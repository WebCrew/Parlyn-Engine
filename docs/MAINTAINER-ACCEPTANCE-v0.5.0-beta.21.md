# Parlyn Engine v0.5.0 Beta 21 — Maintainer Acceptance

Status: passed human Windows acceptance on 2026-09-15. Surface placement and
the wider editor regression scope completed without a reported defect.

Scope: optional downward authoring placement on Move-gizmo release only.
No collision/physics, slope alignment, Inspector snap or asset-import changes.
Surface supports currently mean authored Mesh3D objects, not sprite backdrops.

1. Locate the Surface icon in the Placement group (down arrow onto a sloped
   line). Verify its tooltip, focus, pressed state and independent toggle.
   In a fresh preference store it must be off.
2. With Surface off, Move an object above the floor. It stays where released.
3. Turn Surface on, Move it while above the floor: on release its visible
   bottom rests at the existing editor ground Y=-1.55. It does not drop mid-drag.
4. Create a Mesh3D platform via Add Node, Scale it wider/flatter and place it
   below another mesh or billboard. With Surface on, release Move above it:
   the node rests on its nearest lower mesh top, not on the ground below it.
5. Move beyond the platform: placement falls back to the editor ground. A node
   below the ground with no lower support must not be lifted automatically.
   This downward tool does not resolve already-intersecting geometry.
6. Undo once restores the whole previous position; Redo restores the moved
   and placed result. Save, switch A/B scenes, reopen and verify history.
7. Rotate and Scale do not drop objects; Inspector coordinate changes do not
   drop objects. A click without changing the gizmo must not invoke placement.
8. Check scaled/rotated moving objects, 2.5D and 3D views and billboard placement.
   Only the center-underfoot support is sampled; slope-normal alignment and
   footprint-wide collision are not part of this foundation.
9. With multi-selection, only the existing primary-node Move behavior applies;
   selected nodes and related hierarchy nodes must not act as self-support.
10. Transform Snap remains independent. Surface positioning takes precedence
    over the final vertical grid increment. Ground button/End stays unchanged.
11. Toggle Surface, restart and confirm the preference is restored. Toggling
    must not mark a scene dirty or add History. Re-test panels, Bounds, F,
    Save/Open and unsaved Cancel/Discard/Save & Continue.

Unavailable, disabled, overhead or steep mesh faces are not support targets.
The downward ray is bounded to 1000000 authoring units. This is not runtime
collision detection or an imported-terrain placement promise.
