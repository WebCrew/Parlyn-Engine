const path = require('path');

class ProjectSession {
  #activeProjectRoot = null;

  constructor({ loadProject, trashItem, isProtectedRoot = () => false }) {
    if (typeof loadProject !== 'function') throw new TypeError('ProjectSession requires loadProject().');
    if (typeof trashItem !== 'function') throw new TypeError('ProjectSession requires trashItem().');
    if (typeof isProtectedRoot !== 'function') throw new TypeError('ProjectSession isProtectedRoot must be a function.');
    this.loadProject = loadProject;
    this.trashItem = trashItem;
    this.isProtectedRoot = isProtectedRoot;
  }

  get activeProjectRoot() {
    return this.#activeProjectRoot;
  }

  activate(projectRoot) {
    if (typeof projectRoot !== 'string' || !path.isAbsolute(projectRoot)) {
      throw new TypeError('Active project root must be an absolute path.');
    }
    this.#activeProjectRoot = projectRoot;
    return projectRoot;
  }

  close() {
    if (!this.#activeProjectRoot) return { ok:false, reason:'no-project' };
    const projectRoot = this.#activeProjectRoot;
    this.#activeProjectRoot = null;
    return { ok:true, projectRoot };
  }

  async moveToTrash(confirmationName) {
    const projectRoot = this.#activeProjectRoot;
    if (!projectRoot) return { ok:false, reason:'no-project' };
    if (path.parse(projectRoot).root === projectRoot || this.isProtectedRoot(projectRoot)) {
      throw new Error('Parlyn refuses to move a protected system or user folder to the Recycle Bin.');
    }
    const project = await this.loadProject(projectRoot);
    if (typeof confirmationName !== 'string' || confirmationName !== project.name) {
      throw new Error(`Type the exact project name "${project.name}" to move it to the Recycle Bin.`);
    }
    if (this.#activeProjectRoot !== projectRoot) throw new Error('The active project changed before deletion. Try again.');
    await this.trashItem(projectRoot);
    if (this.#activeProjectRoot === projectRoot) this.#activeProjectRoot = null;
    return { ok:true, projectRoot, projectName:project.name };
  }
}

module.exports = { ProjectSession };
