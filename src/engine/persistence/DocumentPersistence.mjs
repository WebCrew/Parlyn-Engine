import { ProjectDocument } from '../project/ProjectDocument.mjs';
import { SceneDocument } from '../scene/SceneDocument.mjs';
import { WorldDocument } from '../world/WorldDocument.mjs';

const DOCUMENT_READERS = new Map([
  [ProjectDocument.FORMAT, (data) => ProjectDocument.fromJSON(data)],
  [SceneDocument.FORMAT, (data) => SceneDocument.fromJSON(data)],
  [WorldDocument.FORMAT, (data) => WorldDocument.fromJSON(data)]
]);

function requirePlainJson(value, path = 'document', ancestors = new Set()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError(`${path} contains a non-finite number.`);
    return;
  }
  if (typeof value !== 'object') throw new TypeError(`${path} contains a value that JSON cannot preserve.`);
  if (ancestors.has(value)) throw new TypeError(`${path} contains a circular reference.`);

  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${path} must contain only plain JSON objects and arrays.`);
  }

  ancestors.add(value);
  if (Array.isArray(value)) {
    value.forEach((item, index) => requirePlainJson(item, `${path}[${index}]`, ancestors));
  } else {
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== 'string') throw new TypeError(`${path} contains a symbol key that JSON cannot preserve.`);
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor?.enumerable || descriptor.get || descriptor.set) {
        throw new TypeError(`${path}.${key} is not a plain JSON property.`);
      }
      requirePlainJson(value[key], `${path}.${key}`, ancestors);
    }
  }
  ancestors.delete(value);
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
