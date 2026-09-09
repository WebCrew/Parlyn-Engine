# Parlyn Engine v0.5.0 Beta 8 — Maintainer Acceptance

This pass verifies complete unsaved-scene transition protection and the long
asset-name layout correction against the published Beta 8 Windows artifact.

## 1. Install and launch

1. Download the Beta 8 installer and `SHA256SUMS.txt`.
2. Verify the installer checksum.
3. Install normally and launch Parlyn without weakening Windows security.

## 2. Protected editor transitions

For each action below, first make an unsaved scene edit. Confirm **Cancel** keeps
the current scene unchanged, **Discard Changes** continues without saving, and
**Save & Continue** continues only after a successful save:

1. **New Scene**;
2. **Open Scene**;
3. **New Project**;
4. **Open Project**;
5. switching project scenes;
6. renaming or moving the current project scene;
7. **Close Project**.

Confirm that **New Scene** and **Open Scene** leave the previous project session
and subsequent Save cannot overwrite that project's startup scene.

## 3. Application close

1. Make an unsaved edit and close Parlyn with the window **X**.
2. Confirm **Cancel** keeps Parlyn open with the edit intact.
3. Repeat with **Save & Continue**, complete or cancel the save dialog, and
   confirm Parlyn closes only after a successful save.
4. Repeat with **Discard Changes** and confirm Parlyn closes.
5. Repeat the checks with **Alt+F4**.

## 4. Long asset names

1. Import an asset with a filename longer than its asset card.
2. Confirm the card grid remains intact and the visible name ends with an
   ellipsis rather than crossing the card boundary.
3. Hover the card and confirm its full project-relative path remains available.

## 5. Regression

Confirm project and scene persistence, asset rename/move, multi-selection,
Undo/Redo, duplication and hierarchy reparenting still work.

Beta 8 passes only when all required checks succeed or a defect is corrected and
the affected check is repeated against a new artifact.
