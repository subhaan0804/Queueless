const crypto = require('crypto');
const Queue = require('../models/Queue');

// No 0, O, 1, I or L, so a code read off a counter cannot be mistyped.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

async function makeCode() {
  for (;;) {
    let code = '';
    for (let i = 0; i < 6; i++) code += ALPHABET[crypto.randomInt(ALPHABET.length)];
    if (!(await Queue.exists({ code }))) return code;
  }
}

function makeOwnerKey() {
  return crypto.randomBytes(12).toString('hex');
}

module.exports = { makeCode, makeOwnerKey };
