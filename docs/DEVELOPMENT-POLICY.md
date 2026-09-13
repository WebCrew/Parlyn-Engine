# Development Policy

Parlyn is developed foundation first. The active scope is completed before optional new systems are promoted into implementation.

## Product ambition and quality bar

Parlyn aims to become a serious, modern, high-quality open-source game engine
for independent developers and small teams, with a distinctive 2.5D-first
workflow and credible additional 3D support. A limited prototype is an
intermediate milestone, not the intended final product.

Godot, Unity and Unreal Engine are reference points for workflow quality,
capability and developer expectations, not promises of feature parity or an
instruction to copy every subsystem. Parlyn should earn adoption through
dependable tools, coherent workflows and useful distinctive capabilities.

Small roadmap steps constrain the current implementation scope, not the
long-term quality ambition. Evaluate completed workflows for usability,
reliability, data safety, rendering correctness, performance on stated target
hardware, documentation and practical usefulness. Validate progress with
automated checks, human Windows acceptance and, as runtime capabilities mature,
a small representative playable project. Do not substitute feature counts,
marketing claims or predicted future AI improvements for evidence.

For asset authoring, choose deliberately between native tools, optional plugins
and dependable bridges to external applications. An external workflow must be
clear and well tested, not used as an excuse for an incomplete engine workflow.
A full native painter or mesh sculptor is not currently approved roadmap work;
terrain shaping, mesh sculpting and PBR texture painting must be assessed as
distinct capabilities at a future planning review.

This ambition was explicitly reaffirmed by Andreas Holzer on 2026-09-13.
It does not bypass the scope, review or acceptance rules below.

## Required design review — established engines and Parlyn's advantage

Before implementing each bounded roadmap step, explicitly ask:
**How do Godot, Unity and Unreal Engine solve this workflow, and can Parlyn
make it better for its intended developers?**

Compare the relevant behavior, interaction, architecture and limitations using
current official documentation where available. Record a concise conclusion in
the step's design notes or pull request: the reference approach, Parlyn's chosen
approach, any intended improvement and the trade-offs. Do not claim superiority
without evidence; validate improvements through tests and human acceptance.

Godot's modular, extensible approach is the preferred realistic starting point
for Parlyn, not a mandatory architecture to copy. Consider optional plugins and
well-integrated external-tool bridges before adding large specialist subsystems
to the core. Native tools remain an option where the workflow clearly warrants
them and an explicit future planning review approves the scope.

“Better” may mean clearer controls, fewer steps, safer persistence, easier setup,
more accessible defaults or stronger 2.5D/3D consistency; it need not mean more
features. Use the comparison to improve the active step, not to import unrelated
features or interrupt the roadmap. The maturity and resources of the reference
engines are context, not promises of immediate feature parity.

This review rule was requested by Andreas Holzer on 2026-09-13.

## First stable release rule

The project's primary objective is a first genuinely stable release of the engine. This means a coherent, installable and testable Parlyn baseline rather than a collection of partially implemented ideas.

Until that release is reached:

1. Work follows the ordered phases in `ROADMAP.md`.
2. The current phase is stabilized before the next phase becomes active.
3. A new idea is recorded in `IDEA-POOL.md`, not added automatically to the active roadmap or editor.
4. Recording an idea does not authorize implementation.
5. Ideas in the pool are reviewed only at an explicit planning boundary.
6. Existing foundations may be extended only when the extension is required by the active phase.

This rule applies to all maintainers, including the project owner. Enthusiasm for a good idea is not by itself a reason to interrupt the current phase.

## Permitted exceptions

Unplanned work may interrupt the active phase only when it addresses:

- a security vulnerability;
- credible risk of project or user-data loss;
- a broken build or release pipeline;
- a defect that blocks the active milestone;
- a required compatibility change that cannot reasonably wait.

The reason for an exception must be stated in the pull request.

## Definition of complete

A phase or feature is complete only when:

- its intended behavior is implemented rather than represented by a misleading placeholder;
- its data can be created, loaded and saved safely where applicable;
- automated checks cover its critical invariants;
- a reproducible manual test path or sample exists;
- public documentation matches actual behavior;
- CI and security checks pass;
- no known blocker prevents ordinary use of the completed scope.

## Planning states

- **Complete** — meets the definition above.
- **Foundation** — real supporting code/data exists, but the full user-facing feature is not complete.
- **In Progress** — belongs to the one active development phase.
- **Planned** — accepted into the ordered roadmap but not active.
- **Idea Pool** — captured for later evaluation and outside current scope.

Only one main phase should normally be **In Progress**.
