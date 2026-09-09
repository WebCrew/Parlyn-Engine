import assert from "node:assert/strict";
import { approveUnsavedTransition } from "../src/engine/editor/UnsavedChanges.mjs";

let decisions = 0;
let saves = 0;
const request = async () => { decisions += 1; return "cancel"; };
const save = async () => { saves += 1; return true; };

assert.equal(await approveUnsavedTransition({ dirty:false, requestDecision:request, save }), true);
assert.equal(decisions, 0);
assert.equal(saves, 0);
assert.equal(await approveUnsavedTransition({ dirty:true, requestDecision:async () => "cancel", save }), false);
assert.equal(await approveUnsavedTransition({ dirty:true, requestDecision:async () => "discard", save }), true);
assert.equal(await approveUnsavedTransition({ dirty:true, requestDecision:async () => "save", save:async () => false }), false);
assert.equal(await approveUnsavedTransition({ dirty:true, requestDecision:async () => "save", save }), true);
assert.equal(saves, 1);
assert.equal(await approveUnsavedTransition({ dirty:true, requestDecision:async () => "unexpected", save }), false);
await assert.rejects(approveUnsavedTransition({ dirty:true, requestDecision:null, save }), /callbacks/);

console.log("Unsaved-change transition contract check passed.");
