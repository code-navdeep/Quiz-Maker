const axios = require('axios');
const prisma = require('../db');
const { getApiKey } = require('../settings');

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const SYSTEM_MESSAGE = 'You are a helpful assistant that generates quiz questions. Always respond with valid JSON only.';

async function callDeepSeek(messages, maxTokens) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('DeepSeek API key not configured. Add it in Settings.');
  }

  const response = await axios.post(DEEPSEEK_URL, {
    model: 'deepseek-chat',
    messages,
    temperature: 0.7,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
  }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return JSON.parse(response.data.choices[0].message.content);
}

function normalizeAnswer(str) {
  return String(str).trim().toLowerCase().replace(/\.$/, '');
}

function validateQuestion(q, errorMessage) {
  if (!q || typeof q.text !== 'string' || q.text.trim() === '') {
    throw new Error(errorMessage);
  }
  if (
    !Array.isArray(q.options) ||
    q.options.length < 2 ||
    q.options.length > 6 ||
    q.options.some((opt) => typeof opt !== 'string' || opt.trim() === '')
  ) {
    throw new Error(errorMessage);
  }

  let answer = q.answer;
  if (!q.options.includes(answer)) {
    // Canonicalize near-miss answers (case/whitespace/trailing period) to the
    // exact option string so options.indexOf(answer) works downstream.
    const match = q.options.find((opt) => normalizeAnswer(opt) === normalizeAnswer(answer));
    if (!match) {
      throw new Error(errorMessage);
    }
    answer = match;
  }

  return { text: q.text, options: q.options, answer };
}

function validateQuizPayload(quizData) {
  const errorMessage = 'AI returned an invalid quiz. Please try again.';
  if (!quizData || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
    throw new Error(errorMessage);
  }
  return quizData.questions.map((q) => validateQuestion(q, errorMessage));
}

function registerQuizHandlers(ipcMain) {
  ipcMain.handle('quiz:create', async (event, { topic, difficulty, numQuestions, timeLimit }) => {
    const prompt = `Generate a quiz with ${numQuestions} questions about ${topic} with a difficulty of ${difficulty}.
Provide the output ONLY as valid JSON with this exact structure (no additional text):
{
  "questions": [
    {
      "text": "Your question here",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "answer": "The correct option"
    }
  ]
}`;

    const quizData = await callDeepSeek([
      { role: 'system', content: SYSTEM_MESSAGE },
      { role: 'user', content: prompt },
    ], 8000);

    const questions = validateQuizPayload(quizData);

    const newQuiz = await prisma.quiz.create({
      data: {
        title: `${difficulty} quiz on ${topic}`,
        topic,
        difficulty,
        timeLimit,
        questions: {
          create: questions,
        },
      },
      include: { questions: true },
    });

    return newQuiz;
  });

  ipcMain.handle('quiz:getAll', async () => {
    return prisma.quiz.findMany({
      include: { questions: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  ipcMain.handle('quiz:getOne', async (event, id) => {
    const quiz = await prisma.quiz.findUnique({
      where: { id: Number(id) },
      include: { questions: true },
    });

    if (!quiz) {
      throw new Error('Quiz not found.');
    }

    return quiz;
  });

  ipcMain.handle('quiz:delete', async (event, id) => {
    await prisma.quiz.delete({ where: { id: Number(id) } });
    return { success: true };
  });

  ipcMain.handle('question:update', async (event, id, data) => {
    const question = validateQuestion(data, 'Invalid question data.');
    return prisma.question.update({
      where: { id: Number(id) },
      data: question,
    });
  });

  ipcMain.handle('question:regenerate', async (event, id) => {
    const existing = await prisma.question.findUnique({
      where: { id: Number(id) },
      include: { quiz: { include: { questions: true } } },
    });

    if (!existing) {
      throw new Error('Question not found.');
    }

    const existingTexts = existing.quiz.questions.map((q) => `- ${q.text}`).join('\n');

    const prompt = `Generate exactly 1 quiz question about ${existing.quiz.topic} with a difficulty of ${existing.quiz.difficulty}.
It must NOT duplicate or closely resemble any of these existing questions:
${existingTexts}
Provide the output ONLY as valid JSON with this exact structure (no additional text):
{
  "questions": [
    {
      "text": "Your question here",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "answer": "The correct option"
    }
  ]
}`;

    const quizData = await callDeepSeek([
      { role: 'system', content: SYSTEM_MESSAGE },
      { role: 'user', content: prompt },
    ], 1000);

    const [question] = validateQuizPayload(quizData);

    return prisma.question.update({
      where: { id: existing.id },
      data: question,
    });
  });
}

module.exports = { registerQuizHandlers };
