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

## Compatibility

Both the project format and scene format are versioned. Future migrations should be explicit rather than silently interpreting incompatible data.
