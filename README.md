# Briosa JavaScript/TypeScript Client

`@spatialanalyzer/briosa-2026.1.0529.7` is the asynchronous Node.js client for the open-source
[Briosa](https://github.com/spatialanalyzer/briosa) SpatialAnalyzer bridge. It
provides idiomatic lifecycle and MP APIs while keeping generated protobuf and
gRPC types private.

The package does not include SpatialAnalyzer, the SA SDK, or a license. It
targets SpatialAnalyzer `2026.1.0529.7` exactly and Node.js 20.19 or later. The
complete protocol identity is pinned in [`protocol.lock.json`](protocol.lock.json).

## Package Identity

The package is named `@spatialanalyzer/briosa-2026.1.0529.7`, while its
exported Briosa types and functions remain release-neutral. The package has not
been published to npm yet. After publication, the intended installation command
is:

```powershell
npm install @spatialanalyzer/briosa-2026.1.0529.7@0.1.0
```

Each exact SpatialAnalyzer target will have a separate package name. npm package
aliases can give several targets distinct local import specifiers when an
application needs them in one dependency graph; there is no universal runtime
target selector. Only the `2026.1.0529.7` target package is implemented today.

For example, after another exact-target package exists, an application can use
locally meaningful aliases without changing either published package:

```json
{
  "dependencies": {
    "briosa-sa-2026-1-0529-7": "npm:@spatialanalyzer/briosa-2026.1.0529.7@0.1.0",
    "briosa-sa-2027-1-0000-0": "npm:@spatialanalyzer/briosa-2027.1.0000.0@0.1.0"
  }
}
```

The second dependency is only a naming example; Briosa does not currently claim
support for that SpatialAnalyzer target.

## Usage

```ts
import {
  createBriosaClient,
  getWorkingDirectory,
} from '@spatialanalyzer/briosa-2026.1.0529.7';

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
./eng/Test-Conformance.ps1 `
  -ArtifactPath C:\path\to\briosa-client-conformance-0.3.0-sa-2026.1.0529.7-win-x64.zip `
  -NodeExecutable node
npm run lint
npm run format:check
npm run pack:check
```

Unit tests use fake server/transport boundaries. The shared conformance suite
runs the real client and server against a portable fake SDK/application host.
Neither path requires SpatialAnalyzer nor a license.

## Protocol Regeneration

```powershell
node ./eng/import-protocol-artifact.mjs `
  --artifact C:\path\to\briosa-protocol-0.3.0-sa-2026.1.0529.7.zip `
  --update `
  --source-channel github_release

node ./eng/import-protocol-artifact.mjs `
  --artifact C:\path\to\briosa-protocol-0.3.0-sa-2026.1.0529.7.zip
```

Never edit `src/generated` or `protocol.lock.json` by hand.
