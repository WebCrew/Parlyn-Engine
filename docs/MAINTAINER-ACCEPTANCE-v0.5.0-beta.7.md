# Parlyn Engine v0.5.0 Beta 7 — Maintainer Acceptance

This pass verifies safe project-asset rename and move operations against the
published `v0.5.0-beta.7` Windows artifact.

## 1. Install and launch

1. Download the Beta 7 installer and `SHA256SUMS.txt`.
2. Verify the installer checksum.
3. Install normally and launch Parlyn without weakening Windows security.

## 2. Asset rename and move

1. Create or open a disposable Parlyn project.
2. Import at least two image, model or audio files.
3. Select one card in the **Assets** panel and confirm **Rename / Move** becomes available.
4. Rename that asset while preserving its file extension.
5. Move it to a nested path such as `assets/environment/trees/old-oak.png`.
6. Restart Parlyn, reopen the project and confirm the moved asset remains listed.
7. Attempt to move it onto the path of the second imported asset and confirm
   Parlyn refuses without changing either file.
8. Attempt to change its extension and confirm Parlyn refuses the operation.
9. Confirm a failed operation remains visible in the error dialog.

## 3. Regression

Confirm project creation, Save, Close, Open, scene switching, scene rename/move,
multi-selection, Undo/Redo, duplication and hierarchy reparenting still work.

Beta 7 passes only when all required checks succeed or a defect is corrected and
the affected check is repeated against a new artifact.
