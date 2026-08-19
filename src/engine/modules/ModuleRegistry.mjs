const ID_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;

function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') throw new TypeError('Module manifest must be an object.');
  for (const field of ['id', 'name', 'version', 'description']) {
    if (typeof manifest[field] !== 'string' || !manifest[field].trim()) {
      throw new TypeError(`Module manifest requires a non-empty ${field}.`);
    }
  }
  if (!ID_PATTERN.test(manifest.id)) throw new TypeError(`Invalid module id: ${manifest.id}`);
  return Object.freeze({
    id: manifest.id,
    name: manifest.name,
    version: manifest.version,
    description: manifest.description,
    category: manifest.category || 'general',
    official: Boolean(manifest.official),
    enabledByDefault: Boolean(manifest.enabledByDefault)
  });
}

export class ModuleRegistry {
  constructor(context = {}) {
    this.context = context;
    this.entries = new Map();
  }

  register(moduleDefinition) {
    const manifest = validateManifest(moduleDefinition?.manifest);
    if (this.entries.has(manifest.id)) throw new Error(`Module already registered: ${manifest.id}`);
    const entry = {
      manifest,
      activate: typeof moduleDefinition.activate === 'function' ? moduleDefinition.activate : async () => {},
      deactivate: typeof moduleDefinition.deactivate === 'function' ? moduleDefinition.deactivate : async () => {},
      enabled: false
    };
    this.entries.set(manifest.id, entry);
    return manifest;
  }

  list() {
    return [...this.entries.values()].map(({ manifest, enabled }) => ({ ...manifest, enabled }));
  }

  async initializeDefaults() {
    for (const entry of this.entries.values()) {
      if (entry.manifest.enabledByDefault) await this.enable(entry.manifest.id);
    }
  }

  async enable(id) {
    const entry = this.entries.get(id);
    if (!entry) throw new Error(`Unknown module: ${id}`);
    if (entry.enabled) return;
    await entry.activate(this.context);
    entry.enabled = true;
    this.context.events?.dispatchEvent(new CustomEvent('module-changed', { detail:{ id, enabled:true } }));
  }

  async disable(id) {
    const entry = this.entries.get(id);
    if (!entry) throw new Error(`Unknown module: ${id}`);
    if (!entry.enabled) return;
    await entry.deactivate(this.context);
    entry.enabled = false;
    this.context.events?.dispatchEvent(new CustomEvent('module-changed', { detail:{ id, enabled:false } }));
  }

  async setEnabled(id, enabled) {
    return enabled ? this.enable(id) : this.disable(id);
  }
}
