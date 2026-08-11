# Briosa JavaScript/TypeScript v1 public API contract

- Status: Accepted design target
- Last reviewed: 2026-08-10
- Scope: The target-specific `@spatialanalyzer/briosa` Node.js package
- Implementation status: Not yet conforming

## Authority and scope

This document records only the language-specific decisions for the Briosa
JavaScript/TypeScript v1 API. It is normative for the package's handwritten
TypeScript facade, but it is not a second copy of Briosa's shared behavior.

All first-party clients must follow the
[shared client behavioral contract](https://github.com/spatialanalyzer/briosa/blob/main/docs/architecture/client-library-behavioral-contract.md).
That contract owns common lifecycle, readiness, compatibility, capability,
presence, default, failure, cancellation, recovery, replay, ownership, and
conformance behavior. The public protocol and server remain authoritative for
MP command semantics. If either source is ambiguous, resolve the ambiguity in
`spatialanalyzer/briosa`; do not invent JavaScript-only shared policy here.

The language split was established in
[Discussion #6](https://github.com/orgs/spatialanalyzer/discussions/6). The
[JavaScript/TypeScript review](https://github.com/orgs/spatialanalyzer/discussions/6#discussioncomment-17926469)
accepted the choices below after reviewing all 26 rules in the original .NET
proposal.

The current `0.1.0` package is an earlier bootstrap. Its exported API is not a
v1 compatibility commitment and does not override this contract.

## Accepted JavaScript/TypeScript rules

### Public command surface

Every MP command is one named, module-level function exported from the package
root. Its first argument is an explicit, long-lived `BriosaClient` handle:

```ts
await getWorkingDirectory(client);
await getWorkingFrameProperties(client, { signal });
```

MP categories may organize source and documentation, but they do not appear in
the ordinary call path. `BriosaClient` owns lifecycle and generation state; it
does not duplicate MP commands as methods.

The public facade, domain values, command inputs, results, discovery values,
and errors are handwritten. Standard protobuf and gRPC generation supplies the
private transport implementation only. The package has no supported raw
generated export path.

### Construction and lifecycle expression

The only supported construction path is a synchronous factory returning an
opaque public interface:

```ts
const client = createBriosaClient(options);
```

The concrete implementation is private and cannot be directly constructed or
subclassed. There is no package-global default client. Configuration is
effectively immutable after construction, and the handle is not promised to be
structured-cloneable or transferable between Node.js worker threads.

Shared startup and cleanup behavior is expressed as lifecycle methods on the
handle:

```ts
const client = createBriosaClient(options);
await client.start();

try {
  await getWorkingDirectory(client);
} finally {
  await client.stop();
}
```

`stop()` is asynchronous and leaves the long-lived handle reusable for a later
`start()`. `Symbol.asyncDispose` delegates to the same stop behavior as a
JavaScript resource-management convenience; it does not introduce another MP
command surface.

The handle supports overlapping asynchronous calls within one JavaScript realm.
It promises neither implicit call ordering nor SpatialAnalyzer parallelism.
Callers that depend on order await commands sequentially.

### Command and input names

Public command names are derived mechanically from exact MP names:

- preserve every word in order, including articles and prepositions;
- remove punctuation using one documented normalization algorithm;
- retain MP abbreviations;
- use conventional `lowerCamelCase`; and
- omit an `Async` suffix.

For example:

```text
Construct a Point in Working Coordinates
    -> constructAPointInWorkingCoordinates

Set (or construct) default collection
    -> setOrConstructDefaultCollection

Get i-th Collection Name
    -> getIthCollectionName
```

TSDoc records the exact MP command name. Reserved identifiers and real
normalization collisions receive the smallest deterministic, MP-recognizable
clarification and are covered by inventory tests.

Input property names preserve MP labels, order, and abbreviations as closely as
TypeScript permits, converted deterministically to `lowerCamelCase`. TSDoc
records the exact MP label for every property.

### Command inputs and caller controls

A command with MP inputs receives one handwritten readonly
`CommandNameInput` object containing all required and optional MP inputs:

```ts
export interface SetPointNotesInput {
  readonly pointName: CollectionObjectName;
  readonly notes: string;

  /** @defaultValue `true` */
  readonly append?: boolean;
}

await setPointNotes(client, { pointName, notes, append: true }, { signal });
```

A zero-input command omits the input object. Generated request messages never
appear in the consumer API.

Transport and asynchronous controls use a separate optional final
`BriosaCallOptions` argument:

```ts
export interface BriosaCallOptions {
  readonly signal?: AbortSignal;
}
```

The primary command surface does not expose gRPC metadata, channel
credentials, channel options, call handles, generated call options, or other
`@grpc/grpc-js` values. A client-wide `commandTimeoutMs?: number | null` may
configure an additional command deadline; omission and `null` mean no
additional client-imposed command deadline. A one-off caller deadline uses
`AbortSignal.timeout(...)` or an equivalent composed signal.

Every command failure, including local input validation and a pre-aborted
signal, is delivered as a Promise rejection rather than a synchronous throw.
Synchronous domain factories may still throw during ordinary value
construction.

### Public domain values

Use JavaScript built-ins only when they preserve an MP value exactly and
losslessly. Other values use handwritten readonly structural interfaces.
Selective branded scalars distinguish primitive values whose accidental
interchange is a material risk; branding is not required for every scalar.

```ts
export interface Vector {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export type CollectionObjectName = string & {
  readonly __collectionObjectNameBrand: unique symbol;
};
```

Public enums use a frozen runtime constant object plus a literal-union type,
not TypeScript numeric enums or generated protobuf enums:

```ts
export const ExampleMode = Object.freeze({
  first: 'first',
  second: 'second',
} as const);

export type ExampleMode = (typeof ExampleMode)[keyof typeof ExampleMode];
```

Protobuf 64-bit integers map to `bigint`, never `number`. Local representation
validation uses normal `TypeError` for missing or wrong JavaScript value kinds
and `RangeError` for numeric ranges and reviewed domain invariants.

### Results, presence, and collections

JavaScript expresses the shared MP output-cardinality rule as:

- no MP output: `Promise<void>`;
- one MP output: `Promise<T>`; and
- multiple MP outputs: `Promise<TNamedResult>`.

A multiple-output result is a detached readonly plain object. Prefer a domain
concept name; use `CommandNameResult` only when no clearer domain name exists.
Do not use tuples, transport response envelopes, or runtime result classes.
Readonly is the TypeScript contract; ordinary result objects need not be frozen
at runtime.

An optional output uses `T | undefined`. A known slot in a multiple-output
result remains a stable property, such as
`readonly optionalValue: T | undefined`, rather than an optional property.
`null` is reserved for a distinct domain state defined by the shared contract.

Collection inputs use finite synchronous `Iterable<T>`. The implementation
rejects bare strings as collections, materializes the iterable exactly once
before starting the RPC, and preserves order and duplicates. Collection outputs
are fresh detached arrays typed as `readonly T[]`; a required present empty
collection is `[]`.

### Reviewed defaults

A reviewed fixed scalar default is an optional property on the command input
and is documented with `@defaultValue`. Omission or explicit `undefined`
selects the reviewed value; `null` does not. The mapping computes and sends the
effective value explicitly.

A fixed structured default uses a named, deeply immutable runtime value of the
same handwritten domain type. A TypeScript interface and same-name frozen
constant namespace may provide the idiom:

```ts
export interface ProjectionOptions {
  readonly exampleSetting: number;
}

export const ProjectionOptions = Object.freeze({
  default: Object.freeze<ProjectionOptions>({ exampleSetting: 1 }),
});
```

Callers derive deliberate modifications with object spread. A command-specific
default receives a command-specific name.

### Async and error expression

Every remote MP operation returns a native Promise. V1 has no callback or
synchronous wrappers, and command names carry no `Async` suffix.

The handwritten public error boundary uses these JavaScript classes:

- `BriosaOperationError` for a valid typed Briosa operation failure;
- `BriosaTransportError` when no valid typed operation detail is available;
- `BriosaCallAbortedError` for caller cancellation, with
  `name === 'AbortError'` and the original signal reason retained; and
- focused handwritten lifecycle, startup, and compatibility errors before MP
  submission.

Raw `@grpc/grpc-js` errors do not escape through public error values, including
through `Error.cause`. Public operation failures expose handwritten
JavaScript values for the shared execution disposition, recovery guidance,
replay guidance, and replay-safety dimensions.

## Deferred design decisions

The accepted public shape constrains, but intentionally does not settle:

- the exact `BriosaClientOptions`, startup options, stop options, and endpoint
  selection types;
- the detailed lifecycle state machine, runtime ownership modes, artifact
  discovery, launch behavior, and partial-startup cleanup, which remain owned
  by [central issue #147](https://github.com/spatialanalyzer/briosa/issues/147);
- the exact lifecycle error hierarchy and handwritten transport-status shape;
- detailed application, SDK-engine, server, generation, and recovery state
  models and notifications;
- exact domain factories, branding choices, command mapping layout, and
  mechanically checked naming/capability inventories;
- exact npm naming, installation, and versioning mechanics for the parent
  epic's one-module-per-exact-target package model; and
- the shared test-host artifact, scenario protocol, and thin JavaScript fixture
  API, which remain owned by
  [central issue #148](https://github.com/spatialanalyzer/briosa/issues/148).

Resolve these points through focused issues. An implementation issue may make a
reversible local choice only when it stays inside the shared contract and its
accepted scope.

## Current bootstrap incompatibilities

The current `0.1.0` implementation predates this accepted design. A conforming
release must address at least these known gaps:

- replace `new BriosaClient(...)` with `createBriosaClient(...)` returning an
  opaque public interface;
- move MP commands off the client class and into flat package exports;
- add explicit asynchronous `start()` and reusable `stop()` lifecycle methods;
- defer channel creation and all external work until `start()`;
- replace `defaultTimeoutMs: 30_000` and per-call `timeoutMs` with the accepted
  command-timeout and `AbortSignal` model;
- remove public gRPC credentials, channel options, generated messages, enums,
  clients, and protocol identity exports;
- replace generated discovery values and `GetWorkingDirectoryResult` with
  handwritten public values and direct output cardinality;
- replace `BriosaCallError`, public gRPC status values, and its transport
  `Error.cause` with the accepted handwritten error boundary;
- make all command validation failures reject Promises consistently;
- replace synchronous `close()` with asynchronous lifecycle cleanup;
- migrate from the retired bootstrap protocol shape to the parent epic's
  locked target-qualified `package briosa` artifact; and
- update README examples only as their corresponding behavior is implemented.

These are planned breaking changes from an early pre-v1 bootstrap, not
regressions against a previously accepted v1 API.

## V1 non-goals

All non-goals in the shared client behavioral contract apply. Their
JavaScript/TypeScript-specific consequences include:

- no generated public facade, request envelopes, results, or domain model;
- no supported raw generated export subpath;
- no MP command methods on `BriosaClient` and no parallel class/function
  command surfaces;
- no TypeScript overload matrix, singleton alternatives, aliases, rest forms,
  callback forms, or synchronous MP wrappers;
- no raw gRPC metadata, call options, channel objects, or transport escape hatch
  in the primary public API;
- no hidden startup, global default client, or first-command initialization;
- no structured-clone or worker-thread transfer guarantee for a live handle;
- no direct COM integration in the core package; and
- no independently maintained JavaScript fake MP implementation.

## Repository alignment and enforcement

This contract is the design input to
[the JavaScript/TypeScript v1 client epic](https://github.com/spatialanalyzer/briosa-js/issues/3).
The epic's target-specific package model, handwritten public facade, explicit
lifecycle, generated-code boundary, replay safety, and shared conformance goals
are consistent with this document. This repository's `AGENTS.md` enforces the
same authority split and generated-code boundary.

Implementation work should add public API-surface tests that detect generated
or gRPC type leakage, naming-inventory tests for deterministic mappings, local
mapping and validation tests, protocol drift verification, and the shared
target-specific conformance suite in proportion to each change.

Changing common behavior starts in `spatialanalyzer/briosa` and updates the
shared contract first. This document changes only when the JavaScript/TypeScript
expression changes or an accepted central change requires a corresponding
language update.
