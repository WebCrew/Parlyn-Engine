import { Node3D } from './Node3D.mjs';

export class Camera3D extends Node3D {
  constructor(options = {}) {
    super({ ...options, type: 'Camera3D' });
    this.fov = Number(options.fov ?? 50);
    this.near = Number(options.near ?? 0.05);
    this.far = Number(options.far ?? 1000);
    this.primary = Boolean(options.primary ?? false);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      fov: this.fov,
      near: this.near,
      far: this.far,
      primary: this.primary
    };
  }
}
