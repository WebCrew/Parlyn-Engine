import { History } from './History.mjs';
import { SceneDocument } from '../scene/SceneDocument.mjs';

const FORMAT = 'parlyn-scene-history';
const VERSION = 1;
const MAX_ENTRIES = 100;

export class SceneHistoryDocument {
  static FORMAT = FORMAT;
  static VERSION = VERSION;

  constructor({ scenePath, currentScene, history, updatedAt = new Date().toISOString() }) {
    if (typeof scenePath !== 'string' || !scenePath.trim()) throw new TypeError('Scene history requires a scene path.');
    if (typeof updatedAt !== 'string' || !Number.isFinite(Date.parse(updatedAt))) throw new TypeError('Scene history requires a valid updatedAt timestamp.');
    this.format = FORMAT;
    this.version = VERSION;
    this.scenePath = scenePath.trim();
    this.currentScene = SceneDocument.fromJSON(currentScene).toJSON();
    const normalizedHistory = structuredClone(history);
    for (const stackName of ['undoStack', 'redoStack']) {
      if (!Array.isArray(normalizedHistory?.[stackName])) throw new TypeError(`Scene history ${stackName} must be an array.`);
      for (const entry of normalizedHistory[stackName]) entry.snapshot = SceneDocument.fromJSON(entry.snapshot).toJSON();
    }
    const validatedHistory = new History({ limit:MAX_ENTRIES });
    validatedHistory.restoreState(normalizedHistory);
    this.history = validatedHistory.exportState();
    this.updatedAt = updatedAt;
  }

  toJSON() {
    return {
      format:this.format,
      version:this.version,
      scenePath:this.scenePath,
      currentScene:structuredClone(this.currentScene),
      history:structuredClone(this.history),
      updatedAt:this.updatedAt
    };
  }

  static fromJSON(data) {
    if (!data || data.format !== FORMAT) throw new Error('Not a Parlyn scene history file.');
    if (data.version !== VERSION) throw new Error(`Unsupported Parlyn scene history version: ${data.version}`);
    return new SceneHistoryDocument(data);
  }
}
