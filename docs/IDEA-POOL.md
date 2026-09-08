# Parlyn Idea Pool

This file protects good ideas without allowing them to disrupt the active development sequence.

Items listed here are not promises, roadmap commitments or approved implementation work. They remain dormant until the first stable Parlyn release or an explicit planning review.

## Entry format

Each new idea should record:

- **Name**
- **Summary**
- **Why it may matter**
- **Dependencies**
- **Source/date**
- **Status** — normally `Unreviewed`

Do not add editor buttons, data formats, dependencies or public feature claims for an Idea Pool entry.

## Parked ideas

### MetaHuman Character Workflow

- **Summary:** Investigate an optional Parlyn character workflow that accepts
  MetaHuman-derived characters only where Epic's then-current licence and
  distribution terms expressly permit it. The workflow could begin as a
  separate plugin or importer rather than becoming part of the engine core.
- **Why it may matter:** High-quality, ready-made digital humans could help
  small teams prototype and produce character-driven scenes much faster,
  while preserving Parlyn's focus on accessible authoring workflows.
- **Dependencies:** Written legal and licence review of the exact MetaHuman,
  Unreal Engine and distribution terms in force at implementation time;
  technical validation of export formats, rigs, materials, performance and
  attribution requirements; and an opt-in integration that does not ship
  Epic-owned content with Parlyn.
- **Source/date:** Product idea from Andreas Holzer, 2026-09-08.
- **Status:** `Unreviewed` — exploratory only; no compatibility, licensing or
  public support claim is authorized.

### Unreal Marketplace Asset Intake

- **Summary:** Explore an optional Parlyn plugin that helps creators bring
  assets they have lawfully acquired for Unreal Engine into a Parlyn project,
  where the applicable licence permits the intended export and use. The tool
  would focus on asset conversion and project preparation, not on redistributing
  Marketplace content.
- **Why it may matter:** A careful import workflow could lower migration and
  prototyping friction for developers who already own suitable assets, and
  would make Parlyn easier to evaluate alongside established engines.
- **Dependencies:** Written legal review of Epic Games Marketplace, Unreal
  Engine and individual-asset licence terms; a per-asset permission model;
  technical support for legal source formats and conversion of meshes,
  textures, materials, animations and metadata; clear handling of assets that
  cannot be exported or redistributed; and isolation from the MIT engine core.
- **Source/date:** Product idea from Andreas Holzer, 2026-09-08.
- **Status:** `Unreviewed` — no import promise or public compatibility claim
  is authorized until licensing and technical feasibility are confirmed.

### Parlyn Verified Builds

- **Summary:** Explore a future web-platform service that connects a software
  release to its source repository and records verifiable build provenance.
  Possible capabilities include controlled CI builds, dependency and malware
  checks, SBOM generation, published checksums, release attestations and an
  independently verifiable Parlyn quality mark. Public code signing would be
  performed through an established partner such as SignPath, Microsoft or a
  recognized certificate authority; Parlyn would not operate its own
  certificate authority.
- **Why it may matter:** Small open-source and independent development teams
  often face high code-signing costs and fragmented release-security tooling.
  A carefully governed service could make trustworthy releases more accessible
  while creating a possible future revenue stream for the Parlyn web
  ecosystem.
- **Dependencies:** A mature and reputable Parlyn project; proven internal
  release operations; separately governed web infrastructure; security and
  legal review; privacy terms; abuse response and human approval processes;
  liability and insurance assessment; and a qualified external signing
  partner. This must remain separate from the offline-capable MIT engine core.
- **Source/date:** Product discussion following Parlyn's first SignPath
  Foundation application, 2026-09-05.
- **Status:** `Unreviewed` — reconsider and explicitly accept, retain or reject
  at a future planning review. No implementation is authorized.

The named Parlyn Smart Systems are not Idea Pool entries: their direction and initial foundation were already accepted before this policy and are documented in `SMART-SYSTEMS.md`. Their further implementation remains paused until their ordered roadmap phase becomes active.

## Review gate

The pool is reviewed only when:

- the first stable release has been completed; or
- the current roadmap is deliberately revised at a named planning milestone.

During review, an idea may be rejected, retained, merged with another idea, or promoted into a future roadmap phase. Until promotion, it stays outside active development.
