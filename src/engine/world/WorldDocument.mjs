const ID_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;
const FORMAT = 'parlyn-world';
const VERSION = 1;

function requireText(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${label} must be a non-empty string.`);
  return value.trim();
}

function requireId(value, label) {
  if (typeof value !== 'string' || !ID_PATTERN.test(value)) {
    throw new TypeError(`${label} requires a stable lowercase id.`);
  }
  return value;
}

function requireRelativePath(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${label} requires a path.`);
  if (value.includes('\\') || value.startsWith('/') || /^[a-z]:/i.test(value)) throw new Error(`${label} must be relative and use forward slashes.`);
  if (value.split('/').some((part) => !part || part === '.' || part === '..')) throw new Error(`${label} contains an invalid segment.`);
  return value;
}

function requirePoint(value, label) {
  if (!value || !['x', 'y', 'z'].every((axis) => Number.isFinite(value[axis]))) {
    throw new TypeError(`${label} requires finite x, y and z coordinates.`);
  }
  return { x:value.x, y:value.y, z:value.z };
}

function uniqueById(items, label) {
  const ids = new Set();
  for (const item of items) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new TypeError(`${label} entries must be objects.`);
    requireId(item.id, label);
    if (ids.has(item.id)) throw new Error(`Duplicate ${label} id: ${item.id}`);
    ids.add(item.id);
  }
  return ids;
}

export class WorldDocument {
  static FORMAT = FORMAT;
  static VERSION = VERSION;

  constructor({
    name = 'Main World',
    seed = 'parlyn-world',
    capsules = [],
    ways = [],
    landmarks = [],
    encounters = [],
    memory = {}
  } = {}) {
    this.format = FORMAT;
    this.version = VERSION;
    this.name = requireText(name, 'World name');
    this.seed = requireText(seed, 'World seed');
    if (!Array.isArray(capsules) || !Array.isArray(ways) || !Array.isArray(landmarks) || !Array.isArray(encounters)) throw new TypeError('World collections must be arrays.');
    this.capsules = structuredClone(capsules);
    this.ways = structuredClone(ways);
    this.landmarks = structuredClone(landmarks);
    this.encounters = structuredClone(encounters);
    this.memory = structuredClone(memory);
    this.validate();
  }

  validate() {
    const capsuleIds = uniqueById(this.capsules, 'Scene Capsule');
    const wayIds = uniqueById(this.ways, 'Parlyn Way');
    uniqueById(this.landmarks, 'landmark');
    uniqueById(this.encounters, 'encounter');

    for (const capsule of this.capsules) {
      capsule.scene = requireRelativePath(capsule.scene, `Scene Capsule ${capsule.id}`);
      if (capsule.anchors !== undefined && !Array.isArray(capsule.anchors)) throw new TypeError(`Scene Capsule ${capsule.id} anchors must be an array.`);
      const anchorIds = new Set();
      for (const anchor of capsule.anchors ?? []) {
        requireId(anchor.id, `Anchor in ${capsule.id}`);
        if (anchorIds.has(anchor.id)) throw new Error(`Duplicate anchor id in ${capsule.id}: ${anchor.id}`);
        anchorIds.add(anchor.id);
        anchor.position = requirePoint(anchor.position, `Anchor ${anchor.id}`);
      }
    }

    for (const way of this.ways) {
      if (!capsuleIds.has(way.from?.capsule) || !capsuleIds.has(way.to?.capsule)) {
        throw new Error(`Parlyn Way ${way.id} references an unknown Scene Capsule.`);
      }
      if (!Number.isInteger(way.seed)) throw new TypeError(`Parlyn Way ${way.id} requires an integer seed.`);
    }

    for (const landmark of this.landmarks) {
      if (!capsuleIds.has(landmark.capsule)) {
        throw new Error(`Landmark ${landmark.id} references an unknown Scene Capsule.`);
      }
      landmark.position = requirePoint(landmark.position, `Landmark ${landmark.id}`);
      landmark.memoryKey = requireId(landmark.memoryKey, `Landmark ${landmark.id} memory key`);
    }

    for (const encounter of this.encounters) {
      if (!wayIds.has(encounter.way)) {
        throw new Error(`Encounter ${encounter.id} references an unknown Parlyn Way.`);
      }
      if (!Number.isInteger(encounter.seed)) throw new TypeError(`Encounter ${encounter.id} requires an integer seed.`);
      encounter.memoryKey = requireId(encounter.memoryKey, `Encounter ${encounter.id} memory key`);
    }

    if (!this.memory || typeof this.memory !== 'object' || Array.isArray(this.memory)) {
      throw new TypeError('World Memory must be an object.');
    }
    return this;
  }

  remember(key, value) {
    this.memory[requireId(key, 'World Memory key')] = structuredClone(value);
  }

  recall(key, fallback = null) {
    return Object.hasOwn(this.memory, key) ? structuredClone(this.memory[key]) : fallback;
  }

  toJSON() {
    return {
      format:this.format,
      version:this.version,
      name:this.name,
      seed:this.seed,
      capsules:structuredClone(this.capsules),
      ways:structuredClone(this.ways),
      landmarks:structuredClone(this.landmarks),
      encounters:structuredClone(this.encounters),
      memory:structuredClone(this.memory)
    };
  }

  static fromJSON(data) {
    if (!data || data.format !== FORMAT) throw new Error('Not a Parlyn world file.');
    if (data.version !== VERSION) throw new Error(`Unsupported Parlyn world version: ${data.version}`);
    for (const field of ['name', 'seed', 'capsules', 'ways', 'landmarks', 'encounters', 'memory']) {
      if (!Object.hasOwn(data, field)) throw new Error(`Parlyn world file is missing ${field}.`);
    }
    return new WorldDocument(data);
  }
}
