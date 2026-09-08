const assert = require('assert/strict');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { requireAssetPath, listAssets, moveAsset } = require('../src/main/assetFiles');

(async () => {
  assert.equal(requireAssetPath('assets/trees/oak.png'), 'assets/trees/oak.png');
  assert.throws(() => requireAssetPath('../oak.png'), /invalid segment/);
  assert.throws(() => requireAssetPath('assets/../oak.png'), /invalid segment/);
  assert.throws(() => requireAssetPath('assets\\oak.png'), /forward slashes/);
  assert.throws(() => requireAssetPath('assets/no-extension'), /extension/);

  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'parlyn-assets-'));
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'parlyn-assets-outside-'));
  try {
    await fs.mkdir(path.join(root, 'assets'));
    await fs.writeFile(path.join(root, 'assets', 'oak.png'), 'oak');
    await fs.writeFile(path.join(root, 'assets', 'taken.png'), 'taken');
    assert.deepEqual((await listAssets(root)).map((asset) => asset.relativePath), ['assets/oak.png', 'assets/taken.png']);

    const moved = await moveAsset(root, 'assets/oak.png', 'assets/trees/old-oak.png');
    assert.equal(moved.relativePath, 'assets/trees/old-oak.png');
    assert.equal(await fs.readFile(path.join(root, 'assets', 'trees', 'old-oak.png'), 'utf8'), 'oak');
    await assert.rejects(fs.access(path.join(root, 'assets', 'oak.png')));
    await assert.rejects(moveAsset(root, 'assets/trees/old-oak.png', 'assets/taken.png'), /already exists/);
    await assert.rejects(moveAsset(root, 'assets/trees/old-oak.png', 'assets/trees/old-oak.glb'), /preserve its file extension/);
    await assert.rejects(moveAsset(root, 'assets/trees/old-oak.png', 'scenes/old-oak.png'), /assets folder/);

    try {
      await fs.writeFile(path.join(outside, 'outside.png'), 'outside');
      await fs.symlink(path.join(outside, 'outside.png'), path.join(root, 'assets', 'linked.png'));
      await assert.rejects(moveAsset(root, 'assets/linked.png', 'assets/moved.png'), /symbolic link/);
      assert.ok(!(await listAssets(root)).some((asset) => asset.relativePath === 'assets/linked.png'));
    } catch (error) {
      if (!['EPERM', 'EACCES', 'ENOSYS'].includes(error.code)) throw error;
    }
  } finally {
    await fs.rm(root, { recursive:true, force:true });
    await fs.rm(outside, { recursive:true, force:true });
  }
  console.log('Project asset listing and move contract check passed.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
