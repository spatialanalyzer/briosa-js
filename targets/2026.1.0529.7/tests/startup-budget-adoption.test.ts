/* eslint-disable @typescript-eslint/require-await -- Async test doubles implement the transport contract. */

// The startup budget sized from published lifecycle bounds
// (client-library-behavioral-contract.md, "Startup budget from published
// lifecycle bounds"). Every branch runs on a fake clock that the client's
// startup budget reads and arms, so no test waits in real time.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BriosaClientImplementation } from '../src/client.js';
import { BriosaCallAbortedError, BriosaStartupError } from '../src/errors.js';
import type {
  BriosaLifecycleBounds,
  BriosaStartOptions,
} from '../src/index.js';
import { briosaProtocolIdentity } from '../src/generated/protocolIdentity.js';
import {
  SpatialAnalyzerConnectionState,
  SpatialAnalyzerExecutionReadinessState,
  TargetIsolationMode,
  WorkerRuntimeState,
  type GetServerInfoResponse,
  type LifecycleBounds,
  type ListCapabilitiesResponse,
} from '../src/generated/protocol/briosa/discovery.js';
import type { GetWorkingDirectoryResult } from '../src/generated/protocol/briosa/file_operations.js';
import {
  SpatialAnalyzerApplicationState,
  SpatialAnalyzerOwnership,
  SpatialAnalyzerSdkRecoveryState,
  SpatialAnalyzerSdkState,
  type SpatialAnalyzerLifecycleState,
  type SpatialAnalyzerSdkLifecycleState,
} from '../src/generated/protocol/briosa/lifecycle.js';
import type { OwnedServer, ServerLauncher } from '../src/serverLauncher.js';
import {
  StartupBudget,
  maximumTimerDelayMs,
  selectStartupAllowance,
  type StartupClock,
} from '../src/startupBudget.js';
import type { ClientTransport } from '../src/transport.js';

/** A manual monotonic clock; time moves only when a test moves it. */
class FakeClock implements StartupClock {
  time = 0;
  /** Every delay the budget armed, in order. */
  readonly delays: number[] = [];
  readonly #timers = new Map<number, { at: number; run: () => void }>();
  #nextId = 1;

  now(): number {
    return this.time;
  }

  setTimer(callback: () => void, delayMs: number): unknown {
    const id = this.#nextId++;
    this.#timers.set(id, { at: this.time + delayMs, run: callback });
    this.delays.push(delayMs);
    return id;
  }

  clearTimer(handle: unknown): void {
    this.#timers.delete(handle as number);
  }

  get pendingTimers(): number {
    return this.#timers.size;
  }

