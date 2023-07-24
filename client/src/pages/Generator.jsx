import React, { useState } from 'react';
import { generateQuestions } from '../api/index.js';
import QuestionForm from '../components/QuestionForm.jsx';
import QuestionViewer from '../components/QuestionViewer.jsx';

export default function Generator({ onGenerated, onGoPractice }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  async function handleGenerate(form) {
    setLoading(true);
    try {
      const res = await generateQuestions({
        difficulty: form.difficulty,
        category: form.category,
        count: form.count,
        projectDescription: form.projectDescription,
        technicalSubtopic: form.technicalSubtopic
      });
      setItems(res);
      onGenerated && onGenerated(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <h3 className="section-title">AI Interview Question Generator</h3>
        <QuestionForm onSubmit={handleGenerate} loading={loading} />
        <div className="row" style={{ marginTop: 12 }}>
          <div className="spacer" />
          <button className="btn primary" onClick={() => onGoPractice && onGoPractice()} disabled={!items.length}>Go to Practice Room</button>
        </div>
      </div>
      {!!items.length && (
        <div className="card">
          <h3 className="section-title">Preview</h3>
          <QuestionViewer items={items} readOnly />
        </div>
      )}
    </div>
  );
}


