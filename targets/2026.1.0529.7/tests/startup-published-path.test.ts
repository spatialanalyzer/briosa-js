/* eslint-disable @typescript-eslint/require-await -- Async test doubles implement the launcher contract. */

// The published-bounds path (Server 0.10.1 and later) through the real gRPC
// transport and an in-process loopback server. A fake monotonic clock drives
// the startup budget, so a step can answer "late" without waiting: its timer
// never runs unless a test fires it. Each case has a Server 0.10.0 counterpart,
// which must behave as Client 0.5.0 did.

import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';

import {
  Server,
  ServerCredentials,
  status,
  type sendUnaryData,
  type ServerUnaryCall,
} from '@grpc/grpc-js';

import {
  BriosaClientImplementation,
  getWorkingDirectory,
} from '../src/client.js';
import {
  BriosaLifecycleError,
  BriosaProtocolError,
  BriosaStartupError,
  BriosaTransportError,
} from '../src/errors.js';
import {
  DiscoveryServiceService,
  SpatialAnalyzerConnectionState,
  SpatialAnalyzerExecutionReadinessState,
  TargetIsolationMode,
  WorkerRuntimeState,
  type GetServerInfoResponse,
  type LifecycleBounds,
  type ListCapabilitiesResponse,
} from '../src/generated/protocol/briosa/discovery.js';
import { FileOperationsService } from '../src/generated/protocol/briosa/file_operations.js';
import {
  SpatialAnalyzerApplicationState,
  SpatialAnalyzerLifecycleService,
  SpatialAnalyzerOwnership,
  SpatialAnalyzerSdkLifecycleService,
  SpatialAnalyzerSdkRecoveryState,
  SpatialAnalyzerSdkState,
  type SpatialAnalyzerLifecycleState,
  type SpatialAnalyzerSdkLifecycleState,
} from '../src/generated/protocol/briosa/lifecycle.js';
import { MpExecutionState } from '../src/generated/protocol/briosa/operation_outcomes.js';
import { briosaProtocolIdentity } from '../src/generated/protocolIdentity.js';
import type { SpatialAnalyzerLaunchOptions } from '../src/index.js';
import type { OwnedServer, ServerLauncher } from '../src/serverLauncher.js';
import type { StartupClock } from '../src/startupBudget.js';

/** A manual monotonic clock; time moves only when a test moves it. */
class FakeClock implements StartupClock {
  time = 0;
  /** When set, the next now() first moves here and runs every due timer. */
  jumpOnNextRead: number | null = null;
  readonly #timers = new Map<number, { at: number; run: () => void }>();
  #nextId = 1;

  now(): number {
    if (this.jumpOnNextRead !== null) {
      const to = this.jumpOnNextRead;
      this.jumpOnNextRead = null;
      this.advanceTo(to);
    }
    return this.time;
  }

  setTimer(callback: () => void, delayMs: number): unknown {
    const id = this.#nextId++;
    this.#timers.set(id, { at: this.time + delayMs, run: callback });
    return id;
  }

  clearTimer(handle: unknown): void {
    this.#timers.delete(handle as number);
  }

