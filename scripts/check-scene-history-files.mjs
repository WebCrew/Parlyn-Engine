import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { SceneDocument } from '../src/engine/scene/SceneDocument.mjs';
import { History } from '../src/engine/history/History.mjs';
import { sceneHistoryRelativePath, saveSceneHistory, loadSceneHistory } from '../src/main/sceneHistoryFiles.mjs';
import { readDocumentFile, writeDocumentFileAtomic } from '../src/main/documentFiles.mjs';

const root = await fs.mkdtemp(path.join(os.tmpdir(), 'parlyn-per-scene-history-'));
try {
  const emptyRoot = path.join(root, 'empty');
  await fs.mkdir(emptyRoot);
  assert.deepEqual(await loadSceneHistory(emptyRoot, 'scenes/new.json', new SceneDocument().toJSON()), { history:null, warning:null });
  const entries = ['scenes/first/Demo.parlyn-scene.json', 'scenes/second/Demo.parlyn-scene.json'].map((scenePath, index) => {
    const scene = new SceneDocument(`Demo ${index}`);
    const before = scene.toJSON();
    scene.bounds = { min:{ x:-10-index, y:-3, z:-10 }, max:{ x:10+index, y:8, z:10 } };
    const history = new History(); history.push(before, 'Change Scene Bounds');
    return { scenePath, scene, before, history };
  });
  assert.notEqual(sceneHistoryRelativePath(entries[0].scenePath), sceneHistoryRelativePath(entries[1].scenePath));
  for (const entry of entries) {
    const file = path.join(root, entry.scenePath);
    await fs.mkdir(path.dirname(file), { recursive:true });
    await writeDocumentFileAtomic(file, entry.scene.toJSON(), 'parlyn-scene');
    await saveSceneHistory(root, entry.scenePath, entry.scene.toJSON(), entry.history.exportState());
  }
  // Save A, save B, reopen A, reopen B: each scene retains its own Undo.
  for (const entry of entries) {
    const scene = await readDocumentFile(path.join(root, entry.scenePath), 'parlyn-scene');
    const result = await loadSceneHistory(root, entry.scenePath, scene);
    assert.equal(result.warning, null);
    const restored = new History(); restored.restoreState(result.history);
    assert.equal(restored.canUndo, true);
    assert.deepEqual(restored.undo(scene).snapshot, entry.before);
    assert.deepEqual(restored.redo(entry.before).snapshot, scene);
  }
  // Persist an Undo followed by a switch/reopen: Redo is retained too.
  const first = entries[0];
  first.history.undo(first.scene.toJSON());
  await saveSceneHistory(root, first.scenePath, first.before, first.history.exportState());
  const redoResult = await loadSceneHistory(root, first.scenePath, first.before);
  const redoHistory = new History(); redoHistory.restoreState(redoResult.history);
  assert.equal(redoHistory.canRedo, true);
  assert.deepEqual(redoHistory.redo(first.before).snapshot, first.scene.toJSON());
  assert.equal((await loadSceneHistory(root, first.scenePath, first.scene.toJSON())).history, null, 'Stale history remains rejected.');
  assert.throws(() => sceneHistoryRelativePath('../outside.json'));

  // Legacy history is read-only, accepted only when path and snapshot match.
  const legacy = path.join(root, '.parlyn/startup-scene.parlyn-history.json');
  await writeDocumentFileAtomic(legacy, { format:'parlyn-scene-history', version:1,
    scenePath:'scenes/legacy.json', currentScene:first.before, history:new History().exportState(), updatedAt:new Date().toISOString() }, 'parlyn-scene-history');
  assert.notEqual((await loadSceneHistory(root, 'scenes/legacy.json', first.before)).history, null);
  assert.equal((await loadSceneHistory(root, 'scenes/other.json', first.before)).history, null);
  const legacyBefore = await fs.readFile(legacy, 'utf8');
  await saveSceneHistory(root, 'scenes/legacy.json', first.before, new History().exportState());
  assert.equal(await fs.readFile(legacy, 'utf8'), legacyBefore, 'New saves must not overwrite legacy history.');
  const primary = path.join(root, sceneHistoryRelativePath('scenes/legacy.json'));
  await fs.writeFile(primary, '{broken', 'utf8');
  assert.equal((await loadSceneHistory(root, 'scenes/legacy.json', first.before)).history, null, 'Corrupt primary must not fall back to an older legacy snapshot.');
} finally {
  await fs.rm(root, { recursive:true, force:true });
}
console.log('Per-scene saved Undo/Redo history regression check passed.');
