const assert = require('assert/strict');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { assertTrustedIpcEvent, assertIpcPayload } = require('../src/main/ipcSecurity');
const { resolveExistingProjectPath, resolveWritableProjectPath, resolveWritableProjectPathCreatingParents } = require('../src/main/projectPaths');

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
    const nestedScenePath = await resolveWritableProjectPathCreatingParents(temporaryRoot, 'scenes/chapters/Intro.parlyn-scene.json');
    const realNestedParent = await fs.realpath(path.join(temporaryRoot, 'scenes', 'chapters'));
    assert.equal(nestedScenePath, path.join(realNestedParent, 'Intro.parlyn-scene.json'));

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
  const threeRenderer = await fs.readFile(path.join(repositoryRoot, 'src/engine/render/ThreeRenderer.mjs'), 'utf8');
  const styles = await fs.readFile(path.join(repositoryRoot, 'src/renderer/styles.css'), 'utf8');
  const main = await fs.readFile(path.join(repositoryRoot, 'src/main/main.js'), 'utf8');
  const preload = await fs.readFile(path.join(repositoryRoot, 'src/main/preload.js'), 'utf8');
  const pkg = JSON.parse(await fs.readFile(path.join(repositoryRoot, 'package.json'), 'utf8'));
  assert.match(html, /class="brand" aria-label="Parlyn Engine"/);
  assert.match(html, /alt="" aria-hidden="true" class="brand-logo"/);
  assert.match(html, /id="error-dialog"/);
  assert.match(html, /id="error-area"/);
  assert.match(html, /id="error-guidance"/);
  assert.match(html, /id="error-details"/);
  assert.match(html, /id="error-technical"/);
  assert.match(html, /id="copy-error"/);
  assert.match(html, /id="snap-toggle"[^>]+aria-pressed="false"/);
  assert.match(html, /id="snap-settings-dialog"/);
  assert.match(html, /id="transform-space"[^>]+aria-pressed="false"/);
  assert.match(html, /id="place-on-ground"/);
  assert.doesNotMatch(html, /class="mode-badge">2\.5D First/);
  assert.match(html, /class="tool-group viewport-tool-group" aria-label="Transform tools"/);
  assert.match(html, /class="tool-group placement-tool-group" aria-label="Placement tools"/);
  assert.match(html, /class="tool-group viewport-view-group" aria-label="Viewport mode"/);
  assert.equal((html.match(/class="command-icon"/g) || []).length, 7, 'Command Bar must expose seven Parlyn command icons.');
  assert.match(html, /id="tool-select"[^>]+aria-label="Select"/);
  assert.match(html, /id="tool-move"[^>]+aria-label="Move"/);
  assert.match(html, /id="tool-rotate"[^>]+aria-label="Rotate"/);
  assert.match(html, /id="tool-scale"[^>]+aria-label="Scale"/);
  assert.match(html, /id="place-on-ground"[^>]+aria-label="Place selection on ground"/);
  assert.match(html, /id="snap-translation"[^>]+min="0\.01"[^>]+max="100"/);
  assert.match(html, /id="snap-rotation"[^>]+min="1"[^>]+max="180"/);
  assert.match(html, /id="snap-scale"[^>]+min="0\.01"[^>]+max="10"/);
  assert.match(html, /id="view-menu"/);
  assert.match(html, /data-resize-panel="hierarchy"/);
  assert.match(html, /data-resize-panel="inspector"/);
  assert.match(html, /data-resize-panel="assets"/);
  assert.match(html, /asset-browser\.css/);
  const htmlIds = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(htmlIds).size, htmlIds.length, 'Editor element IDs must be unique.');
  const referencedIds = new Set([...renderer.matchAll(/\$\("([^"]+)"\)/g)].map((match) => match[1]));
  for (const id of referencedIds) assert.ok(htmlIds.includes(id), `Renderer references missing editor element #${id}.`);
  assert.ok(pkg.build.files.includes('assets/branding/**/*'), 'Packaged editor must include its branding assets.');
  assert.match(main, /setWindowOpenHandler/);
  assert.match(main, /will-navigate/);
  assert.match(main, /secureHandle\('parlyn:app:get-info'/);
  assert.match(main, /secureHandle\('parlyn:app:editor-ready'/);
  assert.match(main, /secureHandle\('parlyn:app:confirm-close'/);
  assert.match(main, /secureHandle\('parlyn:clipboard:write-text'/);
  assert.match(main, /parlyn:app:close-requested/);
  assert.match(main, /secureHandle\('parlyn:project:open'/);
  assert.match(main, /secureHandle\('parlyn:project:open-scene'/);
  assert.match(main, /secureHandle\('parlyn:project:create-scene'/);
  assert.match(main, /secureHandle\('parlyn:project:move-scene'/);
  assert.match(main, /secureHandle\('parlyn:project:move-asset'/);
  assert.match(main, /secureHandle\('parlyn:project:close'/);
  assert.match(main, /secureHandle\('parlyn:project:delete'/);
  assert.match(main, /parlyn-scene-history/);
  assert.match(renderer, /history\.exportState\(/);
  assert.match(renderer, /history\.restoreState\(result\.history\)/);
  assert.match(renderer, /normalizeWorkspaceLayout/);
  assert.match(renderer, /createErrorReport/);
  assert.match(renderer, /host\.copyText\(currentErrorReport\.technicalDetails\)/);
  assert.match(renderer, /normalizeTransformSnapping/);
  assert.match(renderer, /renderer\.setTransformSnapping\(transformSnapping\)/);
  assert.match(renderer, /parlyn\.editor\.transform-snapping/);
  assert.match(renderer, /snap-toggle/);
  assert.match(renderer, /saveTransformSnapSettings/);
  assert.match(renderer, /resetTransformSnapSettings/);
  assert.match(renderer, /normalizeTransformSpace/);
  assert.match(renderer, /renderer\.setTransformSpace\(transformSpace\.space\)/);
  assert.match(renderer, /parlyn\.editor\.transform-space/);
  assert.match(renderer, /querySelector\("\.command-label"\)\.textContent/);
  assert.match(renderer, /placeSelectionOnGround/);
  assert.match(renderer, /key === "end"/);
  assert.match(threeRenderer, /setTransformSpace\(space\)/);
  assert.match(threeRenderer, /this\.transformMode === 'scale' \? 'local' : this\.transformSpace/);
  assert.match(threeRenderer, /getGroundedPosition\(nodeId, groundY = -1\.55\)/);
  assert.match(renderer, /parlyn\.editor\.workspace-layout/);
  for (const [selector, column] of [['#hierarchy-panel', 1], ['#hierarchy-resizer', 2], ['.center', 3], ['#inspector-resizer', 4], ['#inspector-panel', 5]]) {
    assert.match(styles, new RegExp(`${selector.replace('.', '\\.') }\\{grid-column:${column}\\}`), `${selector} must keep a stable workspace grid column.`);
  }

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
  for (const method of ['getAppInfo','editorReady','onAppCloseRequested','confirmAppClose','copyText','createProject','openProject','openProjectScene','createProjectScene','moveProjectScene','closeProject','deleteProject','saveProjectScene','saveProjectWorld','saveSceneAs','openScene','importAssets','moveProjectAsset']) {
    assert.equal(typeof exposedHost[method], 'function', `Preload host is missing ${method}().`);
  }

  console.log('Desktop trust boundary and editor error contract check passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
