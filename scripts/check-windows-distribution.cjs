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
const previewWorkflow = fs.readFileSync(path.join(root, '.github/workflows/publish-unsigned-preview.yml'), 'utf8');
const msixWorkflow = fs.readFileSync(path.join(root, '.github/workflows/unsigned-msix-test.yml'), 'utf8');
requireValue(workflow.includes('signpath/github-action-submit-signing-request@v2'), 'Windows workflow is missing the SignPath signing action.');
for (const setting of [
  'SIGNPATH_API_TOKEN',
  'SIGNPATH_ORGANIZATION_ID',
  'SIGNPATH_PROJECT_SLUG',
  'SIGNPATH_SIGNING_POLICY_SLUG',
  'WINDOWS_EXPECTED_PUBLISHER',
]) {
  requireValue(workflow.includes(setting), `Windows workflow is missing its signing setting: ${setting}`);
}
requireValue(workflow.includes('github-artifact-id'), 'SignPath must sign the uploaded GitHub workflow artifact.');
requireValue(workflow.includes('Verify signed Windows artifacts'), 'Signed output must be verified before publication.');
requireValue(workflow.includes('require_signing'), 'Windows workflow must distinguish signed and unsigned preflight builds.');
requireValue(!workflow.includes('BEGIN PRIVATE KEY'), 'Signing material must never be embedded in the workflow.');
requireValue(previewWorkflow.includes('Compress-Archive'), 'Unsigned previews must create a portable ZIP test artifact.');
requireValue(previewWorkflow.includes('Parlyn-Engine-Portable-0.5.0-beta.18-x64.zip'), 'Portable preview artifact has an unexpected name.');
requireValue(previewWorkflow.includes('release/win-unpacked/Parlyn Engine.exe'), 'Portable preview must verify its packaged executable.');
requireValue(msixWorkflow.includes('workflow_dispatch:'), 'Unsigned MSIX testing must support explicit manual dispatch.');
requireValue(msixWorkflow.includes('actions/upload-artifact@v7'), 'Unsigned MSIX testing must upload only an internal workflow artifact.');

const msixManifest = fs.readFileSync(path.join(root, 'build/msix/AppxManifest.xml'), 'utf8');
requireValue(msixManifest.includes('Publisher="CN=AppModelSamples, OID.2.25.311729368913984317654407730594956997722=1"'), "Unsigned MSIX identity must match Microsoft's documented unsigned namespace publisher.");
requireValue(msixManifest.includes('WebCrew.ParlynEngine.Development'), 'Unsigned MSIX must use a development-only identity.');
requireValue(msixManifest.includes('runFullTrust'), 'Packaged Electron editor requires the full-trust capability.');
const msixScript = fs.readFileSync(path.join(root, 'scripts/build-unsigned-msix-test.ps1'), 'utf8');
requireValue(msixScript.includes('MakeAppx.exe'), 'Unsigned MSIX build must use the Windows SDK packager.');
requireValue(msixScript.includes('Get-FileHash'), 'Unsigned MSIX build must produce a SHA-256 checksum.');

const gitignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
for (const sensitivePattern of ['*.pfx', '*.p12', '*.key']) {
  requireValue(gitignore.split(/\r?\n/).includes(sensitivePattern), `Missing signing-secret ignore rule: ${sensitivePattern}`);
}

console.log('Windows distribution configuration check passed.');
