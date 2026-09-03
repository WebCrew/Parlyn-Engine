function hash32(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function deterministicUnit(seed, key = '') {
  let state = hash32(`${seed}:${key}`) || 1;
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}

export function resolveEncounter(encounter, worldSeed) {
  if (!encounter || !Number.isInteger(encounter.seed)) {
    throw new TypeError('Encounter resolution requires an integer seed.');
  }
  const variants = encounter.variants ?? [];
  if (!variants.length) return null;
  const value = deterministicUnit(worldSeed, `${encounter.id}:${encounter.seed}`);
  return structuredClone(variants[Math.floor(value * variants.length)]);
}
