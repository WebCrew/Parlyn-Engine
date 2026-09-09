const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const fs = require('fs/promises');
const path = require('path');
const { pathToFileURL } = require('url');
const { resolveExistingProjectPath, resolveWritableProjectPath, resolveWritableProjectPathCreatingParents } = require('./projectPaths');
const { assertTrustedIpcEvent, assertIpcPayload } = require('./ipcSecurity');
const { ProjectSession } = require('./ProjectSession');
const { listAssets, moveAsset } = require('./assetFiles');

const persistence = import('../engine/persistence/DocumentPersistence.mjs');
const documentFiles = import('./documentFiles.mjs');
const EDITOR_FILE = path.join(__dirname, '..', 'renderer', 'index.html');
const EDITOR_URL = pathToFileURL(EDITOR_FILE).href;
const STARTUP_HISTORY_PATH = '.parlyn/startup-scene.parlyn-history.json';
const MAX_HISTORY_FILE_BYTES = 32 * 1024 * 1024;
const approvedWindowClosures = new WeakSet();
const readyEditorWindows = new WeakSet();

app.setAppUserModelId('org.parlyn.engine');

function safeName(value, fallback = 'Parlyn-Project') {
  const cleaned = String(value || fallback).trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, '-').replace(/\s+/g, ' ').replace(/[. ]+$/g, '');
  return cleaned || fallback;
}

function slug(value, fallback = 'parlyn-project') {
  return safeName(value, fallback).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || fallback;
}

async function readDocument(filePath, expectedFormat, label = 'Parlyn document') {
  const { readDocumentFile } = await documentFiles;
  return readDocumentFile(filePath, expectedFormat, label);
}

async function writeDocumentAtomic(filePath, document, expectedFormat, label = 'Parlyn document') {
  const { writeDocumentFileAtomic } = await documentFiles;
  return writeDocumentFileAtomic(filePath, document, expectedFormat, label);
}

async function loadSceneHistory(projectRoot, sceneRelativePath, currentScene) {
  let historyFile;
  try {
    historyFile = await resolveExistingProjectPath(projectRoot, STARTUP_HISTORY_PATH, 'Scene history file');
  } catch (error) {
    if (error.code === 'ENOENT') return { history:null, warning:null };
    return { history:null, warning:error.message };
  }
  try {
    const info = await fs.stat(historyFile);
    if (info.size > MAX_HISTORY_FILE_BYTES) return { history:null, warning:'Saved scene history exceeded the 32 MiB safety limit and was ignored.' };
    const document = await readDocument(historyFile, 'parlyn-scene-history', 'Parlyn scene history');
    if (document.scenePath !== sceneRelativePath || JSON.stringify(document.currentScene) !== JSON.stringify(currentScene)) {
      return { history:null, warning:'Saved scene history did not match the current scene and was safely ignored.' };
    }
    return { history:document.history, warning:null };
  } catch (error) {
    return { history:null, warning:error.message };
  }
}

const projectSession = new ProjectSession({
  async loadProject(projectRoot) {
    const projectFile = await resolveExistingProjectPath(projectRoot, 'parlyn.project.json', 'Parlyn project file');
    return readDocument(projectFile, 'parlyn-project', 'Parlyn project file');
  },
  trashItem:projectRoot => shell.trashItem(projectRoot),
  isProtectedRoot(projectRoot) {
    const normalize = value => {
      const resolved = path.resolve(value);
      return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
    };
    const target = normalize(projectRoot);
    const protectedUserFolders = ['home', 'desktop', 'documents', 'downloads'].map(name => normalize(app.getPath(name)));
    if (protectedUserFolders.includes(target)) return true;

    const protectedApplicationRoots = [app.getAppPath(), process.resourcesPath].filter(Boolean).map(normalize);
    return protectedApplicationRoots.some(root => target === root || target.startsWith(`${root}${path.sep}`));
  }
});

