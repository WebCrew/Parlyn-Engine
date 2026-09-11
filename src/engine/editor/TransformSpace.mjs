export const TRANSFORM_SPACE_VERSION = 1;
export const DEFAULT_TRANSFORM_SPACE = Object.freeze({ version:TRANSFORM_SPACE_VERSION, space:"world" });

export function normalizeTransformSpace(value) {
  if (!value || value.version !== TRANSFORM_SPACE_VERSION || !["local", "world"].includes(value.space)) {
    return { ...DEFAULT_TRANSFORM_SPACE };
  }
  return { version:TRANSFORM_SPACE_VERSION, space:value.space };
}
