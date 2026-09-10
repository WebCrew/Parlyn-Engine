const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('parlynHost', {
  getAppInfo:()=>ipcRenderer.invoke('parlyn:app:get-info'),
  editorReady:()=>ipcRenderer.invoke('parlyn:app:editor-ready'),
  onAppCloseRequested:(callback)=>{
    if (typeof callback !== 'function') throw new TypeError('Close-request callback must be a function.');
    const listener=()=>callback();
    ipcRenderer.on('parlyn:app:close-requested',listener);
    return ()=>ipcRenderer.removeListener('parlyn:app:close-requested',listener);
  },
  confirmAppClose:()=>ipcRenderer.invoke('parlyn:app:confirm-close'),
  copyText:(text)=>ipcRenderer.invoke('parlyn:clipboard:write-text',{ text }),
  saveSceneAs:(payload)=>ipcRenderer.invoke('parlyn:scene:save-as',payload),
  openScene:()=>ipcRenderer.invoke('parlyn:scene:open'),
  createProject:(payload)=>ipcRenderer.invoke('parlyn:project:create',payload),
  openProject:()=>ipcRenderer.invoke('parlyn:project:open'),
  openProjectScene:(payload)=>ipcRenderer.invoke('parlyn:project:open-scene',payload),
  createProjectScene:(payload)=>ipcRenderer.invoke('parlyn:project:create-scene',payload),
  moveProjectScene:(payload)=>ipcRenderer.invoke('parlyn:project:move-scene',payload),
  closeProject:()=>ipcRenderer.invoke('parlyn:project:close'),
  deleteProject:(payload)=>ipcRenderer.invoke('parlyn:project:delete',payload),
  saveProjectScene:(payload)=>ipcRenderer.invoke('parlyn:project:save-scene',payload),
  saveProjectWorld:(payload)=>ipcRenderer.invoke('parlyn:project:save-world',payload),
  importAssets:()=>ipcRenderer.invoke('parlyn:project:import-assets'),
  moveProjectAsset:(payload)=>ipcRenderer.invoke('parlyn:project:move-asset',payload)
});
