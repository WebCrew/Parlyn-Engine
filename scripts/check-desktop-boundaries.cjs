const assert = require('assert/strict');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { assertTrustedIpcEvent, assertIpcPayload } = require('../src/main/ipcSecurity');
const { resolveExistingProjectPath, resolveWritableProjectPath } = require('../src/main/projectPaths');

(async () => {
  const editorUrl = 'file:///parlyn/src/renderer/index.html';
  assert.doesNotThrow(() => assertTrustedIpcEvent({ senderFrame:{ url:editorUrl } }, editorUrl));
  assert.throws(() => assertTrustedIpcEvent({ senderFrame:{ url:'https://example.invalid/' } }, editorUrl), /untrusted/);
  assert.throws(() => assertTrustedIpcEvent({}, editorUrl), /untrusted/);
  assert.deepEqual(assertIpcPayload({ scene:{ format:'parlyn-scene' } }), { scene:{ format:'parlyn-scene' } });
  assert.throws(() => assertIpcPayload('not-an-object'), /must be an object/);
  assert.throws(() => assertIpcPayload({ data:'x'.repeat(32) }, 'Small payload', 16), /IPC limit/);

  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'parlyn-boundary-'));
  const outsideRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'parlyn-outside-'));
  try {
    await fs.mkdir(path.join(temporaryRoot, 'scenes'));
    const scenePath = path.join(temporaryRoot, 'scenes', 'Main.parlyn-scene.json');
    await fs.writeFile(scenePath, '{}', 'utf8');
    const realScenePath = await fs.realpath(scenePath);
    assert.equal(await resolveExistingProjectPath(temporaryRoot, 'scenes/Main.parlyn-scene.json'), realScenePath);
    assert.equal(await resolveWritableProjectPath(temporaryRoot, 'scenes/Main.parlyn-scene.json'), realScenePath);

    try {
      await fs.symlink(outsideRoot, path.join(temporaryRoot, 'escaped'), 'dir');
      const outsideFile = path.join(outsideRoot, 'outside.json');
      await fs.writeFile(outsideFile, '{}', 'utf8');
      await assert.rejects(resolveExistingProjectPath(temporaryRoot, 'escaped/outside.json'), /symbolic link/);
      await assert.rejects(resolveWritableProjectPath(temporaryRoot, 'escaped/new.json'), /symbolic link/);
    } catch (error) {
      if (!['EPERM', 'EACCES', 'ENOSYS'].includes(error.code)) throw error;
    }
  } finally {
    await fs.rm(temporaryRoot, { recursive:true, force:true });
    await fs.rm(outsideRoot, { recursive:true, force:true });
  }

  const repositoryRoot = path.resolve(__dirname, '..');
  const html = await fs.readFile(path.join(repositoryRoot, 'src/renderer/index.html'), 'utf8');
  const renderer = await fs.readFile(path.join(repositoryRoot, 'src/renderer/app.mjs'), 'utf8');
  const main = await fs.readFile(path.join(repositoryRoot, 'src/main/main.js'), 'utf8');
  const preload = await fs.readFile(path.join(repositoryRoot, 'src/main/preload.js'), 'utf8');
  const pkg = JSON.parse(await fs.readFile(path.join(repositoryRoot, 'package.json'), 'utf8'));
  assert.match(html, /class="brand" aria-label="Parlyn Engine"/);
  assert.match(html, /alt="" aria-hidden="true" class="brand-logo"/);
  assert.match(html, /id="error-dialog"/);
  const htmlIds = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(htmlIds).size, htmlIds.length, 'Editor element IDs must be unique.');
  const referencedIds = new Set([...renderer.matchAll(/\$\("([^"]+)"\)/g)].map((match) => match[1]));
  for (const id of referencedIds) assert.ok(htmlIds.includes(id), `Renderer references missing editor element #${id}.`);
  assert.ok(pkg.build.files.includes('assets/branding/**/*'), 'Packaged editor must include its branding assets.');
  assert.match(main, /setWindowOpenHandler/);
  assert.match(main, /will-navigate/);
  assert.match(main, /secureHandle\('parlyn:app:get-info'/);
  assert.match(main, /secureHandle\('parlyn:project:open'/);

  let exposedHost = null;
  vm.runInNewContext(preload, {
    require(moduleName) {
      assert.equal(moduleName, 'electron', 'Sandboxed preload may only load Electron APIs.');
      return {
        contextBridge:{ exposeInMainWorld(name, value) { assert.equal(name, 'parlynHost'); exposedHost = value; } },
        ipcRenderer:{ invoke:async () => ({}) }
      };
    }
  }, { filename:'src/main/preload.js' });
  assert.ok(exposedHost, 'Preload must expose window.parlynHost.');
  for (const method of ['getAppInfo','createProject','openProject','saveProjectScene','saveProjectWorld','saveSceneAs','openScene','importAssets']) {
    assert.equal(typeof exposedHost[method], 'function', `Preload host is missing ${method}().`);
  }

  console.log('Desktop trust boundary and editor error contract check passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
