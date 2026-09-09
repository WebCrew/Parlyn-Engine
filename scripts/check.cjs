const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.resolve(__dirname, '..');
const required = [
  'package.json',
  'README.md',
  'LICENSE',
  'assets/branding/parlyn-logo-dark.svg',
  'assets/branding/parlyn-logo-light.svg',
  'src/main/main.js',
  'src/main/documentFiles.mjs',
  'src/main/ipcSecurity.js',
  'src/main/projectPaths.js',
  'src/main/assetFiles.js',
  'src/main/ProjectSession.js',
  'src/main/preload.js',
  'src/renderer/index.html',
  'src/renderer/asset-browser.css',
  'src/renderer/app.mjs',
  'src/engine/project/ProjectDocument.mjs',
  'src/engine/editor/UnsavedChanges.mjs',
  'src/engine/editor/WorkspaceLayout.mjs',
  'src/engine/history/SceneHistoryDocument.mjs',
  'src/engine/persistence/DocumentPersistence.mjs',
  'src/engine/world/WorldDocument.mjs',
  'src/engine/world/DeterministicEncounter.mjs',
  'src/engine/render/RendererBackend.mjs',
  'src/engine/render/ThreeRenderer.mjs',
  'src/engine/modules/ModuleRegistry.mjs',
  'src/modules/example/ExampleModule.mjs',
  'docs/MODULE-SYSTEM.md',
  'docs/SMART-SYSTEMS.md',
  'docs/AUTHENTICATION.md',
  'docs/WINDOWS-DISTRIBUTION.md',
  'docs/MAINTAINER-ACCEPTANCE-v0.5.0-beta.4.md',
  'docs/MAINTAINER-ACCEPTANCE-v0.5.0-beta.5.md',
  'docs/MAINTAINER-ACCEPTANCE-v0.5.0-beta.7.md',
  'docs/MAINTAINER-ACCEPTANCE-v0.5.0-beta.8.md',
  'docs/MAINTAINER-ACCEPTANCE-v0.5.0-beta.9.md',
  'docs/MAINTAINER-ACCEPTANCE-v0.5.0-beta.9.1.md',
  'build/icon.ico',
  '.github/workflows/windows-installer.yml',
  'scripts/check-smart-systems.mjs',
  'scripts/check-core-persistence.mjs',
  'scripts/check-core-invariants.mjs',
  'scripts/check-desktop-boundaries.cjs',
  'scripts/check-project-session.cjs',
  'scripts/check-unsaved-changes.mjs',
  'scripts/check-workspace-layout.mjs',
  'scripts/check-asset-files.cjs',
  'scripts/check-electron-preload.cjs',
  'scripts/check-windows-distribution.cjs',
  'scripts/verify-windows-artifacts.ps1'
];

for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) throw new Error(`Missing required file: ${rel}`);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.name !== 'parlyn-engine') throw new Error('Unexpected package name.');
if (pkg.version !== '0.5.0-beta.9.1') throw new Error(`Unexpected package version: ${pkg.version}`);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

const codeFiles = walk(path.join(root, 'src')).filter((file) => /\.(mjs|js)$/.test(file));
for (const file of codeFiles) {
  cp.execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
}

cp.execFileSync(process.execPath, [path.join(root, 'scripts/check-smart-systems.mjs')], { stdio: 'inherit' });
cp.execFileSync(process.execPath, [path.join(root, 'scripts/check-core-persistence.mjs')], { stdio: 'inherit' });
cp.execFileSync(process.execPath, [path.join(root, 'scripts/check-core-invariants.mjs')], { stdio: 'inherit' });
cp.execFileSync(process.execPath, [path.join(root, 'scripts/check-desktop-boundaries.cjs')], { stdio: 'inherit' });
cp.execFileSync(process.execPath, [path.join(root, 'scripts/check-project-session.cjs')], { stdio: 'inherit' });
cp.execFileSync(process.execPath, [path.join(root, 'scripts/check-unsaved-changes.mjs')], { stdio: 'inherit' });
cp.execFileSync(process.execPath, [path.join(root, 'scripts/check-workspace-layout.mjs')], { stdio: 'inherit' });
cp.execFileSync(process.execPath, [path.join(root, 'scripts/check-asset-files.cjs')], { stdio: 'inherit' });
cp.execFileSync(process.execPath, [path.join(root, 'scripts/check-windows-distribution.cjs')], { stdio: 'inherit' });

console.log(`Parlyn structure check passed (${codeFiles.length} JavaScript modules checked).`);
