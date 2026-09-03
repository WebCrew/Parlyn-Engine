const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('parlynHost', {
  version:'0.4.0',
  platform:process.platform,
  saveSceneAs:(payload)=>ipcRenderer.invoke('parlyn:scene:save-as',payload),
  openScene:()=>ipcRenderer.invoke('parlyn:scene:open'),
  createProject:(payload)=>ipcRenderer.invoke('parlyn:project:create',payload),
  openProject:()=>ipcRenderer.invoke('parlyn:project:open'),
  saveProjectScene:(payload)=>ipcRenderer.invoke('parlyn:project:save-scene',payload),
  saveProjectWorld:(payload)=>ipcRenderer.invoke('parlyn:project:save-world',payload),
  importAssets:()=>ipcRenderer.invoke('parlyn:project:import-assets')
});
