# Windows release integrity and code-signing policy

## Current status

Parlyn's application to the SignPath Foundation Open Source Code Signing program
was not approved in September 2026. The Foundation explained that the young
project does not yet have the public visibility and independent trust signals
required for a Foundation certificate. This decision is not a security finding
or an assessment that Parlyn is harmful.

Parlyn currently has no SignPath Foundation certificate and no other publicly
trusted Authenticode signing identity. Current Windows preview releases are
therefore explicitly **unsigned**. They must never be described as
SignPath-signed, Foundation-certified, digitally signed, or as trusted by
Windows.

## Current release safeguards

Unsigned does not mean unreviewed. Current preview releases are published with:

- a reproducible GitHub Actions Windows packaging workflow;
- required project and distribution checks;
- public release artifacts published from the official repository;
- published SHA-256 checksums for installer and portable artifacts; and
- documented maintainer installation and functional acceptance tests.

A checksum confirms that a downloaded artifact matches the release asset; it
does not replace a public publisher identity. Windows or browser reputation
warnings are therefore possible for unsigned releases. Users should download
only from the official Parlyn GitHub release, verify the published checksum, and
respect any Windows security decision.

## Future trusted signing

The repository retains a controlled signing workflow so that a publicly trusted
signing identity can be integrated later without redesigning the release
process. A paid SignPath subscription or another established certificate
provider may be evaluated only when the project has a justified operational
need and sustainable funding. No certificate, supplier, date, or approval is
promised.

Until then, Windows distribution remains an unsigned preview channel with
transparent release notes, checksums and test records.

## Roles

- Committers and reviewers: the
  [WebCrew repository maintainers](https://github.com/WebCrew/Parlyn-Engine/graphs/contributors)
- Future signing approvers: the
  [WebCrew organization owners](https://github.com/orgs/WebCrew/people)

All people participating in future signing roles must use multi-factor
authentication for GitHub and the selected signing service. Contributions from
people without commit access must be reviewed by a maintainer before they are
merged. Every future release-signing request requires manual approval by an
authorized approver.

## Privacy

Parlyn does not transfer information to other networked systems unless
specifically requested by the user or the person installing or operating it.

Future account, update, marketplace, team or cloud features will be optional.
Their network behavior and applicable privacy policy must be documented before
they are included in a release. Local editing and locally owned projects remain
usable without a Parlyn account.

## Future signed-release procedure

If a public signing identity is later approved and configured, the intended
controlled path is:

1. Release changes, dependencies and build scripts are reviewed in GitHub.
2. Required CI and security checks complete successfully.
3. GitHub Actions builds the Windows package on a GitHub-hosted runner.
4. The unsigned package is uploaded as a workflow artifact.
5. The workflow submits that exact artifact to the configured signing service
   under the project's restricted release-signing policy.
6. An authorized approver manually reviews and approves the signing request.
7. The workflow downloads the signed result, verifies each Authenticode
   signature and expected publisher, and records SHA-256 hashes.
8. Only that verified artifact may be described as an official signed Windows
   release.

Unsigned local, pull-request and preview builds remain separate from this
future signed-release path. Signing credentials and private-key material must
never be committed to the repository, included in artifacts or printed in logs.
