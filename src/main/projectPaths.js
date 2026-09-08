const path = require('path');
const fs = require('fs/promises');

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

function isInside(root, target) {
  return target !== root && target.startsWith(root + path.sep);
}

function isInsideOrEqual(root, target) {
  return target === root || target.startsWith(root + path.sep);
}

async function resolveExistingProjectPath(projectRoot, relativePath, label = 'Project path') {
  const target = resolveProjectPath(projectRoot, relativePath, label);
  const [realRoot, realTarget] = await Promise.all([fs.realpath(projectRoot), fs.realpath(target)]);
  if (!isInside(realRoot, realTarget)) throw new Error(`${label} escapes the project root through a symbolic link.`);
  return realTarget;
}

async function resolveWritableProjectPath(projectRoot, relativePath, label = 'Project path') {
  const target = resolveProjectPath(projectRoot, relativePath, label);
  const [realRoot, realParent] = await Promise.all([fs.realpath(projectRoot), fs.realpath(path.dirname(target))]);
  if (!isInsideOrEqual(realRoot, realParent)) throw new Error(`${label} escapes the project root through a symbolic link.`);
  try {
    const info = await fs.lstat(target);
    if (info.isSymbolicLink()) throw new Error(`${label} cannot replace a symbolic link.`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  return path.join(realParent, path.basename(target));
}

async function resolveWritableProjectPathCreatingParents(projectRoot, relativePath, label = 'Project path') {
  const target = resolveProjectPath(projectRoot, relativePath, label);
  const realRoot = await fs.realpath(projectRoot);
  const parentParts = path.relative(path.resolve(projectRoot), path.dirname(target)).split(path.sep).filter(Boolean);
  let current = realRoot;
  for (const part of parentParts) {
    const next = path.join(current, part);
    try {
      const info = await fs.lstat(next);
      if (info.isSymbolicLink() || !info.isDirectory()) throw new Error(`${label} contains an unsafe parent.`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await fs.mkdir(next);
    }
    current = await fs.realpath(next);
    if (!isInsideOrEqual(realRoot, current)) throw new Error(`${label} escapes the project root.`);
  }
  return resolveWritableProjectPath(projectRoot, relativePath, label);
}

module.exports = { validateRelativeProjectPath, resolveProjectPath, resolveExistingProjectPath, resolveWritableProjectPath, resolveWritableProjectPathCreatingParents };
