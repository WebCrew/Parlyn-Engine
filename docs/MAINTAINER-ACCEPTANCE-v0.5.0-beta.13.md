# Parlyn Engine v0.5.0 Beta 13 — Maintainer Acceptance

Beta 13 makes the Transform Snap increments configurable without changing the
established toggle, 2.5D constraints or unrestricted Inspector entry.

## Portable test preparation

1. Download `Parlyn-Engine-Portable-0.5.0-beta.13-x64.zip` and
   `SHA256SUMS.txt` from the same release.
2. Verify the ZIP checksum, extract it and start `Parlyn Engine.exe`. Do not
   bypass a Windows security decision.

## Configurable Snap steps

1. Open the Snap settings through the small button beside **Snap**.
2. Confirm the defaults: Move `0.5`, Rotate `15`, Scale `0.1`.
3. Set Move to `1`, Rotate to `30` and Scale to `0.25`, then choose **Apply**.
4. Enable **Snap** and verify a 3D mesh follows all three custom increments.
5. Repeat with a 2.5D sprite and confirm its existing axis limits remain.
6. Use Undo and Redo after every transform.
7. Restart Parlyn and confirm the custom values and Snap state remain active.
8. Open the settings, choose **Reset Defaults** and confirm all three defaults
   appear immediately and are used by the gizmos.

## Boundaries and regression

1. Confirm invalid or out-of-range entries cannot be applied: Move below `0.01`,
   Rotate below `1` or above `180`, and Scale below `0.01`.
2. Confirm changing Snap settings never marks a scene unsaved.
3. Confirm direct Inspector values remain unrestricted.
4. Save and reopen a scene, exercise the error dialog, and restore/reset the
   workspace layout.

Local/World gizmo modes remain the next separate Roadmap step.
