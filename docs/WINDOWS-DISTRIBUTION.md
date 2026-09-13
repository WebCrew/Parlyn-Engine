# Windows Distribution

## Status and scope

The Windows installer foundation was introduced to address the test blocker
recorded in [Issue #12](https://github.com/WebCrew/Parlyn-Engine/issues/12): the
project owner could not run the unsigned Electron development binary while
Windows Smart App Control remained enabled.

A packaged installer has since been installed and launched successfully on the
maintainer's Windows machine with Smart App Control left enabled, so Issue #12
has been closed as a testing blocker. Trusted public code signing remains a
separate distribution-hardening step.

This work does not activate the broader launcher, account or online ecosystem
scope from Phase 8. It provides a reproducible packaged editor, an NSIS
installer and a strict boundary for future trusted code signing.

## Installer behavior

The Windows build produces a 64-bit per-user NSIS installer named:

```text
Parlyn-Engine-Setup-<version>-x64.exe
```

The installer:

- presents a normal installation wizard;
- allows the installation directory to be selected;
- creates Start menu and desktop shortcuts;
- installs without requiring machine-wide privileges by default;
- preserves user projects and application data during uninstall;
- includes the bundled Parlyn test project as a read-only example resource.

## Local packaging

Install the locked dependencies and build the installer:

```powershell
npm ci
npm run build:windows
```

For a faster unpacked preflight build:

```powershell
npm run build:windows:dir
```

Artifacts are written to `release/`, which remains excluded from source control.

An unsigned local build is useful for packaging inspection and local testing,
but it must not be described as a trusted or publicly signed release.

## Current unsigned distribution and future signing

Parlyn's September 2026 SignPath Foundation application was not approved because
the project is still too young to meet the Foundation's public-trust and
visibility criteria. Parlyn therefore has no Foundation certificate or other
publicly trusted Authenticode identity at present.

Current installer and portable artifacts are unsigned preview releases. They
are still built by the reproducible GitHub Actions workflow, checked before
publication, accompanied by SHA-256 checksums, and covered by documented
maintainer acceptance tests. Users should obtain them only from the official
GitHub release, verify the matching checksum, and respect any Windows security
decision.

The repository retains a controlled signing workflow for a later trusted
identity. A paid SignPath subscription or another established certificate
provider may be considered only when operational need and sustainable funding
justify it. There is no configured certificate, provider commitment or
timeline.

If trusted signing is later enabled, the workflow expects these protected
configuration values:

```text
SIGNPATH_API_TOKEN                 protected GitHub Actions secret
SIGNPATH_ORGANIZATION_ID           GitHub Actions variable
SIGNPATH_PROJECT_SLUG              GitHub Actions variable
SIGNPATH_SIGNING_POLICY_SLUG       GitHub Actions variable
WINDOWS_EXPECTED_PUBLISHER         protected GitHub Actions secret
```

They are placeholders only and must not be populated or used to claim trusted
signing until a real identity is configured. Signing keys remain outside the
repository and GitHub runner. The workflow refuses a signing-required build
without the expected configuration and publisher.

See the Parlyn [Code-signing policy](CODE-SIGNING-POLICY.md).

## Verification

After building on Windows, run:

```powershell
.\scripts\verify-windows-artifacts.ps1 `
  -ArtifactDirectory release `
  -RequireSignature `
  -ExpectedPublisher "<expected certificate subject>"
```

For a future signed release, the verifier checks:

- exactly one expected NSIS installer exists;
- the unpacked `Parlyn Engine.exe` exists and carries Parlyn product metadata;
- every packaged `.exe` has a valid Authenticode signature when required;
- installer and main executable match the expected publisher;
- SHA-256 hashes are printed for the review record.

## Maintainer acceptance test

Smart App Control should remain enabled throughout the test.

1. Download the intended test or release artifact.
2. Verify its SHA-256 hash and, for signed releases, Authenticode status.
3. Install to the default per-user location.
4. Launch Parlyn from the final installer page, Start menu and desktop shortcut.
5. Create a project and reopen the bundled test project.
6. Save and reopen its scene and world data.
7. Uninstall Parlyn and confirm separately stored user projects remain intact.

The packaged installer has passed the initial install-and-launch smoke test on
the maintainer's Windows machine. Public trusted signing remains a future
distribution-hardening option, separate from the resolved development-binary
blocker.

Phase 1 functional acceptance completed with the unsigned `v0.5.0-beta.4`
prerelease and Issue #23. The current Phase 2 editor candidate is
`v0.5.0-beta.18`; its repeatable checklist is documented in
[`MAINTAINER-ACCEPTANCE-v0.5.0-beta.18.md`](MAINTAINER-ACCEPTANCE-v0.5.0-beta.18.md).

Unsigned preview releases also provide a portable ZIP for functional testing.
It creates no installation or uninstall registration and is the preferred test
artifact until trusted signing is available. The executable inside remains
unsigned and must not be used to bypass a Windows security decision.
