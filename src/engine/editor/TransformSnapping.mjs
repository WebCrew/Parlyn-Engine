export const TRANSFORM_SNAPPING_VERSION = 1;

export const DEFAULT_TRANSFORM_SNAPPING = Object.freeze({
  version:TRANSFORM_SNAPPING_VERSION,
  enabled:false,
  translation:0.5,
  rotationDegrees:15,
  scale:0.1
});

export function normalizeTransformSnapping(value) {
  if (!value || value.version !== TRANSFORM_SNAPPING_VERSION || typeof value.enabled !== "boolean") {
    return { ...DEFAULT_TRANSFORM_SNAPPING };
  }
  return {
    version:TRANSFORM_SNAPPING_VERSION,
    enabled:value.enabled,
    translation:boundedNumber(value.translation, 0.01, 100, DEFAULT_TRANSFORM_SNAPPING.translation),
    rotationDegrees:boundedNumber(value.rotationDegrees, 1, 180, DEFAULT_TRANSFORM_SNAPPING.rotationDegrees),
    scale:boundedNumber(value.scale, 0.01, 10, DEFAULT_TRANSFORM_SNAPPING.scale)
  };
}

function boundedNumber(value, minimum, maximum, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number >= minimum && number <= maximum ? number : fallback;
}
