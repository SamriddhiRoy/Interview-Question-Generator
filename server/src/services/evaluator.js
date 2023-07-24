import { getModel } from '../config/gemini.js';

function clampScore(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function basicHeuristicCodingScore(answerText) {
  if (!answerText || typeof answerText !== 'string') return 0;
  const lenScore = Math.min(1, answerText.length / 200);
  const hasFunction = /function\s+\w+|\w+\s*=>/.test(answerText) ? 0.2 : 0;
  const hasLoop = /(for|while)\s*\(/.test(answerText) ? 0.2 : 0;
  const hasReturn = /\breturn\b/.test(answerText) ? 0.2 : 0;
  return Math.min(1, lenScore * 0.4 + hasFunction + hasLoop + hasReturn);
}

function defaultFeedback() {
  return {
    strongPoints: [],
    improvements: [],
    suggestedAnswer: ''
  };
}

export async function evaluateAnswer(payload) {
  const { category, question, answer, testCases, projectDescription } = payload;
  const model = getModel('gemini-1.5-flash');

  if (!model) {
    if (category === 'Coding') {
      const score = basicHeuristicCodingScore(answer?.code || answer);
      return {
        score,
        strongPoints: score > 0.5 ? ['Reasonable structure'] : [],
        improvements: score < 0.7 ? ['Add edge case handling', 'Optimize complexity'] : [],
        suggestedAnswer: '',
        categories: ['correctness', 'style', 'efficiency']
      };
    }
    return {
      score: 0.5,
      ...defaultFeedback(),
      categories: ['clarity', 'structure', 'relevance']
    };
  }

  const judgePrompt = `
You are a strict interview evaluator. Score 0-1 and give feedback as JSON:
{
  "score": number between 0 and 1,
  "strongPoints": string[],
  "improvements": string[],
  "suggestedAnswer": string
}

Question:
${question || '(missing)'}

Category: ${category}
${projectDescription ? 'Candidate project description:\n' + projectDescription : ''}
${
  category === 'Coding'
    ? `Coding answer:\n${typeof answer === 'object' ? answer?.code || '' : answer}\n`
    : `Answer:\n${typeof answer === 'string' ? answer : JSON.stringify(answer)}\n`
}
${Array.isArray(testCases) && testCases.length ? `Test cases (for reference):\n${JSON.stringify(testCases)}` : ''}

Return JSON only.
  `;

  const result = await model.generateContent(judgePrompt);
  const text = result?.response?.text() || '{}';
  try {
    const json = JSON.parse(text);
    return {
      score: clampScore(json.score),
      strongPoints: Array.isArray(json.strongPoints) ? json.strongPoints : [],
      improvements: Array.isArray(json.improvements) ? json.improvements : [],
      suggestedAnswer: typeof json.suggestedAnswer === 'string' ? json.suggestedAnswer : '',
      categories:
        category === 'Coding'
          ? ['correctness', 'style', 'efficiency']
          : category === 'HR'
          ? ['grammar', 'structure', 'leadership']
          : category === 'System Design'
          ? ['clarity', 'tradeoffs', 'scalability']
          : ['correctness', 'clarity', 'relevance']
    };
  } catch (e) {
    // Fallback heuristics
    if (category === 'Coding') {
      const score = basicHeuristicCodingScore(answer?.code || answer);
      return {
        score,
        strongPoints: score > 0.5 ? ['Reasonable structure'] : [],
        improvements: score < 0.7 ? ['Add edge case handling', 'Optimize complexity'] : [],
        suggestedAnswer: '',
        categories: ['correctness', 'style', 'efficiency']
      };
    }
    return {
      score: 0.5,
      ...defaultFeedback(),
      categories: ['clarity', 'structure', 'relevance']
    };
  }
}


