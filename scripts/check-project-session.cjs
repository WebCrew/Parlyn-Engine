const assert = require('assert/strict');
const path = require('path');
const { ProjectSession } = require('../src/main/ProjectSession');

(async () => {
  const projectRoot = path.resolve('test-project');
  const trashed = [];
  let loadFailure = null;
  let trashFailure = null;
  const session = new ProjectSession({
    async loadProject(root) {
      if (loadFailure) throw loadFailure;
      assert.equal(root, projectRoot);
      return { format:'parlyn-project', version:1, name:'Safety Test' };
    },
    async trashItem(root) { if (trashFailure) throw trashFailure; trashed.push(root); },
    isProtectedRoot:root => root === path.resolve('protected-user-folder')
  });

  assert.deepEqual(session.close(), { ok:false, reason:'no-project' });
  assert.deepEqual(await session.moveToTrash('Safety Test'), { ok:false, reason:'no-project' });
  assert.throws(() => session.activate('relative/project'), /absolute path/);

  session.activate(projectRoot);
  assert.equal(session.activeProjectRoot, projectRoot);
  const closed = session.close();
  assert.deepEqual(closed, { ok:true, projectRoot });
  assert.equal(session.activeProjectRoot, null);

  session.activate(projectRoot);
  await assert.rejects(session.moveToTrash('wrong name'), /exact project name/);
  assert.equal(session.activeProjectRoot, projectRoot);
  assert.deepEqual(trashed, []);

  loadFailure = new Error('Invalid project file');
  await assert.rejects(session.moveToTrash('Safety Test'), /Invalid project file/);
  assert.equal(session.activeProjectRoot, projectRoot);
  assert.deepEqual(trashed, []);

  loadFailure = null;
  trashFailure = new Error('Recycle Bin unavailable');
  await assert.rejects(session.moveToTrash('Safety Test'), /Recycle Bin unavailable/);
  assert.equal(session.activeProjectRoot, projectRoot);
  assert.deepEqual(trashed, []);

  trashFailure = null;
  const deleted = await session.moveToTrash('Safety Test');
  assert.deepEqual(deleted, { ok:true, projectRoot, projectName:'Safety Test' });
  assert.equal(session.activeProjectRoot, null);
  assert.deepEqual(trashed, [projectRoot]);

  session.activate(path.parse(projectRoot).root);
  await assert.rejects(session.moveToTrash('Safety Test'), /protected system or user folder/);
  session.activate(path.resolve('protected-user-folder'));
  await assert.rejects(session.moveToTrash('Safety Test'), /protected system or user folder/);

  console.log('Project session close and Recycle Bin contract check passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
