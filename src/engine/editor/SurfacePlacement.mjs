export function placeNodeOnSurface(scene, renderer, nodeId, selectedIds = []) {
  const node = scene.findById(nodeId);
  if (!node || !['Mesh3D', 'Sprite2_5D', 'Billboard2_5D'].includes(node.type)) return false;
  const excluded = new Set([nodeId, ...selectedIds]);
  for (const id of [nodeId, ...selectedIds]) {
    const related = scene.findById(id);
    related?.walk(child => excluded.add(child.id));
    for (let ancestor = related?.parent; ancestor; ancestor = ancestor.parent) excluded.add(ancestor.id);
  }
  const position = renderer.getSurfacePlacedPosition(nodeId, [...excluded]);
  if (!position || !['x', 'y', 'z'].every(axis => Number.isFinite(position[axis]))) return false;
  if (Math.abs(position.y - node.position.y) < 0.000001) return false;
  node.position = position;
  renderer.updateNodeTransform(node);
  return true;
}
