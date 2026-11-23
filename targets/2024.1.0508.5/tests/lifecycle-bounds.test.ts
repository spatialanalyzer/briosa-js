// The lifecycle bounds and the configured interaction mode that Server 0.10.1
// and later publish in GetServerInfo (spatialanalyzer/briosa#400). Server
// 0.10.0 publishes neither; every allowance is then unavailable and the mode
// unknown.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import type {
  BriosaLifecycleBounds,
  BriosaServerSnapshot,
} from '../src/index.js';
import {
  ConfiguredSpatialAnalyzerInteractionMode,
  GetServerInfoResponse,
  type LifecycleBounds,
} from '../src/generated/protocol/briosa/discovery.js';
import { mapSnapshot } from '../src/protocolMapping.js';
import {
  ScriptedTransport,
  defaultCapabilities,
  serverInfo,
  startedClient,
} from './support/fakes.js';

// Through the generated codec, as the bytes arrive from a server.
function snapshotOf(
  fields: Partial<GetServerInfoResponse>,
  extraBytes: Uint8Array = new Uint8Array(),
): BriosaServerSnapshot {
  const bytes = GetServerInfoResponse.encode({
    ...serverInfo(false),
    ...fields,
  }).finish();
  return mapSnapshot(
    GetServerInfoResponse.decode(Buffer.concat([bytes, extraBytes])),
    defaultCapabilities(),
  );
}

const unavailable: BriosaLifecycleBounds = {
  startSdkMs: null,
  launchSpatialAnalyzerMs: null,
  connectSpatialAnalyzerMs: null,
  recoverSdkMs: null,
  stopSdkMs: null,
  closeOwnedSpatialAnalyzerMs: null,
  startupWithLaunchMs: null,
  startupWithoutLaunchMs: null,
  hostGracefulShutdown: { kind: 'unavailable' },
};

// The published values at the server's default settings.
const serverDefaults: LifecycleBounds = {
  startSdkMilliseconds: 45_000,
  launchSpatialAnalyzerMilliseconds: 30_000,
  connectSpatialAnalyzerMilliseconds: 60_000,
  recoverSdkMilliseconds: 55_000,
  stopSdkMilliseconds: 15_000,
  closeOwnedSpatialAnalyzerMilliseconds: 30_000,
  startupWithLaunchMilliseconds: 100_000,
  startupWithoutLaunchMilliseconds: 70_000,
  hostGracefulShutdown: {
    limit: { $case: 'finiteMilliseconds', value: 105_000n },
  },
};

void test('Server 0.10.0: no bounds and no mode', () => {
  const snapshot = snapshotOf({});
  assert.deepEqual(snapshot.lifecycleBounds, unavailable);
  assert.equal(snapshot.configuredSpatialAnalyzerInteractionMode, 'unknown');
});

void test('every published allowance is an optional duration in milliseconds', () => {
  const snapshot = snapshotOf({
    lifecycleBounds: serverDefaults,
    configuredSpatialAnalyzerInteractionMode:
      ConfiguredSpatialAnalyzerInteractionMode.CONFIGURED_SPATIAL_ANALYZER_INTERACTION_MODE_SILENT,
  });
  assert.deepEqual(snapshot.lifecycleBounds, {
    startSdkMs: 45_000,
    launchSpatialAnalyzerMs: 30_000,
    connectSpatialAnalyzerMs: 60_000,
    recoverSdkMs: 55_000,
    stopSdkMs: 15_000,
    closeOwnedSpatialAnalyzerMs: 30_000,
    startupWithLaunchMs: 100_000,
    startupWithoutLaunchMs: 70_000,
    hostGracefulShutdown: { kind: 'finite', milliseconds: 105_000 },
  });
  assert.equal(snapshot.configuredSpatialAnalyzerInteractionMode, 'silent');
});

void test('an absent or zero allowance is unavailable, each on its own', () => {
  const snapshot = snapshotOf({
    lifecycleBounds: {
      startSdkMilliseconds: 0,
      launchSpatialAnalyzerMilliseconds: 30_000,
      startupWithoutLaunchMilliseconds: 4_294_967_295,
    },
  });
  assert.deepEqual(snapshot.lifecycleBounds, {
    ...unavailable,
    launchSpatialAnalyzerMs: 30_000,
    startupWithoutLaunchMs: 4_294_967_295,
  });
});

