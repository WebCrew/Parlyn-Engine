import assert from 'node:assert/strict';
import { Node } from '../src/engine/core/Node.mjs';
import { History } from '../src/engine/history/History.mjs';
import { SceneDocument } from '../src/engine/scene/SceneDocument.mjs';

assert.throws(() => new Node({ id:'', name:'Node', type:'Node' }), /Node id/);
assert.throws(() => new Node({ id:'node', name:' ', type:'Node' }), /Node name/);

const root = new Node({ id:'root', name:'Root', type:'Node' });
const branch = new Node({ id:'branch', name:'Branch', type:'Node' });
const leaf = new Node({ id:'leaf', name:'Leaf', type:'Node' });
root.addChild(branch);
branch.addChild(leaf);
assert.throws(() => root.addChild(root), /own child/);
assert.throws(() => leaf.addChild(root), /descendants/);
assert.equal(root.parent, null);
assert.equal(branch.parent, root);
assert.equal(leaf.parent, branch);

root.addChild(leaf);
assert.equal(leaf.parent, root);
assert.deepEqual(branch.children, []);
assert.deepEqual(root.children, [branch, leaf]);
const visited = [];
root.walk((node) => visited.push(node.id));
assert.deepEqual(visited, ['root', 'branch', 'leaf']);
assert.throws(() => root.walk(null), /visitor/);

const hierarchyScene = new SceneDocument('Hierarchy Commands');
const parentA = hierarchyScene.root.addChild(new Node({ id:'parent-a', name:'Parent A', type:'Node' }));
const parentB = hierarchyScene.root.addChild(new Node({ id:'parent-b', name:'Parent B', type:'Node' }));
const nested = parentA.addChild(new Node({ id:'nested', name:'Nested', type:'Node' }));
const duplicate = hierarchyScene.duplicateById(parentA.id);
assert.equal(duplicate.name, 'Parent A Copy');
assert.equal(duplicate.parent, hierarchyScene.root);
assert.equal(duplicate.children.length, 1);
assert.notEqual(duplicate.id, parentA.id);
assert.notEqual(duplicate.children[0].id, nested.id);
assert.equal(hierarchyScene.reparentById(nested.id, parentB.id), true);
assert.equal(nested.parent, parentB);
assert.equal(hierarchyScene.reparentById(nested.id, parentB.id), false);
assert.throws(() => hierarchyScene.reparentById(parentB.id, nested.id), /descendants/);
assert.throws(() => hierarchyScene.reparentById(hierarchyScene.root.id, parentA.id), /scene nodes/);

const deepRoot = new Node({ id:'deep-0', name:'Deep 0', type:'Node' });
let deepCursor = deepRoot;
for (let index = 1; index <= 2000; index += 1) {
  deepCursor = deepCursor.addChild(new Node({ id:`deep-${index}`, name:`Deep ${index}`, type:'Node' }));
}
let visitedCount = 0;
deepRoot.walk(() => { visitedCount += 1; });
assert.equal(visitedCount, 2001, 'Iterative traversal must handle deep runtime hierarchies.');

assert.throws(() => new History({ limit:0 }), /positive integer/);
assert.throws(() => new History({ limit:1.5 }), /positive integer/);
const history = new History({ limit:2 });
const first = { value:1 };
history.push(first, 'First');
first.value = 99;
history.push({ value:2 }, 'Second');
history.push({ value:3 }, 'Third');
assert.equal(history.undoStack.length, 2, 'History must enforce its configured limit.');
assert.deepEqual(history.undo({ value:4 }), { snapshot:{ value:3 }, label:'Third' });
const secondUndo = history.undo({ value:3 });
assert.deepEqual(secondUndo, { snapshot:{ value:2 }, label:'Second' });
secondUndo.snapshot.value = 100;
assert.deepEqual(history.redo({ value:2 }), { snapshot:{ value:3 }, label:'Second' });
history.push({ value:5 }, 'New branch');
assert.equal(history.canRedo, false, 'A new change must invalidate the redo branch.');
const exportedHistory = history.exportState();
assert.throws(() => history.exportState({ maxBytes:0 }), /positive/);
const boundedExport = history.exportState({ maxBytes:120 });
assert.ok(boundedExport.undoStack.length < exportedHistory.undoStack.length, 'Bounded history export must discard oldest entries when required.');
const restoredHistory = new History({ limit:2 });
restoredHistory.restoreState(exportedHistory);
exportedHistory.undoStack[0].snapshot.value = 999;
assert.deepEqual(restoredHistory.undo({ value:6 }), { snapshot:{ value:5 }, label:'New branch' });
assert.throws(() => restoredHistory.restoreState({ version:2, undoStack:[], redoStack:[] }), /supported/);
assert.throws(() => restoredHistory.restoreState({ version:1, undoStack:[{ snapshot:{}, label:'A' }, { snapshot:{}, label:'B' }], redoStack:[{ snapshot:{}, label:'C' }] }), /limit/);
assert.throws(() => history.push(null, 'Invalid'), /snapshot/);
assert.throws(() => history.push({ value:1 }, ' '), /label/);
history.clear();
assert.equal(history.canUndo, false);
assert.equal(history.canRedo, false);

function sceneWithDepth(depth) {
  const document = {
    format:'parlyn-scene', version:2, name:'Depth Test',
    root:{ id:'depth-root', name:'Root', type:'SceneRoot', enabled:true, metadata:{}, children:[] }
  };
  let cursor = document.root;
  for (let index = 1; index <= depth; index += 1) {
    const child = { id:`depth-node-${index}`, name:`Node ${index}`, type:'Node', enabled:true, metadata:{}, children:[] };
    cursor.children.push(child);
    cursor = child;
  }
  return document;
}

assert.doesNotThrow(() => SceneDocument.fromJSON(sceneWithDepth(256)));
assert.throws(() => SceneDocument.fromJSON(sceneWithDepth(257)), /maximum depth/);
const depthBoundScene = SceneDocument.fromJSON(sceneWithDepth(256));
const extraRootNode = depthBoundScene.root.addChild(new Node({ id:'depth-extra', name:'Depth Extra', type:'Node' }));
assert.throws(() => depthBoundScene.reparentById(extraRootNode.id, 'depth-node-256'), /maximum scene depth/);

const oversizedScene = sceneWithDepth(0);
for (let index = 0; index < 10000; index += 1) {
  oversizedScene.root.children.push({ id:`wide-${index}`, name:`Wide ${index}`, type:'Node', enabled:true, metadata:{}, children:[] });
}
assert.throws(() => SceneDocument.fromJSON(oversizedScene), /maximum node count/);

console.log('Node hierarchy and History invariant check passed.');
