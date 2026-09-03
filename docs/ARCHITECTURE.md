# Architecture

Parlyn separates four concerns:

1. **Engine model** — Parlyn-owned nodes, scenes and metadata.
2. **Renderer interface** — a small API used by the editor/runtime.
3. **Renderer backend** — currently THREE.js.
4. **Editor/platform** — Electron, panels and user interaction.

The engine model must never require Electron. Renderer-specific objects must not leak into serialized Parlyn scene data.

## Node family

- Node
- Node2_5D
- Node3D

Planned specializations include Sprite2_5D, Billboard2_5D, ParallaxLayer, Mesh3D, Camera and Light.

## Renderer rule

Parlyn code talks to a RendererBackend contract. THREE.js can be replaced or complemented later without changing the project format or editor concepts.


## Desktop application and service boundary

Parlyn is distributed as an installable desktop engine. The editor owns local authoring and must remain usable without an account or network connection. A future launcher owns engine installation, updates and authentication for optional online services.

Long-lived credentials must not cross automatically from the launcher into the editor. The editor receives only short-lived, narrowly scoped authorization when an online feature requires it. Projects, scenes, assets and the reserved `.parlyn/` directory must never contain account tokens.

See [`AUTHENTICATION.md`](AUTHENTICATION.md).

## Smart Systems boundary

Parlyn Ways, Scene Capsules, World Memory, Adaptive Simulation, Encounter Layers, Parlyn Horizon and Parlyn Voice build on Parlyn-owned versioned data. Their models must not depend on Electron or expose THREE.js objects in serialized project data. Rendering, simulation policy and optional providers remain replaceable implementations.

See [`SMART-SYSTEMS.md`](SMART-SYSTEMS.md).
