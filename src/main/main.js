const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs/promises');
const path = require('path');
const { resolveProjectPath } = require('./projectPaths');

let activeProjectRoot = null;

function safeName(value, fallback = 'Parlyn-Project') {
  const cleaned = String(value || fallback).trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, '-').replace(/\s+/g, ' ').replace(/[. ]+$/g, '');
  return cleaned || fallback;
}

function slug(value, fallback = 'parlyn-project') {
  return safeName(value, fallback).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || fallback;
}

async function readJson(filePath, label = 'JSON document') {
  let source;
  try {
    source = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Could not read ${label}: ${filePath}`, { cause:error });
  }
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`${label} contains invalid JSON: ${filePath}`, { cause:error });
  }
}

function validateProjectManifest(project) {
  if (!project || project.format !== 'parlyn-project') throw new Error('The selected folder is not a Parlyn project.');
  if (Number(project.version) !== 1) throw new Error(`Unsupported Parlyn project version: ${project.version}`);
  resolveProjectPath('.', project.startupScene, 'Startup scene');
  resolveProjectPath('.', project.world, 'World document');
  return project;
}

async function listAssets(projectRoot) {
  if (!projectRoot) return [];
  const assetsRoot = path.join(projectRoot, 'assets');
  const result = [];
  async function walk(dir) {
    let entries = [];
    try { entries = await fs.readdir(dir, { withFileTypes:true }); } catch { return; }
    for (const entry of entries) {
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
  win.loadFile(path.join(__dirname,'..','renderer','index.html'));
}

ipcMain.handle('parlyn:scene:save-as', async (_event, payload) => {
  const defaultName = `${slug(payload?.name || 'scene','scene')}.parlyn-scene.json`;
  const result = await dialog.showSaveDialog({ title:'Save Parlyn Scene', defaultPath:defaultName, filters:[{ name:'Parlyn Scene', extensions:['json'] }] });
  if (result.canceled || !result.filePath) return { canceled:true };
  if (payload?.scene?.format !== 'parlyn-scene') throw new Error('Invalid Parlyn scene document.');
  await fs.writeFile(result.filePath, JSON.stringify(payload.scene,null,2),'utf8');
  return { canceled:false, filePath:result.filePath };
});

ipcMain.handle('parlyn:scene:open', async () => {
  const result = await dialog.showOpenDialog({ title:'Open Parlyn Scene', properties:['openFile'], filters:[{ name:'Parlyn Scene', extensions:['json'] }] });
  if (result.canceled || !result.filePaths[0]) return { canceled:true };
  const filePath=result.filePaths[0];
  return { canceled:false, filePath, scene:await readJson(filePath) };
});

ipcMain.handle('parlyn:project:create', async (_event, payload) => {
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
  await fs.mkdir(path.join(projectRoot,'scenes'),{ recursive:true });
  await fs.mkdir(path.join(projectRoot,'assets'),{ recursive:true });
  await fs.mkdir(path.join(projectRoot,'worlds'),{ recursive:true });
  await fs.mkdir(path.join(projectRoot,'.parlyn'),{ recursive:true });
  const project={ format:'parlyn-project', version:1, name, startupScene:'scenes/Main.parlyn-scene.json', world:'worlds/Main.parlyn-world.json', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() };
  const world={ format:'parlyn-world', version:1, name:`${name} World`, seed:slug(name), capsules:[], ways:[], landmarks:[], encounters:[], memory:{} };
  await fs.writeFile(path.join(projectRoot,'parlyn.project.json'),JSON.stringify(project,null,2),'utf8');
  await fs.writeFile(path.join(projectRoot,'worlds','Main.parlyn-world.json'),JSON.stringify(world,null,2),'utf8');
  if (payload?.scene) await fs.writeFile(path.join(projectRoot,'scenes','Main.parlyn-scene.json'),JSON.stringify(payload.scene,null,2),'utf8');
  activeProjectRoot=projectRoot;
  return { canceled:false, projectRoot, project, world, assets:await listAssets(projectRoot) };
});

ipcMain.handle('parlyn:project:open', async () => {
  const choose=await dialog.showOpenDialog({ title:'Open Parlyn Project', properties:['openDirectory'] });
  if (choose.canceled || !choose.filePaths[0]) return { canceled:true };
  const projectRoot=choose.filePaths[0];
  const projectFile=path.join(projectRoot,'parlyn.project.json');
  const project=validateProjectManifest(await readJson(projectFile, 'Parlyn project file'));
  const scenePath=resolveProjectPath(projectRoot,project.startupScene,'Startup scene');
  const worldPath=resolveProjectPath(projectRoot,project.world,'World document');
  const scene=await readJson(scenePath,'Startup scene');
  const world=await readJson(worldPath,'World document');
  if (scene?.format !== 'parlyn-scene') throw new Error('The startup scene is not a Parlyn scene document.');
  if (world?.format !== 'parlyn-world') throw new Error('The world file is not a Parlyn world document.');
  activeProjectRoot=projectRoot;
  return { canceled:false, projectRoot, project, scene, world, assets:await listAssets(projectRoot) };
});

ipcMain.handle('parlyn:project:save-scene', async (_event, payload) => {
  if (!activeProjectRoot) return { ok:false, reason:'no-project' };
  const relativePath=payload?.relativePath || 'scenes/Main.parlyn-scene.json';
  const target=resolveProjectPath(activeProjectRoot,relativePath,'Project scene path');
  if (payload?.scene?.format !== 'parlyn-scene') throw new Error('Invalid Parlyn scene document.');
  await fs.mkdir(path.dirname(target),{ recursive:true });
  await fs.writeFile(target,JSON.stringify(payload.scene,null,2),'utf8');
  const projectFile=path.join(activeProjectRoot,'parlyn.project.json');
  const project=validateProjectManifest(await readJson(projectFile,'Parlyn project file'));
  project.updatedAt=new Date().toISOString();
  await fs.writeFile(projectFile,JSON.stringify(project,null,2),'utf8');
  return { ok:true, filePath:target, relativePath };
});

ipcMain.handle('parlyn:project:save-world', async (_event, payload) => {
  if (!activeProjectRoot) return { ok:false, reason:'no-project' };
  const relativePath=payload?.relativePath || 'worlds/Main.parlyn-world.json';
  const target=resolveProjectPath(activeProjectRoot,relativePath,'Project world path');
  if (payload?.world?.format !== 'parlyn-world') throw new Error('Invalid Parlyn world document.');
  await fs.mkdir(path.dirname(target),{ recursive:true });
  await fs.writeFile(target,JSON.stringify(payload.world,null,2),'utf8');
  return { ok:true, filePath:target, relativePath };
});

ipcMain.handle('parlyn:project:import-assets', async () => {
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
  const assetsRoot=path.join(activeProjectRoot,'assets');
  await fs.mkdir(assetsRoot,{ recursive:true });
  for (const source of choose.filePaths) {
    let target=path.join(assetsRoot,path.basename(source));
    let i=1;
    while (true) {
      try { await fs.access(target); const ext=path.extname(source), base=path.basename(source,ext); target=path.join(assetsRoot,`${base}-${i++}${ext}`); }
      catch { break; }
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
