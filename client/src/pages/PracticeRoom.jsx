import React, { useRef } from 'react';
import Whiteboard from '../components/Whiteboard.jsx';

export default function PracticeRoom({ initialQuestions }) {
  const roomIdRef = useRef(`room-${Math.random().toString(36).slice(2, 8)}`);

  return (
    <div className="card">
      <h3 className="section-title">Practice - System Design</h3>
      <Whiteboard roomId={roomIdRef.current} />
    </div>
  );
}


