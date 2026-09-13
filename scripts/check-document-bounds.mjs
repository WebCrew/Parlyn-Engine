import assert from 'node:assert/strict';
import * as THREE from 'three';
import { normalizeDocumentBounds } from '../src/engine/core/DocumentBounds.mjs';
import { SceneDocument } from '../src/engine/scene/SceneDocument.mjs';
import { WorldDocument } from '../src/engine/world/WorldDocument.mjs';
import { History } from '../src/engine/history/History.mjs';
import { SceneHistoryDocument } from '../src/engine/history/SceneHistoryDocument.mjs';
import { normalizeDocument } from '../src/engine/persistence/DocumentPersistence.mjs';
import { ThreeRenderer } from '../src/engine/render/ThreeRenderer.mjs';

const bounds = { min:{ x:-20, y:-3, z:-10 }, max:{ x:20, y:8, z:10 } };
assert.equal(normalizeDocumentBounds(undefined), null);
for (const invalid of [false, [], {}, { min:[], max:{} }]) assert.throws(() => normalizeDocumentBounds(invalid));
for (const bad of [NaN, Infinity, -Infinity, '1', 1000001, -1000001]) {
  const copy = structuredClone(bounds); copy.min.x = bad;
  assert.throws(() => normalizeDocumentBounds(copy));
}
for (const axis of ['x', 'y', 'z']) for (const offset of [0, 1]) {
  const copy = structuredClone(bounds); copy.min[axis] = copy.max[axis] + offset;
  assert.throws(() => normalizeDocumentBounds(copy));
}
const normalized = normalizeDocumentBounds(bounds);
normalized.min.x = 99;
assert.equal(bounds.min.x, -20, 'Normalization must isolate mutable vectors.');

const scene = new SceneDocument();
const oldScene = scene.toJSON();
assert.ok(!Object.hasOwn(oldScene, 'bounds'));
assert.equal(SceneDocument.fromJSON(oldScene).bounds, null);
const oldWorld = new WorldDocument().toJSON();
assert.equal(WorldDocument.fromJSON(oldWorld).bounds, null);
scene.bounds = structuredClone(bounds);
const world = new WorldDocument({ bounds });
for (const doc of [scene, world]) {
  const json = doc.toJSON();
  assert.deepEqual(normalizeDocument(JSON.parse(JSON.stringify(json))).bounds, bounds);
  json.bounds.max.x = 99;
  assert.equal(doc.bounds.max.x, 20, 'Serialization must isolate bounds.');
  doc.bounds.min.x = doc.bounds.max.x;
  assert.throws(() => doc.toJSON());
  doc.bounds = structuredClone(bounds);
}
const history = new History();
history.push(oldScene, 'Change Scene Bounds');
const undo = history.undo(scene.toJSON());
assert.equal(SceneDocument.fromJSON(undo.snapshot).bounds, null);
assert.deepEqual(SceneDocument.fromJSON(history.redo(oldScene).snapshot).bounds, bounds);
const restoredHistory = new History();
restoredHistory.restoreState(history.exportState());
assert.equal(restoredHistory.canUndo, true);
const historyDocument = new SceneHistoryDocument({ scenePath:'scenes/main.parlynscene', currentScene:scene.toJSON(), history:history.exportState() });
assert.deepEqual(normalizeDocument(historyDocument.toJSON()).currentScene.bounds, bounds);
for (const original of [scene.toJSON(), world.toJSON()]) {
  const invalid = structuredClone(original);
  invalid.bounds.min.y = invalid.bounds.max.y;
  assert.throws(() => normalizeDocument(invalid), 'Invalid bounds must be rejected on document load.');
}

const renderer = new ThreeRenderer(null);
renderer.scene = new THREE.Scene();
const targetBefore = renderer.cameraTarget.clone();
renderer.setDocumentBounds('scene', bounds);
renderer.setDocumentBounds('world', bounds);
assert.equal(renderer.scene.children.length, 2);
assert.equal(renderer.nodeObjects.size, 0, 'Bounds guides must not be selectable scene nodes.');
const helper = renderer.boundsHelpers.get('scene');
assert.deepEqual(helper.box.min.toArray(), [-20, -3, -10]);
renderer.setDocumentBounds('scene', structuredClone(bounds));
assert.equal(renderer.boundsHelpers.get('scene'), helper, 'Unchanged guides must not be recreated.');
let disposed = false;
helper.geometry.addEventListener('dispose', () => { disposed = true; });
renderer.setDocumentBounds('scene', null);
assert.equal(disposed, true);
assert.equal(renderer.scene.children.length, 1);
assert.deepEqual(renderer.cameraTarget, targetBefore);
renderer.setDocumentBounds('world', null);
assert.equal(renderer.scene.children.length, 0);
console.log('Optional scene/world bounds contract check passed.');
