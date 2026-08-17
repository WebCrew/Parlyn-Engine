import { Node } from '../core/Node.mjs';
import { Node2_5D } from '../core/Node2_5D.mjs';
import { Node3D } from '../core/Node3D.mjs';
import { Camera3D } from '../core/Camera3D.mjs';
import { Light3D } from '../core/Light3D.mjs';

function nodeFromJSON(data) {
  const base = {
    id: data.id,
    name: data.name,
    type: data.type,
    position: data.position,
    rotation: data.rotation,
    scale: data.scale,
    depthLayer: data.depthLayer
  };

  let node;
  if (data.type === 'Camera3D') node = new Camera3D({ ...base, fov:data.fov, near:data.near, far:data.far, primary:data.primary });
  else if (data.type === 'Light3D') node = new Light3D({ ...base, lightKind:data.lightKind, color:data.color, intensity:data.intensity, castShadow:data.castShadow });
  else if (data.type === 'Sprite2_5D' || data.type === 'Billboard2_5D' || data.type === 'Node2_5D') node = new Node2_5D(base);
  else if (data.type === 'Mesh3D' || data.type === 'Node3D') node = new Node3D(base);
  else node = new Node(base);

  node.enabled = data.enabled ?? true;
  node.metadata = structuredClone(data.metadata ?? {});
  for (const childData of data.children ?? []) node.addChild(nodeFromJSON(childData));
  return node;
}

export class SceneDocument {
  constructor(name = 'Main Scene') {
    this.format = 'parlyn-scene';
    this.version = 2;
    this.name = name;
    this.root = new Node({ name, type: 'SceneRoot' });
  }

  findById(id) {
    let result = null;
    this.root.walk((node) => { if (node.id === id) result = node; });
    return result;
  }

  removeById(id) {
    const node = this.findById(id);
    if (!node || node === this.root || !node.parent) return false;
    return node.parent.removeChild(node);
  }

  toJSON() {
    return { format:this.format, version:this.version, name:this.name, root:this.root.toJSON() };
  }

  static fromJSON(data) {
    if (!data || data.format !== 'parlyn-scene') throw new Error('Not a Parlyn scene file.');
    const scene = new SceneDocument(data.name ?? 'Main Scene');
    scene.version = Number(data.version ?? 1);
    scene.root = nodeFromJSON(data.root ?? { name:scene.name, type:'SceneRoot' });
    return scene;
  }
}
