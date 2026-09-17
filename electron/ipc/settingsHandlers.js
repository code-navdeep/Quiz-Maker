const { getApiKey, setApiKey } = require('../settings');

function registerSettingsHandlers(ipcMain) {
  ipcMain.handle('settings:getApiKeyStatus', async () => {
    return { configured: Boolean(getApiKey()) };
  });

  ipcMain.handle('settings:setApiKey', async (event, key) => {
    if (typeof key !== 'string' || !key.trim()) {
      throw new Error('API key cannot be empty.');
    }
    setApiKey(key.trim());
    return { success: true };
  });
}

module.exports = { registerSettingsHandlers };
