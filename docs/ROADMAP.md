# Parlyn Engine Roadmap

This roadmap describes direction, not promises or fixed dates. Parlyn is still young enough that architecture may change when testing proves a better approach.

## Foundation — current

- independent Node/Scene architecture
- renderer abstraction
- THREE.js renderer backend
- 2.5D + 3D hybrid viewport
- scene persistence
- undo/redo foundation
- project-folder model
- asset storage/import foundation
- `Sprite2_5D`, `Billboard2_5D`, `Mesh3D`, `Light3D`, `Camera3D`

## Editor foundation

- transform gizmos
- duplication and reparenting
- multi-scene project browser
- rename/move project assets
- unsaved-change protection
- editor preferences
- stronger error reporting

## 2.5D renderer foundation

- texture-backed sprites
- billboard modes
- explicit depth ordering
- sprite materials
- normal maps
- height/parallax maps
- 2.5D-aware lighting and shadows
- particles and atmospheric effects

## Runtime foundation

- editor/runtime separation
- runtime cameras
- input abstraction
- collision/physics abstraction
- audio nodes
- scene switching
- game export/build pipeline

## Asset pipeline

- glTF/GLB loader
- image texture importer
- audio importer
- import metadata
- generated cache
- pluggable importer API

## Later

- animation workflows
- shader authoring support
- debugging/profiling tools
- package/plugin model
- additional renderer backends where justified
- asset marketplace ecosystem
- broader community contribution model
