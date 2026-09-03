# Desktop Accounts and Authentication

Parlyn is an installable desktop engine, not a browser application. The editor and local projects must remain usable offline. A Parlyn account authenticates optional online services; it must never become a gate for opening the engine or a locally owned project.

## Canonical service origin

`https://parlyn.org` is and remains Parlyn's canonical public home. Public website, account, launcher, marketplace and service URLs must be derived from this origin rather than scattered hard-coded hosts.

Planned URL families:

- `https://parlyn.org/` — public Parlyn website
- `https://parlyn.org/account/` — user-facing account area
- `https://parlyn.org/store/` — Asset Store
- `https://parlyn.org/api/v1/` — versioned service API base
- `https://parlyn.org/oauth/` — authorization endpoints
- `https://parlyn.org/downloads/` — launcher and engine distribution metadata

These paths reserve an architectural convention; their presence in documentation does not claim that the services are already deployed. Runtime code should read service endpoints from one validated configuration source, with production defaulting to `https://parlyn.org`.

## Component boundary

```text
Parlyn Desktop Launcher
├── Account sign-in and sign-out
├── Engine version installation and updates
├── Marketplace and user library
└── Optional team/cloud services

Parlyn Editor
├── Local projects, scenes and assets
├── Offline editing and runtime tools
└── Narrow clients for optional online services
```

The launcher and editor are separate trust domains. The editor must not receive a long-lived account credential merely because the launcher is signed in.

## Planned sign-in flow

1. The launcher starts an OAuth 2.0 / OpenID Connect authorization-code flow with PKCE.
2. Authentication happens in the system browser on the canonical `https://parlyn.org` origin. Parlyn never receives the user's password.
3. The identity service redirects to a registered loopback callback or verified `parlyn://` application link.
4. The launcher validates state, PKCE and the returned authorization response.
5. Access tokens are short-lived and scoped to the requested Parlyn service.
6. Refresh credentials are encrypted with the operating-system credential facility, such as Windows DPAPI through Electron `safeStorage`.
7. The editor receives only a short-lived, narrowly scoped token when an online feature actually needs one.
8. Sign-out revokes the server session where supported and removes local credentials.

## Credential rules

- Never store passwords.
- Never write tokens into project files, scene files, `.parlyn/`, logs, command-line arguments or source control.
- Never use `localStorage` or plain JSON as a credential store.
- Keep development secrets in ignored environment files or the CI secret store.
- Redact authorization headers and personal data from diagnostics.
- Scope tokens by service and operation; do not share one broad token across launcher, editor and modules.
- Treat third-party modules as untrusted. Modules require declared permissions and must not inherit the user's account session.
- Local project ownership remains independent of account status, subscriptions and server availability.

## Offline behavior

Without a connection or account, users can launch an installed editor, create and open local projects, edit scenes, import assets, run local projects and export through locally installed toolchains. Online-only surfaces must fail separately and explain their status without disabling local work.

## Current implementation status

Parlyn v0.5.0 has no account system, network client, token store or authentication UI. Its Electron renderer communicates only with the local main process through the constrained preload bridge. This document defines the boundary that future launcher and service work must preserve.
