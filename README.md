# Automated Interview Question Generator + Practice Room

Stack: React (Vite), Node.js, Express, Socket.io, Google Gemini API (no TypeScript).
 
## Project Structure

```
Interview Question Generator/
├─ server/
│  ├─ src/
│  │  ├─ config/gemini.js
│  │  ├─ routes/generate.js
│  │  ├─ routes/evaluate.js
│  │  ├─ routes/attempts.js
│  │  ├─ services/generator.js
│  │  ├─ services/evaluator.js
│  │  ├─ sockets/index.js
│  │  ├─ sockets/whiteboard.js
│  │  ├─ sockets/practice.js
│  │  └─ index.js
│  ├─ package.json
│  └─ .env.example
├─ client/
│  ├─ src/
│  │  ├─ api/index.js
│  │  ├─ main.jsx
│  │  ├─ App.jsx
│  │  ├─ styles.css
│  │  ├─ pages/Generator.jsx
│  │  ├─ pages/PracticeRoom.jsx
│  │  ├─ components/QuestionForm.jsx
│  │  ├─ components/QuestionViewer.jsx
│  │  ├─ components/CodeEditor.jsx
│  │  ├─ components/Whiteboard.jsx
│  │  ├─ components/TimerControls.jsx
│  │  ├─ components/ProgressBar.jsx
│  │  └─ components/VoiceRecorder.jsx
│  ├─ index.html
│  ├─ vite.config.js
│  └─ package.json
└─ .gitignore
```

## Prerequisites
- Node.js 18+
- Google API key for Gemini

## Setup

1) Server
```
cd server
copy env.example .env   # on Windows PowerShell use: copy .\env.example .env
# put your GOOGLE_API_KEY in .env (see keys below)
npm install
npm run dev
```
Server runs on http://localhost:5000

2) Client
```
cd client
npm install
# optional: set API url
# echo VITE_API_BASE_URL=http://localhost:5000 >> .env
npm run dev
```
Client runs on http://localhost:5173

## Environment Variables
Server `.env` (see `server/env.example`):
- `PORT` (default 5000)
- `CLIENT_ORIGIN` (default http://localhost:5173)
- `GOOGLE_API_KEY` (required)

Client `.env`:
- `VITE_API_BASE_URL` (default http://localhost:5000)

## Features
- AI Question Generation (Coding, HR, System Design, Technical, Project-based)
- Practice Room with timers, progress, and code editor
- Voice recorder for HR/System Design answers
- Real-time Whiteboard via Socket.io + Canvas
- Real-time feedback with Gemini + basic scoring

## Notes
- Code execution sandbox for coding test cases is stubbed; current evaluation uses Gemini + heuristics.
- Attempts are stored in-memory for demo; swap with a DB for persistence.


