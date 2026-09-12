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

**Status: Complete**

Already present:

- independent Node and Scene architecture;
- renderer abstraction with THREE.js backend;
- hybrid 2.5D and 3D viewport;
- project, scene and versioned world formats;
- validated project, scene and world persistence with atomic document writes;
- explicit format compatibility, scene-v1 migration and automated round-trip checks;
- hierarchy selection, Inspector and viewport ray casting;
- Move, Rotate and Scale gizmos;
- cycle-safe Node reparenting and bounded scene loading;
- validated, isolated and size-bounded Undo/Redo history;
- constrained Electron preload bridge;
- trusted editor-only IPC and navigation boundaries;
- visible, actionable errors for project, scene, world and asset operations;
- automated structural, Smart Systems and CodeQL checks.

Completion evidence:

- the repeatable `v0.5.0-beta.4` maintainer test passed and is recorded in completed Issue #23.

## Phase 2 — Editor foundation

**Status: In Progress**

- duplication and reparenting — initial editor commands complete;
- durable, validated local Scene History — initial foundation complete;
- multi-selection where appropriate — initial hierarchy and viewport selection complete;
- multi-scene project browser — validated listing, switching, creation, rename and move complete;
- rename and move project assets — initial safe editor workflow complete;
- unsaved-change protection — complete across editor transitions and application close;
- editor preferences and workspace layout — initial versioned local foundation
  complete with panel visibility, bounded resizing, restoration and reset;
- consistent editor command layout — initial Command Bar foundation complete
  with Parlyn SVG icons and separate transform, placement and view controls;
- stronger error reporting — initial contextual dialog, recovery guidance and
  copyable technical details complete;
- transform snapping and local/world gizmo modes — complete with persistent,
  configurable snapping and explicit Local/World orientation;
- optional Surface/Ground Snap and Grid Snap, including a keyboard command to
  place the current selection on the ground — initial Ground command and End
  shortcut complete; automatic surface placement remains;
- Frame Selected — initial single- and multi-selection camera framing complete;
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

**Status: Architecture; installer foundation active as a blocker exception**

Issue #12 prevents the project owner from testing the active foundation while
Windows Smart App Control remains enabled. The development policy therefore
permits a narrowly scoped distribution exception: build, package, sign and
verify the current editor without activating launcher, account or ecosystem
work.

- reproducible packaged Windows editor and NSIS installer foundation;
- trusted Authenticode signing integration and maintainer acceptance test;
- installable launcher and version manager;
- offline access to installed versions and local projects;
- optional account sign-in using OAuth 2.0/OpenID Connect with PKCE;
- scoped tokens protected by the operating system;
- canonical `https://parlyn.org` service origin;
- strict credential separation between launcher, editor and modules.

See [`AUTHENTICATION.md`](AUTHENTICATION.md).
See [`WINDOWS-DISTRIBUTION.md`](WINDOWS-DISTRIBUTION.md) for the limited active
exception and its completion criteria.

## Phase 9 — Online ecosystem

**Status: Planned**

- marketplace and user library;
- team and optional cloud services;
- Asset Store;
- Guided CMS service integration;
- broader contribution and publishing workflows.

## After the first stable release

Only after the ordered baseline is complete do we review the Idea Pool for animation workflows, shader authoring, profiling, additional renderer backends and other new directions.
