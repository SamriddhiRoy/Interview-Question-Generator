import React, { useState } from 'react';
import Generator from './pages/Generator.jsx';
import PracticeRoom from './pages/PracticeRoom.jsx';

export default function App() {
  const [screen, setScreen] = useState('generator');
  const [generated, setGenerated] = useState([]);

  return (
    <div className="container">
      <div className="nav">
        <button className={`btn ${screen === 'generator' ? 'primary' : ''}`} onClick={() => setScreen('generator')}>Generator</button>
        <button className={`btn ${screen === 'practice' ? 'primary' : ''}`} onClick={() => setScreen('practice')}>Practice Room</button>
        <div className="spacer" />
        <a className="btn accent" href="https://ai.google.dev/" target="_blank" rel="noreferrer">Gemini</a>
      </div>

      {screen === 'generator' && <Generator onGenerated={setGenerated} onGoPractice={() => setScreen('practice')} />}
      {screen === 'practice' && <PracticeRoom initialQuestions={generated} />}
    </div>
  );
}


