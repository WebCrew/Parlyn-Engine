// Authoring bounds are optional world-space guides, never viewport or physics limits.
export function normalizeDocumentBounds(value) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Bounds must be an object or null.');
  const result = { min:{}, max:{} };
  for (const end of ['min', 'max']) {
    if (!value[end] || typeof value[end] !== 'object' || Array.isArray(value[end])) throw new TypeError(`Bounds ${end} must be a vector.`);
    for (const axis of ['x', 'y', 'z']) {
      const n = value[end][axis];
      if (!Number.isFinite(n) || Math.abs(n) > 1000000) throw new RangeError('Bounds coordinates must be finite and within ±1000000 units.');
      result[end][axis] = n;
    }
  }
  for (const axis of ['x', 'y', 'z']) {
    if (result.min[axis] >= result.max[axis]) throw new RangeError(`Bounds minimum ${axis.toUpperCase()} must be below its maximum.`);
  }
  return result;
}
