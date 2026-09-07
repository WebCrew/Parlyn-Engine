import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { ProjectDocument } from '../src/engine/project/ProjectDocument.mjs';
import { SceneDocument } from '../src/engine/scene/SceneDocument.mjs';
import { Node2_5D } from '../src/engine/core/Node2_5D.mjs';
import { WorldDocument } from '../src/engine/world/WorldDocument.mjs';
import { History } from '../src/engine/history/History.mjs';
import { SceneHistoryDocument } from '../src/engine/history/SceneHistoryDocument.mjs';
import { normalizeDocument, parseDocumentText, stringifyDocument } from '../src/engine/persistence/DocumentPersistence.mjs';
import { readDocumentFile, writeDocumentFileAtomic } from '../src/main/documentFiles.mjs';

const require = createRequire(import.meta.url);
const { validateRelativeProjectPath, resolveProjectPath } = require('../src/main/projectPaths.js');
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const project = new ProjectDocument({ name:'Roundtrip', startupScene:'scenes/Main.parlyn-scene.json', world:'worlds/Main.parlyn-world.json' });
assert.deepEqual(ProjectDocument.fromJSON(project.toJSON()).toJSON(), project.toJSON());

const scene = new SceneDocument('Roundtrip Scene');
const sprite = new Node2_5D({ name:'Sprite', type:'Sprite2_5D', position:{ x:1, y:2, z:3 } });
sprite.metadata = { extensionData:{ version:1, nodes:[{ id:'future-safe', operation:'placeholder' }] } };
scene.root.addChild(sprite);
const restoredScene = SceneDocument.fromJSON(scene.toJSON());
assert.deepEqual(restoredScene.toJSON(), scene.toJSON());

const legacyScene = scene.toJSON();
legacyScene.version = 1;
delete legacyScene.root.children[0].enabled;
delete legacyScene.root.children[0].metadata;
const migratedScene = SceneDocument.fromJSON(legacyScene).toJSON();
assert.equal(migratedScene.version, SceneDocument.VERSION);
assert.equal(migratedScene.root.children[0].enabled, true);
assert.deepEqual(migratedScene.root.children[0].metadata, {});

const world = new WorldDocument({ name:'Roundtrip World', seed:'roundtrip' });
assert.deepEqual(WorldDocument.fromJSON(world.toJSON()).toJSON(), world.toJSON());

const sceneHistory = new History({ limit:100 });
sceneHistory.push(scene.toJSON(), 'Add Sprite');
const historyDocument = new SceneHistoryDocument({
  scenePath:'scenes/Main.parlyn-scene.json',
  currentScene:scene.toJSON(),
  history:sceneHistory.exportState()
});
assert.deepEqual(SceneHistoryDocument.fromJSON(historyDocument.toJSON()).toJSON(), historyDocument.toJSON());

for (const document of [project.toJSON(), scene.toJSON(), world.toJSON(), historyDocument.toJSON()]) {
  const source = stringifyDocument(document, document.format);
  assert.deepEqual(parseDocumentText(source, document.format), normalizeDocument(document, document.format));
}

for (const [relativePath, format] of [
  ['samples/Parlyn-Test-Project/parlyn.project.json', 'parlyn-project'],
  ['samples/Parlyn-Test-Project/scenes/Main.parlyn-scene.json', 'parlyn-scene'],
  ['samples/Parlyn-Test-Project/worlds/Main.parlyn-world.json', 'parlyn-world']
]) {
  const samplePath = path.join(repositoryRoot, relativePath);
  const sample = await readDocumentFile(samplePath, format, `sample ${format}`);
  assert.equal(sample.format, format);
}

assert.equal(validateRelativeProjectPath('scenes/Main.parlyn-scene.json'), 'scenes/Main.parlyn-scene.json');
assert.match(resolveProjectPath('/tmp/parlyn-project', 'worlds/Main.parlyn-world.json'), /Main\.parlyn-world\.json$/);
for (const invalid of ['../outside.json', '/absolute.json', 'C:\\absolute.json', 'scenes\\Main.json', 'scenes//Main.json']) {
  assert.throws(() => validateRelativeProjectPath(invalid));
}

