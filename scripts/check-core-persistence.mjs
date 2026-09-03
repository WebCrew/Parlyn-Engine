import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { ProjectDocument } from '../src/engine/project/ProjectDocument.mjs';
import { SceneDocument } from '../src/engine/scene/SceneDocument.mjs';
import { Node2_5D } from '../src/engine/core/Node2_5D.mjs';
import { WorldDocument } from '../src/engine/world/WorldDocument.mjs';

const require = createRequire(import.meta.url);
const { validateRelativeProjectPath, resolveProjectPath } = require('../src/main/projectPaths.js');

const project = new ProjectDocument({ name:'Roundtrip', startupScene:'scenes/Main.parlyn-scene.json', world:'worlds/Main.parlyn-world.json' });
assert.deepEqual(ProjectDocument.fromJSON(project.toJSON()).toJSON(), project.toJSON());

const scene = new SceneDocument('Roundtrip Scene');
scene.root.addChild(new Node2_5D({ name:'Sprite', type:'Sprite2_5D', position:{ x:1, y:2, z:3 } }));
const restoredScene = SceneDocument.fromJSON(scene.toJSON());
assert.deepEqual(restoredScene.toJSON(), scene.toJSON());

const world = new WorldDocument({ name:'Roundtrip World', seed:'roundtrip' });
assert.deepEqual(WorldDocument.fromJSON(world.toJSON()).toJSON(), world.toJSON());

assert.equal(validateRelativeProjectPath('scenes/Main.parlyn-scene.json'), 'scenes/Main.parlyn-scene.json');
assert.match(resolveProjectPath('/tmp/parlyn-project', 'worlds/Main.parlyn-world.json'), /Main\.parlyn-world\.json$/);
for (const invalid of ['../outside.json', '/absolute.json', 'C:\\absolute.json', 'scenes\\Main.json', 'scenes//Main.json']) {
  assert.throws(() => validateRelativeProjectPath(invalid));
}

assert.throws(() => ProjectDocument.fromJSON({ format:'parlyn-project', version:99, name:'Future', startupScene:'scenes/Main.parlyn-scene.json' }), /Unsupported/);
assert.throws(() => SceneDocument.fromJSON({ format:'parlyn-scene', version:99, name:'Future', root:{ id:'root', name:'Root', type:'SceneRoot', children:[] } }), /Unsupported/);
assert.throws(() => WorldDocument.fromJSON({ format:'parlyn-world', version:99 }), /Unsupported/);

const duplicate = scene.toJSON();
duplicate.root.children.push(structuredClone(duplicate.root.children[0]));
assert.throws(() => SceneDocument.fromJSON(duplicate), /Duplicate node id/);

console.log('Core persistence contract check passed.');
