export class History {
  constructor({ limit = 100 } = {}) {
    if (!Number.isInteger(limit) || limit < 1) throw new RangeError('History limit must be a positive integer.');
    this.limit = limit;
    this.undoStack = [];
    this.redoStack = [];
  }

  push(snapshot, label = 'Change') {
    this.undoStack.push({ snapshot:cloneSnapshot(snapshot), label:requireLabel(label) });
    if (this.undoStack.length > this.limit) this.undoStack.shift();
    this.redoStack = [];
  }

  undo(currentSnapshot) {
    if (!this.undoStack.length) return null;
    const current = cloneSnapshot(currentSnapshot);
    const entry = this.undoStack.pop();
    this.redoStack.push({ snapshot:current, label:entry.label });
    return structuredClone(entry);
  }

  redo(currentSnapshot) {
    if (!this.redoStack.length) return null;
    const current = cloneSnapshot(currentSnapshot);
    const entry = this.redoStack.pop();
    this.undoStack.push({ snapshot:current, label:entry.label });
    return structuredClone(entry);
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }

  exportState({ maxBytes = Number.POSITIVE_INFINITY } = {}) {
    if (!(maxBytes > 0)) throw new RangeError('History export maxBytes must be positive.');
    const state = {
      version:1,
      undoStack:this.undoStack.map(cloneEntry),
      redoStack:this.redoStack.map(cloneEntry)
    };
    while (encodedSize(state) > maxBytes && (state.undoStack.length || state.redoStack.length)) {
      if (state.undoStack.length) state.undoStack.shift();
      else state.redoStack.shift();
    }
    return state;
  }

  restoreState(state) {
    if (!state || state.version !== 1 || !Array.isArray(state.undoStack) || !Array.isArray(state.redoStack)) {
      throw new TypeError('History state must be a supported Parlyn history object.');
    }
    if (state.undoStack.length + state.redoStack.length > this.limit) {
      throw new RangeError(`History state exceeds the configured limit of ${this.limit}.`);
    }
    const undoStack = state.undoStack.map(requireEntry);
    const redoStack = state.redoStack.map(requireEntry);
    this.undoStack = undoStack;
    this.redoStack = redoStack;
  }

  get canUndo() { return this.undoStack.length > 0; }
  get canRedo() { return this.redoStack.length > 0; }
}

function requireLabel(value) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError('History label must be a non-empty string.');
  return value.trim();
}

function cloneSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') throw new TypeError('History snapshot must be an object or array.');
  try {
    return structuredClone(snapshot);
  } catch (error) {
    throw new TypeError('History snapshot must be structured-cloneable.', { cause:error });
  }
}

function cloneEntry(entry) {
  return { snapshot:cloneSnapshot(entry.snapshot), label:requireLabel(entry.label) };
}

function requireEntry(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new TypeError('History entry must be an object.');
  return cloneEntry(entry);
}

function encodedSize(value) {
  return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}
