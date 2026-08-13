/* eslint-disable @typescript-eslint/require-await -- Async test doubles implement the transport contract. */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { Metadata, status, type ServiceError } from '@grpc/grpc-js';

import {
  BriosaLifecycleError,
  BriosaOperationError,
  BriosaProtocolError,
  BriosaSpatialAnalyzerError,
  BriosaTransportError,
  createBriosaClient,
  getWorkingDirectory,
} from '../src/index.js';
import { mapServiceError } from '../src/errors.js';
import {
  BriosaClientImplementation,
  type BriosaClient,
} from '../src/client.js';
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
  LifecycleRecoveryGuidance,
  SpatialAnalyzerApplicationState,
  SpatialAnalyzerLifecycleError,
  SpatialAnalyzerLifecycleFailureKind,
  SpatialAnalyzerOwnership,
  SpatialAnalyzerSdkRecoveryState,
  SpatialAnalyzerSdkState,
  type SpatialAnalyzerLifecycleState,
  type SpatialAnalyzerSdkLifecycleState,
} from '../src/generated/protocol/briosa/lifecycle.js';
import {
  ExecutionDisposition,
  OperationError,
  OperationFailureKind,
  RecoveryGuidance,
  ReplayGuidance,
  ReplaySafety,
} from '../src/generated/protocol/briosa/operation_outcomes.js';
import type { OwnedServer, ServerLauncher } from '../src/serverLauncher.js';
import type { ClientTransport } from '../src/transport.js';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

class FakeServer implements OwnedServer {
  readonly target = '127.0.0.1:49152';
  readonly hasExited = false;
  closed = false;
  async close(): Promise<void> {
    this.closed = true;
  }
}

class FakeLauncher implements ServerLauncher {
  readonly server = new FakeServer();
  launchCount = 0;
  async launch(): Promise<OwnedServer> {
    this.launchCount += 1;
    return this.server;
  }
}

class FakeTransport implements ClientTransport {
  readonly calls: string[] = [];
  readonly connectGenerations: number[] = [];
  readonly stopGenerations: number[] = [];
  readonly closeGenerations: number[] = [];
  sdkGeneration = 0;
  connected = false;
  closeApplicationCount = 0;
  launchFailure: ServiceError | null = null;
  publishReadySnapshot = true;

  async getServerSnapshot(): Promise<
    readonly [GetServerInfoResponse, ListCapabilitiesResponse]
  > {
    this.calls.push('snapshot');
    return matchingSnapshot(this.connected && this.publishReadySnapshot);
  }

  async getApplicationState(): Promise<SpatialAnalyzerLifecycleState> {
    this.calls.push('get-sa-state');
    return applicationNotRunning();
  }

  async launchApplication(): Promise<SpatialAnalyzerLifecycleState> {
    this.calls.push('launch-sa');
    if (this.launchFailure !== null) throw this.launchFailure;
    return {
      stateRevision: 2n,
      applicationState:
        SpatialAnalyzerApplicationState.SPATIAL_ANALYZER_APPLICATION_STATE_RUNNING,
      ownership:
        SpatialAnalyzerOwnership.SPATIAL_ANALYZER_OWNERSHIP_SERVER_LAUNCHED,
      applicationGeneration: 2,
    };
  }

  async closeApplication(
    expectedGeneration: number,
  ): Promise<SpatialAnalyzerLifecycleState> {
    this.calls.push('close-sa');
    this.closeApplicationCount += 1;
    this.closeGenerations.push(expectedGeneration);
    return applicationNotRunning();
  }

  async getSdkState(): Promise<SpatialAnalyzerSdkLifecycleState> {
    this.calls.push('get-sdk-state');
    return this.#sdkState();
  }

  async startSdk(): Promise<SpatialAnalyzerSdkLifecycleState> {
    this.calls.push('start-sdk');
    this.sdkGeneration += 1;
    this.connected = false;
    return this.#sdkState();
  }

  async connectSdk(
    expectedGeneration: number,
    reconnect: boolean,
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    this.calls.push(reconnect ? 'reconnect-sdk' : 'connect-sdk');
    this.connectGenerations.push(expectedGeneration);
    this.connected = true;
    return this.#sdkState();
  }

  async stopSdk(
    expectedGeneration: number,
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    this.calls.push('stop-sdk');
    this.stopGenerations.push(expectedGeneration);
    this.sdkGeneration = 0;
    this.connected = false;
    return this.#sdkState();
  }

  async recoverSdk(): Promise<SpatialAnalyzerSdkLifecycleState> {
    this.calls.push('recover-sdk');
    this.sdkGeneration += 1;
    this.connected = false;
    return this.#sdkState();
  }

  async getWorkingDirectory(): Promise<string> {
    this.calls.push('get-working-directory');
    return String.raw`C:\Working`;
  }

  close(): void {
    this.calls.push('close-transport');
  }

