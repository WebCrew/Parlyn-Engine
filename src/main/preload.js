const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('parlynHost', {
  getAppInfo:()=>ipcRenderer.invoke('parlyn:app:get-info'),
  saveSceneAs:(payload)=>ipcRenderer.invoke('parlyn:scene:save-as',payload),
  openScene:()=>ipcRenderer.invoke('parlyn:scene:open'),
  createProject:(payload)=>ipcRenderer.invoke('parlyn:project:create',payload),
  openProject:()=>ipcRenderer.invoke('parlyn:project:open'),
  openProjectScene:(payload)=>ipcRenderer.invoke('parlyn:project:open-scene',payload),
  closeProject:()=>ipcRenderer.invoke('parlyn:project:close'),
  deleteProject:(payload)=>ipcRenderer.invoke('parlyn:project:delete',payload),
  saveProjectScene:(payload)=>ipcRenderer.invoke('parlyn:project:save-scene',payload),
  saveProjectWorld:(payload)=>ipcRenderer.invoke('parlyn:project:save-world',payload),
  importAssets:()=>ipcRenderer.invoke('parlyn:project:import-assets')
});
