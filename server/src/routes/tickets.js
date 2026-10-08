// Routes a customer calls with their ticket id.
const express = require('express');
const Queue = require('../models/Queue');
const Ticket = require('../models/Ticket');
const { publish } = require('../lib/snapshot');
const { HttpError } = require('../lib/http');

const router = express.Router();

async function findTicket(id) {
  const ticket = await Ticket.findById(id);
  if (!ticket) throw new HttpError(404, 'This ticket no longer exists.');
  return ticket;
}

router.get('/:id', async (req, res) => {
  const ticket = await findTicket(req.params.id);
  const queue = await Queue.findById(ticket.queueId);
  res.json({
    number: ticket.number,
    status: ticket.status,
    queueName: queue.name,
    queueCode: queue.code,
  });
});

router.post('/:id/leave', async (req, res) => {
  // Filtering on status makes the check and the update one atomic step.
  const ticket = await Ticket.findOneAndUpdate(
    { _id: req.params.id, status: 'waiting' },
    { status: 'left', finishedAt: new Date() }
  );
  if (!ticket) {
    await findTicket(req.params.id); // 404 when unknown
    throw new HttpError(409, 'You can only leave while you are waiting.');
  }
  const queue = await Queue.findById(ticket.queueId);
  await publish(req.app.get('io'), queue);
  res.json({ ok: true });
});

module.exports = router;
