export function registerPractice(io, socket) {
  socket.on('practice:join', (roomId) => {
    socket.join(`practice:${roomId}`);
    socket.emit('practice:joined', roomId);
  });

  socket.on('practice:timer', ({ roomId, remainingMs }) => {
    io.to(`practice:${roomId}`).emit('practice:timer', { remainingMs });
  });

  socket.on('practice:progress', ({ roomId, progress }) => {
    io.to(`practice:${roomId}`).emit('practice:progress', progress);
  });
}


