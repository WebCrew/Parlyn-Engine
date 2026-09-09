import assert from "node:assert/strict";
import { DEFAULT_WORKSPACE_LAYOUT, WORKSPACE_LAYOUT_VERSION, normalizeWorkspaceLayout } from "../src/engine/editor/WorkspaceLayout.mjs";

assert.deepEqual(normalizeWorkspaceLayout(null), { version:WORKSPACE_LAYOUT_VERSION, panels:{ hierarchy:true, inspector:true, assets:true }, sizes:{ hierarchy:238, inspector:305, assets:190 } });
assert.deepEqual(normalizeWorkspaceLayout({ version:WORKSPACE_LAYOUT_VERSION, panels:{ hierarchy:false, inspector:true, assets:false }, sizes:{ hierarchy:1, inspector:900, assets:"260" } }), { version:WORKSPACE_LAYOUT_VERSION, panels:{ hierarchy:false, inspector:true, assets:false }, sizes:{ hierarchy:180, inspector:520, assets:260 } });
assert.deepEqual(normalizeWorkspaceLayout({ version:999, panels:{ hierarchy:false }, sizes:{ hierarchy:400 } }), DEFAULT_WORKSPACE_LAYOUT);
assert.deepEqual(normalizeWorkspaceLayout({ version:WORKSPACE_LAYOUT_VERSION, panels:{ hierarchy:"false" }, sizes:{ assets:"invalid" } }), DEFAULT_WORKSPACE_LAYOUT);
console.log("Workspace layout validation check passed.");
