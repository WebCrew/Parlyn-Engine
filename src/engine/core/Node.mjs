export class Node {
  constructor({ id = crypto.randomUUID(), name = 'Node', type = 'Node' } = {}) {
    for (const [value, label] of [[id, 'Node id'], [name, 'Node name'], [type, 'Node type']]) {
      if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${label} must be a non-empty string.`);
    }
    this.id = id.trim();
    this.name = name.trim();
    this.type = type.trim();
    this.parent = null;
    this.children = [];
    this.enabled = true;
    this.metadata = {};
  }

  addChild(node) {
    if (!(node instanceof Node)) throw new TypeError('Child must be a Parlyn Node.');
    if (node === this) throw new Error('A node cannot be its own child.');
    for (let ancestor = this; ancestor; ancestor = ancestor.parent) {
      if (ancestor === node) throw new Error('A node cannot be parented below one of its descendants.');
    }
    if (node.parent) node.parent.removeChild(node);
    node.parent = this;
    this.children.push(node);
    return node;
  }

  removeChild(node) {
    const index = this.children.indexOf(node);
    if (index < 0) return false;
    this.children.splice(index, 1);
    node.parent = null;
    return true;
  }

  walk(visitor) {
    if (typeof visitor !== 'function') throw new TypeError('Node visitor must be a function.');
    const pending = [this];
    while (pending.length) {
      const node = pending.pop();
      visitor(node);
      for (let index = node.children.length - 1; index >= 0; index -= 1) pending.push(node.children[index]);
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      enabled: this.enabled,
      metadata: structuredClone(this.metadata),
      children: this.children.map((child) => child.toJSON())
    };
  }
}
