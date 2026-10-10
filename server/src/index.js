// Read server/.env from the server folder itself, so it works from any working directory.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const http = require('http');
const os = require('os');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const Queue = require('./models/Queue');
const { buildSnapshot } = require('./lib/snapshot');
const queueRoutes = require('./routes/queues');
const ownerRoutes = require('./routes/owner');
const ticketRoutes = require('./routes/tickets');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
// Routes reach the socket server through the app: you ask by REST, you are told by socket.
app.set('io', io);

app.use(cors());
app.use(express.json());
// One line per API request, so a failing phone can be diagnosed from this terminal.
app.use('/api', (req, res, next) => {
  res.on('finish', () => console.log(`${req.method} ${req.originalUrl} ${res.statusCode}`));
  next();
});

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/queues', queueRoutes);
app.use('/api/queues', ownerRoutes);
app.use('/api/tickets', ticketRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found.' }));

// Express 5 forwards errors thrown in async handlers here.
app.use((err, req, res, next) => {
  // A malformed ticket id fails to cast to an ObjectId; to the client it is just unknown.
  const status = err.status || (err.name === 'CastError' ? 404 : 500);
  if (status === 500) console.error(err);
  const messages = { 404: 'Not found.', 500: 'Something went wrong on the server.' };
  res.status(status).json({ error: err.status ? err.message : messages[status] });
});

io.on('connection', (socket) => {
  // Clients send this on every (re)connect, so a Wi-Fi blip is healed by a fresh snapshot.
  socket.on('room:join', async (code) => {
    try {
      const queue = await Queue.findOne({ code: String(code).toUpperCase() });
      if (!queue) return;
      socket.join(queue.code);
      socket.emit('queue:update', await buildSnapshot(queue));
    } catch (err) {
      console.error(err);
    }
  });
});

// The addresses a phone on the same Wi-Fi can use to reach this server.
function lanUrls(port) {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((net) => net.family === 'IPv4' && !net.internal)
    .map((net) => `http://${net.address}:${port}`);
}

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set. Copy server/.env.example to server/.env and fill it in.');
  process.exit(1);
}

const port = process.env.PORT || 4000;
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: process.env.MONGO_DB_NAME || undefined,
  })
  .then(() => {
    console.log('MongoDB connected');
    httpServer.listen(port, () => {
      console.log(`Server listening on port ${port}`);
      console.log(`  on this computer: http://localhost:${port}`);
      console.log('  from a phone (use the address on your Wi-Fi network):');
      lanUrls(port).forEach((url) => console.log(`    ${url}`));
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
