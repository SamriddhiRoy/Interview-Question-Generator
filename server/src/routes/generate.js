import { Router } from 'express';
import { generateQuestions } from '../services/generator.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { difficulty, category, count, projectDescription, technicalSubtopic } = req.body || {};
    if (!category) return res.status(400).json({ error: 'category is required' });
    const safeCount = Math.max(1, Math.min(20, Number(count) || 5));
    const items = await generateQuestions({
      difficulty: difficulty || 'Easy',
      category,
      count: safeCount,
      projectDescription: projectDescription || '',
      technicalSubtopic: technicalSubtopic || 'General'
    });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate questions', details: err.message });
  }
});

export default router;


