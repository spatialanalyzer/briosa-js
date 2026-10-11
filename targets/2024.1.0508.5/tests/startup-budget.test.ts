/* eslint-disable @typescript-eslint/require-await -- Async test doubles implement the transport contract. */

// Pins the client startup budget against the server's default lifecycle bounds
// (spatialanalyzer/briosa main 0c7ff7a; #298 and #315), pins that budget expiry is
// reported as startup-timeout whichever phase it interrupts, and pins that
// lifecycle calls carry no client-imposed per-call deadline.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BriosaClientImplementation } from '../src/client.js';
import { BriosaCallAbortedError, BriosaStartupError } from '../src/errors.js';
import { briosaProtocolIdentity } from '../src/generated/protocolIdentity.js';
import {
  SpatialAnalyzerConnectionState,
  SpatialAnalyzerExecutionReadinessState,
  TargetIsolationMode,
  WorkerRuntimeState,
  type GetServerInfoResponse,
  type ListCapabilitiesResponse,
} from '../src/generated/protocol/briosa/discovery.js';
import {
  SpatialAnalyzerApplicationState,
  SpatialAnalyzerOwnership,
  SpatialAnalyzerSdkRecoveryState,
  SpatialAnalyzerSdkState,
  type SpatialAnalyzerLifecycleState,
  type SpatialAnalyzerSdkLifecycleState,
} from '../src/generated/protocol/briosa/lifecycle.js';
import { normalizeStartOptions } from '../src/models.js';
import type { OwnedServer, ServerLauncher } from '../src/serverLauncher.js';
import type { ClientTransport } from '../src/transport.js';

// Server defaults, identical in both targets (milliseconds).
// Briosa:Worker:StartupTimeout: worker launch, COM activation, Ready, ConnectEx, and
// the application association after a successful readiness probe.
const serverStartupTimeoutMs = 10_000;
// Briosa:Worker:ReadinessProbeTimeout: the private readiness probe inside Connect.
const serverReadinessProbeTimeoutMs = 30_000;
// Briosa:SpatialAnalyzer:ApplicationStartupTimeout: LaunchSpatialAnalyzer's window wait.
const serverApplicationStartupTimeoutMs = 30_000;
// Fixed heartbeat timeout: Connect's liveness recheck after the association.
const serverHeartbeatTimeoutMs = 5_000;
// Fixed worker shutdown bound: forced cleanup before a failed Connect is reported.
const serverWorkerShutdownTimeoutMs = 5_000;
// Server host startup, process observations, discovery, and round trips.
const marginMs = 20_000;

void test('the default startup budget is two minutes', () => {
  assert.equal(normalizeStartOptions({}).startupTimeoutMs, 120_000);
});

void test('the default startup budget covers the server worst case with margin', () => {
  const startSdk = serverStartupTimeoutMs;
  const launchApplication = serverApplicationStartupTimeoutMs;
  const connect =
    serverStartupTimeoutMs +
    serverReadinessProbeTimeoutMs +
    serverStartupTimeoutMs +
    serverHeartbeatTimeoutMs +
    serverWorkerShutdownTimeoutMs;
  const serverWorstCase = startSdk + launchApplication + connect;

  assert.equal(serverWorstCase, 100_000);
  assert.ok(
    normalizeStartOptions({}).startupTimeoutMs >= serverWorstCase + marginMs,
    `The default startup budget must cover the server's ${serverWorstCase} ms worst case plus ${marginMs} ms.`,
  );
});

void test('startup phases share one overall budget', async () => {
  const transport = new RecordingTransport();
  const client = createClient(transport);
  await client.start();
  try {
    assert.deepEqual(
      transport.calls.map((call) => call.name),
      ['snapshot', 'start-sdk', 'launch-sa', 'connect-sdk', 'snapshot'],
    );
    const budget = transport.calls[0]?.signal;
    assert.ok(budget instanceof AbortSignal);
    assert.equal(budget.aborted, false);
    for (const call of transport.calls) {
      assert.equal(call.signal, budget, call.name);
    }
  } finally {
    await client.stop();
  }
});

for (const phase of ['snapshot', 'start-sdk', 'launch-sa', 'connect-sdk']) {
  void test(`budget expiry during ${phase} is a startup timeout`, async () => {
    const transport = new RecordingTransport(phase);
    const client = createClient(transport);
    await assert.rejects(
      client.start({ startupTimeoutMs: 100 }),
      (error: unknown) =>
        error instanceof BriosaStartupError &&
        error.diagnosticCode === 'startup-timeout',
    );
    assert.equal(transport.calls.at(-1)?.name, phase);
    await client.stop();
  });
}

