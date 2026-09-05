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

Parlyn uses electron-builder's standard Windows signing environment variables:

```text
CSC_LINK
CSC_KEY_PASSWORD
```

`CSC_LINK` must refer to a valid, publicly trusted code-signing identity made
available by the maintainer or the controlled CI environment. The password and
certificate material must never be committed, written into project files or
printed in build logs.

The manual GitHub Actions workflow maps protected repository secrets to those
variables:

```text
WINDOWS_CSC_LINK
WINDOWS_CSC_KEY_PASSWORD
WINDOWS_EXPECTED_PUBLISHER
```

The default workflow refuses to build when trusted signing is required but no
signing identity or expected publisher is configured. It may be run with
`require_signing` disabled only to inspect the packaging pipeline; that artifact
is not suitable for the Smart App Control acceptance test.

Cloud-HSM signing services require a dedicated electron-builder signing hook
instead of an exportable certificate. That integration will be added only after
the maintainer selects and verifies a service; provider credentials do not
belong in the general installer configuration.

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