  #sdkState(): SpatialAnalyzerSdkLifecycleState {
    return {
      stateRevision: 3n,
      sdkState:
        this.sdkGeneration === 0
          ? SpatialAnalyzerSdkState.SPATIAL_ANALYZER_SDK_STATE_STOPPED
          : this.connected
            ? SpatialAnalyzerSdkState.SPATIAL_ANALYZER_SDK_STATE_READY
            : SpatialAnalyzerSdkState.SPATIAL_ANALYZER_SDK_STATE_RUNNING,
      ...(this.sdkGeneration === 0
        ? {}
        : { sdkGeneration: this.sdkGeneration }),
      connectionState: this.connected
        ? SpatialAnalyzerConnectionState.SPATIAL_ANALYZER_CONNECTION_STATE_CONNECTED
        : SpatialAnalyzerConnectionState.SPATIAL_ANALYZER_CONNECTION_STATE_DISCONNECTED,
      executionReadinessState: this.connected
        ? SpatialAnalyzerExecutionReadinessState.SPATIAL_ANALYZER_EXECUTION_READINESS_STATE_EXECUTION_READY
        : SpatialAnalyzerExecutionReadinessState.SPATIAL_ANALYZER_EXECUTION_READINESS_STATE_UNVERIFIED,
      readyForMp: this.connected,
      recoveryState:
        SpatialAnalyzerSdkRecoveryState.SPATIAL_ANALYZER_SDK_RECOVERY_STATE_NOT_REQUIRED,
    };
  }
}

function createTestClient(
  launcher: FakeLauncher,
  transport: FakeTransport,
): BriosaClient {
  return new BriosaClientImplementation({}, launcher, () => transport);
}

function applicationNotRunning(): SpatialAnalyzerLifecycleState {
  return {
    stateRevision: 1n,
    applicationState:
      SpatialAnalyzerApplicationState.SPATIAL_ANALYZER_APPLICATION_STATE_NOT_RUNNING,
    ownership: SpatialAnalyzerOwnership.SPATIAL_ANALYZER_OWNERSHIP_NONE,
  };
}

function matchingSnapshot(
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
      readyForMp: ready,
    },
    {
      protocolPackage: briosaProtocolIdentity.protocolPackage,
      spatialAnalyzerTarget: briosaProtocolIdentity.spatialAnalyzerTarget,
      operations: [
        {
          operationId: 'file_operations.get_working_directory',
          grpcService: 'briosa.FileOperations',
          rpc: 'GetWorkingDirectory',
          fullyQualifiedMethod: '/briosa.FileOperations/GetWorkingDirectory',
        },
      ],
    },
  ];
}

function serviceError(
  code: status,
  key: string,
  detail: Uint8Array,
): ServiceError {
  const metadata = new Metadata();
  metadata.set(key, Buffer.from(detail));
  return Object.assign(new Error('status text must not be parsed'), {
    code,
    details: 'status text must not be parsed',
    metadata,
  });
}

void test('records merged lifecycle artifact and generated semantics', () => {
  assert.equal(
    briosaProtocolIdentity.artifactName,
    'briosa-protocol-0.2.0-lifecycle-sa-2026.1.0529.7',
  );
  assert.equal(
    briosaProtocolIdentity.sourceRevision,
    'cf8d01288fb52b8880262e76c6a68bc8d1bc743f',
  );
  assert.equal(briosaProtocolIdentity.protocolPackage, 'briosa');
  assert.equal(
    briosaProtocolIdentity.clientGenerationContract,
    'standard-protobuf-grpc',
  );

  const lock = JSON.parse(
    readFileSync(resolve(repositoryRoot, 'protocol.lock.json'), 'utf8'),
  ) as { protocol: { javascript_semantics: { int64: string } } };
  assert.equal(lock.protocol.javascript_semantics.int64, 'bigint');
});

void test('construction is dormant and options fail closed', async () => {
  const launcher = new FakeLauncher();
  void createTestClient(launcher, new FakeTransport());
  assert.equal(launcher.launchCount, 0);
  assert.throws(() => createBriosaClient({ commandTimeoutMs: 0 }), RangeError);
  await assert.rejects(
    () =>
      createTestClient(launcher, new FakeTransport()).start({
        startSpatialAnalyzerSdk: false,
      }),
    TypeError,
  );
});

void test('default startup is ordered and stop leaves SA running', async () => {
  const launcher = new FakeLauncher();
  const transport = new FakeTransport();
  const client = createTestClient(launcher, transport);

  await client.start();
  assert.equal(await getWorkingDirectory(client), String.raw`C:\Working`);
  await client.stop();

  assert.deepEqual(transport.calls, [
    'snapshot',
    'start-sdk',
    'launch-sa',
    'connect-sdk',
    'snapshot',
    'get-working-directory',
    'stop-sdk',
    'close-transport',
  ]);
  assert.equal(launcher.server.closed, true);
  assert.equal(transport.closeApplicationCount, 0);
  await client[Symbol.asyncDispose]();
});

