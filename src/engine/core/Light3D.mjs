import { Node3D } from './Node3D.mjs';

export class Light3D extends Node3D {
  constructor(options = {}) {
    super({ ...options, type: 'Light3D' });
    this.lightKind = options.lightKind ?? 'directional';
    this.color = options.color ?? '#ffffff';
    this.intensity = Number(options.intensity ?? 2);
    this.castShadow = Boolean(options.castShadow ?? true);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      lightKind: this.lightKind,
      color: this.color,
      intensity: this.intensity,
      castShadow: this.castShadow
    };
  }
}