async function listProjectScenes(projectRoot) {
  if (!projectRoot) return [];
  const scenesRoot = await resolveExistingProjectPath(projectRoot, 'scenes', 'Scenes directory');
  const scenes = [];
  async function walk(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes:true })) {
      if (entry.isSymbolicLink()) continue;
      const fullPath=path.join(directory,entry.name);
      if (entry.isDirectory()) await walk(fullPath);
      else if (entry.isFile() && entry.name.endsWith('.parlyn-scene.json')) {
        const relativePath=path.relative(projectRoot,fullPath).replace(/\\/g,'/');
        const filePath=await resolveExistingProjectPath(projectRoot,relativePath,'Project scene');
        const scene=await readDocument(filePath,'parlyn-scene','Project scene');
        scenes.push({ name:scene.name, relativePath });
      }
    }
  }
  await walk(scenesRoot);
  return scenes.sort((a,b) => a.relativePath.localeCompare(b.relativePath));
}

function requireScenePath(value) {
  if (typeof value !== 'string' || !/^scenes\/.+\.parlyn-scene\.json$/.test(value)) throw new Error('Scene paths must stay inside scenes/ and end with .parlyn-scene.json.');
  return value;
}

function createWindow() {
  const win = new BrowserWindow({
    width:1500,
    height:940,
    minWidth:1120,
    minHeight:720,
    backgroundColor:'#0c1118',
    title:'Parlyn Engine',
    webPreferences:{
      preload:path.join(__dirname,'preload.js'),
      contextIsolation:true,
      nodeIntegration:false
    }
  });
  win.removeMenu();
  win.webContents.setWindowOpenHandler(() => ({ action:'deny' }));
  win.webContents.on('will-navigate', (event, url) => { if (url !== EDITOR_URL) event.preventDefault(); });
  win.webContents.on('render-process-gone', () => readyEditorWindows.delete(win));
  win.on('close', (event) => {
    if (approvedWindowClosures.has(win) || !readyEditorWindows.has(win)) {
      approvedWindowClosures.delete(win);
      return;
    }
    event.preventDefault();
    win.webContents.send('parlyn:app:close-requested');
  });
  win.loadURL(EDITOR_URL);
}

function secureHandle(channel, handler, { payload = false } = {}) {
  ipcMain.handle(channel, async (event, value) => {
    assertTrustedIpcEvent(event, EDITOR_URL);
    if (payload) assertIpcPayload(value, `${channel} payload`);
    return handler(value, event);
  });
}

secureHandle('parlyn:app:get-info', async () => ({
  version:app.getVersion(),
  platform:process.platform
}));

secureHandle('parlyn:app:confirm-close', async (_, event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win || win.isDestroyed()) return { ok:false };
  approvedWindowClosures.add(win);
  win.close();
  return { ok:true };
});

secureHandle('parlyn:app:editor-ready', async (_, event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win || win.isDestroyed()) return { ok:false };
  readyEditorWindows.add(win);
  return { ok:true };
});

secureHandle('parlyn:scene:save-as', async (payload) => {
  const defaultName = `${slug(payload?.name || 'scene','scene')}.parlyn-scene.json`;
  const result = await dialog.showSaveDialog({ title:'Save Parlyn Scene', defaultPath:defaultName, filters:[{ name:'Parlyn Scene', extensions:['json'] }] });
  if (result.canceled || !result.filePath) return { canceled:true };
  await writeDocumentAtomic(result.filePath, payload?.scene, 'parlyn-scene', 'Parlyn scene');
  return { canceled:false, filePath:result.filePath };
}, { payload:true });

secureHandle('parlyn:scene:open', async () => {
  const result = await dialog.showOpenDialog({ title:'Open Parlyn Scene', properties:['openFile'], filters:[{ name:'Parlyn Scene', extensions:['json'] }] });
  if (result.canceled || !result.filePaths[0]) return { canceled:true };
  const filePath=result.filePaths[0];
  return { canceled:false, filePath, scene:await readDocument(filePath, 'parlyn-scene', 'Parlyn scene') };
});

