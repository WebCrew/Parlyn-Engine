# Parlyn Engine v0.5.0 Test Guide

This test focuses on the two new foundations introduced in v0.5.0: viewport transform gizmos and the module lifecycle.

## Baseline regression

Confirm that the v0.4 workflows still work:

1. Start Parlyn.
2. Open the bundled `samples/Parlyn-Test-Project`.
3. Select nodes in Hierarchy and Viewport.
4. Orbit, pan and zoom the editor camera.
5. Change transform values in the Inspector.
6. Add and delete nodes.
7. Undo and redo changes.
8. Save, close, reopen and reload the project/scene.
9. Confirm imported assets still appear.

## Transform gizmos

1. Select a `Mesh3D` node.
2. Press **W** or click **Move**.
3. Drag each visible axis and confirm Position changes live in the Inspector.
4. Undo and redo the move.
5. Press **E** or click **Rotate**.
6. Rotate the mesh and confirm Rotation changes in the Inspector.
7. Undo and redo the rotation.
8. Press **R** or click **Scale**.
9. Scale the mesh and confirm Scale changes in the Inspector.
10. Press **Q** or **Esc** and confirm the gizmo disappears while selection remains.

### 2.5D checks

1. Select a `Sprite2_5D`.
2. Move it on X, Y and Z.
3. Rotate it: only the Z rotation handle should be available.
4. Scale it: only X and Y scaling should be available.
5. Repeat Move and Scale with a `Billboard2_5D`.
6. Orbit the editor camera and confirm the billboard still faces the camera after editing.

## Module system

1. Click **Modules** in the top toolbar.
2. Confirm the official `Example Module` is listed and disabled by default.
3. Enable it.
4. Confirm the status bar reports activation and the module shows Enabled.
5. Disable it again.
6. Confirm the status bar reports deactivation.
7. Close and reopen the Modules dialog and confirm the current in-session state is represented correctly.

The Example Module intentionally performs no gameplay work. Its purpose is to validate manifest registration and activate/deactivate lifecycle behavior.

## Report anything suspicious

Please report crashes, console errors, incorrect transform values, gizmos that become detached from the selected object, Undo/Redo inconsistencies, billboard rotation problems, or module toggles that do not reflect their actual state.
