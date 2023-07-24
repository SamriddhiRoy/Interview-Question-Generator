import { registerWhiteboard } from './whiteboard.js';
import { registerPractice } from './practice.js';

export function initSockets(io) {
  io.on('connection', (socket) => {
    registerWhiteboard(io, socket);
    registerPractice(io, socket);
    socket.on('disconnect', () => {});
  });
}


