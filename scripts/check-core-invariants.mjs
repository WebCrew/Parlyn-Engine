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

const oversizedScene = sceneWithDepth(0);
for (let index = 0; index < 10000; index += 1) {
  oversizedScene.root.children.push({ id:`wide-${index}`, name:`Wide ${index}`, type:'Node', enabled:true, metadata:{}, children:[] });
}
assert.throws(() => SceneDocument.fromJSON(oversizedScene), /maximum node count/);

console.log('Node hierarchy and History invariant check passed.');
