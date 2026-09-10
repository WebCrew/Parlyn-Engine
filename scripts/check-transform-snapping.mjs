import assert from "node:assert/strict";
import { DEFAULT_TRANSFORM_SNAPPING, TRANSFORM_SNAPPING_VERSION, normalizeTransformSnapping } from "../src/engine/editor/TransformSnapping.mjs";

assert.deepEqual(normalizeTransformSnapping(null), DEFAULT_TRANSFORM_SNAPPING);
assert.deepEqual(normalizeTransformSnapping({ version:TRANSFORM_SNAPPING_VERSION, enabled:true, translation:"1", rotationDegrees:30, scale:0.25 }), {
  version:TRANSFORM_SNAPPING_VERSION,
  enabled:true,
  translation:1,
  rotationDegrees:30,
  scale:0.25
});
assert.deepEqual(normalizeTransformSnapping({ version:TRANSFORM_SNAPPING_VERSION, enabled:true, translation:0, rotationDegrees:999, scale:"invalid" }), {
  version:TRANSFORM_SNAPPING_VERSION,
  enabled:true,
  translation:0.5,
  rotationDegrees:15,
  scale:0.1
});
assert.deepEqual(normalizeTransformSnapping({ version:99, enabled:true }), DEFAULT_TRANSFORM_SNAPPING);
console.log("Transform snapping validation check passed.");