assert.throws(() => ProjectDocument.fromJSON({ format:'parlyn-project', version:99, name:'Future', startupScene:'scenes/Main.parlyn-scene.json' }), /missing world|Unsupported/);
assert.throws(() => ProjectDocument.fromJSON({ ...project.toJSON(), updatedAt:'not-a-date' }), /ISO 8601/);
assert.throws(() => SceneDocument.fromJSON({ format:'parlyn-scene', version:99, name:'Future', root:{ id:'root', name:'Root', type:'SceneRoot', children:[] } }), /Unsupported/);
assert.throws(() => SceneDocument.fromJSON({ format:'parlyn-scene', version:2, name:'Missing Root' }), /missing root/);
assert.throws(() => WorldDocument.fromJSON({ format:'parlyn-world', version:99 }), /Unsupported/);
assert.throws(() => WorldDocument.fromJSON({ format:'parlyn-world', version:1 }), /missing name/);
assert.throws(() => SceneHistoryDocument.fromJSON({ ...historyDocument.toJSON(), version:99 }), /Unsupported/);
const invalidHistorySnapshot = historyDocument.toJSON();
invalidHistorySnapshot.history.undoStack[0].snapshot.format = 'not-a-scene';
assert.throws(() => SceneHistoryDocument.fromJSON(invalidHistorySnapshot), /scene file/);

const duplicate = scene.toJSON();
duplicate.root.children.push(structuredClone(duplicate.root.children[0]));
assert.throws(() => SceneDocument.fromJSON(duplicate), /Duplicate node id/);

const invalidTransform = scene.toJSON();
invalidTransform.root.children[0].position.x = Number.NaN;
assert.throws(() => SceneDocument.fromJSON(invalidTransform), /finite number/);

const unknownNode = scene.toJSON();
unknownNode.root.children[0].type = 'FutureScriptNode';
assert.throws(() => SceneDocument.fromJSON(unknownNode), /Unsupported scene node type/);

const unsafeMetadata = scene.toJSON();
unsafeMetadata.root.children[0].metadata.callback = () => {};
assert.throws(() => stringifyDocument(unsafeMetadata, 'parlyn-scene'), /JSON cannot preserve/);

const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'parlyn-persistence-'));
try {
  const projectFile = path.join(temporaryRoot, 'parlyn.project.json');
  await writeDocumentFileAtomic(projectFile, project.toJSON(), 'parlyn-project', 'test project');
  const firstSource = await fs.readFile(projectFile, 'utf8');
  assert.deepEqual(await readDocumentFile(projectFile, 'parlyn-project', 'test project'), project.toJSON());

  await assert.rejects(
    writeDocumentFileAtomic(projectFile, { ...project.toJSON(), updatedAt:'invalid' }, 'parlyn-project', 'test project'),
    /cannot be saved/
  );
  assert.equal(await fs.readFile(projectFile, 'utf8'), firstSource, 'A rejected save must preserve the previous file.');
  assert.deepEqual((await fs.readdir(temporaryRoot)).filter((name) => name.includes('.tmp-')), []);

  const historyFile = path.join(temporaryRoot, 'startup-scene.parlyn-history.json');
  await writeDocumentFileAtomic(historyFile, historyDocument.toJSON(), 'parlyn-scene-history', 'test scene history');
  assert.deepEqual(await readDocumentFile(historyFile, 'parlyn-scene-history', 'test scene history'), historyDocument.toJSON());

  const malformedFile = path.join(temporaryRoot, 'broken.parlyn-scene.json');
  await fs.writeFile(malformedFile, '{ broken json', 'utf8');
  await assert.rejects(readDocumentFile(malformedFile, 'parlyn-scene', 'broken scene'), /invalid JSON/);
} finally {
  await fs.rm(temporaryRoot, { recursive:true, force:true });
}

console.log('Core persistence contract check passed.');
