import { Router } from 'express';
import { randomUUID } from 'crypto';

const router = Router();

// Simple in-memory store for demo
const attempts = new Map();

router.post('/', (req, res) => {
  const id = randomUUID();
  const payload = { id, ...req.body, createdAt: Date.now() };
  attempts.set(id, payload);
  res.json({ id });
});

router.get('/:id', (req, res) => {
  const item = attempts.get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

export default router;


