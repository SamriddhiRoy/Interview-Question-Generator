import React, { useMemo, useState } from 'react';
import CodeEditor from './CodeEditor.jsx';
import VoiceRecorder from './VoiceRecorder.jsx';
import { evaluateAnswer, saveAttempt } from '../api/index.js';

export default function QuestionViewer({ items, readOnly, onDone }) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const item = useMemo(() => items?.[idx] || null, [items, idx]);

  // Read-only preview: show all items (list)
  if (readOnly) {
    if (!items || !items.length) return <div>No questions</div>;
    return (
      <div className="grid" style={{ gap: 12 }}>
        {items.map((q, i) => (
          <div key={i} className="card">
            <div style={{ color: '#9ca3af', marginBottom: 4 }}>
              {q.difficulty ? `${q.difficulty} • ` : ''}{inferCategory(q)}
            </div>
            <div style={{ fontSize: 18, marginBottom: 8 }}>{q.question}</div>
            {Array.isArray(q.hints) && q.hints.length > 0 && (
              <div style={{ color: '#9ca3af', marginBottom: 8 }}>Hints: {q.hints.join(' • ')}</div>
            )}
            {q.difficultyExplanation && (
              <div style={{ color: '#9ca3af', marginBottom: 8 }}>Why this difficulty: {q.difficultyExplanation}</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  async function handleEvaluate() {
    if (!item) return;
    setBusy(true);
    try {
      const payload = {
        category: inferCategory(item),
        question: item.question,
        answer: isCoding(item) ? { code: answer } : answer
      };
      const res = await evaluateAnswer(payload);
      setResult(res);
      await saveAttempt({
        item,
        answer: payload.answer,
        evaluation: res
      });
      onDone && onDone(res);
    } finally {
      setBusy(false);
    }
  }

  function isCoding(q) {
    const qtext = q?.question?.toLowerCase() || '';
    return qtext.includes('code') || qtext.includes('implement') || qtext.includes('function');
  }
  function inferCategory(q) {
    if (q?.category) return q.category;
    if (isCoding(q)) return 'Coding';
    const s = q?.question?.toLowerCase() || '';
    if (s.includes('design') || s.includes('system')) return 'System Design';
    if (s.includes('behavior') || s.includes('tell me')) return 'HR';
    return 'Technical';
  }

  if (!item) return <div>No questions</div>;

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ color: '#9ca3af', marginBottom: 4 }}>
          {item.difficulty ? `${item.difficulty} • ` : ''}{inferCategory(item)}
        </div>
        <div style={{ fontSize: 18, marginBottom: 8 }}>{item.question}</div>
        {Array.isArray(item.hints) && item.hints.length > 0 && (
          <div style={{ color: '#9ca3af', marginBottom: 8 }}>Hints: {item.hints.join(' • ')}</div>
        )}
        {item.difficultyExplanation && (
          <div style={{ color: '#9ca3af', marginBottom: 8 }}>Why this difficulty: {item.difficultyExplanation}</div>
        )}
        {!readOnly && (
          <>
            {isCoding(item) ? (
              <CodeEditor value={answer} onChange={setAnswer} language="javascript" />
            ) : (
              <>
                <textarea className="textarea" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer..." />
                <div style={{ marginTop: 8 }}>
                  <VoiceRecorder onSaveBlob={() => {}} />
                </div>
              </>
            )}
            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn primary" onClick={handleEvaluate} disabled={busy}>{busy ? 'Evaluating...' : 'Submit & Evaluate'}</button>
              <div className="spacer" />
              <button className="btn" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>Prev</button>
              <button className="btn" onClick={() => setIdx((i) => Math.min(items.length - 1, i + 1))} disabled={idx >= items.length - 1}>Next</button>
            </div>
          </>
        )}
      </div>
      {result && (
        <div className="card">
          <h4 className="section-title">Feedback</h4>
          <div style={{ marginBottom: 6 }}>Score: {Math.round((result.score || 0) * 100)}%</div>
          {Array.isArray(result.strongPoints) && result.strongPoints.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ color: '#34d399' }}>Strong points</div>
              <ul>
                {result.strongPoints.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {Array.isArray(result.improvements) && result.improvements.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ color: '#fbbf24' }}>Improvements</div>
              <ul>
                {result.improvements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {result.suggestedAnswer && (
            <div style={{ marginTop: 6 }}>
              <div style={{ color: '#60a5fa' }}>Suggested corrected answer</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{result.suggestedAnswer}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


