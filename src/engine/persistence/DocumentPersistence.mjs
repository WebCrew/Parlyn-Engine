import { ProjectDocument } from '../project/ProjectDocument.mjs';
import { SceneDocument } from '../scene/SceneDocument.mjs';
import { WorldDocument } from '../world/WorldDocument.mjs';
import { SceneHistoryDocument } from '../history/SceneHistoryDocument.mjs';

const DOCUMENT_READERS = new Map([
  [ProjectDocument.FORMAT, (data) => ProjectDocument.fromJSON(data)],
  [SceneDocument.FORMAT, (data) => SceneDocument.fromJSON(data)],
  [WorldDocument.FORMAT, (data) => WorldDocument.fromJSON(data)],
  [SceneHistoryDocument.FORMAT, (data) => SceneHistoryDocument.fromJSON(data)]
]);

function requirePlainJson(value, path = 'document') {
  const ancestors = new Set();
  const pending = [{ value, path, exit:false }];
  while (pending.length) {
    const current = pending.pop();
    if (current.exit) {
      ancestors.delete(current.value);
      continue;
    }
    const item = current.value;
    if (item === null || typeof item === 'string' || typeof item === 'boolean') continue;
    if (typeof item === 'number') {
      if (!Number.isFinite(item)) throw new TypeError(`${current.path} contains a non-finite number.`);
      continue;
    }
    if (typeof item !== 'object') throw new TypeError(`${current.path} contains a value that JSON cannot preserve.`);
    if (ancestors.has(item)) throw new TypeError(`${current.path} contains a circular reference.`);
    const prototype = Object.getPrototypeOf(item);
    if (!Array.isArray(item) && prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(`${current.path} must contain only plain JSON objects and arrays.`);
    }

    ancestors.add(item);
    pending.push({ value:item, path:current.path, exit:true });
    if (Array.isArray(item)) {
      for (let index = item.length - 1; index >= 0; index -= 1) {
        pending.push({ value:item[index], path:`${current.path}[${index}]`, exit:false });
      }
    } else {
      const keys = Reflect.ownKeys(item);
      for (let index = keys.length - 1; index >= 0; index -= 1) {
        const key = keys[index];
        if (typeof key !== 'string') throw new TypeError(`${current.path} contains a symbol key that JSON cannot preserve.`);
        const descriptor = Object.getOwnPropertyDescriptor(item, key);
        if (!descriptor?.enumerable || descriptor.get || descriptor.set) {
          throw new TypeError(`${current.path}.${key} is not a plain JSON property.`);
        }
        pending.push({ value:item[key], path:`${current.path}.${key}`, exit:false });
      }
    }
  }
}

export function normalizeDocument(data, expectedFormat = null) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new TypeError('Parlyn document must be a JSON object.');
  }
  requirePlainJson(data);
  if (expectedFormat && data.format !== expectedFormat) {
    throw new Error(`Expected ${expectedFormat}, received ${data.format ?? 'an unmarked document'}.`);
  }
  const reader = DOCUMENT_READERS.get(data.format);
  if (!reader) throw new Error(`Unsupported Parlyn document format: ${data.format ?? 'missing'}`);
  const normalized = reader(data).toJSON();
  requirePlainJson(normalized);
  return normalized;
}

export function parseDocumentText(source, expectedFormat = null, label = 'Parlyn document') {
  if (typeof source !== 'string') throw new TypeError(`${label} source must be text.`);
  let data;
  try {
    data = JSON.parse(source);
  } catch (error) {
    throw new Error(`${label} contains invalid JSON.`, { cause:error });
  }
  try {
    return normalizeDocument(data, expectedFormat);
  } catch (error) {
    throw new Error(`${label} is invalid: ${error.message}`, { cause:error });
  }
}

export function stringifyDocument(data, expectedFormat = null, label = 'Parlyn document') {
  try {
    return `${JSON.stringify(normalizeDocument(data, expectedFormat), null, 2)}\n`;
  } catch (error) {
    throw new Error(`${label} cannot be saved: ${error.message}`, { cause:error });
  }
}
