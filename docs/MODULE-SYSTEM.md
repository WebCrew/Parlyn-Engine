# Parlyn Module System

Parlyn's module system exists to preserve developer freedom while allowing the project to ship reliable official building blocks.

> **Parlyn gives you a strong starting point, not a fixed path.**

## Design goals

- Keep the engine core small and stable.
- Let official Parlyn systems use the same extension model as third-party systems where practical.
- Never make an optional gameplay workflow the only supported workflow.
- Allow developers to replace official modules with custom solutions.
- Introduce permissions and safe external loading before accepting executable marketplace plugins.

## v0.5 foundation

v0.5 introduces the in-memory module registry and lifecycle:

- manifest validation
- unique module IDs
- metadata and categories
- enable / disable state
- `activate(context)` lifecycle hook
- `deactivate(context)` lifecycle hook
- module-change events
- editor module browser

An intentionally small `Example Module` is included as a developer test. It proves the lifecycle without pretending that larger gameplay systems are already implemented.

## Planned manifest direction

Future external modules are expected to use a manifest concept similar to:

```json
{
  "id": "org.parlyn.quest",
  "name": "Parlyn Quest System",
  "version": "1.0.0",
  "engine": ">=1.0.0",
  "permissions": ["scene.read", "scene.write"]
}
```

The exact external package format is intentionally not frozen yet.

## Planned official systems

### Engine-adjacent subsystems

- Audio
- Lighting
- Navigation / pathfinding
- Input and runtime services

### Optional gameplay/editor modules

- Settings framework
- Quest system
- Character creation framework
- Intro / cutscene tools
- Credits tools
- AI editor assistance

Official does **not** mean mandatory. Developers remain free to build or install alternatives.

## Security direction

Loading arbitrary third-party JavaScript is executable-code loading and therefore needs a deliberate security model. Before Parlyn enables external plugins, the architecture should define permissions such as project read/write, filesystem access, network access, editor APIs and runtime APIs.
