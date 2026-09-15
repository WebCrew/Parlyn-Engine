import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { normalizeEditorSessionState } from '../engine/editor/EditorSessionState.mjs';

const MAX_SESSION_BYTES = 64 * 1024;

export async function readLastSession(filePath) {
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile() || stat.size > MAX_SESSION_BYTES) throw new Error('Last-session data is not a valid small file.');
    const normalized = normalizeEditorSessionState(JSON.parse(await fs.readFile(filePath, 'utf8')));
    if (!normalized) throw new Error('Last-session data has an unsupported format.');
    return normalized;
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    await clearLastSession(filePath);
    throw error;
  }
}

export async function writeLastSession(filePath, candidate) {
  const normalized = normalizeEditorSessionState(candidate);
  if (!normalized) throw new TypeError('Invalid editor session state.');
  const source = `${JSON.stringify(normalized, null, 2)}\n`;
  if (Buffer.byteLength(source, 'utf8') > MAX_SESSION_BYTES) throw new Error('Last-session data is too large.');
  const temporaryPath = `${filePath}.tmp-${process.pid}-${randomUUID()}`;
  await fs.mkdir(path.dirname(filePath), { recursive:true });
  try {
    await fs.writeFile(temporaryPath, source, { encoding:'utf8', flag:'wx' });
    await fs.rename(temporaryPath, filePath);
  } catch (error) {
    await fs.rm(temporaryPath, { force:true }).catch(() => {});
    throw error;
  }
  return normalized;
}

export async function clearLastSession(filePath) {
  await fs.rm(filePath, { force:true });
}
