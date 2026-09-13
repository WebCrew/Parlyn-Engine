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

### Guided-Based Parlyn Web Platform

- **Summary:** Build Parlyn's future private web platform from a deliberately
  separated copy or reusable core of Guided CMS without changing the standalone
  Guided product sold publicly. Guided's flat-file content and administration
  foundation would power the Parlyn website, while Parlyn-only SQL modules would
  provide accounts, secure sessions, launcher authorization, user libraries and
  the later Asset Store. CodoForum remains the support forum and would be linked
  to the central Parlyn identity through SSO rather than becoming the Engine's
  account database.
- **Why it may matter:** Reusing a codebase owned and already understood by the
  project can avoid rebuilding page, navigation, media and administration
  foundations. A single Parlyn registration could serve the website, Engine,
  future Asset Store and support forum without exposing forum tables or
  passwords to desktop software.
- **Possible implementation sequence:** (1) isolate the reusable Guided core;
  (2) establish a Parlyn-specific configuration and visual shell; (3) add a
  relational account store with email verification, password recovery, rate
  limits, audit events and optional MFA; (4) expose a versioned Parlyn account
  API using a browser-based OAuth 2.0/OpenID Connect flow with PKCE for desktop
  clients; (5) connect CodoForum as an SSO consumer with automatic user
  provisioning; (6) add downloads and user libraries; and only then (7) design
  Asset Store, publisher, entitlement and payment workflows.
- **System boundaries:** Public Guided CMS releases remain independent and do
  not receive Parlyn account or commerce code. Website content may remain flat
  files, while identities, sessions, roles, purchases, entitlements and audit
  records use SQL. The Engine and launcher communicate only with a documented
  HTTPS API and never read Guided or CodoForum database tables directly.
- **Dependencies:** Completion of the ordered Engine baseline; a security and
  privacy design review; selection of a maintained authentication/OIDC
  foundation and supported SQL database; mail delivery; backup and migration
  procedures; SSO validation against the installed CodoForum version; and
  separate legal/payment review before commerce becomes active.
- **Source/date:** Architecture discussion with Andreas Holzer, 2026-09-09.
- **Status:** `Unreviewed` — preferred direction for later evaluation, but no
  web-account, SSO or Asset Store implementation is authorized during the
  current Editor Foundation phase.

### DLSS 5 / Upscaling Plugin

- **Summary:** Monitor the development of NVIDIA DLSS 5 and evaluate at a
  later planning review whether an optional Parlyn upscaling plugin would be
  technically realistic and useful.
- **Why it may matter:** Optional modern upscaling could improve rendering
  performance and image quality for projects running on supported hardware,
  without forcing the engine core or every Parlyn project to depend on a
  proprietary vendor technology.
- **Dependencies:** A stable rendering and plugin interface; review of NVIDIA's
  then-current SDK, licence, hardware and distribution requirements; technical
  validation against Parlyn's 2.5D-first and 3D rendering paths; and clean,
  vendor-neutral alternatives for unsupported or non-NVIDIA hardware.
- **Source/date:** Product idea from Andreas Holzer, 2026-09-12.
- **Status:** `Unreviewed` — observation and later feasibility review only.
  No roadmap commitment, NVIDIA dependency in the engine core or public
  integration claim is authorized.

The named Parlyn Smart Systems are not Idea Pool entries: their direction and initial foundation were already accepted before this policy and are documented in `SMART-SYSTEMS.md`. Their further implementation remains paused until their ordered roadmap phase becomes active.

## Review gate

The pool is reviewed only when:

- the first stable release has been completed; or
- the current roadmap is deliberately revised at a named planning milestone.

During review, an idea may be rejected, retained, merged with another idea, or promoted into a future roadmap phase. Until promotion, it stays outside active development.
