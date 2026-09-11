import assert from "node:assert/strict";
import { DEFAULT_TRANSFORM_SPACE, TRANSFORM_SPACE_VERSION, normalizeTransformSpace } from "../src/engine/editor/TransformSpace.mjs";

assert.deepEqual(normalizeTransformSpace(null), DEFAULT_TRANSFORM_SPACE);
assert.deepEqual(normalizeTransformSpace({ version:TRANSFORM_SPACE_VERSION, space:"local" }), { version:1, space:"local" });
assert.deepEqual(normalizeTransformSpace({ version:TRANSFORM_SPACE_VERSION, space:"world" }), { version:1, space:"world" });
assert.deepEqual(normalizeTransformSpace({ version:99, space:"local" }), DEFAULT_TRANSFORM_SPACE);
assert.deepEqual(normalizeTransformSpace({ version:TRANSFORM_SPACE_VERSION, space:"camera" }), DEFAULT_TRANSFORM_SPACE);
console.log("Transform space validation check passed.");
