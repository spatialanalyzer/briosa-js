# Briosa JavaScript/TypeScript Client

`@spatialanalyzer/briosa-2024.1.0508.5` is the asynchronous Node.js client for the open-source
[Briosa](https://github.com/spatialanalyzer/briosa) SpatialAnalyzer bridge. It
provides idiomatic lifecycle and MP APIs while keeping generated protobuf and
gRPC types private.

The package does not include SpatialAnalyzer, the SA SDK, or a license. It
targets SpatialAnalyzer `2024.1.0508.5` exactly and Node.js 20.19 or later. The
complete protocol identity is pinned in [`protocol.lock.json`](protocol.lock.json).

## Package Identity

The package is named `@spatialanalyzer/briosa-2024.1.0508.5`, while its
exported Briosa types and functions remain release-neutral. The package has not
been published to npm yet. After publication, the intended installation command
is:

```powershell
npm install briosa@npm:@spatialanalyzer/briosa-2024.1.0508.5@0.1.0
```

Each exact SpatialAnalyzer target has an independent package. Install the chosen
package under the local dependency name `briosa` so application imports stay short.
To change targets, change this dependency; command differences may also require
application code changes. Applications that need both targets can choose distinct
npm aliases. There is no universal runtime target selector.

## Usage

```ts
import { createBriosaClient, getWorkingDirectory } from 'briosa';

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
for the client API overview. The target-specific source and locked protocol define
this package's exact API.

## Server Distribution Lookup

The client resolves the matching server distribution in this order:

1. `BRIOSA_SERVER_PATH`
2. A package-local `briosa-server/Briosa.Server.exe`
3. `%LOCALAPPDATA%/Briosa/servers/<briosa-version>/sa-<sa-target>/Briosa.Server.exe`

The locator is private so the installer/package layout can evolve without
adding executable paths to the public startup options.

## Build and Test

Run these commands from `targets/2024.1.0508.5/`; each target builds and
packages independently.

```powershell
npm ci
npm run build
npm test
./eng/Test-Conformance.ps1 `
  -ArtifactPath C:\path\to\briosa-client-conformance-0.6.0-sa-2024.1.0508.5-win-x64.zip `
  -NodeExecutable node
npm run lint
npm run format:check
npm run pack:check
npm run package:consumer
```

Unit tests use fake server/transport boundaries. The shared conformance suite
runs the real client and server against a portable fake SDK/application host.
Neither path requires SpatialAnalyzer nor a license.

## Protocol Regeneration

```powershell
node ./eng/import-protocol-artifact.mjs `
  --artifact C:\path\to\briosa-protocol-0.6.0-sa-2024.1.0508.5.zip `
  --update `
  --source-channel github_release

node ./eng/import-protocol-artifact.mjs `
  --artifact C:\path\to\briosa-protocol-0.6.0-sa-2024.1.0508.5.zip
```

Never edit `src/generated` or `protocol.lock.json` by hand.

## Server Logging

Pass optional typed `logging` settings to `start`:

```typescript
await briosa.start({
  logging: {
    minimumLevel: 'Debug',
    consoleEnabled: false,
    maxFileSizeMiB: 20,
    retainedFileCount: 10,
  },
});
```

`BriosaLoggingOptions` also exposes `categoryLevels`, `fileEnabled`,
`fileDirectory`, `maxAgeDays`, and `maxTotalSizeMiB`. Omitted settings preserve
server configuration. Values are validated before launch; custom directories
must be absolute Windows paths. Hidden launches retain server-owned JSONL logs.
See the [shared startup contract](https://github.com/spatialanalyzer/briosa/blob/main/docs/architecture/client-library-behavioral-contract.md#server-logging-startup-controls)
and [server observability guide](https://github.com/spatialanalyzer/briosa/blob/main/targets/2024.1.0508.5/docs/operations/server-observability.md).

## Compatibility and validation

This package pins the matching Briosa v0.6.0 protocol and conformance bundles.
Startup checks the server version, source revision, protocol package, and exact
SA target before admitting MP calls. The other SA target is not interchangeable.

Portable conformance covers lifecycle, identity mismatch, denied capabilities,
typed MP and output failure, deadlines, cancellation, watchdog recovery, SDK loss,
and owned-process cleanup. Its harness disables Control Center auto-launch and
restores the prior setting afterward. These checks use a fake SDK, without a
SpatialAnalyzer installation or license.

The public relationship-reference inputs use `CollectionItemName`, including
the item name and optional item type; they are not geometric object references.
This corrects earlier pre-publication facade annotations that disagreed with the
protocol. Existing callers of those methods must pass the item-name value.

Broader licensed runtime coverage and protected runtime CI remain outstanding.
Enterprise Artifactory integration is also unverified. This package remains v0.x;
portable results do not imply v1.0 readiness or validation on physical instruments.

### SA 2024 differences

The facade implements the reviewed 996-operation SA 2024 surface. It omits later
commands and the three scan operations whose SDK bindings are unavailable in
this release. See the authoritative [compatibility record](https://github.com/spatialanalyzer/briosa/blob/v0.6.0/targets/2024.1.0508.5/docs/development/sa2024-compatibility.md)
for the complete command and field differences.

- Run Crib Sheet, Project Objects, and Stop Projection are available. Their
  instrument-dependent runtime validation remains outstanding.
- Surface-face construction takes seven explicit Boolean selectors (planes,
  cylinders, spheres, cones, lines, points, circles).
- Direct CAD Access requires an explicit surface compatibility mode; both QDAS
  operations require the caller's date/time stamp.
- General relationship statistics return Max Deviation without an inferred
  absolute-value guarantee. Cone properties omit cut length; points-to-objects
  statistics omit average deviation; feature-check reporting omits the later
  failed-vectors-only option.
- Enhanced Cloud and the three later system-string choices are absent. Reserved
  wire values stay reserved; remaining choices retain their original numbers.
- Instrument names retain the exact value supplied by the caller. The server
  validates against the 185 reviewed 2024 literals, including `PMT Arm 4m 7 dof`.
