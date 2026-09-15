# Parlyn Engine v0.5.0 Beta 23 — Maintainer Acceptance

Status: pending human Windows acceptance. Beta 22 passed maintainer testing on
2026-09-15.

Scope: reopen the last saved project scene or standalone scene after a normal
application close. This includes the editor camera, 2.5D/3D view and valid node
selection. This release does not add autosave or recovery of unsaved edits.

1. Open a project with at least two scenes and switch to its non-startup scene.
   Save it, select two nodes, choose 3D view and noticeably orbit, pan and zoom.
2. Close Parlyn normally and reopen it. The same project and scene, saved scene
   contents, 3D mode, camera position and both selected nodes must return.
3. Confirm the restored scene is clean (no unsaved marker) and its saved
   Undo/Redo history still behaves as before.
4. Change a node, close Parlyn and choose **Save and Continue**. Reopen Parlyn;
   the saved change and last workspace state must return.
5. Change a node again, close Parlyn and choose **Discard**. Reopen Parlyn; the
   previous saved value must return and the discarded value must stay gone.
6. Change a node, close Parlyn and choose **Cancel**. Parlyn must remain open
   with the unsaved change intact. Save or discard it before continuing.
7. Use **Close Project**, then close and reopen Parlyn. It must show the normal
   empty startup workspace and must not reopen the deliberately closed project.
8. Open and save a standalone scene outside a project. Close and reopen Parlyn;
   that saved scene and its camera/view/selection must return without a project.
9. Using a disposable project copy, close Parlyn and then rename or move that
   project folder in Explorer. Parlyn must fall back to normal startup without a
   startup loop. A second restart must remain normal.
10. Run a short regression for scene switching, selection, Move/Rotate/Scale,
    Snap, Surface, Ground, Frame Selected, Bounds, panels and Save/Open.

Only saved scene data is reopened. Unsaved recovery and separate drafts belong
to the next independently tested Phase 2 step.
