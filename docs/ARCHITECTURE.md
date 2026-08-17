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
