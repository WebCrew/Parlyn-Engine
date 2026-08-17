import { Node } from './Node.mjs';

export class Node2_5D extends Node {
  constructor(options = {}) {
    super({ ...options, type: options.type ?? 'Node2_5D' });
    this.position = { x: 0, y: 0, z: 0, ...(options.position ?? {}) };
    this.rotation = Number(options.rotation ?? 0);
    this.scale = { x: 1, y: 1, ...(options.scale ?? {}) };
    this.depthLayer = options.depthLayer ?? 'gameplay';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      position: { ...this.position },
      rotation: this.rotation,
      scale: { ...this.scale },
      depthLayer: this.depthLayer
    };
  }
}
