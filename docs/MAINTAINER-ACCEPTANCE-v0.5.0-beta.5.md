# Parlyn Engine v0.5.0 Beta 5 — Maintainer Acceptance

This pass verifies the first Phase 2 editor slice and all Beta 4 regressions on
the published `v0.5.0-beta.5` Windows artifact.

## Test record

Record the Windows version, installer filename, SHA-256 and pass/fail result in
Issue #29. Smart App Control and normal Windows security settings remain enabled.

## 1. Download, install and launch

1. Download the Beta 5 installer and `SHA256SUMS.txt`.
2. Confirm the hash from the following command matches the checksum file:

   ```powershell
   Get-FileHash "$env:USERPROFILE\Downloads\Parlyn-Engine-Setup-0.5.0-beta.5-x64.exe" -Algorithm SHA256
   ```

3. Install normally and launch Parlyn.

## 2. Durable Scene History

1. Create a project named `Parlyn Beta 5 Test`.
2. Add a 2.5D Sprite, rename it and save.
3. Close and reopen the project, then use **Undo** and **Redo**.
4. Close Parlyn completely, launch it again, reopen the project and repeat **Undo** and **Redo**.
5. Confirm the scene states change in the expected order after both kinds of reopen.
6. Confirm `.parlyn/startup-scene.parlyn-history.json` exists inside the project.

## 3. Duplication and hierarchy

1. Select a node and duplicate it with the Hierarchy button.
2. Repeat with **Ctrl+D** and confirm each copy has a distinct selectable identity.
3. Move a node beneath another node through the hierarchy dialog.
4. Confirm the nested indentation appears and invalid descendant targets are unavailable.
5. Move the node back to **Scene Root**.
6. Undo and redo duplication and reparenting in order.
7. Save, restart Parlyn and confirm the nested structure survives.

## 4. Beta 4 regression

1. Confirm project creation, Scene Save, World Save and Open Project still work.
2. Make an unsaved change and confirm **Close** still offers Cancel, Discard and Save & Continue.
3. Create a disposable project, enter its exact name and confirm **Delete** moves it to the Recycle Bin.
4. Add a parent with a nested child, delete the parent, and confirm no orphan remains visible in the viewport.

Beta 5 passes only when every required check succeeds or a defect is corrected
and the affected check is repeated against a new artifact.
