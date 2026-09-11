# Parlyn Engine v0.5.0 Beta 15 — Maintainer Acceptance

Beta 15 adds the first Ground Placement command. It uses the rendered bounds of
the current selection so objects rest on the editor ground instead of merely
moving their pivot to a fixed Y value.

1. Open a project and move a 3D mesh clearly above the ground.
2. Select it and click **Ground**. Confirm its lowest visible point rests on the grid.
3. Move it upward again and press **End**. Confirm the same result.
4. Rotate and scale the mesh, then repeat; its current visible bounds must be used.
5. Repeat with a 2.5D sprite.
6. Multi-select several nodes at different heights and confirm each is grounded.
7. Undo and Redo the complete operation as one history step.
8. Save and reopen the scene and confirm the grounded positions persist.
9. Confirm Snap and Local/World modes still behave normally.

Automatic Surface Snap remains a later, separate step.
