import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { Server as SocketIOServer } from 'socket.io';

import generateRouter from './routes/generate.js';
import evaluateRouter from './routes/evaluate.js';
import attemptsRouter from './routes/attempts.js';
import { initSockets } from './sockets/index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'interview-backend', timestamp: Date.now() });
});

app.use('/api/generate', generateRouter);
app.use('/api/evaluate', evaluateRouter);
app.use('/api/attempts', attemptsRouter);

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: clientOrigin, methods: ['GET', 'POST'] }
});

initSockets(io);

server.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});


