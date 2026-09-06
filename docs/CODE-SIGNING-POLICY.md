# Code signing policy

Parlyn has applied to the SignPath Foundation Open Source Code Signing program.
Approval and certificate availability are currently pending. The repository
contains a SignPath-compatible controlled signing workflow so that the project
is ready to integrate trusted signing if the application is approved.

Until approval is confirmed, no Parlyn build may be described as SignPath-signed,
SignPath Foundation certified or as using a SignPath Foundation certificate.

If approved, free code signing would be provided through
[SignPath.io](https://signpath.io/) with a certificate supplied by
[SignPath Foundation](https://signpath.org/).

## Roles

- Committers and reviewers: the
  [WebCrew repository maintainers](https://github.com/WebCrew/Parlyn-Engine/graphs/contributors)
- Approvers: the [WebCrew organization owners](https://github.com/orgs/WebCrew/people)

All people participating in these roles must use multi-factor authentication
for GitHub and SignPath access once SignPath access exists. Contributions from
people without commit access must be reviewed by a maintainer before they are
merged. Every future release signing request requires manual approval by an
approver.

## Privacy

This program will not transfer any information to other networked systems unless
specifically requested by the user or the person installing or operating it.

Future account, update, marketplace, team or cloud features will be optional.
Their network behavior and applicable privacy policy must be documented before
they are included in a signed release. Local editing and locally owned projects
will remain usable without a Parlyn account.

## Signed release procedure

The following procedure describes the intended trusted signing path after a
public signing identity has been approved and configured:

1. Release changes, dependencies and build scripts are reviewed in GitHub.
2. Required CI and security checks complete successfully.
3. GitHub Actions builds the Windows package on a GitHub-hosted runner.
4. The unsigned package is uploaded as a GitHub workflow artifact.
5. The workflow submits that exact artifact to the approved signing service
   using the project's restricted release signing policy.
6. An approver manually reviews and approves the signing request.
7. The workflow downloads the signed result, verifies each Authenticode
   signature and expected publisher, and records SHA-256 hashes.
8. Only that verified signed artifact may be described as an official signed
   Windows release.

Unsigned local or pull-request builds are packaging preflights only. Signing
credentials and private key material must never be committed to the repository,
included in artifacts or printed in logs.
