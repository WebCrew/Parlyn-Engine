# Parlyn Engine v0.5.0 Beta 9.1 — Maintainer Acceptance

Beta 9.1 carries the Beta 9 workspace-layout foundation and adds a portable
Windows test artifact after Smart App Control blocked an unsigned NSIS uninstall
helper on the maintainer's machine.

## Portable test preparation

1. Download `Parlyn-Engine-Portable-0.5.0-beta.9.1-x64.zip` and
   `SHA256SUMS.txt` from the same release.
2. Verify the ZIP's SHA-256 checksum.
3. Extract the complete ZIP into a new folder owned by the current user.
4. Start `Parlyn Engine.exe` from that extracted folder.
5. If Windows blocks the executable, stop the test. Do not disable or bypass
   Smart App Control.

The portable build must create no entry under **Installed Apps** and requires no
uninstaller. Remove it later by deleting its extracted folder. Project folders
stored elsewhere and local editor preferences are separate.

## Workspace layout

1. Confirm Hierarchy/Scenes, Assets and Inspector begin in their default places.
2. Hide each panel through **View**, then restore it.
3. Close each panel through its `×` button, then restore it through **View**.
4. Resize both side panels and Assets with their dividers.
5. Confirm the viewport immediately receives space released by a hidden panel.
6. Restart the portable build and confirm visibility and sizes are restored.
7. Choose **View > Reset Layout**, restart again and confirm the default persists.

## Regression

1. Create or open a project and switch between two scenes.
2. Add and transform a node, then use Undo and Redo.
3. Save the scene and confirm layout changes do not add the unsaved `*`.
4. Import an asset and resize Assets around its card.
5. Confirm the unsaved-change dialog still protects edited scenes.

The NSIS installer remains attached for packaging diagnosis, but it is not the
recommended unsigned functional-test path. Beta 9.1 passes only when all required
portable and editor checks succeed.
