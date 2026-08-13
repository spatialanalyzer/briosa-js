# Engineering Workflows

`import-protocol-artifact.mjs` verifies one schema-2 Briosa protocol ZIP and its
adjacent checksum. `--update` regenerates the private grpc-js TypeScript
transport and records the exact artifact, source, schema, descriptor, package,
generation-contract, and SA-target identities. Verification mode regenerates
in a temporary directory and fails on identity, toolchain, file-list, or
generated-byte drift.

```powershell
node ./eng/import-protocol-artifact.mjs `
  --artifact C:\path\to\briosa-protocol-0.2.0-lifecycle-sa-2026.1.0529.7.zip `
  --update `
  --source-channel source_commit_bootstrap
```

Generated transport modules are private implementation details. Handwritten
public interfaces, lifecycle orchestration, mappings, and errors live outside
`src/generated` and never expose generated or grpc-js values.

`Test-Conformance.ps1` verifies the immutable package named by
`conformance.lock.json`, then runs the shared Briosa scenario runner against the
public-API-only `tools/conformance.ts` fixture. The package supplies the real
Briosa server plus a portable fake SDK/application host, so lifecycle,
compatibility, capability, failure, interruption, worker-loss, recovery, and
cleanup behavior can run in ordinary Windows CI without SpatialAnalyzer or a
license.
