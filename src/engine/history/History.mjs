export class History {
  constructor({ limit = 100 } = {}) {
    this.limit = limit;
    this.undoStack = [];
    this.redoStack = [];
  }

  push(snapshot, label = 'Change') {
    this.undoStack.push({ snapshot: structuredClone(snapshot), label });
    if (this.undoStack.length > this.limit) this.undoStack.shift();
    this.redoStack = [];
  }

  undo(currentSnapshot) {
    if (!this.undoStack.length) return null;
    const entry = this.undoStack.pop();
    this.redoStack.push({ snapshot: structuredClone(currentSnapshot), label: entry.label });
    return structuredClone(entry);
  }

  redo(currentSnapshot) {
    if (!this.redoStack.length) return null;
    const entry = this.redoStack.pop();
    this.undoStack.push({ snapshot: structuredClone(currentSnapshot), label: entry.label });
    return structuredClone(entry);
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }

  get canUndo() { return this.undoStack.length > 0; }
  get canRedo() { return this.redoStack.length > 0; }
}
