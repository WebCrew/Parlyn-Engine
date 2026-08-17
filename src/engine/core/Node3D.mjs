import { Node } from './Node.mjs';

export class Node3D extends Node {
  constructor(options = {}) {
    super({ ...options, type: options.type ?? 'Node3D' });
    this.position = { x: 0, y: 0, z: 0, ...(options.position ?? {}) };
    this.rotation = { x: 0, y: 0, z: 0, ...(options.rotation ?? {}) };
    this.scale = { x: 1, y: 1, z: 1, ...(options.scale ?? {}) };
  }

  toJSON() {
    return {
      ...super.toJSON(),
      position: { ...this.position },
      rotation: { ...this.rotation },
      scale: { ...this.scale }
    };
  }
}
