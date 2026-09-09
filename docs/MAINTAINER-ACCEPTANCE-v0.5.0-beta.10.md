# Parlyn Engine v0.5.0 Beta 10 — Maintainer Acceptance

Beta 10 corrects workspace reflow when the leading Hierarchy/Scenes panel is
hidden and retains the portable unsigned test path introduced in Beta 9.1.

## Portable test preparation

1. Download `Parlyn-Engine-Portable-0.5.0-beta.10-x64.zip` and
   `SHA256SUMS.txt` from the same release.
2. Verify the ZIP checksum and extract it into a new folder.
3. Start `Parlyn Engine.exe`. If Windows blocks it, stop; do not bypass Smart App
   Control.

## Panel combinations

For every step, confirm the viewport remains centered, Inspector stays on the
right, Assets stays below the viewport and no panel content overlaps another.

1. Hide and restore Hierarchy/Scenes by itself.
2. Hide and restore Inspector by itself.
3. Hide and restore Assets by itself.
4. Hide Hierarchy/Scenes and Inspector together, then restore both.
5. Hide Hierarchy/Scenes and Assets together, then restore both.
6. Hide Inspector and Assets together, then restore both.
7. Hide all three panels and confirm the viewport fills the workspace.
8. Restore all three through **View**.
9. Repeat the Hierarchy/Scenes test using its `×` button.

## Persistence and regression

1. Hide Hierarchy/Scenes, resize the other panels and restart Parlyn. Confirm the
   exact layout is restored without reflow corruption.
2. Choose **View > Reset Layout** and confirm the standard layout returns.
3. Create or open a project, switch scenes, transform a node, use Undo/Redo and
   save normally.
4. Confirm layout changes never add the unsaved `*` to the title.

The NSIS installer remains diagnostic while unsigned. Routine functional testing
uses the portable ZIP and removes it later by deleting the extracted folder.
