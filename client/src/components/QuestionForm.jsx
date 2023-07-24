import React, { useState } from 'react';

export default function QuestionForm({ onSubmit, loading }) {
  const [difficulty, setDifficulty] = useState('Easy');
  const [category, setCategory] = useState('Coding');
  const [count, setCount] = useState(5);
  const [projectDescription, setProjectDescription] = useState('');
  const [technicalSubtopic, setTechnicalSubtopic] = useState('General');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit && onSubmit({
      difficulty,
      category,
      count: Number(count),
      projectDescription,
      technicalSubtopic: category === 'Technical' ? technicalSubtopic : undefined
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid two">
        <div>
          <label className="section-title">Difficulty</label>
          <select className="select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
        <div>
          <label className="section-title">Category</label>
          <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Coding</option>
            <option>HR</option>
            <option>System Design</option>
            <option>Technical</option>
            <option>Project</option>
          </select>
        </div>
      </div>
      {category === 'Technical' && (
        <div className="grid two" style={{ marginTop: 12 }}>
          <div>
            <label className="section-title">Technical Topic</label>
            <select className="select" value={technicalSubtopic} onChange={(e) => setTechnicalSubtopic(e.target.value)}>
              <option>General</option>
              <option>Python</option>
              <option>React</option>
              <option>JavaScript</option>
              <option>Java</option>
              <option>OOP</option>
              <option>Spring Boot</option>
            </select>
          </div>
        </div>
      )}
      <div className="grid two" style={{ marginTop: 12 }}>
        <div>
          <label className="section-title">Number of Questions</label>
          <input className="input" type="number" min="1" max="20" value={count} onChange={(e) => setCount(e.target.value)} />
        </div>
        <div>
          <label className="section-title">Project Description (optional)</label>
          <textarea className="textarea" value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} placeholder="Paste your project summary for tailored questions..." />
        </div>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <div className="spacer" />
        <button className="btn primary" disabled={loading} type="submit">{loading ? 'Generating...' : 'Generate'}</button>
      </div>
    </form>
  );
}


