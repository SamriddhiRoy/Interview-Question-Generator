import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${baseURL}/api`
});

export async function generateQuestions(payload) {
  const { data } = await api.post('/generate', payload);
  return data.items || [];
}

export async function evaluateAnswer(payload) {
  const { data } = await api.post('/evaluate', payload);
  return data;
}

export async function saveAttempt(payload) {
  const { data } = await api.post('/attempts', payload);
  return data;
}


