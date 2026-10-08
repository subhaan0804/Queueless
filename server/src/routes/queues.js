// Routes any device may call: create a queue, look one up, join it.
const express = require('express');
const Queue = require('../models/Queue');
const Ticket = require('../models/Ticket');
const { makeCode, makeOwnerKey } = require('../lib/code');
const { buildSnapshot, publish } = require('../lib/snapshot');
const { findQueue } = require('../lib/auth');
const { HttpError, cleanText } = require('../lib/http');

const router = express.Router();

router.post('/', async (req, res) => {
  const body = req.body || {};
  const name = cleanText(body.name, 40);
  if (!name) throw new HttpError(400, 'Enter a shop or clinic name.');
  const minutes = Number(body.defaultServiceMin) || 5;
  const queue = await Queue.create({
    name,
    code: await makeCode(),
    ownerKey: makeOwnerKey(),
    defaultServiceMin: Math.min(60, Math.max(1, minutes)),
  });
  res.status(201).json({
    code: queue.code,
    ownerKey: queue.ownerKey,
    snapshot: await buildSnapshot(queue),
  });
});

router.get('/:code', async (req, res) => {
  res.json(await buildSnapshot(await findQueue(req.params.code)));
});

router.post('/:code/join', async (req, res) => {
  const code = req.params.code.toUpperCase();
  // One atomic $inc hands out the number, so two simultaneous scans can never
  // receive the same token. The status filter also rejects paused/closed queues.
  const queue = await Queue.findOneAndUpdate(
    { code, status: 'open' },
    { $inc: { lastNumber: 1 } },
    { returnDocument: 'after' }
  );
  if (!queue) {
    const existing = await findQueue(code); // 404 when the code is unknown
    throw new HttpError(
      409,
      existing.status === 'paused'
        ? 'Joining is paused for now. Try again in a few minutes.'
        : 'This queue is closed. Ask the shop for a new code.'
    );
  }
  const ticket = await Ticket.create({
    queueId: queue._id,
    number: queue.lastNumber,
    sortKey: queue.lastNumber,
    name: cleanText((req.body || {}).name, 30),
  });
  const snapshot = await publish(req.app.get('io'), queue);
  res.status(201).json({ ticketId: ticket.id, number: ticket.number, snapshot });
});

module.exports = router;
