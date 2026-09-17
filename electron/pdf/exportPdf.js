const { BrowserWindow, dialog } = require('electron');
const fs = require('fs');
const prisma = require('../db');
const { buildHandoutHtml, buildAnswerKeyHtml } = require('./templates');

function sanitizeFileName(name) {
  return String(name).replace(/[\\/:*?"<>|]/g, '').trim();
}

async function renderHtmlToPdfBuffer(html) {
  const win = new BrowserWindow({ show: false });

  try {
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    return await win.webContents.printToPDF({
      printBackground: true,
      pageSize: 'Letter',
    });
  } finally {
    win.destroy();
  }
}

async function exportPdfWithDialog(html, defaultFileName) {
  const pdfBuffer = await renderHtmlToPdfBuffer(html);

  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Save PDF',
    defaultPath: defaultFileName,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });

  if (canceled || !filePath) {
    return { saved: false };
  }

  fs.writeFileSync(filePath, pdfBuffer);
  return { saved: true, filePath };
}

async function fetchQuiz(id) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: Number(id) },
    include: { questions: true },
  });

  if (!quiz) {
    throw new Error('Quiz not found.');
  }

  return quiz;
}

function registerPdfHandlers(ipcMain) {
  ipcMain.handle('quiz:exportHandoutPdf', async (event, id) => {
    const quiz = await fetchQuiz(id);
    const html = buildHandoutHtml(quiz);
    return exportPdfWithDialog(html, `${sanitizeFileName(quiz.title)} - Handout.pdf`);
  });

  ipcMain.handle('quiz:exportAnswerKeyPdf', async (event, id) => {
    const quiz = await fetchQuiz(id);
    const html = buildAnswerKeyHtml(quiz);
    return exportPdfWithDialog(html, `${sanitizeFileName(quiz.title)} - Answer Key.pdf`);
  });
}

module.exports = { registerPdfHandlers };
