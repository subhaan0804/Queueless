const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  queueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Queue', required: true, index: true },
  number: { type: Number, required: true },
  // Orders the line. Equals `number` until a recall moves someone to the back.
  sortKey: { type: Number, required: true },
  name: { type: String, default: '' },
  // Device token used by the server to notify a customer when this ticket is called.
  expoPushToken: { type: String, default: '' },
  status: {
    type: String,
    enum: ['waiting', 'serving', 'done', 'skipped', 'left'],
    default: 'waiting',
  },
  joinedAt: { type: Date, default: Date.now },
  // calledAt -> finishedAt is the real service time used for the estimate.
  calledAt: Date,
  finishedAt: Date,
});

module.exports = mongoose.model('Ticket', ticketSchema);