  advanceTo(time: number): void {
    this.time = time;
    for (const [id, timer] of [...this.#timers]) {
      if (timer.at <= time && this.#timers.delete(id)) timer.run();
    }
  }
}

type Rpc =
  | 'GetServerInfo'
  | 'ListCapabilities'
  | 'GetSpatialAnalyzerState'
  | 'LaunchSpatialAnalyzer'
  | 'CloseOwnedSpatialAnalyzer'
  | 'GetSpatialAnalyzerSdkState'
  | 'StartSpatialAnalyzerSdk'
  | 'ConnectToSpatialAnalyzer'
  | 'StopSpatialAnalyzerSdk'
  | 'GetWorkingDirectory';

/** What the server does when it receives the nth call of an RPC (1-based). */
interface Hook {
  readonly rpc: Rpc;
  readonly call: number;
  /** Clock time when the reply leaves, without running due timers. */
  readonly answerAt?: number;
  /** The client's next clock read moves here and runs the due timers. */
  readonly fireTimersOnNextRead?: number;
  /** Fails the call with this gRPC status instead of answering. */
  readonly fail?: status;
  /** Answers with an empty message, which lacks the required state. */
  readonly empty?: boolean;
}

const clock = new FakeClock();
const received: Rpc[] = [];
let hooks: Hook[] = [];
let bounds: LifecycleBounds | undefined;
let sdkGeneration = 0;
let connected = false;
let port = 0;
const server = new Server();

function count(rpc: Rpc): number {
  return received.filter((name) => name === rpc).length;
}

function sdkState(): SpatialAnalyzerSdkLifecycleState {
  return {
    stateRevision: 1n,
    sdkState:
      sdkGeneration === 0
        ? SpatialAnalyzerSdkState.SPATIAL_ANALYZER_SDK_STATE_STOPPED
        : connected
          ? SpatialAnalyzerSdkState.SPATIAL_ANALYZER_SDK_STATE_READY
          : SpatialAnalyzerSdkState.SPATIAL_ANALYZER_SDK_STATE_RUNNING,
    ...(sdkGeneration === 0 ? {} : { sdkGeneration }),
    connectionState: connected
      ? SpatialAnalyzerConnectionState.SPATIAL_ANALYZER_CONNECTION_STATE_CONNECTED
      : SpatialAnalyzerConnectionState.SPATIAL_ANALYZER_CONNECTION_STATE_DISCONNECTED,
    executionReadinessState: connected
      ? SpatialAnalyzerExecutionReadinessState.SPATIAL_ANALYZER_EXECUTION_READINESS_STATE_EXECUTION_READY
      : SpatialAnalyzerExecutionReadinessState.SPATIAL_ANALYZER_EXECUTION_READINESS_STATE_UNVERIFIED,
    readyForMp: connected,
    recoveryState:
      SpatialAnalyzerSdkRecoveryState.SPATIAL_ANALYZER_SDK_RECOVERY_STATE_NOT_REQUIRED,
  };
}

function applicationState(): SpatialAnalyzerLifecycleState {
  return {
    stateRevision: 1n,
    applicationState:
      SpatialAnalyzerApplicationState.SPATIAL_ANALYZER_APPLICATION_STATE_RUNNING,
    ownership:
      SpatialAnalyzerOwnership.SPATIAL_ANALYZER_OWNERSHIP_SERVER_LAUNCHED,
    applicationGeneration: 1,
  };
}

// Records the call, applies its hook, and answers or fails it.
function handle<T>(
  rpc: Rpc,
  answer: () => T,
): (call: ServerUnaryCall<unknown, T>, callback: sendUnaryData<T>) => void {
  return (_call, callback) => {
    received.push(rpc);
    const hook = hooks.find(
      (candidate) => candidate.rpc === rpc && candidate.call === count(rpc),
    );
    if (hook?.answerAt !== undefined) clock.time = hook.answerAt;
    if (hook?.fireTimersOnNextRead !== undefined) {
      clock.jumpOnNextRead = hook.fireTimersOnNextRead;
    }
    if (hook?.fail !== undefined) {
      callback({ code: hook.fail, details: 'scripted failure' }, null);
      return;
    }
    callback(null, hook?.empty === true ? ({} as T) : answer());
  };
}

before(async () => {
  server.addService(DiscoveryServiceService, {
    getServerInfo: handle<GetServerInfoResponse>('GetServerInfo', () => ({
      version: {
        briosaVersion: briosaProtocolIdentity.briosaVersion,
        sourceRevision: briosaProtocolIdentity.sourceRevision,
        protocolPackage: briosaProtocolIdentity.protocolPackage,
        spatialAnalyzerTarget: briosaProtocolIdentity.spatialAnalyzerTarget,
      },
      workerState: WorkerRuntimeState.WORKER_RUNTIME_STATE_READY,
      spatialAnalyzerConnectionState: connected
        ? SpatialAnalyzerConnectionState.SPATIAL_ANALYZER_CONNECTION_STATE_CONNECTED
        : SpatialAnalyzerConnectionState.SPATIAL_ANALYZER_CONNECTION_STATE_DISCONNECTED,
      spatialAnalyzerExecutionReadinessState: connected
        ? SpatialAnalyzerExecutionReadinessState.SPATIAL_ANALYZER_EXECUTION_READINESS_STATE_EXECUTION_READY
        : SpatialAnalyzerExecutionReadinessState.SPATIAL_ANALYZER_EXECUTION_READINESS_STATE_UNVERIFIED,
      targetIsolationMode:
        TargetIsolationMode.TARGET_ISOLATION_MODE_SINGLE_TENANT,
      compatibility: { major: 3, revision: bounds === undefined ? 0 : 1 },
      readyForMp: connected,
      ...(bounds === undefined ? {} : { lifecycleBounds: bounds }),
    })),
    listCapabilities: handle<ListCapabilitiesResponse>(
      'ListCapabilities',
      () => ({
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
      }),
    ),
  });
  server.addService(SpatialAnalyzerLifecycleService, {
    getSpatialAnalyzerState: handle('GetSpatialAnalyzerState', () => ({
      state: applicationState(),
    })),
    launchSpatialAnalyzer: handle('LaunchSpatialAnalyzer', () => ({
      state: applicationState(),
    })),
    closeOwnedSpatialAnalyzer: handle('CloseOwnedSpatialAnalyzer', () => ({
      state: applicationState(),
    })),
  });
  server.addService(SpatialAnalyzerSdkLifecycleService, {
    getSpatialAnalyzerSdkState: handle('GetSpatialAnalyzerSdkState', () => ({
      state: sdkState(),
    })),
    startSpatialAnalyzerSdk: handle('StartSpatialAnalyzerSdk', () => {
      sdkGeneration += 1;
      connected = false;
      return { state: sdkState() };
    }),
    connectToSpatialAnalyzer: handle('ConnectToSpatialAnalyzer', () => {
      connected = true;
      return { state: sdkState() };
    }),
    stopSpatialAnalyzerSdk: handle('StopSpatialAnalyzerSdk', () => {
      sdkGeneration = 0;
      connected = false;
      return { state: sdkState() };
    }),
  });
  server.addService(FileOperationsService, {
    getWorkingDirectory: handle('GetWorkingDirectory', () => ({
      directory: String.raw`C:\Working`,
      execution: {
        state: MpExecutionState.MP_EXECUTION_STATE_SUCCEEDED,
        mpResultCode: 2,
        outputRetrievals: [],
      },
    })),
  });
  port = await new Promise<number>((resolvePromise, reject) => {
    server.bindAsync(
      '127.0.0.1:0',
      ServerCredentials.createInsecure(),
      (error, bound) =>
        error === null ? resolvePromise(bound) : reject(error),
    );
  });
});

after(() => {
  server.forceShutdown();
});

beforeEach(() => {
  clock.time = 0;
  clock.jumpOnNextRead = null;
  received.length = 0;
  hooks = [];
  bounds = undefined;
  sdkGeneration = 0;
  connected = false;
});

class LoopbackLauncher implements ServerLauncher {
  async launch(): Promise<OwnedServer> {
    return {
      target: `127.0.0.1:${port}`,
      hasExited: false,
      close: async () => undefined,
    };
  }
}

// The real gRPC transport, the fake clock for the startup budget.
function client(): BriosaClientImplementation {
  return new BriosaClientImplementation(
    {},
    new LoopbackLauncher(),
    undefined,
    clock,
  );
}

// Allowance 160 s: an omitted budget's deadline is t0 + 180 s.
const published: LifecycleBounds = { startupWithLaunchMilliseconds: 160_000 };

function isTimeout(cause?: (error: unknown) => boolean) {
  return (error: unknown): boolean =>
    error instanceof BriosaStartupError &&
    error.diagnosticCode === 'startup-timeout' &&
    (cause === undefined || cause(error.cause));
}

// Review finding 1: MP admission stays closed after a timed-out startup.

void test('a startup that times out after a ready snapshot admits no MP work', async () => {
  bounds = published;
  // The post-Connect snapshot answers ready at 181 s, past the deadline.
  hooks = [{ rpc: 'ListCapabilities', call: 2, answerAt: 181_000 }];
  const briosa = client();
  await assert.rejects(briosa.start(), isTimeout());
  assert.equal(count('ListCapabilities'), 2);

  const closed = (error: unknown): boolean =>
    error instanceof BriosaLifecycleError &&
    error.diagnosticCode === 'mp-command-admission-closed';
  await assert.rejects(getWorkingDirectory(briosa), closed);
  // A diagnostic read of the partial generation keeps admission closed.
  assert.equal((await briosa.getServerSnapshot()).readyForMp, true);
  assert.equal((await briosa.getSpatialAnalyzerSdkState()).readyForMp, true);
  await assert.rejects(getWorkingDirectory(briosa), closed);
  assert.equal(count('GetWorkingDirectory'), 0);

  // The lifecycle rules after a partial startup: start again needs a stop.
  await assert.rejects(
    briosa.start(),
    (error: unknown) =>
      error instanceof BriosaLifecycleError &&
      error.diagnosticCode === 'startup-partially-completed',
  );
  await briosa.stop();
  await assert.rejects(
    getWorkingDirectory(briosa),
    (error: unknown) =>
      error instanceof BriosaLifecycleError &&
      error.diagnosticCode === 'client-not-started',
  );
  hooks = [];
  await briosa.start();
  assert.equal(await getWorkingDirectory(briosa), String.raw`C:\Working`);
  assert.equal(count('GetWorkingDirectory'), 1);
  await briosa.stop();
});

void test('Server 0.10.0: the same late snapshot completes as in Client 0.5.0', async () => {
  hooks = [{ rpc: 'ListCapabilities', call: 2, answerAt: 181_000 }];
  const briosa = client();
  await briosa.start();
  assert.equal(await getWorkingDirectory(briosa), String.raw`C:\Working`);
  await briosa.stop();
});

// Review finding 2: the deadline is checked immediately before each request
// is submitted, after the request is built.

function lateLaunchOptions(): SpatialAnalyzerLaunchOptions {
  // Reading the option takes until 181 s, as a blocking getter would.
  return {
    get startMinimized(): boolean {
      clock.time = 181_000;
      return false;
    },
  };
}

void test('a launch request built past the deadline is never submitted', async () => {
  bounds = published;
  const briosa = client();
  await assert.rejects(
    briosa.start({ launchOptions: lateLaunchOptions() }),
    isTimeout(),
  );
  assert.equal(count('StartSpatialAnalyzerSdk'), 1);
  assert.equal(count('LaunchSpatialAnalyzer'), 0);
  await briosa.stop();
});

void test('Server 0.10.0: the same launch request is submitted as in Client 0.5.0', async () => {
  const briosa = client();
  await briosa.start({ launchOptions: lateLaunchOptions() });
  assert.equal(count('LaunchSpatialAnalyzer'), 1);
  await briosa.stop();
});

void test('a refresh whose GetServerInfo answers past the deadline submits no ListCapabilities', async () => {
  bounds = published;
  hooks = [{ rpc: 'GetServerInfo', call: 2, answerAt: 181_000 }];
  const briosa = client();
  await assert.rejects(briosa.start(), isTimeout());
  assert.equal(count('GetServerInfo'), 2);
  assert.equal(count('ListCapabilities'), 1);
  await briosa.stop();
});

void test('Server 0.10.0: the same refresh submits ListCapabilities as in Client 0.5.0', async () => {
  hooks = [{ rpc: 'GetServerInfo', call: 2, answerAt: 181_000 }];
  const briosa = client();
  await briosa.start();
  assert.equal(count('ListCapabilities'), 2);
  await briosa.stop();
});

void test('a timer that fires between the two refresh requests stops the second', async () => {
  bounds = published;
  // After GetServerInfo answers, the client's next clock read runs the due
  // 180 s timer, which aborts the startup before ListCapabilities.
  hooks = [{ rpc: 'GetServerInfo', call: 2, fireTimersOnNextRead: 181_000 }];
  const briosa = client();
  await assert.rejects(briosa.start(), isTimeout());
  assert.equal(count('GetServerInfo'), 2);
  assert.equal(count('ListCapabilities'), 1);
  await briosa.stop();
});

// The launch request's options are read inside the call setup, where Client
// 0.5.0 read them: after the signal is sampled and inside its error handling.

void test('Server 0.10.0: a getter that aborts the signal still sends one Launch, as in Client 0.5.0', async () => {
  const briosa = client();
  await briosa.start({
    startSpatialAnalyzerSdk: false,
    launchSpatialAnalyzer: false,
    connectToSpatialAnalyzer: false,
  });
  const caller = new AbortController();
  const state = await briosa.launchSpatialAnalyzer(
    {
      get startMinimized(): boolean {
        caller.abort();
        return false;
      },
    },
    { signal: caller.signal },
  );
  assert.equal(state.applicationState, 'running');
  assert.equal(count('LaunchSpatialAnalyzer'), 1);
  await briosa.stop();
});

for (const path of ['Server 0.10.0', 'published bounds'] as const) {
  void test(`${path}: a getter that throws during startup fails the call setup, as in Client 0.5.0`, async () => {
    if (path === 'published bounds') bounds = published;
    const briosa = client();
    await assert.rejects(
      briosa.start({
        launchOptions: {
          get startMinimized(): boolean {
            // A non-Error value, as a caller's getter may throw.
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw 'sentinel';
          },
        },
      }),
      (error: unknown) =>
        error instanceof Error &&
        error.message === 'Briosa call setup failed.' &&
        error.cause === 'sentinel',
    );
    assert.equal(count('LaunchSpatialAnalyzer'), 0);
    await briosa.stop();
  });
}

// Review finding 3: a step that fails at or past the deadline is the timeout,
// with its own failure as the cause; before the deadline it keeps its error.

const unavailable = (error: unknown): boolean =>
  error instanceof BriosaTransportError &&
  error.diagnosticCode === 'transport-unavailable';
const stateMissing = (error: unknown): boolean =>
  error instanceof BriosaProtocolError &&
  error.diagnosticCode === 'application-state-missing';

for (const [name, hook, failure] of [
  ['UNAVAILABLE', { fail: status.UNAVAILABLE }, unavailable],
  ['a reply without its state', { empty: true }, stateMissing],
] as const) {
  void test(`Launch failing with ${name} after the deadline is the startup timeout`, async () => {
    bounds = published;
    hooks = [
      { rpc: 'LaunchSpatialAnalyzer', call: 1, answerAt: 181_000, ...hook },
    ];
    const briosa = client();
    await assert.rejects(briosa.start(), isTimeout(failure));
    await briosa.stop();
  });

  void test(`Launch failing with ${name} before the deadline keeps its own error`, async () => {
    bounds = published;
    hooks = [
      { rpc: 'LaunchSpatialAnalyzer', call: 1, answerAt: 179_000, ...hook },
    ];
    const briosa = client();
    await assert.rejects(briosa.start(), failure);
    await briosa.stop();
  });

  void test(`Server 0.10.0: Launch failing with ${name} late keeps its own error`, async () => {
    hooks = [
      { rpc: 'LaunchSpatialAnalyzer', call: 1, answerAt: 181_000, ...hook },
    ];
    const briosa = client();
    await assert.rejects(briosa.start(), failure);
    await briosa.stop();
  });
}
