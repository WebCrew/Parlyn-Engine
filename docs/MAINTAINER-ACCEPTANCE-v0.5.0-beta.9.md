# Parlyn Engine v0.5.0 Beta 9 — Maintainer Acceptance

Use this checklist to validate the initial workspace-layout and editor-preference
foundation against the published Beta 9 Windows artifact.

## Install and baseline

1. Download the Beta 9 installer and `SHA256SUMS.txt` from the same release.
2. Verify the SHA-256 checksum, install Parlyn and launch it normally.
3. Confirm Hierarchy/Scenes, Assets and Inspector are visible in their familiar
   default positions and the viewport remains usable.

## Panel visibility

1. Open **View** and hide each of the three panels separately.
2. Confirm the hidden area is returned to the viewport rather than leaving an
   empty column or row.
3. Reopen every panel through **View**.
4. Close every panel once with its `×` button and restore it through **View**.

## Resizing and safety limits

1. Drag the vertical divider beside Hierarchy/Scenes in both directions.
2. Drag the vertical divider beside Inspector in both directions.
3. Drag the horizontal divider above Assets in both directions.
4. Confirm no panel can be reduced to an unusable sliver or enlarged without a
   sensible bound, and confirm the viewport continues rendering after each drag.

## Persistence and reset

1. Choose clearly recognizable panel sizes and hide one panel.
2. Close and restart Parlyn. Confirm visibility and sizes are restored.
3. Open **View**, choose **Reset Layout**, and confirm all three panels return to
   their default sizes and positions.
4. Restart Parlyn once more and confirm the reset layout persists.

## Regression

1. Create or open a project and switch between two scenes.
2. Add and transform a node, then use Undo and Redo.
3. Save the scene and confirm panel changes never add the unsaved-change `*` to
   the window title.
4. Import an asset and confirm its card remains usable after resizing Assets.
5. Close the application with and without unsaved scene changes; confirm the
   Beta 8 safety dialog still behaves correctly.

Beta 9 passes only when all required checks succeed or a defect is corrected and
the affected checks are repeated.
