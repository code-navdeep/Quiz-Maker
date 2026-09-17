function bridge() {
  if (!window.api) {
    throw new Error('Quiz Maker must run inside Electron (npm run dev) — window.api is not available.');
  }
  return window.api;
}

// IPC errors arrive wrapped as "Error invoking remote method 'quiz:create': Error: <message>".
// Return the original message so toasts can show the real cause.
export function getErrorMessage(error) {
  const message = error?.message || '';
  const marker = message.lastIndexOf('Error: ');
  return marker >= 0 ? message.slice(marker + 'Error: '.length) : message;
}

export const api = {
  createQuiz: (payload) => bridge().createQuiz(payload),
  getAllQuizzes: () => bridge().getAllQuizzes(),
  getQuiz: (id) => bridge().getQuiz(id),
  deleteQuiz: (id) => bridge().deleteQuiz(id),
  exportHandoutPdf: (id) => bridge().exportHandoutPdf(id),
  exportAnswerKeyPdf: (id) => bridge().exportAnswerKeyPdf(id),
  updateQuestion: (id, data) => bridge().updateQuestion(id, data),
  regenerateQuestion: (id) => bridge().regenerateQuestion(id),
  getApiKeyStatus: () => bridge().getApiKeyStatus(),
  setApiKey: (key) => bridge().setApiKey(key),
};
