export class ProjectDocument {
  constructor({
    name = 'Parlyn Project',
    version = 1,
    startupScene = 'scenes/Main.parlyn-scene.json',
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  } = {}) {
    this.format = 'parlyn-project';
    this.version = version;
    this.name = name;
    this.startupScene = startupScene;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  touch() {
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      format: this.format,
      version: this.version,
      name: this.name,
      startupScene: this.startupScene,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(data) {
    if (!data || data.format !== 'parlyn-project') {
      throw new Error('Not a Parlyn project file.');
    }
    return new ProjectDocument(data);
  }
}
