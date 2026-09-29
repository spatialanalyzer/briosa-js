# Briosa JavaScript/TypeScript Client

`@spatialanalyzer/briosa-2026.1.0529.7` is the asynchronous Node.js client for the open-source
[Briosa](https://github.com/spatialanalyzer/briosa) SpatialAnalyzer bridge. It
provides idiomatic lifecycle and MP APIs while keeping generated protobuf and
gRPC types private.

The package does not include SpatialAnalyzer, the SA SDK, or a license. It
targets SpatialAnalyzer `2026.1.0529.7` exactly and Node.js 20.19 or later. The
complete protocol identity is pinned in [`protocol.lock.json`](protocol.lock.json).

## Package Identity

The next version is not published yet. Build the candidate locally and use its
package path or feed in the installation command below.

The package is named `@spatialanalyzer/briosa-2026.1.0529.7`, while its
exported Briosa types and functions remain release-neutral. Install it using an npm alias:

```powershell
npm install briosa@file:C:\path\to\spatialanalyzer-briosa-2026.1.0529.7-0.4.0.tgz
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

## Server selection

Applications select a server independently of their protocol generation pin.
On Windows x64, discovery reads Registry64 installation hints, committed
canonical stores, explicit search roots, and supported local layouts. It validates
receipts and manifests, filters the exact SA target and compatibility contract,
and selects the highest compatible stable release. No internet access is needed.

This development checkout prepares client 0.4.0 for behavioral contract **2.0**
(major 2, revision at least 0). It is not a published compatibility claim.
Major-1 servers and servers without contract metadata, including Server 0.6.1,
are rejected before launch. Protocol and source pins remain exact build inputs;
startup verifies the running server against its selected installation.

The three robot methods Get Robot Machine Parameter, Start Robot Machine
Interface, and Stop Robot Machine Interface now take a collection/instrument
identity for the MP argument named Machine ID. Supply an instrument ID rather
than a machine ID; other robot methods retain their existing types.

A full server queue returns an overload error with NotStarted, no recovery
action, and MayReplay guidance. The client preserves these separate facts and
never retries automatically. The 64 KiB inbound limit may also produce a
transport size error without typed detail. See the
[authoritative migration guide](https://github.com/spatialanalyzer/briosa/blob/main/docs/development/runtime-redesign-migration.md).

A missing or incompatible explicit choice fails without selecting another
installation. The choice is fixed for the session, including worker recovery.
Prereleases require explicit opt-in. Conflicting manifests for the same release
precedence produce an ambiguity error; identical copies prefer machine, user,
then portable scope and a stable path order. Elevated automatic discovery admits
only protected machine installations.

The optional selection settings include an executable path or installation ID,
an exact version, minimum version (inclusive), maximum version (exclusive),
excluded versions, search roots, allowed scopes, and an SA executable path.
Search roots name package stores with a committed `products` directory.
Read-only discovery returns candidates, the selected identity, and rejection codes
without starting Briosa, the SDK, or SA. Detailed paths belong to explicitly
requested diagnostics; installer **Verify/Repair** provides full payload checks.

`BRIOSA_SERVER_PATH` is ignored by default in client 0.2. Use a direct selection
option in new applications. Existing scripts can opt in to the legacy environment
override; an invalid override fails without fallback. Direct selectors take
precedence. Published 0.1.0/0.1.1 packages retain their original behavior.

Custom stores can be registered through the Installer's **Register existing
installations** action or `packages register` command. Alternatively provide a
search root or executable path per application. No machine-wide active server is
selected. Installing several SA releases does not establish concurrent execution:
the server still verifies the activated SDK and connected SA independently.

The [shared selection contract](https://github.com/spatialanalyzer/briosa/blob/main/docs/architecture/installation-selection-and-compatibility.md)
owns these rules and the [compatibility matrix](https://github.com/spatialanalyzer/briosa/blob/main/compatibility/matrix.json)
distinguishes tested pairs from declared forward compatibility.

```ts
import { discoverInstallations } from 'briosa';

const selection = { version: '0.9.0-dev.1', allowPrerelease: true };
const report = await discoverInstallations(selection); // no process launch
await briosa.start({ serverSelection: selection });
```

Use `executablePath`, `installationId`, `minimumVersion`, `maximumVersionExclusive`,
`excludedVersions`, `searchRoots`, `allowedScopes`, `allowPrerelease`,
`spatialAnalyzerExecutablePath`, and `useLegacyEnvironmentOverride` as needed.
The Node Registry adapter uses a bounded hidden PowerShell subprocess with
profiles disabled. Paths are passed as data, not shell expressions.

## Build and Test

Run these commands from `targets/2026.1.0529.7/`; each target builds and
packages independently.

```powershell
npm ci
npm run build
npm test
./eng/Test-Conformance.ps1 `
  -ArtifactPath C:\path\to\briosa-client-conformance-0.6.1-sa-2026.1.0529.7-win-x64.zip `
  -ExpectIncompatible `
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
  --artifact C:\path\to\briosa-protocol-0.9.0-dev.1-sa-2026.1.0529.7.zip `
  --update `
  --source-channel source_commit_bootstrap

node ./eng/import-protocol-artifact.mjs `
  --artifact C:\path\to\briosa-protocol-0.9.0-dev.1-sa-2026.1.0529.7.zip
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
and [server observability guide](https://github.com/spatialanalyzer/briosa/blob/main/targets/2026.1.0529.7/docs/operations/server-observability.md).

## Compatibility and validation

This package pins its generation artifact and tests the declared compatibility
contract against packaged servers. The retained 0.6.1 baseline must be rejected.
Exact SA target, runtime identity, capabilities, and readiness still gate MP calls.

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
