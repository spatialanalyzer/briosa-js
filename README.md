# Briosa JavaScript/TypeScript clients

Independent exact-target clients for the [Briosa SpatialAnalyzer bridge](https://github.com/spatialanalyzer/briosa).

| SpatialAnalyzer target | Product and development guide | Client version |
| --- | --- | --- |
| 2024.1.0508.5 | [SA 2024](targets/2024.1.0508.5/README.md) | 0.1.0 |
| 2026.1.0529.7 | [SA 2026](targets/2026.1.0529.7/README.md) | 0.1.0 |

Choose the package for your exact SA installation. Each product pins its own
Briosa v0.6.0 protocol and portable conformance artifacts. Client package versions
are independent of the Briosa server version. Packages are prepared for initial
publication; this change does not publish them to a registry.

Package names include the SA target; application namespaces/imports remain stable.
See each product guide for installation and examples. Run development commands
from the chosen `targets/<exact-sa-release>/` directory. CI validates both products.

SpatialAnalyzer, its SDK, and a license are required separately for real work.
Portable checks do not establish licensed runtime validation. Broader licensed
runtime CI and enterprise Artifactory verification remain outstanding before v1.0
promotion.

## Stable imports

After registry publication, select one target through an npm alias:

```sh
npm install briosa@npm:@spatialanalyzer/briosa-2024.1.0508.5@0.1.0
```

```ts
import { createBriosaClient, getWorkingDirectory } from 'briosa';
```

For SA 2026, replace only the target in the installation command with
`2026.1.0529.7`. The published distribution keeps its target-qualified name.
