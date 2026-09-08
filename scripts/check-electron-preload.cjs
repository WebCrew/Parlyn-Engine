const assert = require('assert/strict');
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');

const methods = [
  'getAppInfo',
  'createProject',
  'openProject',
  'openProjectScene',
  'createProjectScene',
  'moveProjectScene',
  'closeProject',
  'deleteProject',
  'saveProjectScene',
  'saveProjectWorld',
  'saveSceneAs',
  'openScene',
  'importAssets'
];

app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  ipcMain.handle('parlyn:app:get-info', () => ({ version:app.getVersion(), platform:process.platform }));
  const win = new BrowserWindow({
    show:false,
    webPreferences:{
      preload:path.join(__dirname, '..', 'src', 'main', 'preload.js'),
      contextIsolation:true,
      nodeIntegration:false,
      sandbox:true
    }
  });
  await win.loadURL('data:text/html,<title>Parlyn preload smoke test</title>');
  const result = await win.webContents.executeJavaScript(`(async () => ({
    missing:${JSON.stringify(methods)}.filter((name) => typeof window.parlynHost?.[name] !== 'function'),
    appInfo:await window.parlynHost?.getAppInfo?.()
  }))()`);
  assert.deepEqual(result.missing, [], `Electron preload is missing: ${result.missing.join(', ')}`);
  assert.equal(result.appInfo?.version, app.getVersion());
  assert.equal(result.appInfo?.platform, process.platform);
  console.log('Electron sandboxed preload smoke test passed.');
  win.destroy();
  app.quit();
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
