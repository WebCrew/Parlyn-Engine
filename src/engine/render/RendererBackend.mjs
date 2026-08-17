export class RendererBackend {
  constructor() { if (new.target === RendererBackend) throw new TypeError('RendererBackend is abstract.'); }
  async initialize() { throw new Error('initialize() not implemented'); }
  rebuild() { throw new Error('rebuild() not implemented'); }
  addNode() { throw new Error('addNode() not implemented'); }
  removeNode() { throw new Error('removeNode() not implemented'); }
  resize() { throw new Error('resize() not implemented'); }
  render() { throw new Error('render() not implemented'); }
  selectNode() { throw new Error('selectNode() not implemented'); }
  updateNodeTransform() { throw new Error('updateNodeTransform() not implemented'); }
  setView() { throw new Error('setView() not implemented'); }
  dispose() {}
}
