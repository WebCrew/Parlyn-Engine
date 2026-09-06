import { Node } from '../core/Node.mjs';
import { Node2_5D } from '../core/Node2_5D.mjs';
import { Node3D } from '../core/Node3D.mjs';
import { Camera3D } from '../core/Camera3D.mjs';
import { Light3D } from '../core/Light3D.mjs';

const FORMAT = 'parlyn-scene';
const VERSION = 2;
const SUPPORTED_VERSIONS = new Set([1, 2]);
const SUPPORTED_NODE_TYPES = new Set(['SceneRoot', 'Node', 'Node2_5D', 'Sprite2_5D', 'Billboard2_5D', 'Node3D', 'Mesh3D', 'Camera3D', 'Light3D']);
const MAX_SCENE_NODES = 10000;
const MAX_SCENE_DEPTH = 256;

function requireFinite(value, label) {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be a finite number.`);
  return value;
}

function requireVector(value, axes, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${label} must be an object.`);
  for (const axis of axes) requireFinite(value[axis], `${label}.${axis}`);
}

function requireNodeData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new TypeError('Scene node must be an object.');
  for (const field of ['id', 'name', 'type']) {
    if (typeof data[field] !== 'string' || !data[field].trim()) throw new TypeError(`Scene node requires a non-empty ${field}.`);
  }
  if (!SUPPORTED_NODE_TYPES.has(data.type)) throw new Error(`Unsupported scene node type: ${data.type}`);
  if (data.enabled !== undefined && typeof data.enabled !== 'boolean') throw new TypeError(`Node ${data.id} enabled must be a boolean.`);
  if (data.metadata !== undefined && (!data.metadata || typeof data.metadata !== 'object' || Array.isArray(data.metadata))) {
    throw new TypeError(`Node ${data.id} metadata must be an object.`);
  }

  if (['Node2_5D', 'Sprite2_5D', 'Billboard2_5D'].includes(data.type)) {
    requireVector(data.position, ['x', 'y', 'z'], `Node ${data.id} position`);
    requireFinite(data.rotation, `Node ${data.id} rotation`);
    requireVector(data.scale, ['x', 'y'], `Node ${data.id} scale`);
    if (typeof data.depthLayer !== 'string' || !data.depthLayer.trim()) throw new TypeError(`Node ${data.id} depthLayer must be a non-empty string.`);
  }
  if (['Node3D', 'Mesh3D', 'Camera3D', 'Light3D'].includes(data.type)) {
    requireVector(data.position, ['x', 'y', 'z'], `Node ${data.id} position`);
    requireVector(data.rotation, ['x', 'y', 'z'], `Node ${data.id} rotation`);
    requireVector(data.scale, ['x', 'y', 'z'], `Node ${data.id} scale`);
  }
  if (data.type === 'Camera3D') {
    for (const field of ['fov', 'near', 'far']) requireFinite(data[field], `Camera ${data.id} ${field}`);
    if (data.fov <= 0 || data.fov >= 180) throw new RangeError(`Camera ${data.id} fov must be between 0 and 180 degrees.`);
    if (data.near <= 0 || data.far <= data.near) throw new RangeError(`Camera ${data.id} requires 0 < near < far.`);
    if (data.primary !== undefined && typeof data.primary !== 'boolean') throw new TypeError(`Camera ${data.id} primary must be a boolean.`);
  }
  if (data.type === 'Light3D') {
    requireFinite(data.intensity, `Light ${data.id} intensity`);
    if (typeof data.lightKind !== 'string' || !data.lightKind.trim()) throw new TypeError(`Light ${data.id} lightKind must be a non-empty string.`);
    if ((typeof data.color !== 'string' || !data.color.trim()) && !Number.isInteger(data.color)) throw new TypeError(`Light ${data.id} color must be a string or integer.`);
    if (data.castShadow !== undefined && typeof data.castShadow !== 'boolean') throw new TypeError(`Light ${data.id} castShadow must be a boolean.`);
  }
}

function migrateNodeV1(data) {
  const root = structuredClone(data);
  const pending = [[root, 0]];
  let count = 0;
  while (pending.length) {
    const [node, depth] = pending.pop();
    if (!node || typeof node !== 'object' || Array.isArray(node)) throw new TypeError('Scene node must be an object.');
    if (depth > MAX_SCENE_DEPTH) throw new RangeError(`Scene hierarchy exceeds the maximum depth of ${MAX_SCENE_DEPTH}.`);
    count += 1;
    if (count > MAX_SCENE_NODES) throw new RangeError(`Scene exceeds the maximum node count of ${MAX_SCENE_NODES}.`);
    node.enabled ??= true;
    node.metadata ??= {};
    node.children ??= [];
    if (!Array.isArray(node.children)) throw new TypeError(`Node ${node.id ?? 'unknown'} children must be an array.`);
    if (node.type === 'Camera3D') {
      node.fov ??= 50;
      node.near ??= 0.05;
      node.far ??= 1000;
      node.primary ??= false;
    }
    if (node.type === 'Light3D') {
      node.lightKind ??= 'directional';
      node.color ??= '#ffffff';
      node.intensity ??= 2;
      node.castShadow ??= true;
    }
    for (const child of node.children) pending.push([child, depth + 1]);
  }
  return root;
}

function nodeFromJSON(data, state, depth = 0) {
  if (depth > MAX_SCENE_DEPTH) throw new RangeError(`Scene hierarchy exceeds the maximum depth of ${MAX_SCENE_DEPTH}.`);
  state.count += 1;
  if (state.count > MAX_SCENE_NODES) throw new RangeError(`Scene exceeds the maximum node count of ${MAX_SCENE_NODES}.`);
  requireNodeData(data);
  if (state.ids.has(data.id)) throw new Error(`Duplicate node id: ${data.id}`);
  state.ids.add(data.id);
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
  for (const childData of data.children ?? []) node.addChild(nodeFromJSON(childData, state, depth + 1));
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
    for (const field of ['version', 'name', 'root']) {
      if (!Object.hasOwn(data, field)) throw new Error(`Parlyn scene file is missing ${field}.`);
    }
    const sourceVersion = data.version;
    if (!SUPPORTED_VERSIONS.has(sourceVersion)) throw new Error(`Unsupported Parlyn scene version: ${data.version}`);
    const scene = new SceneDocument(data.name);
    const rootData = sourceVersion === 1 ? migrateNodeV1(data.root) : data.root;
    scene.root = nodeFromJSON(rootData, { ids:new Set(), count:0 });
    if (scene.root.type !== 'SceneRoot') throw new Error('Parlyn scene root must use type SceneRoot.');
    scene.version = VERSION;
    return scene;
  }
}
