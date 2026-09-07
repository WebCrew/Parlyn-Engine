# Parlyn Engine Changes

## Unreleased — Foundation Stabilization

- Started Phase 2 with editor commands for deep node duplication and safe reparenting.
- Added recursive hierarchy rendering and fixed subtree deletion in the viewport.
- Added a bounded, validated local Scene History that preserves Undo/Redo through project close and application restart.
- Added the versioned `parlyn-scene-history` document format with stale-history rejection.
- Added explicit Close Project behavior that clears the privileged project session and protects unsaved scene changes.
- Added exact-name-confirmed project deletion through the operating system Recycle Bin; Parlyn never permanently deletes the active project.
- Adopted full Semantic Version prerelease names in application metadata and Windows installer filenames.
- Restored the sandboxed Electron preload bridge so packaged project creation and saving work again.
- Added sandboxed preload contract and real Electron smoke tests that verify every desktop host method before Windows packaging.
- Added a reproducible 64-bit Windows NSIS installer foundation.
- Added branded Windows executable and installer metadata.
- Added a manual Windows build workflow with a strict trusted-signing gate.
- Added automated Windows distribution configuration and Authenticode artifact checks.
- Documented the Smart App Control maintainer acceptance path for Issue #12.
- Added versioned Parlyn world data, World Memory and deterministic encounter foundations.
- Connected world documents to project creation, loading and saving.
- Added honest Foundation/Planned UI status for all Parlyn Smart Systems.
- Defined desktop account architecture and `parlyn.org` as the canonical service origin.
- Reorganized the roadmap into ordered development phases.
- Added a binding foundation-first development policy and separate Idea Pool.
- Added the Core Data & Persistence Contract v1.
- Reject unsupported project, scene and world versions explicitly.
- Validate project-relative paths and block traversal outside the project root.
- Detect duplicate scene node IDs and invalid scene roots.
- Replace silent project-loading failures with actionable errors.
- Add automated project, scene and world roundtrip/error-case checks.
- Added a shared persistence boundary for project, scene and world documents.
- Validate complete documents before both open and save operations.
- Write documents through temporary sibling files and atomic replacement.
- Preserve the previous valid file when a save payload is rejected.
- Reject non-finite numbers, non-JSON values and unsupported scene node types before data can be lost.
- Harden timestamp, transform, camera, light and required-field validation.
- Test real filesystem round trips, malformed input and rejected-save preservation.
- Restricted privileged IPC calls to Parlyn's own local editor document.
- Added renderer payload shape and size limits before filesystem operations.
- Blocked project-root escapes through symbolic links.
- Denied unexpected editor navigation and renderer-created windows.
- Replaced status-only operation failures with a visible error dialog.
- Included branding assets in packaged builds and removed broken-image fallback text from the editor toolbar.
- Added automated desktop trust-boundary and UI error-contract checks.
- Prevented Node self-parenting and ancestor cycles during reparenting.
- Switched Node traversal to stable iterative pre-order traversal.
- Added strict History limits, labels, snapshot isolation and redo-branch rules.
- Bounded loaded scenes to 10,000 nodes and 256 hierarchy levels.
- Reworked plain-JSON validation to avoid recursive call-stack exhaustion.
- Added automated Node hierarchy and Undo/Redo invariant checks.
- Added a repeatable Beta 4 maintainer acceptance checklist for the Phase 1 completion gate.
- Generalized the non-overwriting unsigned preview workflow for explicit beta releases.


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
