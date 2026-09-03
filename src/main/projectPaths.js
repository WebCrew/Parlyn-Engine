const path = require('path');

function validateRelativeProjectPath(value, label = 'Project path') {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${label} must be a non-empty string.`);
  if (value.includes('\\')) throw new Error(`${label} must use forward slashes.`);
  if (path.posix.isAbsolute(value) || path.win32.isAbsolute(value)) throw new Error(`${label} must be relative.`);
  const parts = value.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..')) throw new Error(`${label} contains an invalid segment.`);
  return value;
}

function resolveProjectPath(projectRoot, relativePath, label = 'Project path') {
  const safeRelativePath = validateRelativeProjectPath(relativePath, label);
  const root = path.resolve(projectRoot);
  const target = path.resolve(root, ...safeRelativePath.split('/'));
  if (target === root || !target.startsWith(root + path.sep)) throw new Error(`${label} escapes the project root.`);
  return target;
}

module.exports = { validateRelativeProjectPath, resolveProjectPath };
