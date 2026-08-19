# Parlyn Engine Roadmap

This roadmap describes direction, not promises or fixed dates. Parlyn is still young enough that architecture may change when testing proves a better approach.

## Guiding principle — developer freedom

**Parlyn gives you a strong starting point, not a fixed path.**

Parlyn may provide official high-quality systems, but optional Parlyn workflows must not become the only way to build a game. Developers should be able to use official modules, replace them with custom solutions, or choose compatible community alternatives.

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
- viewport transform gizmos (move / rotate / scale)
- module registry and lifecycle foundation

## Editor foundation

- duplication and reparenting
- multi-scene project browser
- rename/move project assets
- unsaved-change protection
- editor preferences
- stronger error reporting
- transform snapping and local/world gizmo options
- optional Surface / Ground Snap for prop placement, plus Grid Snap
- Frame Selected command for quickly focusing lights, cameras, audio sources and distant nodes
- optional scene/world bounds kept separate from the dynamically resizable editor viewport

## Plugin / module platform

- external module package format
- version compatibility rules
- permission model
- safe editor API surface
- controlled module UI extension points (panels, menus, toolbars, Inspector extensions, settings and node registration)
- safe runtime API surface
- module dependency handling
- module install/update/remove workflow
- signed/trusted publishing options where justified

### Planned official Parlyn modules and systems

Engine-adjacent systems:

- Audio
- Lighting
- Navigation / pathfinding
- Input/runtime services

Optional higher-level systems:

- Settings framework
- Quest system
- Character creation framework
- Intro / cutscene tools
- Credits tools
- AI editor assistance with provider abstraction and explicit user approval before changes are applied

These are intended as maintained starting points, **not mandatory workflows**.

## 2.5D renderer foundation

- texture-backed sprites
- billboard modes, including explicit camera-facing / constrained rotation behavior
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
- audio nodes with global and spatial sources plus editor visualization for spatial range
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
- additional renderer backends where justified
- asset marketplace ecosystem
- broader community contribution model
