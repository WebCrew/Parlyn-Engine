const FORMAT = 'parlyn-project';
const VERSION = 1;

function requireText(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${label} must be a non-empty string.`);
  return value.trim();
}

function requireProjectPath(value, label) {
  const result = requireText(value, label);
  if (result.includes('\\') || result.startsWith('/') || /^[a-z]:/i.test(result)) throw new Error(`${label} must be a relative path using forward slashes.`);
  if (result.split('/').some((part) => !part || part === '.' || part === '..')) throw new Error(`${label} contains an invalid segment.`);
  return result;
}

export class ProjectDocument {
  static FORMAT = FORMAT;
  static VERSION = VERSION;

  constructor({
    name = 'Parlyn Project',
    version = VERSION,
    startupScene = 'scenes/Main.parlyn-scene.json',
    world = 'worlds/Main.parlyn-world.json',
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  } = {}) {
    if (Number(version) !== VERSION) throw new Error(`Unsupported Parlyn project version: ${version}`);
    this.format = FORMAT;
    this.version = VERSION;
    this.name = requireText(name, 'Project name');
    this.startupScene = requireProjectPath(startupScene, 'Startup scene');
    this.world = requireProjectPath(world, 'World document');
    this.createdAt = requireText(createdAt, 'Created timestamp');
    this.updatedAt = requireText(updatedAt, 'Updated timestamp');
  }

  touch() {
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      format:this.format,
      version:this.version,
      name:this.name,
      startupScene:this.startupScene,
      world:this.world,
      createdAt:this.createdAt,
      updatedAt:this.updatedAt
    };
  }

  static fromJSON(data) {
    if (!data || data.format !== FORMAT) throw new Error('Not a Parlyn project file.');
    return new ProjectDocument(data);
  }
}
