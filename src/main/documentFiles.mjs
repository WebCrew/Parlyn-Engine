import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { parseDocumentText, stringifyDocument } from '../engine/persistence/DocumentPersistence.mjs';

export async function readDocumentFile(filePath, expectedFormat, label = 'Parlyn document') {
  let source;
  try {
    source = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Could not read ${label}: ${filePath}`, { cause:error });
  }

  try {
    return parseDocumentText(source, expectedFormat, label);
  } catch (error) {
    throw new Error(`${error.message} (${filePath})`, { cause:error });
  }
}

export async function writeDocumentFileAtomic(filePath, document, expectedFormat, label = 'Parlyn document') {
  const source = stringifyDocument(document, expectedFormat, label);
  const temporaryPath = `${filePath}.tmp-${process.pid}-${randomUUID()}`;
  await fs.mkdir(path.dirname(filePath), { recursive:true });
  try {
    await fs.writeFile(temporaryPath, source, { encoding:'utf8', flag:'wx' });
    await fs.rename(temporaryPath, filePath);
  } catch (error) {
    await fs.rm(temporaryPath, { force:true }).catch(() => {});
    throw new Error(`Could not save ${label}: ${filePath}`, { cause:error });
  }
}
