# Parlyn Engine v0.5.0 Beta 14 — Maintainer Acceptance

Beta 14 adds explicit, persistent Local/World orientation for Move and Rotate.
Scale remains local by design to avoid misleading world-axis scaling.

## Portable test preparation

1. Download `Parlyn-Engine-Portable-0.5.0-beta.14-x64.zip` and
   `SHA256SUMS.txt` from the same release.
2. Verify the ZIP checksum, extract it and start `Parlyn Engine.exe`. Do not
   bypass a Windows security decision.

## Local and World orientation

1. Open a project and rotate a 3D mesh so its own axes differ visibly from the
   world grid.
2. Choose **Move**, set orientation to **World**, and confirm the gizmo follows
   the fixed world axes.
3. Switch to **Local** and confirm the gizmo follows the rotated object axes.
4. Repeat with **Rotate** and confirm its rings change orientation appropriately.
5. Enable Snap and confirm the configured increments work in both orientations.
6. Choose **Scale**. Confirm the orientation button displays **Local** and is
   disabled because scale always uses object-local axes.
7. Return to Move and confirm the previously selected orientation returns.
8. Exercise Undo and Redo for transforms performed in both modes.

## Persistence and regression

1. Leave Local selected, restart Parlyn and confirm Local returns without making
   the scene dirty.
2. Switch to World, restart again and confirm World returns.
3. Repeat Move and Rotate with a 2.5D sprite and confirm its existing axis limits.
4. Confirm Snap settings, Inspector entry, scene saving, errors and workspace
   layout continue to work.

This completes the initial Transform Snap and Local/World Roadmap item.
