import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { normalizeEditorSessionState, normalizeEditorViewState } from '../src/engine/editor/EditorSessionState.mjs';
import { clearLastSession, readLastSession, writeLastSession } from '../src/main/lastSessionFiles.mjs';

const view = normalizeEditorViewState({ mode:'3d', camera:{ target:{ x:3, y:4, z:5 }, orbit:{ yaw:1, pitch:99, distance:500 } }, selectionIds:['one', 'one', '', 7, 'two'] });
assert.deepEqual(view, { mode:'3d', camera:{ target:{ x:3, y:4, z:5 }, orbit:{ yaw:1, pitch:1.25, distance:40 } }, selectionIds:['one', 'two'] });
assert.equal(normalizeEditorSessionState(null), null);
assert.equal(normalizeEditorSessionState({ version:1, kind:'project', projectRoot:'C:\\Game' }), null);

const state = normalizeEditorSessionState({ version:1, kind:'project', projectRoot:'C:\\Game', scenePath:'scenes/Level.parlyn-scene.json', view });
assert.equal(state.kind, 'project');
assert.equal(state.scenePath, 'scenes/Level.parlyn-scene.json');

const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'parlyn-session-'));
const filePath = path.join(directory, 'last-session.json');
try {
  assert.equal(await readLastSession(filePath), null);
  await writeLastSession(filePath, state);
  assert.deepEqual(await readLastSession(filePath), state);
  await fs.writeFile(filePath, '{broken', 'utf8');
  await assert.rejects(readLastSession(filePath));
  assert.equal(await readLastSession(filePath), null);
  await writeLastSession(filePath, { version:1, kind:'scene', filePath:'C:\\Scene.json', view:{} });
  await clearLastSession(filePath);
  assert.equal(await readLastSession(filePath), null);
} finally {
  await fs.rm(directory, { recursive:true, force:true });
}

console.log('Editor last-session validation check passed.');
