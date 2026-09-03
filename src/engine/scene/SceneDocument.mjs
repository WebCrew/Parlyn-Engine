import { Node } from '../core/Node.mjs';
import { Node2_5D } from '../core/Node2_5D.mjs';
import { Node3D } from '../core/Node3D.mjs';
import { Camera3D } from '../core/Camera3D.mjs';
import { Light3D } from '../core/Light3D.mjs';

const FORMAT = 'parlyn-scene';
const VERSION = 2;
const SUPPORTED_VERSIONS = new Set([1, 2]);

function requireNodeData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new TypeError('Scene node must be an object.');
  for (const field of ['id', 'name', 'type']) {
    if (typeof data[field] !== 'string' || !data[field].trim()) throw new TypeError(`Scene node requires a non-empty ${field}.`);
  }
}

function nodeFromJSON(data, ids) {
  requireNodeData(data);
  if (ids.has(data.id)) throw new Error(`Duplicate node id: ${data.id}`);
  ids.add(data.id);
  if (data.children !== undefined && !Array.isArray(data.children)) throw new TypeError(`Node ${data.id} children must be an array.`);

  const base = {
    id:data.id, name:data.name, type:data.type,
    position:data.position, rotation:data.rotation,
    scale:data.scale, depthLayer:data.depthLayer
  };

  let node;
  if (data.type === 'Camera3D') node = new Camera3D({ ...base, fov:data.fov, near:data.near, far:data.far, primary:data.primary });
  else if (data.type === 'Light3D') node = new Light3D({ ...base, lightKind:data.lightKind, color:data.color, intensity:data.intensity, castShadow:data.castShadow });
  else if (data.type === 'Sprite2_5D' || data.type === 'Billboard2_5D' || data.type === 'Node2_5D') node = new Node2_5D(base);
  else if (data.type === 'Mesh3D' || data.type === 'Node3D') node = new Node3D(base);
  else node = new Node(base);

  node.enabled = data.enabled ?? true;
  node.metadata = structuredClone(data.metadata ?? {});
  for (const childData of data.children ?? []) node.addChild(nodeFromJSON(childData, ids));
  return node;
}

export class SceneDocument {
  static FORMAT = FORMAT;
  static VERSION = VERSION;

  constructor(name = 'Main Scene') {
    if (typeof name !== 'string' || !name.trim()) throw new TypeError('Scene name must be a non-empty string.');
    this.format = FORMAT;
    this.version = VERSION;
    this.name = name.trim();
    this.root = new Node({ name:this.name, type:'SceneRoot' });
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
    return { format:this.format, version:VERSION, name:this.name, root:this.root.toJSON() };
  }

  static fromJSON(data) {
    if (!data || data.format !== FORMAT) throw new Error('Not a Parlyn scene file.');
    const sourceVersion = Number(data.version ?? 1);
    if (!SUPPORTED_VERSIONS.has(sourceVersion)) throw new Error(`Unsupported Parlyn scene version: ${data.version}`);
    const scene = new SceneDocument(data.name ?? 'Main Scene');
    const rootData = data.root ?? { id:crypto.randomUUID(), name:scene.name, type:'SceneRoot', children:[] };
    scene.root = nodeFromJSON(rootData, new Set());
    if (scene.root.type !== 'SceneRoot') throw new Error('Parlyn scene root must use type SceneRoot.');
    scene.version = VERSION;
    return scene;
  }
}
