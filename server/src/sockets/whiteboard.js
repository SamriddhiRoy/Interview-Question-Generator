export function registerWhiteboard(io, socket) {
  socket.on('whiteboard:join', (roomId) => {
    socket.join(`whiteboard:${roomId}`);
    socket.emit('whiteboard:joined', roomId);
  });

  socket.on('whiteboard:draw', ({ roomId, stroke }) => {
    socket.to(`whiteboard:${roomId}`).emit('whiteboard:draw', stroke);
  });

  socket.on('whiteboard:clear', ({ roomId }) => {
    io.to(`whiteboard:${roomId}`).emit('whiteboard:clear');
  });
}


