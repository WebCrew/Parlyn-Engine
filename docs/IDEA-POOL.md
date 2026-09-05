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
