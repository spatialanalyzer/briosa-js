# Engineering Workflows

`import-protocol-artifact.mjs` verifies one schema-2 Briosa protocol ZIP and its
adjacent checksum. `--update` regenerates the private grpc-js TypeScript
transport and records the exact artifact, source, schema, descriptor, package,
generation-contract, and SA-target identities. Verification mode regenerates
in a temporary directory and fails on identity, toolchain, file-list, or
generated-byte drift.

```powershell
node ./eng/import-protocol-artifact.mjs `
  --artifact C:\path\to\briosa-protocol-0.6.0-sa-2024.1.0508.5.zip `
  --update `
  --source-channel github_release
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

Run all commands from this exact-target directory. `Test-Conformance.ps1` runs
headlessly with `Briosa__Desktop__Mode=Disabled` for its child processes and restores
the caller's prior value. The package consumer check installs the actual local
package and validates the stable public namespace/import without launching SA.
