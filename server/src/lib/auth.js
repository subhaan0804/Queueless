const Queue = require('../models/Queue');
const { HttpError } = require('./http');

async function findQueue(code) {
  const queue = await Queue.findOne({ code: String(code).toUpperCase() });
  if (!queue) throw new HttpError(404, 'No queue has this code. Check the 6 characters and try again.');
  return queue;
}

// Owner routes: the queue is loaded here so handlers can use req.queue.
async function requireOwner(req, res, next) {
  const queue = await findQueue(req.params.code);
  if (req.get('x-owner-key') !== queue.ownerKey) {
    throw new HttpError(403, 'This device does not own this queue.');
  }
  req.queue = queue;
  next();
}

module.exports = { findQueue, requireOwner };