const hostCases: readonly [
  string,
  LifecycleBounds['hostGracefulShutdown'],
  BriosaLifecycleBounds['hostGracefulShutdown'],
][] = [
  ['absent', undefined, { kind: 'unavailable' }],
  ['an unset limit', {}, { kind: 'unavailable' }],
  [
    'a zero finite value',
    { limit: { $case: 'finiteMilliseconds', value: 0n } },
    { kind: 'unavailable' },
  ],
  [
    'the largest value the server publishes',
    { limit: { $case: 'finiteMilliseconds', value: 4_294_967_294n } },
    { kind: 'finite', milliseconds: 4_294_967_294 },
  ],
  [
    'the largest exact number',
    {
      limit: {
        $case: 'finiteMilliseconds',
        value: BigInt(Number.MAX_SAFE_INTEGER),
      },
    },
    { kind: 'finite', milliseconds: Number.MAX_SAFE_INTEGER },
  ],
  [
    'a value too large for an exact number',
    {
      limit: {
        $case: 'finiteMilliseconds',
        value: BigInt(Number.MAX_SAFE_INTEGER) + 1n,
      },
    },
    { kind: 'unavailable' },
  ],
  [
    'an explicitly unbounded wait',
    { limit: { $case: 'unbounded', value: {} } },
    { kind: 'unbounded' },
  ],
];

for (const [name, wire, expected] of hostCases) {
  void test(`host shutdown bound: ${name}`, () => {
    const snapshot = snapshotOf({
      lifecycleBounds: {
        startupWithLaunchMilliseconds: 100_000,
        ...(wire === undefined ? {} : { hostGracefulShutdown: wire }),
      },
    });
    assert.deepEqual(snapshot.lifecycleBounds?.hostGracefulShutdown, expected);
    // A missing host bound never makes a startup allowance unavailable.
    assert.equal(snapshot.lifecycleBounds?.startupWithLaunchMs, 100_000);
  });
}

void test('host shutdown bound: a limit case this client does not know is unavailable', () => {
  // GetServerInfoResponse field 12 (lifecycle_bounds) holding field 9
  // (host_graceful_shutdown), whose only field is an unknown case 3.
  const unknownCase = Uint8Array.from([0x62, 0x04, 0x4a, 0x02, 0x18, 0x05]);
  const snapshot = snapshotOf({}, unknownCase);
  assert.deepEqual(snapshot.lifecycleBounds?.hostGracefulShutdown, {
    kind: 'unavailable',
  });
});

const modeCases: readonly [number, string][] = [
  [0, 'unknown'],
  [1, 'unchanged'],
  [2, 'silent'],
  [3, 'automatic'],
  [4, 'manual'],
  [5, 'unknown'],
  [99, 'unknown'],
];

for (const [value, expected] of modeCases) {
  void test(`configured interaction mode ${value} is ${expected}`, () => {
    const snapshot = snapshotOf({
      configuredSpatialAnalyzerInteractionMode: value,
      lifecycleBounds: { startupWithLaunchMilliseconds: 100_000 },
    });
    assert.equal(snapshot.configuredSpatialAnalyzerInteractionMode, expected);
    // An unknown mode never makes a startup allowance unavailable.
    assert.equal(snapshot.lifecycleBounds?.startupWithLaunchMs, 100_000);
  });
}

void test('every server snapshot carries the published values', async () => {
  const transport = new ScriptedTransport();
  transport.serverInfoFields = {
    lifecycleBounds: serverDefaults,
    configuredSpatialAnalyzerInteractionMode:
      ConfiguredSpatialAnalyzerInteractionMode.CONFIGURED_SPATIAL_ANALYZER_INTERACTION_MODE_UNCHANGED,
  };
  const { client } = await startedClient(transport);
  try {
    const snapshot = await client.getServerSnapshot();
    assert.equal(snapshot.lifecycleBounds?.startupWithLaunchMs, 100_000);
    assert.equal(
      snapshot.configuredSpatialAnalyzerInteractionMode,
      'unchanged',
    );
  } finally {
    await client.stop();
  }
});

void test('each reply gets its own host shutdown bound', () => {
  const first = snapshotOf({ lifecycleBounds: {} }).lifecycleBounds;
  assert.ok(first !== undefined);
  // A caller that changes what it received cannot change a later reply.
  Object.assign(first.hostGracefulShutdown, { kind: 'unbounded' });
  const later = snapshotOf({
    lifecycleBounds: {
      hostGracefulShutdown: {
        limit: { $case: 'finiteMilliseconds', value: 0n },
      },
    },
  }).lifecycleBounds;
  assert.deepEqual(later?.hostGracefulShutdown, { kind: 'unavailable' });
  assert.notEqual(later?.hostGracefulShutdown, first.hostGracefulShutdown);
  assert.deepEqual(snapshotOf({}).lifecycleBounds?.hostGracefulShutdown, {
    kind: 'unavailable',
  });
});
