# Briosa JavaScript/TypeScript clients

[Documentation](https://briosa.dev/) | [API Reference](https://briosa.dev/api/javascript) | [First MP Command](https://briosa.dev/docs/getting-started/first-request)

Independent exact-target clients for the [Briosa SpatialAnalyzer bridge](https://github.com/spatialanalyzer/briosa).

| SpatialAnalyzer target | Product and development guide | Client version |
| --- | --- | --- |
| 2024.1.0508.5 | [SA 2024](targets/2024.1.0508.5/README.md) | 0.5.0 |
| 2026.1.0529.7 | [SA 2026](targets/2026.1.0529.7/README.md) | 0.5.0 |

Choose the package for your exact SA installation. Client 0.5.x works with
Server 0.10.x and does not work with Server 0.9.x or earlier; Client 0.5.0 was
tested with Server 0.10.0. Client 0.4.x works with Server 0.9.x, and clients
0.4.x and earlier do not work with Server 0.10.x. For server releases after
0.10.0, a patch update keeps the same clients working; a minor update may
require a client upgrade. Each product pins its own generation artifact and
retains Server 0.9.2 as a conformance baseline that it must reject. Client
package versions are independent of the Briosa server version. See
[Releasing](RELEASING.md) for registry publishing and validation.

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
npm install briosa@npm:@spatialanalyzer/briosa-2024.1.0508.5@0.5.0
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

The default `startupTimeoutMs` is 120000 (two minutes) instead of 30000 in both
products. It is sized from the server's default lifecycle bounds; see
[startup and lifecycle time budgets](docs/design/v1-public-api-contract.md#startup-and-lifecycle-time-budgets).
