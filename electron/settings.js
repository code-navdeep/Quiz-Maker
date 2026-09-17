const path = require('path');
const fs = require('fs');
const { app } = require('electron');

function settingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function loadSettings() {
  try {
    return JSON.parse(fs.readFileSync(settingsPath(), 'utf8'));
  } catch {
    // No settings file yet (first run) or unreadable content — treat as empty.
    return {};
  }
}

function saveSettings(settings) {
  fs.writeFileSync(settingsPath(), JSON.stringify(settings, null, 2));
}

function getApiKey() {
  const stored = loadSettings().deepseekApiKey;
  if (typeof stored === 'string' && stored.trim()) {
    return stored.trim();
  }

  const env = process.env.DEEPSEEK_API_KEY;
  if (env && env !== 'YOUR_DEEPSEEK_API_KEY_HERE') {
    return env;
  }

  return null;
}

function setApiKey(key) {
  const settings = loadSettings();
  settings.deepseekApiKey = key;
  saveSettings(settings);
}

module.exports = { getApiKey, setApiKey };
