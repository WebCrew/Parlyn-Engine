# Development Policy

Parlyn is developed foundation first. The active scope is completed before optional new systems are promoted into implementation.

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
