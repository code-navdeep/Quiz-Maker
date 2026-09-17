const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  createQuiz: (payload) => ipcRenderer.invoke('quiz:create', payload),
  getAllQuizzes: () => ipcRenderer.invoke('quiz:getAll'),
  getQuiz: (id) => ipcRenderer.invoke('quiz:getOne', id),
  deleteQuiz: (id) => ipcRenderer.invoke('quiz:delete', id),
  exportHandoutPdf: (id) => ipcRenderer.invoke('quiz:exportHandoutPdf', id),
  exportAnswerKeyPdf: (id) => ipcRenderer.invoke('quiz:exportAnswerKeyPdf', id),
  updateQuestion: (id, data) => ipcRenderer.invoke('question:update', id, data),
  regenerateQuestion: (id) => ipcRenderer.invoke('question:regenerate', id),
  getApiKeyStatus: () => ipcRenderer.invoke('settings:getApiKeyStatus'),
  setApiKey: (key) => ipcRenderer.invoke('settings:setApiKey', key),
});
