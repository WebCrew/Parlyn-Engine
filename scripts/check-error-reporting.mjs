import assert from "node:assert/strict";
import { createErrorReport, readableErrorMessage, redactLocalPaths } from "../src/engine/editor/ErrorReport.mjs";

assert.equal(readableErrorMessage("Error invoking remote method 'parlyn:test': Error: Broken file"), "Broken file");
assert.equal(redactLocalPaths("Could not read C:\\Users\\Andi\\Project\\scene.json"), "Could not read [local path]");

const cause = new Error("Disk denied");
const error = new Error("Could not save C:\\Users\\Andi\\Project\\scene.json", { cause });
const report = createErrorReport("Scene save failed", error, { timestamp:"2026-09-10T12:00:00.000Z" });
assert.equal(report.area, "Scene");
assert.equal(report.message, "Could not save [local path]");
assert.match(report.guidance, /scene/i);
assert.match(report.technicalDetails, /C:\\Users\\Andi\\Project\\scene\.json/);
assert.match(report.technicalDetails, /Cause 1: Disk denied/);
assert.match(report.technicalDetails, /2026-09-10T12:00:00\.000Z/);

const assetReport = createErrorReport("Asset import failed", new Error("Unsupported file"));
assert.equal(assetReport.area, "Assets");
assert.match(assetReport.guidance, /asset/i);
console.log("Editor error reporting check passed.");
