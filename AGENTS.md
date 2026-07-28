# Briosa JavaScript client agent guide

This repository contains a thin generated client. Public protocol and command semantics belong to `spatialanalyzer/briosa`, not here.

- Consume only an exact, verified Briosa protocol artifact recorded in `protocol.lock.json`.
- Never hand-edit `src/generated`; update it through `eng/import-protocol-artifact.mjs`.
- Keep hand-written code limited to idiomatic Node.js transport adapters, packaging, deadlines/cancellation, presence handling, 64-bit semantics, and typed errors.
- Do not add hand-maintained per-command transports or duplicate shared protocol policy.
- Do not parse gRPC status text. Decode the value-free `briosa-operation-error-bin` trailer.
- Never automatically replay an ambiguously completed operation. Preserve execution disposition, recovery guidance, replay guidance, and replay safety separately.
- Ordinary builds and tests must not require SpatialAnalyzer, a license, proprietary SDK binaries, or vendor documentation.
- Run locked install, build, tests, linting, formatting, package creation, protocol drift verification, and shared conformance in proportion to the change.

GitHub issues and the organization roadmap are the planning source of truth. Keep changes scoped to the active client issue and link a PR with `Closes #<number>` only when all acceptance criteria are met.
