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

Reserved for generated caches, import metadata and other project-local internal data. Developers should not rely on its contents as a public API.

## Compatibility contract v1

Every persisted Parlyn document declares a `format` and numeric `version`.

| Document | Current version | Read compatibility |
|---|---:|---|
| `parlyn-project` | 1 | version 1 |
| `parlyn-scene` | 2 | versions 1 and 2; version 1 is upgraded in memory and saved as version 2 |
| `parlyn-world` | 1 | version 1 |

Unknown future versions are rejected with an explicit error. Parlyn must never silently interpret an unsupported document as the current format.

Project references such as `startupScene` and `world` are project-relative paths using forward slashes. Absolute paths, empty segments, backslashes and parent traversal (`..`) are invalid.

## Persistence invariants

- Project, scene and world documents survive a load/save roundtrip without losing supported data.
- Scene node IDs are unique inside a scene document.
- A scene root uses the `SceneRoot` type.
- World collections are arrays and their stable IDs are unique.
- Scene and world references cannot escape the selected project directory.
- Missing, unreadable and malformed required documents produce an explicit error rather than opening a partial project.

Future format migrations must be deliberate, tested and documented here.
