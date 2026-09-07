const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs/promises');
const path = require('path');
const { pathToFileURL } = require('url');
const { resolveExistingProjectPath, resolveWritableProjectPath } = require('./projectPaths');
const { assertTrustedIpcEvent, assertIpcPayload } = require('./ipcSecurity');

let activeProjectRoot = null;
const persistence = import('../engine/persistence/DocumentPersistence.mjs');
const documentFiles = import('./documentFiles.mjs');
const EDITOR_FILE = path.join(__dirname, '..', 'renderer', 'index.html');
const EDITOR_URL = pathToFileURL(EDITOR_FILE).href;

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

async function listAssets(projectRoot) {
  if (!projectRoot) return [];
  let assetsRoot;
  try {
    assetsRoot = await resolveExistingProjectPath(projectRoot, 'assets', 'Assets directory');
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  const result = [];
  async function walk(dir) {
    let entries;
    try { entries = await fs.readdir(dir, { withFileTypes:true }); }
    catch (error) { if (error.code === 'ENOENT') return; throw error; }
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else result.push({ name:entry.name, relativePath:path.relative(projectRoot, full).replace(/\\/g,'/'), extension:path.extname(entry.name).toLowerCase() });
    }
  }
  await walk(assetsRoot);
  return result.sort((a,b)=>a.relativePath.localeCompare(b.relativePath));
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
  win.loadURL(EDITOR_URL);
}

function secureHandle(channel, handler, { payload = false } = {}) {
  ipcMain.handle(channel, async (event, value) => {
    assertTrustedIpcEvent(event, EDITOR_URL);
    if (payload) assertIpcPayload(value, `${channel} payload`);
    return handler(value);
  });
}

secureHandle('parlyn:app:get-info', async () => ({
  version:app.getVersion(),
  platform:process.platform
}));

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
  activeProjectRoot=await fs.realpath(projectRoot);
  return { canceled:false, projectRoot:activeProjectRoot, project, world, assets:await listAssets(activeProjectRoot) };
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
  activeProjectRoot=projectRoot;
  return { canceled:false, projectRoot, project, scene, world, assets:await listAssets(projectRoot) };
});

secureHandle('parlyn:project:save-scene', async (payload) => {
  if (!activeProjectRoot) return { ok:false, reason:'no-project' };
  const relativePath=payload?.relativePath || 'scenes/Main.parlyn-scene.json';
  const target=await resolveWritableProjectPath(activeProjectRoot,relativePath,'Project scene path');
  await writeDocumentAtomic(target, payload?.scene, 'parlyn-scene', 'Parlyn scene');
  const projectFile=await resolveWritableProjectPath(activeProjectRoot,'parlyn.project.json','Parlyn project file');
  const project=await readDocument(projectFile, 'parlyn-project', 'Parlyn project file');
  project.updatedAt=new Date().toISOString();
  await writeDocumentAtomic(projectFile, project, 'parlyn-project', 'Parlyn project file');
  return { ok:true, filePath:target, relativePath };
}, { payload:true });

secureHandle('parlyn:project:save-world', async (payload) => {
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

app.whenReady().then(()=>{
  createWindow();
  app.on('activate',()=>{ if (BrowserWindow.getAllWindows().length===0) createWindow(); });
});
app.on('window-all-closed',()=>{ if (process.platform!=='darwin') app.quit(); });
