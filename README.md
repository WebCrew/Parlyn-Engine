<p align="center">
  <img src="assets/branding/parlyn-logo-dark.svg" alt="Parlyn Engine" width="420">
</p>

<p align="center"><strong>Depth. Layers. Worlds.</strong></p>

# Parlyn Engine

**Parlyn Engine** is a free and open-source game engine designed primarily for **modern 2.5D development**, while keeping real 3D available wherever a project benefits from it.

Parlyn treats sprites, billboards, layered depth, lighting and real 3D geometry as parts of the same scene workflow. 2.5D is not a secondary editor mode: it is a first-class engine concept.

> **Current status:** v0.5.0 GitHub Preview — early engine/editor foundation. APIs and project formats may still change.

Parlyn is an installable desktop engine, not a browser application. Local editing and locally owned projects will remain available offline. A future account and launcher will serve optional updates, marketplace, library, team and cloud features; see [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md).

The committed, staged direction for large 2.5D-first worlds is documented as **Parlyn Smart Systems**, including Parlyn Ways, Scene Capsules, World Memory, Adaptive Simulation, Encounter Layers, Parlyn Horizon and Parlyn Voice. These are planned systems, not claims about the current preview; see [`docs/SMART-SYSTEMS.md`](docs/SMART-SYSTEMS.md).

## Why Parlyn?

Parlyn is being built around a simple idea: developers should be able to use the production advantages of 2.5D without giving up modern presentation or the freedom to mix in 3D.

The long-term direction includes:

- layered 2.5D scenes with real depth
- sprites and camera-facing billboards in 3D space
- normal/height-map workflows and modern lighting
- real 3D geometry in the same scene
- particles, shaders and post-processing
- accessible editor workflows for small teams and newcomers
- an open asset pipeline based on common interchange formats
- renderer abstraction so Parlyn is not permanently tied to one backend

## What works today

### Editor

- Electron desktop editor
- real THREE.js-backed viewport behind a Parlyn renderer abstraction
- 2.5D and 3D editor camera presets
- hierarchy selection and viewport ray-cast selection
- transform inspector
- viewport Move / Rotate / Scale gizmos with W / E / R shortcuts
- live Inspector synchronization during gizmo edits
- editor camera orbit, pan and zoom
- undo/redo history foundation
- native scene open/save dialogs
- final Parlyn visual identity and branding

### Scene graph

Parlyn owns its scene data and node model. Current first-class node types include:

- `Node`
- `Node2_5D`
- `Node3D`
- `Sprite2_5D`
- `Billboard2_5D`
- `Mesh3D`
- `Light3D`
- `Camera3D`

`Billboard2_5D` already demonstrates one of Parlyn's core goals: 2.5D elements can coexist naturally with meshes, lights and cameras inside one scene.

### Projects

v0.4.0 introduces the first real Parlyn project model.

A project contains:

```text
My Project/
├── parlyn.project.json
├── scenes/
│   └── Main.parlyn-scene.json
├── assets/
└── .parlyn/
```

Projects can be created and reopened through native desktop dialogs. Scene data remains plain, readable JSON during this early phase.

### Asset workflow foundation

The editor can now import common asset files into a Parlyn project's `assets/` directory and display them in the Asset panel.

Initial accepted file types include:

- PNG / JPEG / WebP / SVG
- glTF / GLB
- OBJ
- WAV / OGG / MP3

This is the **storage/import foundation**, not yet a complete runtime importer. Loading textures, models and audio into runtime nodes is a later milestone.


## Module foundation

v0.5.0 introduces the first Parlyn module registry and lifecycle. Modules can be registered with validated metadata and enabled or disabled through the editor. The bundled Example Module exists only to test this lifecycle; larger gameplay systems are not being pretended into existence before their foundations are ready.

Parlyn's long-term rule is simple:

> **Parlyn gives you a strong starting point, not a fixed path.**

Official Parlyn systems will be maintained options, not mandatory workflows. Developers remain free to replace them with their own solutions or compatible community modules.

See [`docs/MODULE-SYSTEM.md`](docs/MODULE-SYSTEM.md).

## Architecture

Parlyn deliberately owns its higher-level engine concepts instead of exposing renderer-native objects as project data.

```text
Parlyn Engine
│
├── Project / Scene / Nodes / Assets / Editor
│
└── RendererBackend
     │
     └── ThreeRenderer   (current backend)
```

THREE.js is currently used as the rendering implementation. It is not the definition of Parlyn's scene graph or project format.

This boundary is intentional: future renderer work should remain possible without redesigning the editor or invalidating Parlyn scene files.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## 2.5D-first philosophy

