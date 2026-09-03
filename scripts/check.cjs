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
  'src/main/projectPaths.js',
  'src/main/preload.js',
  'src/renderer/index.html',
  'src/renderer/app.mjs',
  'src/engine/project/ProjectDocument.mjs',
  'src/engine/world/WorldDocument.mjs',
  'src/engine/world/DeterministicEncounter.mjs',
  'src/engine/render/RendererBackend.mjs',
  'src/engine/render/ThreeRenderer.mjs',
  'src/engine/modules/ModuleRegistry.mjs',
  'src/modules/example/ExampleModule.mjs',
  'docs/MODULE-SYSTEM.md',
  'docs/SMART-SYSTEMS.md',
  'docs/AUTHENTICATION.md',
  'scripts/check-smart-systems.mjs',
  'scripts/check-core-persistence.mjs'
];

for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) throw new Error(`Missing required file: ${rel}`);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.name !== 'parlyn-engine') throw new Error('Unexpected package name.');
if (pkg.version !== '0.5.0') throw new Error(`Unexpected package version: ${pkg.version}`);

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

console.log(`Parlyn structure check passed (${codeFiles.length} JavaScript modules checked).`);
