# Parlyn Engine v0.5.0 Beta 19 — Maintainer Acceptance

Status: pending human Windows acceptance. Beta 18 passed the maintainer's full
editor regression test on 2026-09-12.

1. Open an existing project. Bounds are initially absent. Open **Bounds** in
   the View command group; check tooltips, keyboard focus and readable labels.
2. Enable Current Scene bounds, enter Min (-10,-3,-10), Max (10,8,10), and
   Apply. A blue box appears and the scene becomes unsaved.
3. Undo removes the box; Redo restores it. Save, close and reopen the scene:
   the exact values and guide survive. Test switching between two scenes.
4. Change coordinates, disable bounds, Cancel and press Escape. Canceled edits
   must not affect the document or history. Applying unchanged values must
   not mark an otherwise saved scene dirty.
5. Enter equal/reversed Min/Max, blank values or coordinates outside ±1000000:
   no invalid document is applied or saved; correction remains possible.
6. Select Project World and enable different bounds. **Save World Bounds**
   produces an amber box. Reopen the project and verify persistence. World
   bounds are separate from scene Undo/Redo and do not clear scene dirtiness.
7. In a loose scene, Project World must be unavailable. Disable World bounds
   and save; no amber box remains. A failed world save must retain previous
   world bounds and report an error in the dialog.
8. Orbit/pan/zoom, change 2.5D/3D, hide/show/resize panels and resize the window.
   The bounds remain fixed in world coordinates, not screen coordinates.
9. Move objects outside the boxes. They remain editable; boxes cannot be
   selected or included by Frame Selected. Camera movement remains unrestricted.
10. Re-test Move/Rotate/Scale, Snap, Ground/End, Frame Selected/F, selection,
    Undo/Redo, Save, project close and unsaved Cancel/Discard/Save & Continue.

Scope: optional authoring guides only. No collision walls, runtime constraints,
camera clamps, world streaming or Smart Systems simulation are implemented.
Use Beta 19 or later to edit bounds; older editors do not preserve this optional
field when saving. Projects without bounds remain compatible and unchanged.
