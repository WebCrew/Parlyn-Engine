# Windows Distribution

## Status and scope

The Windows installer foundation is a limited exception to Parlyn's ordered
roadmap. It addresses the confirmed test blocker in
[Issue #12](https://github.com/WebCrew/Parlyn-Engine/issues/12): the project
owner cannot run the unsigned Electron development binary while Windows Smart
App Control remains enabled.

This work does not activate the broader launcher, account or online ecosystem
scope from Phase 8. It provides a reproducible packaged editor, an NSIS
installer and a strict boundary for trusted code signing.

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

An unsigned local build is useful only for packaging inspection. It does not
resolve Smart App Control and must not be described as a trusted release.

## Trusted signing boundary

Parlyn's release workflow uses SignPath's GitHub integration. GitHub Actions
builds an explicitly unsigned package on a GitHub-hosted Windows runner and
uploads it as a workflow artifact. SignPath verifies that origin, signs the
configured Parlyn executables and returns the signed artifact to the same
workflow for verification.

```text
SIGNPATH_API_TOKEN                 protected GitHub Actions secret
SIGNPATH_ORGANIZATION_ID           GitHub Actions variable
SIGNPATH_PROJECT_SLUG              GitHub Actions variable
SIGNPATH_SIGNING_POLICY_SLUG       GitHub Actions variable
WINDOWS_EXPECTED_PUBLISHER         protected GitHub Actions secret
```

The token must belong to a SignPath submitter permitted by Parlyn's release
signing policy. Signing keys remain in SignPath's HSM and are never exported to
the repository or GitHub runner. Every release signing request requires manual
approval in accordance with the Parlyn
[Code signing policy](CODE-SIGNING-POLICY.md).

Before enabling the signed workflow, the maintainer must:

- receive approval for Parlyn from SignPath Foundation;
- install the SignPath GitHub App for this repository;
- create and link the SignPath project, artifact configuration and release
  signing policy;
- configure the secret and variables listed above;
- set `WINDOWS_EXPECTED_PUBLISHER` to the exact certificate subject returned by
  the approved SignPath configuration.

The default workflow refuses to build when trusted signing is required but no
SignPath configuration or expected publisher is configured. It may be run with
`require_signing` disabled only to inspect the packaging pipeline; that artifact
is not suitable for the Smart App Control acceptance test.

## Verification

After building on Windows, run:

```powershell
.\scripts\verify-windows-artifacts.ps1 `
  -ArtifactDirectory release `
  -RequireSignature `
  -ExpectedPublisher "<expected certificate subject>"
```

The verifier checks:

- exactly one expected NSIS installer exists;
- the unpacked `Parlyn Engine.exe` exists and carries Parlyn product metadata;
- every packaged `.exe` has a valid Authenticode signature when required;
- installer and main executable match the expected publisher;
- SHA-256 hashes are printed for the review record.

## Maintainer acceptance test

Smart App Control must remain enabled throughout the test.

1. Download the artifact produced by the trusted workflow.
2. Verify its SHA-256 hash and Authenticode status.
3. Confirm Windows displays the expected publisher.
4. Install to the default per-user location.
5. Launch Parlyn from the final installer page, Start menu and desktop shortcut.
6. Create a project and reopen the bundled test project.
7. Save and reopen its scene and world data.
8. Uninstall Parlyn and confirm separately stored user projects remain intact.

Issue #12 remains open until this test succeeds on the maintainer's Windows
machine with Smart App Control enabled.
