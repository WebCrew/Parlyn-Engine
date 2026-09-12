# Parlyn Engine v0.5.0 Beta 18 — Maintainer Acceptance

Beta 18 adds the bounded Frame Selected command without changing scene data.
Beta 17's Command Bar and existing editor commands passed maintainer testing
without an observed regression on 2026-09-12.


1. Select one node, press **F**, and confirm the camera centers and frames it.
2. Use the Frame Selected Command Bar button and confirm it matches **F**.
3. Select nodes that are separated in the scene and confirm all selected nodes
   fit in the viewport with visible margin.
4. Orbit the camera, frame the selection and confirm the current viewing angle
   is preserved while the target and distance change.
5. Clear the selection and confirm the button is disabled and **F** does not
   move the camera.
6. Test small, scaled-up and scaled-down nodes in both 2.5D and 3D views.
7. Re-test selection, Move/Rotate/Scale, Ground, Undo/Redo, saving and reopening.

Frame Selected changes only the editor camera. It must never modify scene data,
create Undo/Redo entries or mark the scene unsaved.
