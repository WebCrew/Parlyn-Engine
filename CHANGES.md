# Parlyn Engine Changes

## v0.5.0 — Transform Tools & Module Foundation

### Editor

- Added viewport Move, Rotate and Scale gizmos.
- Added W / E / R shortcuts and Select mode (Q / Esc).
- Gizmo changes update the Inspector live.
- Gizmo operations participate in the existing Undo / Redo history.
- Added 2.5D-aware transform constraints for rotation and scale.

### Modules

- Added the first Parlyn `ModuleRegistry`.
- Added validated module manifests and unique IDs.
- Added activate/deactivate lifecycle hooks.
- Added module state-change events.
- Added a Modules browser to the editor.
- Added a deliberately small official Example Module for lifecycle testing.
- Added `docs/MODULE-SYSTEM.md`.

### Philosophy / roadmap

- Added developer freedom as an explicit architecture principle.
- Official Parlyn systems are defined as optional starting points, never mandatory workflows.
- Added future official Audio, Lighting, Navigation, Settings, Quest, Character Creator, Intro/Cutscene, Credits and AI assistance directions to the roadmap.

## v0.4.0 — First GitHub Preview

- Public project structure and branding.
- Project-folder model and scene persistence.
- Asset import/storage foundation.
- `Sprite2_5D`, `Billboard2_5D`, `Mesh3D`, `Light3D`, and `Camera3D` scene nodes.
- Sample project and public documentation.
