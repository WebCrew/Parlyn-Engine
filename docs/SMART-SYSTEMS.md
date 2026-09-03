# Parlyn Smart Systems

Parlyn Smart Systems are a committed product direction implemented in stages. They are not claimed as finished features in the current preview.

## System family

### Parlyn Ways
A travel and world-transition system for large 2.5D-first worlds. A configurable area around the player remains interactive 3D or hybrid space. Distant travel space may use layered planes, billboards and controlled parallax, while authored scene hubs provide full detail.

### Scene Capsules
Reusable bounded scene packages containing layout, entry and exit anchors, local assets, rules and deterministic generation inputs. Capsules are the authored building blocks used by Ways and other world systems.

### World Memory
Persistent world-state data independent from rendered scene instances: discovered places, changed objects, completed events, encounter state and stable seeds. Rebuilding a scene must not erase meaningful player-caused state.

### Adaptive Simulation
A tiered simulation policy. Nearby relevant objects receive full updates; distant or hidden systems use reduced-frequency, event-driven or summarized simulation. The policy changes cost, not established world facts.

### Encounter Layers
Deterministic encounter definitions placed over a route or Scene Capsule without baking every encounter into base geometry. The same seed and world state must reproduce the same encounter.

### Parlyn Horizon
The visual transition layer between nearby detailed space and distant 2.5D scenery. It owns representation switching, parallax continuity and transitions without redefining world state.

### Parlyn Voice
A provider-independent dialogue, voice-generation and localization pipeline. Generated output remains reviewable, replaceable and attributable. Provider credentials follow `AUTHENTICATION.md`.

## Architectural boundaries

- Parlyn-owned models remain independent from THREE.js and Electron.
- Smart Systems describe world data and policies; renderer backends decide how representations are drawn.
- Authored content remains inspectable and versioned.
- Random generation uses explicit stored seeds where reproducibility matters.
- Online AI or voice providers remain optional.
- Official systems are maintained starting points, not mandatory workflows.
- Third-party modules require a permission model before executable packages are loaded.

## Staged implementation

1. **Data foundation** — versioned schemas for capsules, routes, landmarks, encounters, seeds and world-memory keys.
2. **Forest-path prototype** — connect two authored Scene Capsules through one deterministic Parlyn Ways route.
3. **Stable landmark** — prove that a landmark keeps identity, placement and state across reconstruction.
4. **Reproducible encounter** — demonstrate identical output from the same seed and world state.
5. **Adaptive/Horizon refinement** — add simulation tiers and visually stable near/far transitions.
6. **Voice/localization foundation** — add provider abstraction, reviewable assets and secure credential integration.

## First proof milestone

- two built scenes represented as Scene Capsules;
- one deterministic forest path connecting them;
- one landmark that remains stable;
- one encounter reproducible from stored seed and world state.

## Planned editor surfaces

- **Project panel:** Smart Systems data and world-memory overview.
- **Scene/Hierarchy:** capsule roots, anchors, landmarks and encounter-layer nodes.
- **Inspector:** IDs, seeds, route links, activation rules and simulation tier.
- **Viewport:** capsule bounds, route corridor, Horizon zones and encounter previews.
- **Modules/Settings:** optional providers and permissions, including Parlyn Voice.

The Smart Systems overview reserves a visible place for every named system. Status badges distinguish **Foundation** systems backed by versioned data from **Planned** systems that are not operational yet. Placeholder surfaces remain informational and disabled; they must never imply that generation, simulation or voice services are complete.
