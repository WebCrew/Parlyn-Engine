const fs = require('fs/promises');
const path = require('path');
const { validateRelativeProjectPath, resolveExistingProjectPath, resolveWritableProjectPathCreatingParents } = require('./projectPaths');

function requireAssetPath(value, label = 'Asset path') {
  const relativePath = validateRelativeProjectPath(value, label);
  if (!/^assets\/.+/.test(relativePath)) throw new Error(`${label} must stay inside the project's assets folder.`);
  if (!path.posix.extname(relativePath)) throw new Error(`${label} must identify a file with an extension.`);
  return relativePath;
}

async function listAssets(projectRoot) {
  if (!projectRoot) return [];
  let assetsRoot;
  try { assetsRoot = await resolveExistingProjectPath(projectRoot, 'assets', 'Assets directory'); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  const result = [];
  async function walk(directory) {
    let entries;
    try { entries = await fs.readdir(directory, { withFileTypes:true }); }
    catch (error) { if (error.code === 'ENOENT') return; throw error; }
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(fullPath);
      else if (entry.isFile()) result.push({ name:entry.name, relativePath:path.relative(projectRoot, fullPath).replace(/\\/g, '/'), extension:path.extname(entry.name).toLowerCase() });
    }
  }
  await walk(assetsRoot);
  return result.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

async function moveAsset(projectRoot, sourceValue, targetValue) {
  const sourcePath = requireAssetPath(sourceValue, 'Existing asset path');
  const targetPath = requireAssetPath(targetValue, 'New asset path');
  if (path.posix.extname(sourcePath).toLowerCase() !== path.posix.extname(targetPath).toLowerCase()) {
    throw new Error('Renaming an asset must preserve its file extension. Reimport the file to change its format.');
  }
  const source = await resolveExistingProjectPath(projectRoot, sourcePath, 'Existing asset');
  if (!(await fs.stat(source)).isFile()) throw new Error('The selected asset is not a regular file.');
  if (sourcePath === targetPath) return { relativePath:sourcePath, assets:await listAssets(projectRoot) };
  const target = await resolveWritableProjectPathCreatingParents(projectRoot, targetPath, 'New asset path');
  try { await fs.link(source, target); }
  catch (error) {
    if (error.code === 'EEXIST') throw new Error('An asset already exists at that project path.');
    throw error;
  }
  try { await fs.unlink(source); }
  catch (error) {
    await fs.unlink(target).catch(() => {});
    throw error;
  }
  return { relativePath:targetPath, assets:await listAssets(projectRoot) };
}

module.exports = { requireAssetPath, listAssets, moveAsset };
