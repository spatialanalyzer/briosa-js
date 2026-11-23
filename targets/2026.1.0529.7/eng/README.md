# Engineering Workflows

`import-protocol-artifact.mjs` verifies one schema-3 Briosa protocol ZIP and its
adjacent checksum. `--update` regenerates the private grpc-js TypeScript
transport and records the exact artifact, source, schema, descriptor, package,
generation-contract, and SA-target identities. Verification mode regenerates
in a temporary directory and fails on identity, toolchain, file-list, or
generated-byte drift.

```powershell
node ./eng/import-protocol-artifact.mjs `
  --artifact C:\path\to\briosa-protocol-0.10.1-dev.1-sa-2026.1.0529.7.zip `
  --update `
  --source-channel source_commit_bootstrap
```

Generated transport modules are private implementation details. Handwritten
public interfaces, lifecycle orchestration, mappings, and errors live outside
`src/generated` and never expose generated or grpc-js values.

`Test-Conformance.ps1` verifies the immutable package named by
`conformance.lock.json`, then runs the shared Briosa scenario runner against the
public-API-only `tools/conformance.ts` fixture. When the runner has
`-OptionalScenario` and its contract lists the optional `large-result`
scenario, the script requests it, except on the `-ExpectIncompatible` path,
and records the requested optional scenarios in the evidence. In that scenario
the fixture reports the UTF-8 length and lowercase SHA-256 of the working
directory the client returned, never the value. The fixture uses only public
API that Client 0.5.0 already has, so the server's retained-client gate can run
it against the published 0.5.0 package. The package supplies the real
Briosa server plus a portable fake SDK/application host, so lifecycle,
compatibility, capability, failure, interruption, worker-loss, recovery, and
cleanup behavior can run in ordinary Windows CI without SpatialAnalyzer or a
license.

Run all commands from this exact-target directory. `Test-Conformance.ps1` runs
headlessly with `Briosa__Desktop__Mode=Disabled` for its child processes and restores
the caller's prior value. The package consumer check installs the actual local
package and validates the stable public namespace/import without launching SA.

The importer also copies the server-owned installation selection fixtures.
Runtime compatibility is independent of the generation artifact build.
`Test-Conformance.ps1 -LockPath <lock> -EvidencePath <new-report.json>` runs
another exact, hash-verified server fixture and retains portable evidence.
The default lock retains Server 0.9.2, the newest contract-major-2 server, for
rejection coverage. Use -ExpectIncompatible with that lock; a contract-major
mismatch must fail before launch.

`Test-CurrentServerConformance.ps1` builds the exact generation source and writes
its own conformance lock; the legacy lock remains independently pinned to 0.9.2.
The current runner keeps a rejected scenario's server log digest, fixture
output, and server log files in the folder that
`BRIOSA_CONFORMANCE_DIAGNOSTICS_DIRECTORY` names; CI sets one per conformance
step and uploads them when a job fails. The frozen 0.9.2 runner ignores that
variable, and its only scenario rejects the installation before any server
starts.
`Test-PackageCompatibility.ps1` exercises the actual packed client against both
server generations. `Test-PublishedClientConformance.ps1` is also used by the
server's retained published-client gate: it verifies the package digest and
identity, creates an isolated consumer, and runs the public-API fixture without
referencing client runtime source. JSON evidence identifies local versus public
package origin and records fake-SDK validation separately from licensed SA work.
