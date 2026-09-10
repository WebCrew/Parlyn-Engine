# Parlyn Engine v0.5.0 Beta 12 — Maintainer Acceptance

Beta 12 introduces the first Transform Snap foundation. A single persistent
toolbar toggle applies fixed, predictable increments to Move, Rotate and Scale.

## Portable test preparation

1. Download `Parlyn-Engine-Portable-0.5.0-beta.12-x64.zip` and
   `SHA256SUMS.txt` from the same release.
2. Verify the ZIP checksum and extract it into a new folder.
3. Start `Parlyn Engine.exe`. If Windows blocks it, stop; do not bypass Smart App
   Control.

## Transform Snap

1. Open a project, select a 3D mesh and choose **Move**.
2. Leave **Snap** off, drag each axis and confirm movement remains continuous.
3. Enable **Snap** and confirm its button is visibly active.
4. Drag each Move axis and confirm values land on `0.5`-unit increments.
5. Choose **Rotate**, drag each axis and confirm angles land on `15°` increments.
6. Choose **Scale**, drag each axis and confirm values land on `0.1` increments.
7. Repeat Move, Rotate and Scale with a 2.5D sprite. Its existing axis limits
   must remain unchanged.
8. Undo and Redo each snapped transformation and confirm the exact values return.

## Persistence and regression

1. Leave **Snap** enabled, restart Parlyn and confirm it remains enabled without
   marking the scene unsaved.
2. Disable **Snap**, restart again and confirm it remains disabled.
3. Confirm Inspector edits remain continuous and are not affected by the viewport
   Snap switch.
4. Switch and save scenes, exercise the Beta 11 error dialog, and hide, resize,
   restore and reset workspace panels.

The fixed increments are the initial safe foundation. Configurable increments and
Local/World gizmo modes follow as separate small steps.
