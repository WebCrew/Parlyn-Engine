# Parlyn Engine v0.5.0 Beta 22 — Maintainer Acceptance

Status: passed human Windows acceptance on 2026-09-15. Beta 21 passed maintainer
testing on 2026-09-15.

Scope: final Phase 2 command and keyboard consistency audit. This release adds
Delete for the current selection, centralizes existing shortcuts and displays a
read-only shortcut reference. It does not add shortcut customization.

1. Open **View → Keyboard Shortcuts**. Confirm that all 13 current commands and
   keys are readable. Close it with its button and then reopen it and press Esc.
2. With no dialog or Inspector field active, verify Q/Esc, W, E and R switch to
   Select, Move, Rotate and Scale and match the toolbar's active states.
3. Select one node and test F, End, Ctrl+D and Delete. Frame, Ground, Duplicate
   and Delete must match their buttons. Undo and Redo must restore each change.
4. Multi-select two unrelated nodes and press Delete. Both must be removed as
   one Undo step; Undo and Redo must restore/remove both together.
5. Verify Ctrl+S, Ctrl+O and Ctrl+Shift+O. They must match Save Scene, Open Scene
   and Open Project, including unsaved-change protection.
6. Verify Ctrl+Z, Ctrl+Y and Ctrl+Shift+Z outside text fields. Both Redo variants
   must perform the same Redo command.
7. Focus the Inspector name or a numeric field. Typing Q/W/E/R/F and pressing
   Delete must edit the field without activating editor commands. Field-native
   Ctrl+Z must not invoke scene Undo. Ctrl+S may commit the field and save.
8. Open Add Node, Bounds, Snap Settings or another modal dialog. Q/W/E/R/F,
   Delete and editor Ctrl shortcuts must not affect the scene behind it. Esc
   closes dialogs according to their existing behavior.
9. Hold a mapped key long enough to create keyboard repeat and try an Alt/AltGr
   combination. A single physical command press must not repeat destructive
   actions and Alt combinations must not trigger editor commands.
10. Repeat a short 2.5D/3D regression: selection, Move/Rotate/Scale, Snap,
    Surface, Ground, Frame Selected, panels, Bounds, Save/Open and scene switch.

The shortcut reference is descriptive only. User profiles, rebinding and a full
shortcut manager are not part of this Phase 2 audit.
