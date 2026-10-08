// Routes that need the owner's key: run the line and close it.
const express = require('express');
const Ticket = require('../models/Ticket');
const { publish } = require('../lib/snapshot');
const { requireOwner } = require('../lib/auth');
const { HttpError } = require('../lib/http');

const router = express.Router();

const toRow = (t) => ({ id: t.id, number: t.number, name: t.name });

function assertNotClosed(queue) {
  if (queue.status === 'closed') {
    throw new HttpError(409, 'This queue is closed. Ask the shop for a new code.');
  }
}

// Used by both Next and Skip, so only one ticket can ever be "serving".
async function advance(queue, finishedStatus) {
  const now = new Date();
  await Ticket.updateOne(
    { queueId: queue._id, status: 'serving' },
    { status: finishedStatus, finishedAt: now }
  );
  await Ticket.findOneAndUpdate(
    { queueId: queue._id, status: 'waiting' },
    { status: 'serving', calledAt: now },
    { sort: { sortKey: 1 } }
  );
}

// Named lists for the owner's screen; the public snapshot has numbers only.
router.get('/:code/owner', requireOwner, async (req, res) => {
  const queueId = req.queue._id;
  const [serving, waiting, skipped] = await Promise.all([
    Ticket.findOne({ queueId, status: 'serving' }),
    Ticket.find({ queueId, status: 'waiting' }).sort({ sortKey: 1 }),
    Ticket.find({ queueId, status: 'skipped' }).sort({ finishedAt: -1 }),
  ]);
  res.json({
    serving: serving ? toRow(serving) : null,
    waiting: waiting.map(toRow),
    skipped: skipped.map(toRow),
  });
});

router.post('/:code/next', requireOwner, async (req, res) => {
  assertNotClosed(req.queue);
  await advance(req.queue, 'done');
  res.json(await publish(req.app.get('io'), req.queue));
});

router.post('/:code/skip', requireOwner, async (req, res) => {
  assertNotClosed(req.queue);
  const serving = await Ticket.exists({ queueId: req.queue._id, status: 'serving' });
  if (!serving) throw new HttpError(400, 'Nobody is being served right now.');
  await advance(req.queue, 'skipped');
  res.json(await publish(req.app.get('io'), req.queue));
});

// A late no-show goes to the back of the line by taking the highest sortKey + 1.
router.post('/:code/recall/:ticketId', requireOwner, async (req, res) => {
  assertNotClosed(req.queue);
  const queueId = req.queue._id;
  const last = await Ticket.findOne({ queueId }).sort({ sortKey: -1 });
  const ticket = await Ticket.findOneAndUpdate(
    { _id: req.params.ticketId, queueId, status: 'skipped' },
    { status: 'waiting', sortKey: last.sortKey + 1, $unset: { calledAt: 1, finishedAt: 1 } }
  );
  if (!ticket) throw new HttpError(404, 'That ticket is not in the skipped list.');
  res.json(await publish(req.app.get('io'), req.queue));
});

router.post('/:code/pause', requireOwner, async (req, res) => {
  assertNotClosed(req.queue);
  req.queue.status = (req.body || {}).paused ? 'paused' : 'open';
  await req.queue.save();
  res.json(await publish(req.app.get('io'), req.queue));
});

router.post('/:code/close', requireOwner, async (req, res) => {
  assertNotClosed(req.queue);
  const queue = req.queue;
  const count = (status) => Ticket.countDocuments({ queueId: queue._id, status });
  const done = await Ticket.find({ queueId: queue._id, status: 'done' });
  const totalMin = done.reduce((s, t) => s + (t.finishedAt - t.calledAt), 0) / 60000;
  // "Left on their own" is counted before the sweep below, which also marks
  // people who were still waiting as left.
  const summary = {
    served: done.length,
    skipped: await count('skipped'),
    left: await count('left'),
    avgServiceMin: done.length ? Math.round((totalMin / done.length) * 100) / 100 : 0,
  };
  await Ticket.updateMany(
    { queueId: queue._id, status: { $in: ['waiting', 'serving'] } },
    { status: 'left', finishedAt: new Date() }
  );
  queue.status = 'closed';
  queue.closedAt = new Date();
  await queue.save();
  await publish(req.app.get('io'), queue);
  res.json({ summary });
});

module.exports = router;