secureHandle('parlyn:project:create', async (payload) => {
  const choose = await dialog.showOpenDialog({ title:'Choose Parent Folder for Parlyn Project', properties:['openDirectory','createDirectory'] });
  if (choose.canceled || !choose.filePaths[0]) return { canceled:true };
  const name=safeName(payload?.name,'Parlyn Project');
  const projectRoot=path.join(choose.filePaths[0], slug(name));
  try {
    await fs.access(projectRoot);
    throw new Error(`A folder named "${path.basename(projectRoot)}" already exists. Choose a different project name.`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const project={ format:'parlyn-project', version:1, name, startupScene:'scenes/Main.parlyn-scene.json', world:'worlds/Main.parlyn-world.json', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() };
  const world={ format:'parlyn-world', version:1, name:`${name} World`, seed:slug(name), capsules:[], ways:[], landmarks:[], encounters:[], memory:{} };
  const { normalizeDocument } = await persistence;
  const normalizedProject = normalizeDocument(project, 'parlyn-project');
  const normalizedWorld = normalizeDocument(world, 'parlyn-world');
  const normalizedScene = payload?.scene ? normalizeDocument(payload.scene, 'parlyn-scene') : null;
  try {
    await fs.mkdir(path.join(projectRoot,'scenes'),{ recursive:true });
    await fs.mkdir(path.join(projectRoot,'assets'),{ recursive:true });
    await fs.mkdir(path.join(projectRoot,'worlds'),{ recursive:true });
    await fs.mkdir(path.join(projectRoot,'.parlyn'),{ recursive:true });
    await writeDocumentAtomic(path.join(projectRoot,'parlyn.project.json'), normalizedProject, 'parlyn-project', 'Parlyn project file');
    await writeDocumentAtomic(path.join(projectRoot,'worlds','Main.parlyn-world.json'), normalizedWorld, 'parlyn-world', 'Parlyn world');
    if (normalizedScene) await writeDocumentAtomic(path.join(projectRoot,'scenes','Main.parlyn-scene.json'), normalizedScene, 'parlyn-scene', 'Parlyn scene');
  } catch (error) {
    await fs.rm(projectRoot, { recursive:true, force:true }).catch(() => {});
    throw error;
  }
  const activeProjectRoot=projectSession.activate(await fs.realpath(projectRoot));
  return { canceled:false, projectRoot:activeProjectRoot, project, world, assets:await listAssets(activeProjectRoot), scenes:await listProjectScenes(activeProjectRoot) };
}, { payload:true });

secureHandle('parlyn:project:open', async () => {
  const choose=await dialog.showOpenDialog({ title:'Open Parlyn Project', properties:['openDirectory'] });
  if (choose.canceled || !choose.filePaths[0]) return { canceled:true };
  const projectRoot=await fs.realpath(choose.filePaths[0]);
  const projectFile=await resolveExistingProjectPath(projectRoot,'parlyn.project.json','Parlyn project file');
  const project=await readDocument(projectFile, 'parlyn-project', 'Parlyn project file');
  const scenePath=await resolveExistingProjectPath(projectRoot,project.startupScene,'Startup scene');
  const worldPath=await resolveExistingProjectPath(projectRoot,project.world,'World document');
  const scene=await readDocument(scenePath, 'parlyn-scene', 'Startup scene');
  const world=await readDocument(worldPath, 'parlyn-world', 'World document');
  const sceneHistory=await loadSceneHistory(projectRoot, project.startupScene, scene);
  projectSession.activate(projectRoot);
  return { canceled:false, projectRoot, project, scene, world, assets:await listAssets(projectRoot), scenes:await listProjectScenes(projectRoot), history:sceneHistory.history, historyWarning:sceneHistory.warning };
});

secureHandle('parlyn:project:open-scene', async (payload) => {
  const activeProjectRoot=projectSession.activeProjectRoot;
  if (!activeProjectRoot) throw new Error('Open a project before selecting a project scene.');
  const relativePath=payload?.relativePath;
  if (typeof relativePath !== 'string' || !relativePath.startsWith('scenes/') || !relativePath.endsWith('.parlyn-scene.json')) throw new Error('Invalid project scene path.');
  const scenePath=await resolveExistingProjectPath(activeProjectRoot,relativePath,'Project scene');
  const scene=await readDocument(scenePath, 'parlyn-scene', 'Project scene');
  const sceneHistory=await loadSceneHistory(activeProjectRoot, relativePath, scene);
  return { ok:true, relativePath, scene, history:sceneHistory.history, historyWarning:sceneHistory.warning };
}, { payload:true });

secureHandle('parlyn:project:create-scene', async (payload) => {
  const activeProjectRoot=projectSession.activeProjectRoot;
  if (!activeProjectRoot) throw new Error('Open a project before creating a project scene.');
  const relativePath=requireScenePath(payload?.relativePath);
  const target=await resolveWritableProjectPathCreatingParents(activeProjectRoot,relativePath,'New project scene');
  try { await fs.access(target); throw new Error('A scene already exists at that project path.'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await writeDocumentAtomic(target,payload?.scene,'parlyn-scene','New project scene');
  return { ok:true, relativePath, scenes:await listProjectScenes(activeProjectRoot) };
}, { payload:true });

secureHandle('parlyn:project:move-scene', async (payload) => {
  const activeProjectRoot=projectSession.activeProjectRoot;
  if (!activeProjectRoot) throw new Error('Open a project before moving a project scene.');
  const sourcePath=requireScenePath(payload?.sourcePath);
  const targetPath=requireScenePath(payload?.targetPath);
  if (sourcePath === targetPath) return { ok:true, relativePath:sourcePath, scenes:await listProjectScenes(activeProjectRoot) };
  const source=await resolveExistingProjectPath(activeProjectRoot,sourcePath,'Existing project scene');
  const target=await resolveWritableProjectPathCreatingParents(activeProjectRoot,targetPath,'New project scene path');
  try { await fs.access(target); throw new Error('A scene already exists at that project path.'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const scene=await readDocument(source,'parlyn-scene','Existing project scene');
  if (typeof payload?.name === 'string' && payload.name.trim()) scene.name=payload.name.trim();
  await writeDocumentAtomic(target,scene,'parlyn-scene','Moved project scene');
  const projectFile=await resolveWritableProjectPath(activeProjectRoot,'parlyn.project.json','Parlyn project file');
  const project=await readDocument(projectFile,'parlyn-project','Parlyn project file');
  if (project.startupScene === sourcePath) project.startupScene=targetPath;
  project.updatedAt=new Date().toISOString();
  await writeDocumentAtomic(projectFile,project,'parlyn-project','Parlyn project file');
  await fs.unlink(source);
  return { ok:true, relativePath:targetPath, project, scene, scenes:await listProjectScenes(activeProjectRoot) };
}, { payload:true });

secureHandle('parlyn:project:close', async () => projectSession.close());

secureHandle('parlyn:project:delete', async (payload) => projectSession.moveToTrash(payload?.confirmationName), { payload:true });

secureHandle('parlyn:project:save-scene', async (payload) => {
  const activeProjectRoot=projectSession.activeProjectRoot;
  if (!activeProjectRoot) return { ok:false, reason:'no-project' };
  const relativePath=payload?.relativePath || 'scenes/Main.parlyn-scene.json';
  const target=await resolveWritableProjectPath(activeProjectRoot,relativePath,'Project scene path');
  await writeDocumentAtomic(target, payload?.scene, 'parlyn-scene', 'Parlyn scene');
  let historyWarning = null;
  if (payload?.history) {
    try {
      await fs.mkdir(path.join(activeProjectRoot,'.parlyn'), { recursive:true });
      const historyTarget=await resolveWritableProjectPath(activeProjectRoot,STARTUP_HISTORY_PATH,'Scene history path');
      const historyDocument={ format:'parlyn-scene-history', version:1, scenePath:relativePath, currentScene:payload.scene, history:payload.history, updatedAt:new Date().toISOString() };
      await writeDocumentAtomic(historyTarget, historyDocument, 'parlyn-scene-history', 'Parlyn scene history');
    } catch (error) {
      historyWarning=error.message;
    }
  }
  const projectFile=await resolveWritableProjectPath(activeProjectRoot,'parlyn.project.json','Parlyn project file');
  const project=await readDocument(projectFile, 'parlyn-project', 'Parlyn project file');
  project.updatedAt=new Date().toISOString();
  await writeDocumentAtomic(projectFile, project, 'parlyn-project', 'Parlyn project file');
  return { ok:true, filePath:target, relativePath, historyWarning, scenes:await listProjectScenes(activeProjectRoot) };
}, { payload:true });

secureHandle('parlyn:project:save-world', async (payload) => {
  const activeProjectRoot=projectSession.activeProjectRoot;
  if (!activeProjectRoot) return { ok:false, reason:'no-project' };
  const relativePath=payload?.relativePath || 'worlds/Main.parlyn-world.json';
  const target=await resolveWritableProjectPath(activeProjectRoot,relativePath,'Project world path');
  await writeDocumentAtomic(target, payload?.world, 'parlyn-world', 'Parlyn world');
  const projectFile=await resolveWritableProjectPath(activeProjectRoot,'parlyn.project.json','Parlyn project file');
  const project=await readDocument(projectFile, 'parlyn-project', 'Parlyn project file');
  project.updatedAt=new Date().toISOString();
  await writeDocumentAtomic(projectFile, project, 'parlyn-project', 'Parlyn project file');
  return { ok:true, filePath:target, relativePath };
}, { payload:true });

secureHandle('parlyn:project:import-assets', async () => {
  const activeProjectRoot=projectSession.activeProjectRoot;
  if (!activeProjectRoot) return { canceled:false, reason:'no-project', assets:[] };
  const choose=await dialog.showOpenDialog({
    title:'Import Assets into Parlyn Project',
    properties:['openFile','multiSelections'],
    filters:[
      { name:'Supported Assets', extensions:['png','jpg','jpeg','webp','svg','glb','gltf','obj','wav','ogg','mp3'] },
      { name:'All Files', extensions:['*'] }
    ]
  });
  if (choose.canceled) return { canceled:true, assets:await listAssets(activeProjectRoot) };
  const assetsRoot=await resolveExistingProjectPath(activeProjectRoot,'assets','Assets directory');
  for (const source of choose.filePaths) {
    let target=path.join(assetsRoot,path.basename(source));
    let i=1;
    while (true) {
      try { await fs.access(target); const ext=path.extname(source), base=path.basename(source,ext); target=path.join(assetsRoot,`${base}-${i++}${ext}`); }
      catch (error) { if (error.code === 'ENOENT') break; throw error; }
    }
    await fs.copyFile(source,target);
  }
  return { canceled:false, assets:await listAssets(activeProjectRoot) };
});

secureHandle('parlyn:project:move-asset', async (payload) => {
  const activeProjectRoot = projectSession.activeProjectRoot;
  if (!activeProjectRoot) throw new Error('Open a project before moving an asset.');
  return { ok:true, ...await moveAsset(activeProjectRoot, payload?.sourcePath, payload?.targetPath) };
}, { payload:true });

app.whenReady().then(()=>{
  createWindow();
  app.on('activate',()=>{ if (BrowserWindow.getAllWindows().length===0) createWindow(); });
});
app.on('window-all-closed',()=>{ if (process.platform!=='darwin') app.quit(); });
