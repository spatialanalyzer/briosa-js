# Engineering scripts

## Protocol artifact

`import-protocol-artifact.mjs` accepts one Briosa protocol ZIP. With `--update`, it verifies the adjacent ZIP checksum and every bundled checksum, regenerates the committed grpc-js TypeScript transport, and writes `protocol.lock.json`. Without `--update`, it regenerates into a temporary directory and fails on identity, generator-option, file-list, or generated-code drift.

The pinned generator maps every protobuf 64-bit integer to JavaScript `bigint` and every optional field to `undefined` when absent. Run locked npm installation before importing.

```powershell
npm ci
node ./eng/import-protocol-artifact.mjs `
  --artifact C:\path\to\briosa-protocol-0.2.0-dev.2-sa-2026.1.0529.7-catalog-5.zip `
  --update `
  --source-channel source_commit_bootstrap
node ./eng/import-protocol-artifact.mjs `
  --artifact C:\path\to\briosa-protocol-0.2.0-dev.2-sa-2026.1.0529.7-catalog-5.zip
```

`--update` is an intentional dependency update. Never edit `src/generated` or `protocol.lock.json` by hand. `source_commit_bootstrap` is temporary until Briosa publishes the first v0.2 release asset; normal release imports use the default `github_release` channel.

## Shared conformance

`Test-Conformance.ps1` requires the pinned protocol ZIP and the exact Briosa source revision recorded in the lock:

```powershell
./eng/Test-Conformance.ps1 `
  -ProtocolArtifactPath C:\path\to\briosa-protocol-0.2.0-dev.2-sa-2026.1.0529.7-catalog-5.zip `
  -BriosaRepository C:\path\to\briosa
```

It verifies typed-error fixtures, creates a deterministic Briosa Windows package, substitutes Briosa's fake worker, and runs every shared live scenario through this client. It requires 64-bit Windows and .NET 10, but never installs, starts, or connects to SpatialAnalyzer and requires no SA license.
