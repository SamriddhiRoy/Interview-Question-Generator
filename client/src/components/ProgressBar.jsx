import React from 'react';

export default function ProgressBar({ value, total, label }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="progress" title={`${pct}%`}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="row" style={{ marginTop: 6 }}>
        <small style={{ color: '#9ca3af' }}>{value}/{total} completed</small>
        <div className="spacer" />
        <small style={{ color: '#9ca3af' }}>{label}</small>
      </div>
    </div>
  );
}