  /** Moves time and runs every timer that falls due, as the event loop would. */
  advanceTo(time: number): void {
    this.time = time;
    for (const [id, timer] of [...this.#timers]) {
      if (timer.at <= time && this.#timers.delete(id)) timer.run();
    }
  }
}

type Phase = 'snapshot' | 'start-sdk' | 'launch-sa' | 'connect-sdk';

interface Script {
  /** Bounds in the first snapshot; later snapshots use `laterBounds`. */
  readonly bounds?: LifecycleBounds;
  readonly laterBounds?: LifecycleBounds;
  /** Clock time when a phase is reached, without running due timers. */
  readonly at?: Partial<Record<Phase | 'launch-server', number>>;
  /** The phase that never answers until the budget's signal aborts. */
  readonly hangAt?: Phase;
  /** Real milliseconds a phase blocks the event loop before it answers. */
  readonly blockMs?: Partial<Record<Phase, number>>;
  /** Clock time when the post-Connect snapshot answers. */
  readonly laterSnapshotAt?: number;
}

class BudgetTransport implements ClientTransport {
  readonly calls: Phase[] = [];
  readonly signals: (AbortSignal | undefined)[] = [];
  #snapshots = 0;
  #sdkGeneration = 0;
  #connected = false;
  #recording = true;

  constructor(
    readonly clock: FakeClock,
    readonly script: Script,
  ) {}

  async getServerSnapshot(
    signal?: AbortSignal,
  ): Promise<readonly [GetServerInfoResponse, ListCapabilitiesResponse]> {
    await this.#reach('snapshot', signal);
    const bounds =
      this.#snapshots++ === 0 ? this.script.bounds : this.script.laterBounds;
    return [
      {
        version: {
          briosaVersion: briosaProtocolIdentity.briosaVersion,
          sourceRevision: briosaProtocolIdentity.sourceRevision,
          protocolPackage: briosaProtocolIdentity.protocolPackage,
          spatialAnalyzerTarget: briosaProtocolIdentity.spatialAnalyzerTarget,
        },
        workerState: WorkerRuntimeState.WORKER_RUNTIME_STATE_READY,
        spatialAnalyzerConnectionState:
          SpatialAnalyzerConnectionState.SPATIAL_ANALYZER_CONNECTION_STATE_CONNECTED,
        spatialAnalyzerExecutionReadinessState:
          SpatialAnalyzerExecutionReadinessState.SPATIAL_ANALYZER_EXECUTION_READINESS_STATE_EXECUTION_READY,
        targetIsolationMode:
          TargetIsolationMode.TARGET_ISOLATION_MODE_SINGLE_TENANT,
        compatibility: { major: 3, revision: bounds === undefined ? 0 : 1 },
        readyForMp: this.#connected,
        ...(bounds === undefined ? {} : { lifecycleBounds: bounds }),
      },
      {
        protocolPackage: briosaProtocolIdentity.protocolPackage,
        spatialAnalyzerTarget: briosaProtocolIdentity.spatialAnalyzerTarget,
        operations: [],
      },
    ];
  }

  async listCapabilities(): Promise<ListCapabilitiesResponse> {
    throw new Error('not used');
  }

  async getApplicationState(): Promise<SpatialAnalyzerLifecycleState> {
    return application();
  }

  async launchApplication(
    _options: unknown,
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerLifecycleState> {
    await this.#reach('launch-sa', signal);
    return application();
  }

  async closeApplication(): Promise<SpatialAnalyzerLifecycleState> {
    return application();
  }

  async getSdkState(): Promise<SpatialAnalyzerSdkLifecycleState> {
    return this.#sdkState();
  }

  async startSdk(
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    await this.#reach('start-sdk', signal);
    this.#sdkGeneration += 1;
    return this.#sdkState();
  }

  async connectSdk(
    _expectedGeneration: number,
    _reconnect: boolean,
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    await this.#reach('connect-sdk', signal);
    this.#connected = true;
    return this.#sdkState();
  }

  async stopSdk(): Promise<SpatialAnalyzerSdkLifecycleState> {
    this.#sdkGeneration = 0;
    this.#connected = false;
    return this.#sdkState();
  }

  async recoverSdk(): Promise<SpatialAnalyzerSdkLifecycleState> {
    throw new Error('not used');
  }

  async getWorkingDirectory(): Promise<GetWorkingDirectoryResult> {
    throw new Error('not used');
  }

  async invokeOperation<TResponse>(): Promise<TResponse> {
    throw new Error('not used');
  }

  close(): void {
    this.#recording = false;
  }

  async #reach(phase: Phase, signal: AbortSignal | undefined): Promise<void> {
    if (!this.#recording) return;
    this.calls.push(phase);
    this.signals.push(signal);
    const later =
      phase === 'snapshot' &&
      this.calls.indexOf('snapshot') < this.calls.length - 1;
    const at = later ? this.script.laterSnapshotAt : this.script.at?.[phase];
    if (at !== undefined) this.clock.time = at;
    const block = this.script.blockMs?.[phase];
    if (block !== undefined) {
      // Busy-waits, so no timer callback can run before this phase answers.
      const until = performance.now() + block;
      while (performance.now() < until) {
        // Blocks the event loop on purpose.
      }
    }
    if (phase !== this.script.hangAt || signal === undefined) return;
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
      sdkState: this.#connected
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

function application(): SpatialAnalyzerLifecycleState {
  return {
    stateRevision: 1n,
    applicationState:
      SpatialAnalyzerApplicationState.SPATIAL_ANALYZER_APPLICATION_STATE_RUNNING,
    ownership:
      SpatialAnalyzerOwnership.SPATIAL_ANALYZER_OWNERSHIP_SERVER_LAUNCHED,
    applicationGeneration: 1,
  };
}

class ClockLauncher implements ServerLauncher {
  constructor(
    readonly clock: FakeClock,
    readonly launchedAt: number | undefined,
  ) {}

  async launch(): Promise<OwnedServer> {
    if (this.launchedAt !== undefined) this.clock.time = this.launchedAt;
    return {
      target: '127.0.0.1:49152',
      hasExited: false,
      close: async () => undefined,
    };
  }
}

interface Harness {
  readonly clock: FakeClock;
  readonly transport: BudgetTransport;
  readonly client: BriosaClientImplementation;
}

function harness(script: Script = {}): Harness {
  const clock = new FakeClock();
  const transport = new BudgetTransport(clock, script);
  const client = new BriosaClientImplementation(
    {},
    new ClockLauncher(clock, script.at?.['launch-server']),
    () => transport,
    clock,
  );
  return { clock, transport, client };
}

/** Lets the startup run until the transport reaches `phase`. */
async function until(transport: BudgetTransport, phase: Phase): Promise<void> {
  for (let turn = 0; turn < 1_000; turn += 1) {
    if (transport.calls.at(-1) === phase) return;
    await new Promise((resolvePromise) => setImmediate(resolvePromise));
  }
  throw new Error(`The startup never reached ${phase}.`);
}

function isStartupTimeout(error: unknown): boolean {
  return (
    error instanceof BriosaStartupError &&
    error.diagnosticCode === 'startup-timeout'
  );
}

/** Asserts that the startup is still waiting at its hanging phase. */
async function stillWaiting(
  started: Promise<void>,
  transport: BudgetTransport,
): Promise<void> {
  let settled = false;
  void started.then(
    () => (settled = true),
    () => (settled = true),
  );
  await new Promise((resolvePromise) => setImmediate(resolvePromise));
  assert.equal(settled, false);
  assert.equal(transport.signals.at(-1)?.aborted, false);
}

// Published bounds as the generated message holds them.
function publish(fields: LifecycleBounds): LifecycleBounds {
  return fields;
}

const withLaunch300 = publish({ startupWithLaunchMilliseconds: 300_000 });

void test('Server 0.10.0: without published bounds the deadline stays at two minutes', async () => {
  const { clock, transport, client } = harness({ hangAt: 'connect-sdk' });
  const started = client.start();
  await until(transport, 'connect-sdk');
  assert.deepEqual(clock.delays, [120_000]);
  clock.advanceTo(119_999);
  await stillWaiting(started, transport);
  clock.advanceTo(120_000);
  await assert.rejects(started, isStartupTimeout);
  await client.stop();
});

void test('an omitted budget adopts the allowance, counted from the start instant', async () => {
  const { clock, transport, client } = harness({
    bounds: withLaunch300,
    at: { 'launch-server': 2_000, snapshot: 5_000 },
    hangAt: 'connect-sdk',
  });
  const started = client.start();
  await until(transport, 'connect-sdk');
  // t0 = 0, before the host launched: 0 + max(120 s, 300 s + 20 s).
  assert.deepEqual(clock.delays, [120_000, 315_000]);
  clock.advanceTo(200_000);
  await stillWaiting(started, transport);
  clock.advanceTo(319_999);
  await stillWaiting(started, transport);
  clock.advanceTo(320_000);
  await assert.rejects(started, isStartupTimeout);
  // One abort signal for every phase: the timer moved, the startup did not restart.
  const budget = transport.signals[0];
  assert.ok(budget instanceof AbortSignal && budget.aborted);
  assert.ok(transport.signals.every((signal) => signal === budget));
  assert.deepEqual(transport.calls, [
    'snapshot',
    'start-sdk',
    'launch-sa',
    'connect-sdk',
  ]);
  await client.stop();
});

void test('the two-minute floor: a short allowance never shortens the budget', async () => {
  const { clock, transport, client } = harness({
    bounds: publish({ startupWithLaunchMilliseconds: 60_000 }),
    hangAt: 'connect-sdk',
  });
  const started = client.start();
  await until(transport, 'connect-sdk');
  assert.deepEqual(clock.delays, [120_000]);
  clock.advanceTo(120_000);
  await assert.rejects(started, isStartupTimeout);
  await client.stop();
});

for (const startupTimeoutMs of [120_000, 30_000, 600_000]) {
  void test(`an explicit ${startupTimeoutMs} ms budget always wins`, async () => {
    const { clock, transport, client } = harness({
      bounds: withLaunch300,
      hangAt: 'connect-sdk',
    });
    const started = client.start({ startupTimeoutMs });
    await until(transport, 'connect-sdk');
    assert.deepEqual(clock.delays, [startupTimeoutMs]);
    clock.advanceTo(startupTimeoutMs - 1);
    await stillWaiting(started, transport);
    clock.advanceTo(startupTimeoutMs);
    await assert.rejects(started, isStartupTimeout);
    await client.stop();
  });
}

void test('late discovery: a snapshot seen at 121 s never extends the budget', async () => {
  // The 120 s timer is due but has not run when the snapshot arrives.
  const { clock, transport, client } = harness({
    bounds: withLaunch300,
    at: { snapshot: 121_000 },
  });
  await assert.rejects(client.start(), isStartupTimeout);
  // No further phase was submitted, and nothing is left armed.
  assert.deepEqual(transport.calls, ['snapshot']);
  assert.deepEqual(clock.delays, [120_000]);
  assert.equal(clock.pendingTimers, 0);
  await client.stop();
});

void test('late discovery: a snapshot seen exactly at the deadline expires', async () => {
  const { clock, transport, client } = harness({
    bounds: withLaunch300,
    at: { snapshot: 120_000 },
  });
  await assert.rejects(client.start(), isStartupTimeout);
  assert.deepEqual(transport.calls, ['snapshot']);
  assert.deepEqual(clock.delays, [120_000]);
  await client.stop();
});

void test('late discovery against Server 0.10.0 behaves as Client 0.5.0', async () => {
  // Without bounds nothing is adopted, so the next phase starts and the due
  // timer ends it, as in Client 0.5.0.
  const { clock, transport, client } = harness({
    at: { snapshot: 121_000 },
    hangAt: 'start-sdk',
  });
  const started = client.start();
  await until(transport, 'start-sdk');
  assert.deepEqual(clock.delays, [120_000]);
  clock.advanceTo(121_000);
  await assert.rejects(started, isStartupTimeout);
  await client.stop();
});

const everyBound = publish({
  startSdkMilliseconds: 150_000,
  launchSpatialAnalyzerMilliseconds: 60_000,
  startupWithLaunchMilliseconds: 200_000,
  startupWithoutLaunchMilliseconds: 190_000,
});

const selections: readonly {
  readonly name: string;
  readonly options: BriosaStartOptions;
  readonly bounds: LifecycleBounds;
  readonly delays: readonly number[];
}[] = [
  {
    name: 'Start SDK, Launch, and Connect use startup with launch',
    options: {},
    bounds: everyBound,
    delays: [120_000, 220_000],
  },
  {
    name: 'Start SDK and Connect use startup without launch',
    options: { launchSpatialAnalyzer: false },
    bounds: everyBound,
    delays: [120_000, 210_000],
  },
  {
    name: 'Start SDK and Launch sum their two allowances',
    options: { connectToSpatialAnalyzer: false },
    bounds: everyBound,
    delays: [120_000, 230_000],
  },
  {
    name: 'Start SDK alone uses its allowance',
    options: { launchSpatialAnalyzer: false, connectToSpatialAnalyzer: false },
    bounds: everyBound,
    delays: [120_000, 170_000],
  },
  {
    name: 'Launch alone uses its allowance',
    options: {
      startSpatialAnalyzerSdk: false,
      connectToSpatialAnalyzer: false,
    },
    bounds: publish({ launchSpatialAnalyzerMilliseconds: 130_000 }),
    delays: [120_000, 150_000],
  },
  {
    name: 'no server phase keeps the deadline',
    options: {
      startSpatialAnalyzerSdk: false,
      launchSpatialAnalyzer: false,
      connectToSpatialAnalyzer: false,
    },
    bounds: everyBound,
    delays: [120_000],
  },
  {
    name: 'a partial set keeps the deadline: Start SDK and Launch without the launch allowance',
    options: { connectToSpatialAnalyzer: false },
    bounds: publish({ startSdkMilliseconds: 150_000 }),
    delays: [120_000],
  },
  {
    name: 'a partial set is never summed: all three without the combined allowance',
    options: {},
    bounds: publish({
      startSdkMilliseconds: 150_000,
      launchSpatialAnalyzerMilliseconds: 60_000,
      connectSpatialAnalyzerMilliseconds: 60_000,
      startupWithoutLaunchMilliseconds: 190_000,
    }),
    delays: [120_000],
  },
  {
    name: 'a zero allowance is unavailable',
    options: {},
    bounds: publish({ startupWithLaunchMilliseconds: 0 }),
    delays: [120_000],
  },
];

for (const { name, options, bounds, delays } of selections) {
  void test(`selection: ${name}`, async () => {
    const { clock, client } = harness({ bounds });
    await client.start(options);
    assert.deepEqual(clock.delays, delays);
    // The budget ends with the startup.
    assert.equal(clock.pendingTimers, 0);
    await client.stop();
  });
}

void test('a deadline beyond the Node.js timer range keeps the bootstrap deadline', async () => {
  const { clock, transport, client } = harness({
    bounds: publish({ startupWithLaunchMilliseconds: 4_294_967_295 }),
    hangAt: 'connect-sdk',
  });
  const started = client.start();
  await until(transport, 'connect-sdk');
  // Never a clamped delay: the 120 s timer stays armed.
  assert.deepEqual(clock.delays, [120_000]);
  clock.advanceTo(120_000);
  await assert.rejects(started, isStartupTimeout);
  await client.stop();
});

void test('the timer range edge: the largest schedulable delay is adopted', async () => {
  const largest = maximumTimerDelayMs - 20_000;
  for (const [allowance, delays] of [
    [largest, [120_000, maximumTimerDelayMs]],
    [largest + 1, [120_000]],
  ] as const) {
    const { clock, client } = harness({
      bounds: publish({ startupWithLaunchMilliseconds: allowance }),
    });
    await client.start();
    assert.deepEqual(clock.delays, delays);
    await client.stop();
  }
});

void test('a sum beyond the timer range keeps the bootstrap deadline', async () => {
  const { clock, client } = harness({
    bounds: publish({
      startSdkMilliseconds: 4_294_967_295,
      launchSpatialAnalyzerMilliseconds: 4_294_967_295,
    }),
  });
  await client.start({ connectToSpatialAnalyzer: false });
  assert.deepEqual(clock.delays, [120_000]);
  await client.stop();
});

void test('adoption happens once: the post-Connect refresh never restarts the budget', async () => {
  const { clock, transport, client } = harness({
    bounds: withLaunch300,
    laterBounds: publish({ startupWithLaunchMilliseconds: 900_000 }),
    at: { 'connect-sdk': 60_000 },
  });
  await client.start();
  assert.deepEqual(transport.calls, [
    'snapshot',
    'start-sdk',
    'launch-sa',
    'connect-sdk',
    'snapshot',
  ]);
  assert.deepEqual(clock.delays, [120_000, 320_000]);
  assert.equal(clock.pendingTimers, 0);
  await client.stop();
});

void test('caller cancellation stays independent of the budget', async () => {
  const { clock, transport, client } = harness({
    bounds: withLaunch300,
    hangAt: 'connect-sdk',
  });
  const caller = new AbortController();
  const started = client.start({ signal: caller.signal });
  await until(transport, 'connect-sdk');
  caller.abort();
  await assert.rejects(
    started,
    (error: unknown) =>
      error instanceof BriosaCallAbortedError &&
      !(error instanceof BriosaStartupError),
  );
  // The startup itself keeps its own adopted deadline.
  assert.equal(transport.signals.at(-1)?.aborted, false);
  assert.deepEqual(clock.delays, [120_000, 320_000]);
  clock.advanceTo(320_000);
  assert.equal(transport.signals.at(-1)?.aborted, true);
  await client.stop();
});

void test('the published allowance is chosen by the selected phases', () => {
  const bounds: BriosaLifecycleBounds = {
    startSdkMs: 1,
    launchSpatialAnalyzerMs: 2,
    connectSpatialAnalyzerMs: 4,
    recoverSdkMs: 8,
    stopSdkMs: 16,
    closeOwnedSpatialAnalyzerMs: 32,
    startupWithLaunchMs: 64,
    startupWithoutLaunchMs: 128,
    hostGracefulShutdown: { kind: 'unbounded' },
  };
  const choose = (s: boolean, l: boolean, c: boolean): number | null =>
    selectStartupAllowance(bounds, {
      startSpatialAnalyzerSdk: s,
      launchSpatialAnalyzer: l,
      connectToSpatialAnalyzer: c,
    });
  assert.equal(choose(true, true, true), 64);
  assert.equal(choose(true, false, true), 128);
  assert.equal(choose(true, true, false), 3);
  assert.equal(choose(true, false, false), 1);
  assert.equal(choose(false, true, false), 2);
  assert.equal(choose(false, false, false), null);
  // Connect without Start SDK is invalid and never sized.
  assert.equal(choose(false, true, true), null);
  assert.equal(choose(false, false, true), null);
  assert.equal(
    selectStartupAllowance(undefined, {
      startSpatialAnalyzerSdk: true,
      launchSpatialAnalyzer: true,
      connectToSpatialAnalyzer: true,
    }),
    null,
  );
});

void test('adoption never revives a finished or expired budget', () => {
  const phases = {
    startSpatialAnalyzerSdk: true,
    launchSpatialAnalyzer: true,
    connectToSpatialAnalyzer: true,
  };
  const bounds: BriosaLifecycleBounds = {
    startSdkMs: null,
    launchSpatialAnalyzerMs: null,
    connectSpatialAnalyzerMs: null,
    recoverSdkMs: null,
    stopSdkMs: null,
    closeOwnedSpatialAnalyzerMs: null,
    startupWithLaunchMs: 300_000,
    startupWithoutLaunchMs: null,
    hostGracefulShutdown: { kind: 'unavailable' },
  };

  const finished = new FakeClock();
  const done = new StartupBudget(120_000, false, finished);
  done.finish();
  assert.equal(done.adopt(bounds, phases), 'kept');
  assert.deepEqual(finished.delays, [120_000]);
  assert.equal(finished.pendingTimers, 0);

  const expired = new FakeClock();
  const late = new StartupBudget(120_000, false, expired);
  expired.advanceTo(120_000);
  assert.equal(late.signal.aborted, true);
  assert.equal(late.adopt(bounds, phases), 'kept');
  assert.deepEqual(expired.delays, [120_000]);

  const once = new FakeClock();
  const twice = new StartupBudget(120_000, false, once);
  assert.equal(twice.adopt(bounds, phases), 'extended');
  assert.equal(
    twice.adopt({ ...bounds, startupWithLaunchMs: 900_000 }, phases),
    'kept',
  );
  assert.deepEqual(once.delays, [120_000, 320_000]);
  twice.finish();
  once.advanceTo(1_000_000);
  assert.equal(twice.signal.aborted, false);
});

// Expiry checks with published bounds (Server 0.10.1 and later): the startup
// submits no phase and publishes no readiness once its deadline has passed,
// even when the deadline's timer has not run yet. Without published bounds
// (Server 0.10.0) the startup keeps Client 0.5.0's timing, checks included.

void test('real clock: an explicit budget that expired during discovery submits no phase', async () => {
  const clock = new FakeClock();
  const transport = new BudgetTransport(clock, {
    bounds: withLaunch300,
    blockMs: { snapshot: 80 },
    hangAt: 'start-sdk',
  });
  const client = new BriosaClientImplementation(
    {},
    new ClockLauncher(clock, undefined),
    () => transport,
  );
  await assert.rejects(
    client.start({ startupTimeoutMs: 10 }),
    isStartupTimeout,
  );
  assert.deepEqual(transport.calls, ['snapshot']);
  await client.stop();
});

void test('real clock, Server 0.10.0: the same expiry keeps Client 0.5.0 timing', async () => {
  // As in Client 0.5.0, the next phase starts before the due timer runs, and
  // the timer then ends it.
  const clock = new FakeClock();
  const transport = new BudgetTransport(clock, {
    blockMs: { snapshot: 80 },
    hangAt: 'start-sdk',
  });
  const client = new BriosaClientImplementation(
    {},
    new ClockLauncher(clock, undefined),
    () => transport,
  );
  await assert.rejects(
    client.start({ startupTimeoutMs: 10 }),
    isStartupTimeout,
  );
  assert.deepEqual(transport.calls, ['snapshot', 'start-sdk']);
  await client.stop();
});

void test('an omitted budget with a partial allowance expires at 121 s without another phase', async () => {
  const { clock, transport, client } = harness({
    // Start SDK, Launch, and Connect need startupWithLaunchMs, which is absent.
    bounds: publish({ startSdkMilliseconds: 150_000 }),
    at: { snapshot: 121_000 },
  });
  await assert.rejects(client.start(), isStartupTimeout);
  assert.deepEqual(transport.calls, ['snapshot']);
  assert.deepEqual(clock.delays, [120_000]);
  await client.stop();
});

for (const [phase, after] of [
  ['start-sdk', 'launch-sa'],
  ['launch-sa', 'connect-sdk'],
  ['connect-sdk', 'snapshot'],
] as const) {
  void test(`a ${phase} answer after the adopted deadline submits nothing more`, async () => {
    // Allowance 160 s: deadline t0 + 180 s. The answer arrives at 181 s,
    // before the timer has run.
    const { clock, transport, client } = harness({
      bounds: publish({ startupWithLaunchMilliseconds: 160_000 }),
      at: { [phase]: 181_000 },
    });
    await assert.rejects(client.start(), isStartupTimeout);
    assert.deepEqual(clock.delays, [120_000, 180_000]);
    // The late phase is the last one sent: the next never starts.
    const sent = transport.calls.slice(1);
    assert.equal(sent.at(-1), phase);
    assert.equal(sent.includes(after), false);
    await client.stop();
  });
}

void test('an answer at exactly the adopted deadline publishes no readiness', async () => {
  const { transport, client } = harness({
    bounds: publish({ startupWithLaunchMilliseconds: 160_000 }),
    laterBounds: publish({ startupWithLaunchMilliseconds: 160_000 }),
    at: { 'connect-sdk': 100_000 },
    laterSnapshotAt: 180_000,
  });
  // The second snapshot answers at the deadline; the startup must not publish.
  await assert.rejects(client.start(), isStartupTimeout);
  assert.deepEqual(transport.calls, [
    'snapshot',
    'start-sdk',
    'launch-sa',
    'connect-sdk',
    'snapshot',
  ]);
  await client.stop();
});

void test('Server 0.10.0: an answer after the deadline keeps Client 0.5.0 behavior', async () => {
  // Client 0.5.0 checks no clock between phases; only its timer ends a
  // startup. A fake timer that never runs therefore lets this one finish.
  const { clock, transport, client } = harness({
    at: { 'connect-sdk': 121_000 },
  });
  await client.start();
  assert.deepEqual(transport.calls, [
    'snapshot',
    'start-sdk',
    'launch-sa',
    'connect-sdk',
    'snapshot',
  ]);
  assert.deepEqual(clock.delays, [120_000]);
  await client.stop();
});

void test('start options are read in Client 0.5.0 order, startupTimeoutMs once', async () => {
  const reads: string[] = [];
  let timeoutReads = 0;
  const options = new Proxy(
    {},
    {
      get(_target, property): unknown {
        reads.push(String(property));
        // A getter that would change the budget on a second read.
        if (property === 'startupTimeoutMs')
          return 30_000 + 1_000 * timeoutReads++;
        return undefined;
      },
    },
  ) as BriosaStartOptions;
  const { clock, transport, client } = harness({ hangAt: 'connect-sdk' });
  const started = client.start(options);
  await until(transport, 'connect-sdk');
  // The same reads, in the same order, as Client 0.5.0's normalization.
  assert.deepEqual(reads, [
    'logging',
    'serverSelection',
    'startSpatialAnalyzerSdk',
    'launchSpatialAnalyzer',
    'connectToSpatialAnalyzer',
    'launchOptions',
    'startupTimeoutMs',
    'signal',
    'logging',
  ]);
  assert.deepEqual(clock.delays, [30_000]);
  clock.advanceTo(30_000);
  await assert.rejects(started, isStartupTimeout);
  await client.stop();
});
