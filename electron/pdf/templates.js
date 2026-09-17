const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const baseStyles = `
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      color: #111;
      padding: 32px 40px;
      font-size: 13pt;
      line-height: 1.5;
    }
    h1 { font-size: 20pt; margin-bottom: 4px; }
    .name-line { display: flex; gap: 40px; margin: 16px 0 10px; font-size: 12pt; }
    .name-line .blank { display: inline-block; border-bottom: 1px solid #111; height: 14px; vertical-align: bottom; }
    .name-line .blank-name { width: 260px; }
    .name-line .blank-date { width: 120px; }
    .meta { color: #444; font-size: 11pt; margin-bottom: 24px; }
    .meta span { margin-right: 18px; }
    .question { margin-bottom: 22px; page-break-inside: avoid; }
    .question-text { font-weight: bold; margin-bottom: 8px; }
    .options { margin-left: 4px; }
    .option { margin-bottom: 4px; }
    .option .letter { display: inline-block; width: 22px; font-weight: bold; }
    .answer-list { font-size: 13pt; line-height: 2; }
    .answer-list .item { display: inline-block; width: 80px; }
  </style>
`;

function buildHandoutHtml(quiz) {
  const questionsHtml = quiz.questions.map((q, index) => {
    const optionsHtml = q.options.map((opt, i) =>
      `<div class="option"><span class="letter">${LETTERS[i]}.</span>${escapeHtml(opt)}</div>`
    ).join('');

    return `
      <div class="question">
        <div class="question-text">${index + 1}. ${escapeHtml(q.text)}</div>
        <div class="options">${optionsHtml}</div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" />${baseStyles}</head>
      <body>
        <h1>${escapeHtml(quiz.title)}</h1>
        <div class="name-line">
          <span>Name: <span class="blank blank-name"></span></span>
          <span>Date: <span class="blank blank-date"></span></span>
        </div>
        <div class="meta">
          <span>Topic: ${escapeHtml(quiz.topic)}</span>
          <span>Difficulty: ${escapeHtml(quiz.difficulty)}</span>
          <span>Time Allowed: ${quiz.timeLimit} minutes</span>
        </div>
        ${questionsHtml}
      </body>
    </html>
  `;
}

function buildAnswerKeyHtml(quiz) {
  const itemsHtml = quiz.questions.map((q, index) => {
    const correctIndex = q.options.indexOf(q.answer);
    const letter = correctIndex >= 0 ? LETTERS[correctIndex] : '?';
    return `<span class="item">${index + 1}. ${letter}</span>`;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" />${baseStyles}</head>
      <body>
        <h1>${escapeHtml(quiz.title)} — Answer Key</h1>
        <div class="meta">
          <span>Topic: ${escapeHtml(quiz.topic)}</span>
          <span>Difficulty: ${escapeHtml(quiz.difficulty)}</span>
        </div>
        <div class="answer-list">${itemsHtml}</div>
      </body>
    </html>
  `;
}

module.exports = { buildHandoutHtml, buildAnswerKeyHtml };
