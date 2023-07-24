import React, { useEffect, useRef, useState } from 'react';

const presets = [
  { label: '30 sec', ms: 30_000 },
  { label: '1 min', ms: 60_000 },
  { label: '5 min', ms: 300_000 }
];

export default function TimerControls({ remainingMs, onTick }) {
  const [ms, setMs] = useState(remainingMs || 0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setMs(remainingMs || 0);
  }, [remainingMs]);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setMs((cur) => {
          const next = Math.max(0, cur - 1000);
          onTick && onTick(next);
          if (next === 0) setRunning(false);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  function start(t) {
    clearInterval(timerRef.current);
    setMs(t);
    onTick && onTick(t);
    setRunning(true);
  }

  function pause() {
    setRunning(false);
  }
  function resume() {
    if (ms > 0) setRunning(true);
  }
  function reset() {
    setRunning(false);
    setMs(0);
    onTick && onTick(0);
  }

  const m = String(Math.floor(ms / 60000)).padStart(2, '0');
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');

  return (
    <div>
      <div className="row" style={{ marginBottom: 8 }}>
        {presets.map((p) => (
          <button key={p.ms} className="btn" onClick={() => start(p.ms)}>{p.label}</button>
        ))}
      </div>
      <div className="row" style={{ marginBottom: 8 }}>
        <div className="card" style={{ padding: 8, fontSize: 28, textAlign: 'center', width: 160 }}>{m}:{s}</div>
        <button className="btn" onClick={pause}>Pause</button>
        <button className="btn" onClick={resume}>Resume</button>
        <button className="btn danger" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}


