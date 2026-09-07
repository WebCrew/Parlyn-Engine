# Parlyn Project Format

Parlyn v0.4 introduces the first project-folder convention.

```text
Project Root/
├── parlyn.project.json
├── scenes/
├── worlds/
├── assets/
└── .parlyn/
```

## `parlyn.project.json`

This file identifies the folder as a Parlyn project and stores lightweight project metadata.

Example:

```json
{
  "format": "parlyn-project",
  "version": 1,
  "name": "Example Project",
  "startupScene": "scenes/Main.parlyn-scene.json",
  "world": "worlds/Main.parlyn-world.json"
}
```

## `scenes/`

Contains Parlyn-owned scene documents. Scene data is currently JSON while the format is young and intentionally easy to inspect.

## `worlds/`

Contains versioned `parlyn-world` documents for Scene Capsules, Parlyn Ways, stable landmarks, deterministic encounters and World Memory. See [`SMART-SYSTEMS.md`](SMART-SYSTEMS.md).

## `assets/`

Contains source assets imported by the developer. External asset formats are not intended to become Parlyn's internal scene format.

## `.parlyn/`

Reserved for generated caches, import metadata and other project-local internal
data. Beta 5 stores the validated startup Scene History here as
`startup-scene.parlyn-history.json`. Developers should not rely on internal
paths as a public API; the history document itself remains explicitly versioned.

## Compatibility contract v1

Every persisted Parlyn document declares a `format` and numeric `version`.

| Document | Current version | Read compatibility |
|---|---:|---|
| `parlyn-project` | 1 | version 1 |
| `parlyn-scene` | 2 | versions 1 and 2; version 1 is upgraded in memory and saved as version 2 |
| `parlyn-world` | 1 | version 1 |
| `parlyn-scene-history` | 1 | version 1 |

Unknown future versions are rejected with an explicit error. Parlyn must never silently interpret an unsupported document as the current format.

Project references such as `startupScene` and `world` are project-relative paths using forward slashes. Absolute paths, empty segments, backslashes and parent traversal (`..`) are invalid.

## Persistence invariants

- Project, scene and world documents survive a load/save roundtrip without losing supported data.
- Scene node IDs are unique inside a scene document.
- A scene root uses the `SceneRoot` type.
- Scene documents contain at most 10,000 nodes and 256 child levels; larger documents are rejected explicitly.
- World collections are arrays and their stable IDs are unique.
- Scene and world references cannot escape the selected project directory.
- Missing, unreadable and malformed required documents produce an explicit error rather than opening a partial project.
- Documents are fully normalized and validated before they replace an existing file.
- Saves use a temporary sibling file followed by an atomic rename. A rejected document never truncates the last valid file.
- Persisted values must be plain JSON data. Functions, non-finite numbers, custom object prototypes, symbol keys and circular references are rejected because JSON cannot preserve them reliably.
- Scene History contains at most 100 Undo/Redo states, is size-bounded on export and is restored only when its current-scene snapshot matches the loaded scene exactly.

The persistence boundary is shared by loose scenes and project-owned project, scene and world files. Validation therefore does not depend on which editor command initiated the operation.

## Future extension data

This contract does not introduce scripting or Visual Scripting. Future script components and graph documents must declare their own versioned schema when that phase becomes active. The current foundation deliberately preserves valid nested JSON metadata during round trips, so later engine-owned extension data can be introduced without coupling persistence to the editor UI.

Future format migrations must be deliberate, tested and documented here.
