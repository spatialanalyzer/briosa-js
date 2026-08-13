# Briosa JavaScript/TypeScript Client

`@spatialanalyzer/briosa` is the asynchronous Node.js client for the open-source
[Briosa](https://github.com/spatialanalyzer/briosa) SpatialAnalyzer bridge. It
provides idiomatic lifecycle and MP APIs while keeping generated protobuf and
gRPC types private.

The package does not include SpatialAnalyzer, the SA SDK, or a license. It
targets SpatialAnalyzer `2026.1.0529.7` exactly and Node.js 20.19 or later. The
complete protocol identity is pinned in [`protocol.lock.json`](protocol.lock.json).

## Usage

```ts
import {
  createBriosaClient,
  getWorkingDirectory,
} from '@spatialanalyzer/briosa';

await using briosa = createBriosaClient();
await briosa.start();

const workingDirectory = await getWorkingDirectory(briosa);
```

Construction is dormant. By default, `start()`:

1. Locates and launches the matching local Briosa server on an owned loopback
   endpoint.
2. Starts a disconnected SA SDK generation.
3. Launches a fresh SpatialAnalyzer application.
4. Connects the SDK and verifies exact identity and MP readiness.

`BriosaStartOptions` can select a control-plane-only startup or connect to an
eligible application that is already running. The application and SDK also
have distinct state, launch, connect, stop, and recovery methods. `stop()` and
`Symbol.asyncDispose` stop the owned server and SDK but never close
SpatialAnalyzer.

The client retains lifecycle generations and supplies RPC guards automatically.
Typed lifecycle failures, compatibility failures, caller cancellation,
ambiguous MP completion, and replay guidance remain distinct. The client never
automatically replays an MP operation.

See the [Briosa documentation](https://spatialanalyzer.github.io/briosa-docs/api/javascript/)
for the complete Next API contract.

## Server Distribution Lookup

The client resolves the matching server distribution in this order:

1. `BRIOSA_SERVER_PATH`
2. A package-local `briosa-server/Briosa.Server.exe`
3. `%LOCALAPPDATA%/Briosa/servers/<briosa-version>/sa-<sa-target>/Briosa.Server.exe`

The locator is private so the installer/package layout can evolve without
adding executable paths to the public startup options.

## Build and Test

```powershell
npm ci
npm run build
npm test
npm run lint
npm run format:check
npm run pack:check
```

Ordinary builds and tests use fake server/transport boundaries and require
neither SpatialAnalyzer nor a license.

## Protocol Regeneration

```powershell
node ./eng/import-protocol-artifact.mjs `
  --artifact C:\path\to\briosa-protocol-0.2.0-lifecycle-sa-2026.1.0529.7.zip `
  --update `
  --source-channel source_commit_bootstrap

node ./eng/import-protocol-artifact.mjs `
  --artifact C:\path\to\briosa-protocol-0.2.0-lifecycle-sa-2026.1.0529.7.zip
```

Never edit `src/generated` or `protocol.lock.json` by hand.