void test('caller abort during startup stays an abort', async () => {
  const transport = new RecordingTransport('connect-sdk');
  const client = createClient(transport);
  await assert.rejects(
    client.start({ startupTimeoutMs: 1_000, signal: AbortSignal.timeout(50) }),
    (error: unknown) =>
      error instanceof BriosaCallAbortedError &&
      !(error instanceof BriosaStartupError),
  );
  await client.stop();
});

void test('lifecycle calls carry no client deadline', async () => {
  const transport = new RecordingTransport();
  const client = new BriosaClientImplementation(
    { commandTimeoutMs: 1_000 },
    new RecordingLauncher(),
    () => transport,
  );
  await client.start();
  try {
    transport.calls.length = 0;

    await client.getServerSnapshot();
    await client.getSpatialAnalyzerState();
    await client.getSpatialAnalyzerSdkState();
    await client.reconnectToSpatialAnalyzer();
    await client.recoverSpatialAnalyzerSdk('replaceWithoutReplay');
    await client.connectToSpatialAnalyzer();
    await client.stopSpatialAnalyzerSdk();
    await client.startSpatialAnalyzerSdk();
    await client.launchSpatialAnalyzer();
    await client.closeOwnedSpatialAnalyzer();

    assert.deepEqual(
      transport.calls.map((call) => call.name),
      [
        'snapshot',
        'get-sa-state',
        'get-sdk-state',
        'reconnect-sdk',
        'recover-sdk',
        'connect-sdk',
        'stop-sdk',
        'start-sdk',
        'launch-sa',
        'close-sa',
      ],
    );
    for (const call of transport.calls) {
      assert.equal(call.signal, undefined, call.name);
    }
  } finally {
    await client.stop();
  }
});

interface RecordedCall {
  readonly name: string;
  readonly signal: AbortSignal | undefined;
}

class RecordingServer implements OwnedServer {
  readonly target = '127.0.0.1:49152';
  readonly hasExited = false;
  async close(): Promise<void> {}
}

class RecordingLauncher implements ServerLauncher {
  async launch(): Promise<OwnedServer> {
    return new RecordingServer();
  }
}

function createClient(
  transport: RecordingTransport,
): BriosaClientImplementation {
  return new BriosaClientImplementation(
    {},
    new RecordingLauncher(),
    () => transport,
  );
}

class RecordingTransport implements ClientTransport {
  readonly calls: RecordedCall[] = [];
  // The RPC that never answers. Like the gRPC transport, it then rejects with
  // BriosaCallAbortedError once its signal aborts.
  readonly #hangAt: string | null;

  constructor(hangAt: string | null = null) {
    this.#hangAt = hangAt;
  }
  #sdkGeneration = 0;
  #connected = false;
  #recording = true;