void test('control-plane-only startup admits no MP commands', async () => {
  const transport = new FakeTransport();
  const client = createTestClient(new FakeLauncher(), transport);
  await client.start({
    startSpatialAnalyzerSdk: false,
    launchSpatialAnalyzer: false,
    connectToSpatialAnalyzer: false,
  });
  assert.equal((await client.getServerSnapshot()).readyForMp, false);
  await assert.rejects(() => getWorkingDirectory(client), BriosaLifecycleError);
  assert.deepEqual(transport.calls, ['snapshot', 'snapshot']);
  await client[Symbol.asyncDispose]();
});

void test('post-server lifecycle failure preserves diagnostic control plane', async () => {
  const launcher = new FakeLauncher();
  const transport = new FakeTransport();
  const detail = SpatialAnalyzerLifecycleError.encode({
    kind: SpatialAnalyzerLifecycleFailureKind.SPATIAL_ANALYZER_LIFECYCLE_FAILURE_KIND_LAUNCH_FAILED,
    diagnosticCode: 'sa-launch-failed',
    recoveryGuidance:
      LifecycleRecoveryGuidance.LIFECYCLE_RECOVERY_GUIDANCE_CORRECT_ENVIRONMENT,
    state: applicationNotRunning(),
  }).finish();
  transport.launchFailure = serviceError(
    status.FAILED_PRECONDITION,
    'briosa-spatial-analyzer-lifecycle-error-bin',
    detail,
  );
  const client = createTestClient(launcher, transport);

  await assert.rejects(
    () => client.start(),
    (error: unknown) =>
      error instanceof BriosaSpatialAnalyzerError &&
      error.kind === 'launchFailed' &&
      error.diagnosticCode === 'sa-launch-failed',
  );
  assert.equal(
    (await client.getSpatialAnalyzerState()).applicationState,
    'notRunning',
  );
  assert.equal(launcher.server.closed, false);
  await client.stop();
  assert.equal(launcher.server.closed, true);
  await client[Symbol.asyncDispose]();
});

void test('failed final readiness does not publish MP admission', async () => {
  const transport = new FakeTransport();
  transport.publishReadySnapshot = false;
  const client = createTestClient(new FakeLauncher(), transport);

  await assert.rejects(() => client.start(), BriosaProtocolError);
  assert.equal((await client.getSpatialAnalyzerSdkState()).readyForMp, true);
  await assert.rejects(() => getWorkingDirectory(client), BriosaLifecycleError);
  await client[Symbol.asyncDispose]();
});

void test('concurrent starts share one server and generations are guarded', async () => {
  const launcher = new FakeLauncher();
  const transport = new FakeTransport();
  const client = createTestClient(launcher, transport);

  await Promise.all([client.start(), client.start()]);
  await client.reconnectToSpatialAnalyzer();
  await client.stopSpatialAnalyzerSdk();
  await client.startSpatialAnalyzerSdk();
  await client.closeOwnedSpatialAnalyzer();

  assert.equal(launcher.launchCount, 1);
  assert.deepEqual(transport.connectGenerations, [1, 1]);
  assert.equal(transport.stopGenerations[0], 1);
  assert.deepEqual(transport.closeGenerations, [2]);
  await client[Symbol.asyncDispose]();
});

void test('typed MP error detaches policy and preserves unknown completion', () => {
  const detail = OperationError.encode({
    operationId: 'construction_operations.mutating_operation',
    kind: OperationFailureKind.OPERATION_FAILURE_KIND_WORKER_WATCHDOG_TIMEOUT,
    diagnosticCode: 'worker-execution-watchdog-timeout',
    executionDisposition:
      ExecutionDisposition.EXECUTION_DISPOSITION_STARTED_OUTCOME_UNKNOWN,
    recoveryGuidance: RecoveryGuidance.RECOVERY_GUIDANCE_WORKER_REPLACEMENT,
    replayGuidance: ReplayGuidance.REPLAY_GUIDANCE_RECONCILE_BEFORE_REPLAY,
    replaySafety: ReplaySafety.REPLAY_SAFETY_UNKNOWN,
  }).finish();
  const mapped = mapServiceError(
    serviceError(status.UNAVAILABLE, 'briosa-operation-error-bin', detail),
  );
  assert.ok(mapped instanceof BriosaOperationError);
  assert.equal(
    mapped.operationId,
    'construction_operations.mutating_operation',
  );
  assert.equal(mapped.kind, 'workerWatchdogTimeout');
  assert.equal(mapped.recoveryGuidance, 'workerReplacement');
  assert.equal(mapped.replaySafety, 'unknown');
  assert.equal(mapped.completionUnknown, true);
  assert.equal(mapped.reconciliationRequired, true);
});

void test('transport failures do not expose raw grpc-js errors', () => {
  const error = serviceError(
    status.UNAVAILABLE,
    'unrelated-bin',
    new Uint8Array(),
  );
  const mapped = mapServiceError(error);
  assert.ok(mapped instanceof BriosaTransportError);
  assert.equal(mapped.diagnosticCode, 'transport-unavailable');
  assert.equal(mapped.cause, undefined);
});
