import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as THREE from 'three';
import { SceneDocument } from '../src/engine/scene/SceneDocument.mjs';
import { Node3D } from '../src/engine/core/Node3D.mjs';
import { Node2_5D } from '../src/engine/core/Node2_5D.mjs';
import { ThreeRenderer } from '../src/engine/render/ThreeRenderer.mjs';
import { History } from '../src/engine/history/History.mjs';
import { placeNodeOnSurface } from '../src/engine/editor/SurfacePlacement.mjs';

const scene = new SceneDocument();
const base = scene.root.addChild(new Node3D({ type:'Mesh3D', position:{y:0}, scale:{x:4,y:0.5,z:4} }));
const upper = scene.root.addChild(new Node3D({ type:'Mesh3D', position:{y:2}, scale:{x:2,y:0.5,z:2} }));
const moving = scene.root.addChild(new Node3D({ type:'Mesh3D', position:{y:5} }));
const renderer = new ThreeRenderer(null); renderer.scene = new THREE.Scene(); renderer.rebuild(scene);
assert.equal(renderer.getSurfacePlacedPosition(moving.id).y, 3.125, 'Nearest lower platform must win.');
assert.equal(renderer.getSurfacePlacedPosition(moving.id, [upper.id]).y, 1.125);
const beforeQuery = scene.toJSON();
renderer.getSurfacePlacedPosition(moving.id);
assert.deepEqual(scene.toJSON(), beforeQuery, 'Query must not mutate documents.');
moving.position.x = 20; renderer.updateNodeTransform(moving);
assert.ok(Math.abs(renderer.getSurfacePlacedPosition(moving.id).y + 0.8) < 0.000001, 'Missing mesh support uses the editor ground.');
moving.position.y = -5; renderer.updateNodeTransform(moving);
assert.equal(renderer.getSurfacePlacedPosition(moving.id), null, 'No upward placement from below ground.');
assert.equal(renderer.getSurfacePlacedPosition('missing'), null);
moving.position = {x:0,y:5,z:0}; upper.position.y = 8; renderer.updateNodeTransform(moving); renderer.updateNodeTransform(upper);
assert.equal(renderer.getSurfacePlacedPosition(moving.id).y, 1.125, 'Overhead platforms must not lift the node.');
upper.position.y = 2;
moving.position = {x:0,y:5,z:0};
upper.enabled = false; renderer.rebuild(scene);
assert.equal(renderer.getSurfacePlacedPosition(moving.id).y, 1.125, 'Disabled supports are excluded.');
upper.enabled = true;
const sprite = scene.root.addChild(new Node2_5D({ type:'Billboard2_5D', position:{x:0,y:6,z:0} }));
sprite.metadata = {width:2,height:2}; renderer.rebuild(scene);
assert.equal(renderer.getSurfacePlacedPosition(sprite.id).y, 3.375, 'Billboards can be placed on mesh surfaces.');
assert.equal(placeNodeOnSurface(scene, renderer, sprite.id), true);
assert.equal(placeNodeOnSurface(scene, renderer, sprite.id), false, 'Already placed nodes are a no-op.');
assert.equal(placeNodeOnSurface(scene, renderer, scene.root.id), false);

// Execute the actual editor commit function to verify opt-out and one-step Undo.
const source = fs.readFileSync(new URL('../src/renderer/app.mjs', import.meta.url), 'utf8');
const start = source.indexOf('function commitGizmoTransform(id, transform)');
const end = source.indexOf('function transformModeLabel', start);
assert.ok(start >= 0 && end > start);
for (const enabled of [false, true]) for (const mode of ['translate', 'rotate', 'scale']) {
  moving.position = {x:0,y:5,z:0}; renderer.rebuild(scene);
  const before = scene.toJSON(); const history = new History();
  const context = {scene, renderer, gizmoStartSnapshot:before, transformMode:mode,
    surfacePlacementEnabled:enabled, selected:null, selectedIds:new Set([moving.id]),
    placeNodeOnSurface, populateInspector(){}, sceneSnapshot:()=>scene.toJSON(),
    applyGizmoTransform(id, transform){ moving.position = {...transform.position}; renderer.updateNodeTransform(moving); },
    pushHistory(snapshot,label){ history.push(snapshot,label); },
    transformModeLabel:()=>mode, status:{textContent:''} };
  const commit = vm.runInNewContext('(' + source.slice(start,end).trim() + ')', context);
  commit(moving.id, {position:{x:0.2,y:5,z:0}});
  assert.equal(moving.position.y, enabled && mode === 'translate' ? 3.125 : 5);
  assert.equal(history.undoStack.length, 1, 'Move and placement must be one history entry.');
  assert.deepEqual(history.undo(scene.toJSON()).snapshot, before);
}
// Hierarchy exclusions must not inadvertently exclude unrelated sibling supports.
moving.position = {x:0,y:5,z:0}; renderer.rebuild(scene);
assert.equal(placeNodeOnSurface(scene, renderer, moving.id, [moving.id]), true);
assert.equal(moving.position.y, 3.125);
console.log('Optional Move-release surface placement checks passed.');