Parlyn does not define 2.5D as "fake 3D". It treats it as a flexible production approach.

A scene may, for example, combine:

- a real 3D floor
- 3D architecture
- illuminated 2.5D characters
- billboard vegetation
- parallax backgrounds
- 3D lights
- particles and atmospheric effects

The engine should provide useful building blocks without dictating how developers must combine them.

## Open asset philosophy

Parlyn aims to work well with legally licensed third-party assets and neutral file formats.

The intended pipeline is:

```text
External asset
      ↓
Importer
      ↓
Parlyn metadata
      ↓
Optimized cache (where useful)
      ↓
Scene / runtime
```

Parlyn will not assume that an asset purchased from another marketplace automatically permits use outside its original ecosystem. Developers remain responsible for the license of third-party content.

See [`docs/ASSET-PIPELINE.md`](docs/ASSET-PIPELINE.md).

## Development setup

Requirements:

- Node.js 22.12 or newer
- npm
- Windows, Linux or macOS capable of running Electron

Install dependencies:

```bash
npm install
```

Run the editor:

```bash
npm run dev
```

Run structural checks:

```bash
npm run check
```

A bundled test project is available under `samples/Parlyn-Test-Project`. Use **Open Project** and select that folder to exercise the current project, scene, node and asset foundations without preparing your own test content first.

Create a minified renderer bundle:

```bash
npm run build:renderer:release
```

### Windows installer

Parlyn now has a reproducible 64-bit Windows NSIS packaging foundation:

```powershell
npm ci
npm run build:windows
```

This produces `release/Parlyn-Engine-Setup-<version>-x64.exe`. An unsigned
artifact is a packaging preflight only and does **not** resolve Windows Smart
App Control. A distributable test build requires a publicly trusted Authenticode
identity supplied through the controlled signing boundary.

See [`docs/WINDOWS-DISTRIBUTION.md`](docs/WINDOWS-DISTRIBUTION.md) for signing,
verification and the maintainer acceptance test.

### Code signing policy

Free code signing provided by [SignPath.io](https://signpath.io/), certificate
by [SignPath Foundation](https://signpath.org/).

Parlyn's signing roles, privacy statement and controlled release procedure are
documented in [`docs/CODE-SIGNING-POLICY.md`](docs/CODE-SIGNING-POLICY.md).

## Editor controls

- **Left mouse:** select / manipulate active gizmo
- **Q / Esc:** Select tool
- **W:** Move tool
- **E:** Rotate tool
- **R:** Scale tool
- **Right mouse drag:** orbit editor camera
- **Middle mouse drag:** pan
- **Mouse wheel:** zoom
- **Ctrl+S:** save scene
- **Ctrl+O:** open scene
- **Ctrl+Shift+O:** open project
- **Ctrl+Z:** undo
- **Ctrl+Y / Ctrl+Shift+Z:** redo

## Near-term roadmap

The next engine milestones are intentionally foundation-heavy:

1. runtime/play-mode separation
2. real image/model asset loaders
3. Parlyn material system for sprites and meshes
4. normal-map aware 2.5D lighting
5. camera-node preview/runtime use
6. collision and physics abstraction
7. project scene browser and multiple scenes
8. external module package and permission model
9. complete and verify signed Windows distribution
10. first compact Parlyn showcase project

See [`docs/ROADMAP.md`](docs/ROADMAP.md). Development follows the binding foundation-first scope rule in [`docs/DEVELOPMENT-POLICY.md`](docs/DEVELOPMENT-POLICY.md); new ideas remain in [`docs/IDEA-POOL.md`](docs/IDEA-POOL.md) until a formal planning review.

## Funding philosophy

Parlyn is intended to remain **free to use, free to modify and royalty-free** under the MIT License.

The project may be supported voluntarily through donations and sponsorships. Optional ecosystem services, such as a future asset marketplace, may later help fund development without putting the engine itself behind a paywall.

Your support helps us continue developing Parlyn Engine as a free and open-source project. With your permission, supporters and sponsors may be acknowledged on a dedicated page, while major sponsors may also be featured at the end of this README.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/A0A66XI3A)

## Contributing

Parlyn is public and open source, but core development is intentionally maintainer-led while the architecture is young.

Bug reports, reproducible test cases and thoughtful workflow feedback are welcome. Broader contribution rules will be introduced when the project is stable enough for outside contributions to be predictable rather than frustrating.

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

Parlyn Engine is released under the **MIT License**. See [`LICENSE`](LICENSE).

---

**Parlyn Engine** — *Depth. Layers. Worlds.*
