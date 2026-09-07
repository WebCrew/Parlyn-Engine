# Parlyn Engine v0.5.0 Beta 3 — Maintainer Acceptance

This is the repeatable Phase 1 acceptance pass. Perform it on the published
`v0.5.0-beta.3` artifact, not on a development checkout or an older beta.

Smart App Control and normal Windows security settings remain enabled. This
preview is intentionally unsigned while the SignPath Foundation application is
pending; a successful functional test is not a claim of trusted signing.

## Test record

Record these values in Issue #23 after the pass:

- date and Windows version;
- installer filename;
- SHA-256 shown by `Get-FileHash`;
- pass/fail for each section below;
- exact wording and screenshot for any failure.

## 1. Download and integrity

1. Download the installer and `SHA256SUMS.txt` from the Beta 3 prerelease.
2. In PowerShell, run:

   ```powershell
   Get-FileHash "$env:USERPROFILE\Downloads\Parlyn-Engine-Setup-0.5.0-x64.exe" -Algorithm SHA256
   ```

3. Confirm the displayed hash matches `SHA256SUMS.txt`.

## 2. Install and launch

1. Install with the normal per-user setup.
2. Launch from the final installer page.
3. Close Parlyn and launch it once from the Start menu and once from the desktop shortcut.
4. Confirm the top button bar shows one intact Parlyn logo and no second broken `Parlyn Engine` fallback text.

## 3. Project and persistence

1. Create a project named `Parlyn Beta 3 Test` in a new empty parent folder.
2. Add one 2.5D Sprite and one 3D Mesh.
3. Rename both nodes and change their positions.
4. Save the scene, close Parlyn, reopen the project and confirm names and positions survived.
5. Open **World**, confirm the project world name and seed appear, then use **Save World**.
6. Open the bundled `samples/Parlyn-Test-Project` and confirm its hierarchy and imported asset appear.

## 4. Hierarchy, transforms and history

1. Select nodes through both Hierarchy and Viewport.
2. Move, rotate and scale the 3D Mesh with W, E and R.
3. Move and scale the 2.5D Sprite; confirm its 2.5D transform controls remain appropriate.
4. Undo at least three changes, then redo them in order.
5. Undo once, make a different change and confirm the old redo path is no longer available.

## 5. Visible error feedback

1. Create a plain text file containing `{ broken json` and give it a `.json` extension.
2. Use **Open Scene** and select that file.
3. Confirm Parlyn stays open and presents a visible `Scene open failed` dialog with an understandable invalid-JSON message.
4. Close the dialog and confirm normal editor interaction still works.

## 6. Modules and regression

1. Open **Modules**, enable and disable the Example Module and confirm its displayed state follows the action.
2. Orbit, pan and zoom the editor camera.
3. Add and delete another node, then undo and redo the deletion.
4. Save and reopen once more without a crash or console-visible failure affecting the UI.

## 7. Uninstall preservation

1. Close Parlyn and uninstall Beta 3 normally.
2. Confirm the separately created `Parlyn Beta 3 Test` project still exists with its files intact.

Phase 1 passes only when every required section succeeds or a discovered defect
is fixed and the affected section is repeated against a new artifact.
