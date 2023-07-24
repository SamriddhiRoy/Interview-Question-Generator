import { Router } from 'express';
import { evaluateAnswer } from '../services/evaluator.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const result = await evaluateAnswer(req.body || {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to evaluate answer', details: err.message });
  }
});

export default router;


