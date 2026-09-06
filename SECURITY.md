# Security Policy

Parlyn Engine is still an early development project and does not yet publish long-term security support windows.

Please do not publish security-sensitive vulnerabilities as public issues. Contact the project maintainers privately through an available project contact channel until a dedicated security-reporting address is established.

Normal reproducible bugs should use the GitHub issue tracker.

## Current desktop boundaries

- Electron context isolation remains enabled and Node integration remains disabled in the renderer.
- Privileged IPC requests are accepted only from Parlyn's bundled local editor document.
- Unexpected navigation and renderer-created windows are denied.
- Project-relative paths are checked lexically and after symbolic-link resolution.
- Renderer payloads are required to be object-shaped and are subject to a bounded IPC size limit.

These controls reduce the early preview's attack surface; they are not a claim that the project has completed a full independent security audit.
