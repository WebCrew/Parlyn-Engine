# Parlyn Engine Roadmap

This roadmap is an ordered development plan, not a list of simultaneous work and not a promise of fixed dates. Parlyn completes and stabilizes one main phase before activating the next.

See [`DEVELOPMENT-POLICY.md`](DEVELOPMENT-POLICY.md) for the binding scope rule and [`IDEA-POOL.md`](IDEA-POOL.md) for ideas outside the active plan.

## Status key

- **Complete** — implemented, documented and tested against its acceptance criteria.
- **Foundation** — real supporting code or data exists; the full feature is not complete.
- **In Progress** — part of the single active phase.
- **Planned** — accepted, but deliberately not active.
- **Idea Pool** — recorded for later evaluation and excluded from current scope.

## Guiding principle — developer freedom

**Parlyn gives you a strong starting point, not a fixed path.**

Official systems remain replaceable. Developers may use Parlyn defaults, custom solutions or compatible community alternatives.

## Phase 1 — Engine and basic editor foundation

**Status: In Progress**

Already present:

- independent Node and Scene architecture;
- renderer abstraction with THREE.js backend;
- hybrid 2.5D and 3D viewport;
- project, scene and versioned world formats;
- local project and scene persistence;
- hierarchy selection, Inspector and viewport ray casting;
- Move, Rotate and Scale gizmos;
- Undo/Redo foundation;
- constrained Electron preload bridge;
- automated structural, Smart Systems and CodeQL checks.

Completion gate:

- harden model validation and round-trip serialization;
- define explicit format compatibility and migrations;
- make project, scene and world persistence reliable;
- replace silent failures with useful errors;
- protect critical filesystem and IPC boundaries;
- expand automated tests for core invariants;
- synchronize README, changelog and technical documentation;
- complete a repeatable maintainer test pass.

## Phase 2 — Editor foundation

**Status: Planned**

- duplication and reparenting;
- multi-selection where appropriate;
- multi-scene project browser;
- rename and move project assets;
- unsaved-change protection;
- editor preferences;
- stronger error reporting;
- transform snapping and local/world gizmo modes;
- optional Surface/Ground Snap and Grid Snap;
- Frame Selected;
- optional scene/world bounds independent from viewport size;
- consistent commands and keyboard behavior.

## Phase 3 — 2.5D renderer and materials

**Status: Planned**

- texture-backed sprites;
- explicit billboard modes;
- dependable depth ordering;
- Parlyn sprite and mesh material system;
- normal and height/parallax maps;
- 2.5D-aware lighting and shadows;
- particles and atmospheric effects.

## Phase 4 — Asset pipeline

**Status: Foundation**

Existing storage/import foundation remains stable while this phase is inactive.

- image texture importer;
- glTF/GLB and OBJ loading;
- audio importer;
- import metadata;
- generated cache;
- reimport behavior;
- pluggable importer API.

## Phase 5 — Runtime and Play Mode

**Status: Planned**

- editor/runtime separation;
- runtime cameras;
- input abstraction;
- scene switching;
- collision and physics abstraction;
- global and spatial audio;
- game export/build pipeline.

## Phase 6 — External module platform

**Status: Foundation**

The internal registry and lifecycle exist. External executable modules remain disabled until this phase defines:

- package format and compatibility rules;
- permission model;
- safe editor and runtime APIs;
- controlled panels, menus, Inspector extensions and node registration;
- dependencies and install/update/remove workflows;
- signed or trusted publishing where justified.

## Phase 7 — Parlyn Smart Systems

**Status: Foundation; further feature work paused**

Existing foundation:

- versioned `parlyn-world` data;
- Scene Capsule, Parlyn Ways, landmark, encounter and World Memory models;
- deterministic encounter resolution;
- editor overview and honest status placeholders.

Ordered work when this phase becomes active:

1. two real Scene Capsules;
2. deterministic forest-path prototype;
3. stable landmark reconstruction;
4. reproducible encounter placement;
5. Adaptive Simulation;
6. Parlyn Horizon;
7. Parlyn Voice and localization foundation.

See [`SMART-SYSTEMS.md`](SMART-SYSTEMS.md).

## Phase 8 — Desktop distribution and accounts

**Status: Architecture only**

- packaged desktop editor builds;
- installable launcher and version manager;
- offline access to installed versions and local projects;
- optional account sign-in using OAuth 2.0/OpenID Connect with PKCE;
- scoped tokens protected by the operating system;
- canonical `https://parlyn.org` service origin;
- strict credential separation between launcher, editor and modules.

See [`AUTHENTICATION.md`](AUTHENTICATION.md).

## Phase 9 — Online ecosystem

**Status: Planned**

- marketplace and user library;
- team and optional cloud services;
- Asset Store;
- Guided CMS service integration;
- broader contribution and publishing workflows.

## After the first stable release

Only after the ordered baseline is complete do we review the Idea Pool for animation workflows, shader authoring, profiling, additional renderer backends and other new directions.
