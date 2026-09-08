# Parlyn Engine v0.5.0 Beta 6 — Maintainer Acceptance

This pass verifies the Phase 2 multi-selection and Multi-Scene Project Browser
against the published `v0.5.0-beta.6` Windows artifact.

## 1. Install and launch

1. Download the Beta 6 installer and `SHA256SUMS.txt`.
2. Verify the installer checksum.
3. Install normally and launch Parlyn without weakening Windows security.

## 2. Multi-selection

1. Open a project with several scene nodes.
2. Use **Ctrl+click** to select separate nodes in the Hierarchy and viewport.
3. Use **Shift+click** in the Hierarchy to select a contiguous range.
4. Confirm every selected node is highlighted.
5. Delete several selected nodes and confirm one Undo restores the complete set.
6. Select a parent and child together, delete them and confirm no orphan remains.

## 3. Multi-Scene Project Browser

1. Confirm the startup scene appears in the **Scenes** panel.
2. Create `Village` at `scenes/Village.parlyn-scene.json`.
3. Create `Forest Path` at `scenes/travel/Forest-Path.parlyn-scene.json`.
4. Modify and save both scenes, then switch between them from the panel.
5. Make an unsaved edit and confirm switching offers Cancel, Discard and Save.
6. Rename `Village` to `Oak Village` and move it to
   `scenes/locations/Oak-Village.parlyn-scene.json`.
7. Restart Parlyn, reopen the project and confirm all scenes and contents remain.
8. Attempt to move a scene onto an existing scene path and confirm Parlyn refuses
   without changing either file.

## 4. Regression

Confirm project creation, Save, Close, Open, Recycle Bin deletion, Undo/Redo,
duplication and hierarchy reparenting still work.

Beta 6 passes only when all required checks succeed or a defect is corrected and
the affected check is repeated against a new artifact.
