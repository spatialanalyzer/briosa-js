# Releasing npm clients

Each release publishes two independent exact-SA products. The current package
version is `0.1.1`, independent of the pinned Briosa Server `0.6.1` version.
This procedure does not establish licensed runtime or enterprise Artifactory
validation, which remain outstanding before v1.0 promotion.

## Registry setup

For each package, configure a trusted publisher for GitHub organization
`spatialanalyzer`, repository `briosa-js`, workflow `release.yml`, environment
`npm`, with direct `npm publish` allowed. The workflow uses Node 24.21.0 and its
bundled npm, which support OIDC and provenance.

For the first release only, npm requires the packages to exist before adding
trusted publishers. Download the archives from the successful tag build, log in
locally with `npm login`, and publish those exact archives with
`npm publish <archive.tgz> --access public --ignore-scripts`. Complete the npm
2FA prompt, then add each trusted publisher. Do not publish placeholder packages.
The initial local upload has no GitHub OIDC provenance; subsequent workflow
publishes use provenance. Do not rerun publication of that same immutable version.

Create the GitHub environment `npm` and restrict deployments to tags
matching `v*`. Trusted-publisher repository, workflow, and environment names must
match exactly. Only the publishing job receives `id-token: write`; builds have
read-only permissions and never receive publishing credentials.

## Release procedure

1. Update both targets' package versions together, review the PR, and merge with
   all CI checks passing. Keep target-specific package names and stable imports.
2. Create and push `v<version>` at the reviewed main commit. A tag push prepares
   artifacts only. The workflow rejects branches, mismatched package versions,
   wrong target identities, and commits outside main.
3. The release workflow reuses the complete CI matrix: protocol drift,
   conformance, tests, formatting, packaging, and installed-package smoke checks.
   Download the `packages-<SA target>` artifacts when needed for inspection.
4. Dispatch `release.yml` **on that tag** with `publish=true` to rebuild, validate,
   and publish the resulting artifacts. Publishing downloads only artifacts from
   its own successful workflow run. No source build runs in the publishing job.
5. Verify installation from the actual registry in a clean consumer environment
   for each target. Check package version, exact SA target, and the stable public
   namespace/import. These checks must not start SpatialAnalyzer.
6. Create a GitHub release for the tag, link both registry packages, and record
   the publishing runs and clean-consumer verification results.

## Partial failures

Registry versions are immutable. Publication is not atomic across the two
products. Inspect registry state after any failed or interrupted run before
retrying. Rerun only failed jobs when one target succeeded; do not overwrite,
delete, or silently skip an existing release. If a published artifact needs a
change, review and publish a new patch version.
