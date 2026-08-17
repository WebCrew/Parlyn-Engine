export class Node {
  constructor({ id = crypto.randomUUID(), name = 'Node', type = 'Node' } = {}) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.parent = null;
    this.children = [];
    this.enabled = true;
    this.metadata = {};
  }

  addChild(node) {
    if (!(node instanceof Node)) throw new TypeError('Child must be a Parlyn Node.');
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
    visitor(this);
    this.children.forEach((child) => child.walk(visitor));
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
