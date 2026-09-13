import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import projectPaths from './projectPaths.js';
import { readDocumentFile, writeDocumentFileAtomic } from './documentFiles.mjs';

const LEGACY_PATH = '.parlyn/startup-scene.parlyn-history.json';
const MAX_HISTORY_FILE_BYTES = 32 * 1024 * 1024;
const { validateRelativeProjectPath, resolveExistingProjectPath, resolveWritableProjectPathCreatingParents } = projectPaths;

export function sceneHistoryRelativePath(scenePath) {
  validateRelativeProjectPath(scenePath, 'Scene history scene path');
  const key = createHash('sha256').update(scenePath, 'utf8').digest('hex');
  return `.parlyn/scene-history/${key}.parlyn-history.json`;
}

export async function loadSceneHistory(projectRoot, scenePath, currentScene) {
  try {
    let file;
    try {
      file = await resolveExistingProjectPath(projectRoot, sceneHistoryRelativePath(scenePath), 'Scene history file');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      // Legacy files remain read-only. They are accepted only for their own scene.
      try { file = await resolveExistingProjectPath(projectRoot, LEGACY_PATH, 'Legacy scene history file'); }
      catch (legacyError) {
        if (legacyError.code === 'ENOENT') return { history:null, warning:null };
        throw legacyError;
      }
    }
    if ((await fs.stat(file)).size > MAX_HISTORY_FILE_BYTES) return { history:null, warning:'Saved scene history exceeded the 32 MiB safety limit and was ignored.' };
    const document = await readDocumentFile(file, 'parlyn-scene-history', 'Parlyn scene history');
    if (document.scenePath !== scenePath || JSON.stringify(document.currentScene) !== JSON.stringify(currentScene)) {
      return { history:null, warning:'Saved scene history did not match the current scene and was safely ignored.' };
    }
    return { history:document.history, warning:null };
  } catch (error) {
    return { history:null, warning:error.message };
  }
}

export async function saveSceneHistory(projectRoot, scenePath, currentScene, history) {
  const target = await resolveWritableProjectPathCreatingParents(projectRoot, sceneHistoryRelativePath(scenePath), 'Scene history path');
  const document = { format:'parlyn-scene-history', version:1, scenePath, currentScene, history, updatedAt:new Date().toISOString() };
  await writeDocumentFileAtomic(target, document, 'parlyn-scene-history', 'Parlyn scene history');
}
