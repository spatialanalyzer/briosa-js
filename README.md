# Briosa JavaScript/TypeScript client

`@spatialanalyzer/briosa` is the thin asynchronous Node.js client for the open-source [Briosa](https://github.com/spatialanalyzer/briosa) gRPC bridge.

The package does not contain SpatialAnalyzer, the SpatialAnalyzer SDK, Briosa server binaries, or a license. Install and run a compatible Briosa server separately. Useful operation calls also require a separately installed, running, licensed SpatialAnalyzer instance.

## Current compatibility

| Coordinate      | Pinned value                            |
| --------------- | --------------------------------------- |
| SpatialAnalyzer | `2026.1.0529.7` exactly                 |
| Core protocol   | `briosa.core.v1alpha1`                  |
| Target protocol | `briosa.sa.v2026_1_0529_7.v1alpha1`     |
| Catalog         | `briosa.sa.2026.1.0529.7`, revision `5` |
| Node.js         | `20.19.0` or later                      |

The complete generation identity is committed in [`protocol.lock.json`](protocol.lock.json). Client package versions, Briosa server versions, protocol packages, catalog revisions, and SpatialAnalyzer releases are independent coordinates. This package does not infer compatibility with another SpatialAnalyzer release.

Until Briosa publishes its first v0.2 release asset, the lock uses the reversible `source_commit_bootstrap` channel: CI rebuilds `0.2.0-dev.2` from Briosa merge commit `1a0714345981592b37e26a90ffc4db0de32fe388` and verifies ZIP SHA-256 `4ce33ac6ecc9db382e870aa2c005f90a25128ad863fcf007c855d00470ea3e39`.

## Usage

```ts
import { BriosaCallError, BriosaClient } from '@spatialanalyzer/briosa';

const client = new BriosaClient({
  address: '127.0.0.1:50051',
  defaultTimeoutMs: 30_000,
});

try {
  const snapshot = await client.getServerSnapshot();
  if (snapshot.readyForMp) {
    const result = await client.getWorkingDirectory();
    if (result.directory !== undefined) {
      // Use the present value. An absent field remains undefined.
    }
  }
} catch (error) {
  if (error instanceof BriosaCallError && error.completionUnknown) {
    // Recovery and replay are separate decisions. Reconcile when required.
  }
  throw error;
} finally {
  client.close();
}
```

`getServerSnapshot()` verifies the exact target protocol and catalog identity before returning discovery data. It exposes attachment, execution readiness, target isolation, and advertised capabilities without treating `ConnectEx` attachment as MP readiness.

Calls accept `{ timeoutMs, signal }` for deadlines and `AbortSignal` cancellation. Failed RPCs throw `BriosaCallError`, which decodes `briosa-operation-error-bin` and keeps canonical gRPC status, execution disposition, recovery guidance, replay guidance, and replay safety separate. The client never parses status text and performs no automatic replay, including after an uncertain completion.

Generated messages deliberately represent absent optional fields as `undefined` and all protobuf 64-bit integer fields as `bigint`; do not coerce them through JavaScript `number`. Generated messages and transport clients remain public for advanced callers.

## Build and test

```powershell
npm ci
npm run build
npm test
npm run lint
npm run format:check
npm run pack:check
```

Ordinary builds and tests require neither SpatialAnalyzer nor a Briosa server. The shared packaged-server conformance suite also requires no SpatialAnalyzer installation or license; see [`eng/README.md`](eng/README.md).

## Protocol regeneration

Import only a verified Briosa protocol ZIP:

```powershell
node ./eng/import-protocol-artifact.mjs `
  --artifact C:\path\to\briosa-protocol-....zip `
  --update
node ./eng/import-protocol-artifact.mjs `
  --artifact C:\path\to\briosa-protocol-....zip
```

The first command performs an intentional dependency update; the second is CI-style drift verification. Never edit `src/generated` or `protocol.lock.json` by hand.
