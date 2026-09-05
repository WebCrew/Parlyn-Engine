# Code signing policy

Free code signing provided by [SignPath.io](https://signpath.io/), certificate
by [SignPath Foundation](https://signpath.org/).

## Roles

- Committers and reviewers: the
  [WebCrew repository maintainers](https://github.com/WebCrew/Parlyn-Engine/graphs/contributors)
- Approvers: the [WebCrew organization owners](https://github.com/orgs/WebCrew/people)

All people participating in these roles must use multi-factor authentication
for GitHub and SignPath access. Contributions from people without commit access
must be reviewed by a maintainer before they are merged. Every release signing
request requires manual approval by an approver.

## Privacy

This program will not transfer any information to other networked systems unless
specifically requested by the user or the person installing or operating it.

Future account, update, marketplace, team or cloud features will be optional.
Their network behavior and applicable privacy policy must be documented before
they are included in a signed release. Local editing and locally owned projects
will remain usable without a Parlyn account.

## Signed release procedure

1. Release changes, dependencies and build scripts are reviewed in GitHub.
2. Required CI and security checks complete successfully.
3. GitHub Actions builds the Windows package on a GitHub-hosted runner.
4. The unsigned package is uploaded as a GitHub workflow artifact.
5. The workflow submits that exact artifact to SignPath using the project's
   restricted release signing policy.
6. An approver manually reviews and approves the signing request.
7. The workflow downloads the signed result, verifies each Authenticode
   signature and expected publisher, and records SHA-256 hashes.
8. Only that verified signed artifact may be described as an official Windows
   release.

Unsigned local or pull-request builds are packaging preflights only. Signing
credentials and private key material must never be committed to the repository,
included in artifacts or printed in logs.