  async getServerSnapshot(
    signal?: AbortSignal,
  ): Promise<readonly [GetServerInfoResponse, ListCapabilitiesResponse]> {
    await this.#record('snapshot', signal);
    return snapshot(this.#connected);
  }

  async getApplicationState(
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerLifecycleState> {
    await this.#record('get-sa-state', signal);
    return application(true);
  }

  async launchApplication(
    _options: unknown,
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerLifecycleState> {
    await this.#record('launch-sa', signal);
    return application(true);
  }

  async closeApplication(
    _expectedGeneration: number,
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerLifecycleState> {
    await this.#record('close-sa', signal);
    return application(false);
  }

  async getSdkState(
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    await this.#record('get-sdk-state', signal);
    return this.#sdkState();
  }

  async startSdk(
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    await this.#record('start-sdk', signal);
    this.#sdkGeneration += 1;
    this.#connected = false;
    return this.#sdkState();
  }

  async connectSdk(
    _expectedGeneration: number,
    reconnect: boolean,
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    await this.#record(reconnect ? 'reconnect-sdk' : 'connect-sdk', signal);
    this.#connected = true;
    return this.#sdkState();
  }

  async stopSdk(
    _expectedGeneration: number,
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    await this.#record('stop-sdk', signal);
    this.#sdkGeneration = 0;
    this.#connected = false;
    return this.#sdkState();
  }

  async recoverSdk(
    _expectedGeneration: number,
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    await this.#record('recover-sdk', signal);
    this.#sdkGeneration += 1;
    this.#connected = false;
    return this.#sdkState();
  }

  async getWorkingDirectory(): Promise<string> {
    throw new Error('not used');
  }

  async invokeOperation<TResponse>(): Promise<TResponse> {
    throw new Error('not used');
  }

  close(): void {
    this.#recording = false;
  }

  async #record(name: string, signal: AbortSignal | undefined): Promise<void> {
    if (this.#recording) this.calls.push({ name, signal });
    if (name !== this.#hangAt || signal === undefined) return;
    await new Promise<never>((_resolve, reject) => {
      const aborted = (): void =>
        reject(new BriosaCallAbortedError(signal.reason));
      if (signal.aborted) aborted();
      else signal.addEventListener('abort', aborted, { once: true });
    });
  }

  #sdkState(): SpatialAnalyzerSdkLifecycleState {
    return {
      stateRevision: 1n,
      sdkState:
        this.#sdkGeneration === 0
          ? SpatialAnalyzerSdkState.SPATIAL_ANALYZER_SDK_STATE_STOPPED
          : this.#connected
            ? SpatialAnalyzerSdkState.SPATIAL_ANALYZER_SDK_STATE_READY
            : SpatialAnalyzerSdkState.SPATIAL_ANALYZER_SDK_STATE_RUNNING,
      ...(this.#sdkGeneration === 0
        ? {}
        : { sdkGeneration: this.#sdkGeneration }),
      connectionState: this.#connected
        ? SpatialAnalyzerConnectionState.SPATIAL_ANALYZER_CONNECTION_STATE_CONNECTED
        : SpatialAnalyzerConnectionState.SPATIAL_ANALYZER_CONNECTION_STATE_DISCONNECTED,
      executionReadinessState: this.#connected
        ? SpatialAnalyzerExecutionReadinessState.SPATIAL_ANALYZER_EXECUTION_READINESS_STATE_EXECUTION_READY
        : SpatialAnalyzerExecutionReadinessState.SPATIAL_ANALYZER_EXECUTION_READINESS_STATE_UNVERIFIED,
      readyForMp: this.#connected,
      recoveryState:
        SpatialAnalyzerSdkRecoveryState.SPATIAL_ANALYZER_SDK_RECOVERY_STATE_NOT_REQUIRED,
    };
  }
}

function application(running: boolean): SpatialAnalyzerLifecycleState {
  return running
    ? {
        stateRevision: 1n,
        applicationState:
          SpatialAnalyzerApplicationState.SPATIAL_ANALYZER_APPLICATION_STATE_RUNNING,
        ownership:
          SpatialAnalyzerOwnership.SPATIAL_ANALYZER_OWNERSHIP_SERVER_LAUNCHED,
        applicationGeneration: 1,
      }
    : {
        stateRevision: 1n,
        applicationState:
          SpatialAnalyzerApplicationState.SPATIAL_ANALYZER_APPLICATION_STATE_NOT_RUNNING,
        ownership: SpatialAnalyzerOwnership.SPATIAL_ANALYZER_OWNERSHIP_NONE,
      };
}

function snapshot(
  ready: boolean,
): readonly [GetServerInfoResponse, ListCapabilitiesResponse] {
  return [
    {
      version: {
        briosaVersion: briosaProtocolIdentity.briosaVersion,
        sourceRevision: briosaProtocolIdentity.sourceRevision,
        protocolPackage: briosaProtocolIdentity.protocolPackage,
        spatialAnalyzerTarget: briosaProtocolIdentity.spatialAnalyzerTarget,
      },
      workerState: WorkerRuntimeState.WORKER_RUNTIME_STATE_READY,
      spatialAnalyzerConnectionState: ready
        ? SpatialAnalyzerConnectionState.SPATIAL_ANALYZER_CONNECTION_STATE_CONNECTED
        : SpatialAnalyzerConnectionState.SPATIAL_ANALYZER_CONNECTION_STATE_DISCONNECTED,
      spatialAnalyzerExecutionReadinessState: ready
        ? SpatialAnalyzerExecutionReadinessState.SPATIAL_ANALYZER_EXECUTION_READINESS_STATE_EXECUTION_READY
        : SpatialAnalyzerExecutionReadinessState.SPATIAL_ANALYZER_EXECUTION_READINESS_STATE_UNVERIFIED,
      targetIsolationMode:
        TargetIsolationMode.TARGET_ISOLATION_MODE_SINGLE_TENANT,
      compatibility: { major: 2, revision: 0 },
      readyForMp: ready,
    },
    {
      protocolPackage: briosaProtocolIdentity.protocolPackage,
      spatialAnalyzerTarget: briosaProtocolIdentity.spatialAnalyzerTarget,
      operations: [],
    },
  ];
}
