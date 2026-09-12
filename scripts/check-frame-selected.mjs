import assert from "node:assert/strict";
import * as THREE from "three";
import { ThreeRenderer } from "../src/engine/render/ThreeRenderer.mjs";

const renderer = new ThreeRenderer(null);
renderer.camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.05, 1000);
renderer.orbit = { yaw:-0.55, pitch:0.42, distance:11 };

const left = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2));
left.position.set(-4, 2, 1);
const right = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 2));
right.position.set(4, 3, -1);
renderer.nodeObjects.set("left", left);
renderer.nodeObjects.set("right", right);

assert.equal(renderer.frameSelection([]), false);
assert.deepEqual(renderer.cameraTarget.toArray(), [0, 0.7, 0]);

assert.equal(renderer.frameSelection(["left"]), true);
assert.deepEqual(renderer.cameraTarget.toArray().map((value) => Number(value.toFixed(6))), [-4, 2, 1]);
assert.ok(renderer.orbit.distance >= 2.5 && renderer.orbit.distance <= 40);

assert.equal(renderer.frameSelection(["left", "right"]), true);
assert.deepEqual(renderer.cameraTarget.toArray().map((value) => Number(value.toFixed(6))), [0, 3, 0]);
assert.ok(renderer.orbit.distance > 5, "Multiple separated nodes should require a wider frame.");

console.log("Frame Selected camera contract check passed.");
