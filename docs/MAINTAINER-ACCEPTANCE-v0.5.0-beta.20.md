# Parlyn Engine v0.5.0 Beta 20 — Maintainer Acceptance

Status: pending human Windows acceptance. Beta 19 was not accepted because
saving a second project scene overwrote the first scene's local history.
Beta 20 separates saved history by project-relative scene path.

Use a disposable copy of a project with two scenes.

1. In scene A enable/change Bounds, Apply and Save. Undo must remain enabled.
2. Switch to B, enable different Bounds, Apply and Save.
3. Switch back to A. Undo must still be enabled and undo A's Bounds edit only.
4. Redo restores A's exact values. Save A, switch to B: B's Undo must still work
   independently. Repeat A/B switching several times.
5. Undo an edit, Save, switch away and return: Redo must remain available if no
   new edit was made. A new edit after Undo must clear only that scene's Redo.
6. Save both scenes, close the project and Engine, restart and reopen. Each
   saved scene must retain its own Undo/Redo state. Include transform edits.
7. Test scene names that are identical but live in different subfolders.
8. Repeat the Bounds checks in [Beta 19's checklist](MAINTAINER-ACCEPTANCE-v0.5.0-beta.19.md), including loose-scene persistence and World Bounds.
9. Re-test unsaved Cancel/Discard/Save & Continue, snapping, Ground/End,
   Frame Selected/F, multi-selection and panel restoration.

History reflects its last successful save, not unsaved actions intentionally
discarded during switching. Already overwritten Beta 19 history cannot be
reconstructed by this fix. A matching legacy history remains readable until
the next save writes a separate per-scene file. Renamed/moved scene paths
have separate history identities; stale history is never attached blindly.
