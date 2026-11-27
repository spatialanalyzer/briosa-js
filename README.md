# Briosa JavaScript/TypeScript clients

[Documentation](https://briosa.dev/) | [API Reference](https://briosa.dev/api/javascript) | [First MP Command](https://briosa.dev/docs/getting-started/first-request)

Independent exact-target clients for the [Briosa SpatialAnalyzer bridge](https://github.com/spatialanalyzer/briosa).

| SpatialAnalyzer target | Product and development guide | Client version |
| --- | --- | --- |
| 2024.1.0508.5 | [SA 2024](https://github.com/spatialanalyzer/briosa-js/blob/main/targets/2024.1.0508.5/README.md) | 0.5.2 |
| 2026.1.0529.7 | [SA 2026](https://github.com/spatialanalyzer/briosa-js/blob/main/targets/2026.1.0529.7/README.md) | 0.5.2 |

Choose the package for your exact SA installation. Client 0.5.x works with
Server 0.10.x and does not work with Server 0.9.x or earlier; Client 0.5.0 was
tested with Server 0.10.0. Client 0.5.1 also reads what Server 0.10.1 adds, and
works with Server 0.10.0 as Client 0.5.0 does. Client 0.5.2 works with the same
servers as Client 0.5.1 and has the same API. Client 0.4.x works with Server
0.9.x, and clients 0.4.x and earlier do not work with Server 0.10.x. For server
releases after 0.10.0, a patch update keeps the same clients working; a minor
update may require a client upgrade. Each product pins its own generation
artifact and retains Server 0.9.2 as a conformance baseline that it must
reject. Client package versions are independent of the Briosa server version.
See [Releasing](RELEASING.md) for registry publishing and validation.

Package names include the SA target; application namespaces/imports remain stable.
See each product guide for installation and examples. Run development commands
from the chosen `targets/<exact-sa-release>/` directory. CI validates both products.

SpatialAnalyzer, its SDK, and a license are required separately for real work.
Portable checks do not establish licensed runtime validation. Broader licensed
runtime CI and enterprise Artifactory verification remain outstanding before v1.0
promotion.

## Stable imports

Select one target through an npm alias:

```sh
npm install briosa@npm:@spatialanalyzer/briosa-2024.1.0508.5@0.5.2
```

```ts
import { createBriosaClient, getWorkingDirectory } from 'briosa';
```

For SA 2026, replace only the target in the installation command with
`2026.1.0529.7`. The published distribution keeps its target-qualified name.

Upgrading from Client 0.4.0 to Client 0.5.0 requires application changes; use
Server 0.10.x with the new client. The breaking changes, including the request
defaults and argument rules that changed, the removed operations, partial
success, and the new discovery fields, are described in the
[Client 0.5 migration guide](docs/client-0.5-migration.md). The 0.3.0 API naming
changes are described in the
[MP argument migration guide](docs/mp-argument-name-migration.md).

Upgrading from Client 0.5.0 to Client 0.5.1 needs no application changes. With
Server 0.10.1 and later, Client 0.5.1 reports why the server denied a call
(`BriosaOperationError.policyDenial`), describes each operation's request
options and denial in discovery, exposes the server's lifecycle bounds and
configured interaction mode on the server snapshot, and sizes an omitted
startup budget from the server's published startup allowance. With Server
0.10.0 these values report "not available" and behavior is unchanged. Each
product guide describes the additions.

Upgrading from Client 0.5.1 to Client 0.5.2 needs no application changes. With
Clients 0.5.0 and 0.5.1, a call following a large response on the same
connection could occasionally receive no reply. The investigation observed this
symptom with Briosa Server 0.10.0 and a 0.10.1 development build.
<https://github.com/spatialanalyzer/briosa/issues/450>

Client 0.5.2 raises the HTTP/2 receive window from 65,535 bytes to 16 MiB on
each stream and on the shared connection. With one unary call at a time, this
leaves room for the largest response the client accepts, including its
five-byte gRPC prefix. Concurrent responses share connection credit and can
still have to wait. The server needs a patched ASP.NET Core runtime to fix the
underlying defect. <https://github.com/dotnet/aspnetcore/pull/70100> Each product guide describes the change.

The default `startupTimeoutMs` is 120000 (two minutes) instead of 30000 in both
products. It is sized from the server's default lifecycle bounds; see
[startup and lifecycle time budgets](docs/design/v1-public-api-contract.md#startup-and-lifecycle-time-budgets).
With Server 0.10.1 and later, Client 0.5.1 lengthens an omitted budget to fit
the startup allowance that the server publishes, never below two minutes; a
value you set always wins.
