# Parlyn Engine v0.5.0 Beta 11 — Maintainer Acceptance

Beta 11 introduces the first stronger error-reporting foundation. Failed editor
operations now show their affected area, a readable summary, recovery guidance
and optional technical details that can be copied for a bug report.

## Portable test preparation

1. Download `Parlyn-Engine-Portable-0.5.0-beta.11-x64.zip` and
   `SHA256SUMS.txt` from the same release.
2. Verify the ZIP checksum and extract it into a new folder.
3. Start `Parlyn Engine.exe`. If Windows blocks it, stop; do not bypass Smart App
   Control.

## Error-reporting test

1. Create or open a project and import a PNG asset.
2. Select the asset and choose **Rename / Move**.
3. Change only its extension from `.png` to `.jpg` and apply the change. This is
   intentionally rejected because renaming must not disguise an asset format.
4. Confirm the error dialog identifies **Assets**, shows a readable explanation
   and provides a recovery suggestion.
5. Confirm **Technical details** is closed by default and the ordinary message
   does not expose a local project path.
6. Open **Technical details** and confirm the sharing warning is visible.
7. Choose **Copy Details**, paste into a text editor and confirm the report
   contains a time, area, operation and message. Review it before sharing because
   technical details may contain local paths.
8. Close the dialog and confirm the project remains usable.

## Regression

1. Rename the same asset without changing its extension and confirm it succeeds.
2. Switch scenes, transform a node, use Undo/Redo and save normally.
3. Hide, resize and restore each workspace panel, then restart Parlyn and confirm
   the layout persists.
4. Choose **View > Reset Layout** and confirm the standard layout returns.

The NSIS installer remains diagnostic while unsigned. Routine functional testing
uses the portable ZIP and removes it later by deleting the extracted folder.
