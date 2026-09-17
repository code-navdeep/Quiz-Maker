const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const { PrismaClient } = require('./prisma-client');

function resolveDbPath() {
  if (process.env.NODE_ENV === 'development') {
    return path.join(__dirname, '..', 'prisma', 'dev.db');
  }

  const dbPath = path.join(app.getPath('userData'), 'quiz-maker.db');

  if (!fs.existsSync(dbPath)) {
    const templatePath = app.isPackaged
      ? path.join(process.resourcesPath, 'prisma', 'template.db')
      : path.join(__dirname, '..', 'prisma', 'template.db');
    fs.copyFileSync(templatePath, dbPath);
  }

  return dbPath;
}

const dbPath = resolveDbPath();

const prisma = new PrismaClient({
  datasources: {
    db: { url: `file:${dbPath}` },
  },
});

module.exports = prisma;
