// An error that carries the HTTP status the client should see.
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Request bodies are untrusted: accept only strings, trimmed and length-capped.
function cleanText(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

module.exports = { HttpError, cleanText };
