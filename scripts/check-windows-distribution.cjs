const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

requireValue(pkg.scripts?.['build:windows']?.includes('electron-builder --win nsis'), 'Missing reproducible NSIS build script.');
requireValue(pkg.build?.appId === 'org.parlyn.engine', 'Unexpected Windows app ID.');
requireValue(pkg.build?.productName === 'Parlyn Engine', 'Unexpected Windows product name.');
requireValue(pkg.build?.win?.requestedExecutionLevel === 'asInvoker', 'Installer must not request unnecessary elevation.');
requireValue(pkg.build?.nsis?.oneClick === false, 'Installer must use the reviewable wizard flow.');
requireValue(pkg.build?.nsis?.perMachine === false, 'Installer must remain per-user by default.');
requireValue(pkg.build?.nsis?.deleteAppDataOnUninstall === false, 'Uninstall must preserve user data.');

const icon = fs.readFileSync(path.join(root, 'build/icon.ico'));
requireValue(icon.length > 4, 'Windows icon is empty.');
requireValue(icon[0] === 0 && icon[1] === 0 && icon[2] === 1 && icon[3] === 0, 'Windows icon has an invalid ICO header.');

const workflow = fs.readFileSync(path.join(root, '.github/workflows/windows-installer.yml'), 'utf8');
requireValue(workflow.includes('WINDOWS_CSC_LINK'), 'Windows workflow is missing its signing boundary.');
requireValue(workflow.includes('require_signing'), 'Windows workflow must distinguish signed and unsigned preflight builds.');
requireValue(!workflow.includes('BEGIN PRIVATE KEY'), 'Signing material must never be embedded in the workflow.');

const gitignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
for (const sensitivePattern of ['*.pfx', '*.p12', '*.key']) {
  requireValue(gitignore.split(/\r?\n/).includes(sensitivePattern), `Missing signing-secret ignore rule: ${sensitivePattern}`);
}

console.log('Windows distribution configuration check passed.');
