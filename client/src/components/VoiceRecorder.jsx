import React, { useEffect, useRef, useState } from 'react';

export default function VoiceRecorder({ onSaveBlob }) {
  const [recording, setRecording] = useState(false);
  const [permission, setPermission] = useState(null);
  const [blobs, setBlobs] = useState([]);
  const mediaRef = useRef(null);
  const recorderRef = useRef(null);

  async function requestPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRef.current = stream;
      setPermission(true);
      return true;
    } catch {
      setPermission(false);
      return false;
    }
  }

  async function start() {
    const ok = permission === true || (await requestPermission());
    if (!ok) return;
    const mediaRecorder = new MediaRecorder(mediaRef.current);
    recorderRef.current = mediaRecorder;
    const chunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      setBlobs((b) => [blob, ...b]);
      onSaveBlob && onSaveBlob(blob);
    };
    mediaRecorder.start();
    setRecording(true);
  }

  function stop() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  useEffect(() => {
    return () => {
      mediaRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div>
      <div className="row" style={{ marginBottom: 8 }}>
        {!recording ? (
          <button className="btn accent" onClick={start}>Start Recording</button>
        ) : (
          <button className="btn danger" onClick={stop}>Stop</button>
        )}
        {permission === false && <span style={{ color: '#f87171' }}>Mic permission denied</span>}
      </div>
      <div>
        {blobs.map((b, i) => (
          <audio key={i} src={URL.createObjectURL(b)} controls style={{ width: '100%', marginBottom: 8 }} />
        ))}
      </div>
    </div>
  );
}


