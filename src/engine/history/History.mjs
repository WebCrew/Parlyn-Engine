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
