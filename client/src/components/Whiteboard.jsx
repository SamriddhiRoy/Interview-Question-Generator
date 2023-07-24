import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socketUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Whiteboard({ roomId }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);
  const socketRef = useRef(null);
  const [color, setColor] = useState('#22d3ee');
  const [size, setSize] = useState(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.clientWidth;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = color;
      ctxRef.current.lineWidth = size;
    }
  }, [color, size]);

  useEffect(() => {
    const socket = io(socketUrl);
    socketRef.current = socket;
    socket.on('connect', () => {
      socket.emit('whiteboard:join', roomId);
    });
    socket.on('whiteboard:draw', (stroke) => {
      drawStroke(stroke, false);
    });
    socket.on('whiteboard:clear', () => {
      clearCanvas(false);
    });
    return () => socket.disconnect();
  }, [roomId]);

  function drawStroke(stroke, shouldBroadcast = true) {
    const ctx = ctxRef.current;
    if (!ctx || !stroke || !stroke.points || !stroke.points.length) return;
    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
    ctx.restore();
    if (shouldBroadcast) {
      socketRef.current?.emit('whiteboard:draw', { roomId, stroke });
    }
  }

  function clearCanvas(shouldBroadcast = true) {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (shouldBroadcast) {
      socketRef.current?.emit('whiteboard:clear', { roomId });
    }
  }

  function onPointerDown(e) {
    drawingRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const stroke = { color, size, points: [{ x, y }] };
    e.currentTarget._currentStroke = stroke;
  }
  function onPointerMove(e) {
    if (!drawingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const stroke = e.currentTarget._currentStroke;
    stroke.points.push({ x, y });
    drawStroke({ ...stroke, points: stroke.points.slice(-2) }, false);
  }
  function onPointerUp(e) {
    drawingRef.current = false;
    const stroke = e.currentTarget._currentStroke;
    if (stroke && stroke.points.length > 1) {
      drawStroke(stroke, true);
    }
    e.currentTarget._currentStroke = null;
  }

  return (
    <div>
      <div className="row" style={{ marginBottom: 8 }}>
        <label className="section-title" style={{ marginRight: 8 }}>Color</label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <label className="section-title" style={{ margin: '0 8px' }}>Size</label>
        <input type="range" min="1" max="12" value={size} onChange={(e) => setSize(Number(e.target.value))} />
        <div className="spacer" />
        <button className="btn danger" onClick={() => clearCanvas(true)}>Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: 600, background: '#0b1220', borderRadius: 8, border: '1px solid #1f2937' }}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
      />
    </div>
  );
}


