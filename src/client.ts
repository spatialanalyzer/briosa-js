import { status } from '@grpc/grpc-js';

import {
  BriosaCallAbortedError,
  BriosaError,
  BriosaLifecycleError,
  BriosaProtocolError,
  BriosaStartupError,
  isServiceError,
  mapServiceError,
} from './errors.js';
import type {
  BriosaCallOptions,
  BriosaClientOptions,
  BriosaLifecycleCallOptions,
  BriosaServerSnapshot,
  BriosaStartOptions,
  NormalizedBriosaStartOptions,
  SpatialAnalyzerLaunchOptions,
  SpatialAnalyzerLifecycleState,
  SpatialAnalyzerSdkLifecycleState,
  SpatialAnalyzerSdkRecoveryMode,
} from './models.js';
import {
  normalizeStartOptions,
  validateClientOptions,
  validateLaunchOptions,
} from './models.js';
import {
  mapApplicationState,
  mapSdkState,
  mapSnapshot,
} from './protocolMapping.js';
import {
  LocalServerLauncher,
  type OwnedServer,
  type ServerLauncher,
} from './serverLauncher.js';
import {
  type ClientTransport,
  GrpcClientTransport,
  type OperationCodec,
} from './transport.js';

const getWorkingDirectoryInternal = Symbol('getWorkingDirectoryInternal');
const invokeOperationInternal = Symbol('invokeOperationInternal');

interface Session {
  readonly server: OwnedServer;
  readonly transport: ClientTransport;
  snapshot: BriosaServerSnapshot;
  applicationState: SpatialAnalyzerLifecycleState | null;
  sdkState: SpatialAnalyzerSdkLifecycleState | null;
  startupCompleted: boolean;
  commandAdmissionOpen: boolean;
  activeCommands: number;
  commandsDrained: Promise<void>;
  resolveCommandsDrained: (() => void) | null;
}

type TransportFactory = (target: string) => ClientTransport;

/** Opaque public handle for one reusable local Briosa server session. */
export interface BriosaClient {
  start(options?: BriosaStartOptions): Promise<void>;
  getServerSnapshot(
    options?: BriosaLifecycleCallOptions,
  ): Promise<BriosaServerSnapshot>;
  getSpatialAnalyzerState(
    options?: BriosaLifecycleCallOptions,
  ): Promise<SpatialAnalyzerLifecycleState>;
  launchSpatialAnalyzer(
    launchOptions?: SpatialAnalyzerLaunchOptions,
    options?: BriosaLifecycleCallOptions,
  ): Promise<SpatialAnalyzerLifecycleState>;
  closeOwnedSpatialAnalyzer(
    options?: BriosaLifecycleCallOptions,
  ): Promise<SpatialAnalyzerLifecycleState>;
  getSpatialAnalyzerSdkState(
    options?: BriosaLifecycleCallOptions,
  ): Promise<SpatialAnalyzerSdkLifecycleState>;
  startSpatialAnalyzerSdk(
    options?: BriosaLifecycleCallOptions,
  ): Promise<SpatialAnalyzerSdkLifecycleState>;
  connectToSpatialAnalyzer(
    options?: BriosaLifecycleCallOptions,
  ): Promise<SpatialAnalyzerSdkLifecycleState>;
  reconnectToSpatialAnalyzer(
    options?: BriosaLifecycleCallOptions,
  ): Promise<SpatialAnalyzerSdkLifecycleState>;
  stopSpatialAnalyzerSdk(
    options?: BriosaLifecycleCallOptions,
  ): Promise<SpatialAnalyzerSdkLifecycleState>;
  recoverSpatialAnalyzerSdk(
    mode: SpatialAnalyzerSdkRecoveryMode,
    options?: BriosaLifecycleCallOptions,
  ): Promise<SpatialAnalyzerSdkLifecycleState>;
  stop(): Promise<void>;
  [Symbol.asyncDispose](): Promise<void>;
}

/** @internal Concrete implementation; not exported from the package root. */
export class BriosaClientImplementation implements BriosaClient {
  readonly #options: BriosaClientOptions;
  readonly #serverLauncher: ServerLauncher;
  readonly #transportFactory: TransportFactory;
  #lockTail: Promise<void> = Promise.resolve();
  #session: Session | null = null;
  #startTask: Promise<void> | null = null;
  #stopTask: Promise<void> | null = null;
  #finallyDisposed = false;

  /** @internal Use createBriosaClient. */
  constructor(
    options: BriosaClientOptions = {},
    serverLauncher: ServerLauncher = new LocalServerLauncher(),
    transportFactory: TransportFactory = (target) =>
      new GrpcClientTransport(target),
  ) {
    validateClientOptions(options);
    this.#options = options;
    this.#serverLauncher = serverLauncher;
    this.#transportFactory = transportFactory;
  }

  async start(options: BriosaStartOptions = {}): Promise<void> {
    const normalized = normalizeStartOptions(options);
    const selected = await this.#withLock(() => {
      this.#ensureOpen();
      if (this.#session?.startupCompleted === true) return { task: null };
      if (this.#startTask !== null) return { task: this.#startTask };
      if (this.#session !== null) {
        throw new BriosaLifecycleError('startup-partially-completed');
      }
      if (this.#stopTask !== null) {
        throw new BriosaLifecycleError('client-stop-in-progress');
      }
      const startTask = this.#runStart(normalized);
      this.#startTask = startTask;
      void startTask
        .finally(() => {
          if (this.#startTask === startTask) this.#startTask = null;
        })
        .catch(() => undefined);
      return { task: startTask };
    });
    if (selected.task !== null) {
      await waitForCaller(selected.task, normalized.signal);
    }
  }

  getServerSnapshot(
    options: BriosaLifecycleCallOptions = {},
  ): Promise<BriosaServerSnapshot> {
    return this.#runLifecycle(async (session) => {
      try {
        const snapshot = mapSnapshot(
          ...(await session.transport.getServerSnapshot(options.signal)),
        );
        updateSnapshot(session, snapshot);
        return snapshot;
      } catch (error) {
        throw mapTransportFailure(error, session.applicationState);
      }
    });
  }

  getSpatialAnalyzerState(
    options: BriosaLifecycleCallOptions = {},
  ): Promise<SpatialAnalyzerLifecycleState> {
    return this.#runLifecycle((session) =>
      this.#refreshApplicationState(session, options.signal),
    );
  }

  launchSpatialAnalyzer(
    launchOptions: SpatialAnalyzerLaunchOptions = {},
    options: BriosaLifecycleCallOptions = {},
  ): Promise<SpatialAnalyzerLifecycleState> {
    validateLaunchOptions(launchOptions);
    return this.#runLifecycle(async (session) => {
      try {
        const state = mapApplicationState(
          await session.transport.launchApplication(
            launchOptions,
            options.signal,
          ),
        );
        session.applicationState = state;
        return state;
      } catch (error) {
        throw mapTransportFailure(error, session.applicationState);
      }
    });
  }

  closeOwnedSpatialAnalyzer(
    options: BriosaLifecycleCallOptions = {},
  ): Promise<SpatialAnalyzerLifecycleState> {
    return this.#runLifecycle(async (session) => {
      const current = await this.#ensureApplicationState(
        session,
        options.signal,
      );
      const generation = requireGeneration(
        current.applicationGeneration,
        'application-generation-unavailable',
      );
      try {
        const state = mapApplicationState(
          await session.transport.closeApplication(generation, options.signal),
        );
        session.applicationState = state;
        return state;
      } catch (error) {
        throw mapTransportFailure(error, current);
      }
    });
  }

  getSpatialAnalyzerSdkState(
    options: BriosaLifecycleCallOptions = {},
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    return this.#runLifecycle((session) =>
      this.#refreshSdkState(session, options.signal),
    );
  }

  startSpatialAnalyzerSdk(
    options: BriosaLifecycleCallOptions = {},
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    return this.#runLifecycle(async (session) => {
      try {
        const state = mapSdkState(
          await session.transport.startSdk(options.signal),
        );
        updateSdkState(session, state);
        return state;
      } catch (error) {
        throw mapTransportFailure(error, session.applicationState);
      }
    });
  }

  connectToSpatialAnalyzer(
    options: BriosaLifecycleCallOptions = {},
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    return this.#connectSdk(false, options.signal);
  }

  reconnectToSpatialAnalyzer(
    options: BriosaLifecycleCallOptions = {},
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    return this.#connectSdk(true, options.signal);
  }

  stopSpatialAnalyzerSdk(
    options: BriosaLifecycleCallOptions = {},
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    return this.#sdkGenerationTransition((transport, generation) =>
      transport.stopSdk(generation, options.signal),
    );
  }

  recoverSpatialAnalyzerSdk(
    mode: SpatialAnalyzerSdkRecoveryMode,
    options: BriosaLifecycleCallOptions = {},
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    if (mode !== 'replaceWithoutReplay') {
      throw new TypeError("mode must be 'replaceWithoutReplay'.");
    }
    return this.#sdkGenerationTransition((transport, generation) =>
      transport.recoverSdk(generation, options.signal),
    );
  }

  async stop(): Promise<void> {
    const selected = await this.#withLock(() => {
      this.#ensureOpen();
      return { task: this.#getOrCreateStopTask() };
    });
    await selected.task;
  }

  async [Symbol.asyncDispose](): Promise<void> {
    const selected = await this.#withLock(() => {
      if (this.#finallyDisposed) return { task: null };
      this.#finallyDisposed = true;
      return { task: this.#getOrCreateStopTask() };
    });
    if (selected.task !== null) await selected.task;
  }

  async [getWorkingDirectoryInternal](
    options: BriosaCallOptions = {},
  ): Promise<string> {
    const session = await this.#withLock(() => {
      this.#ensureOpen();
      if (this.#startTask !== null) {
        throw new BriosaLifecycleError('client-start-in-progress');
      }
      const current = this.#requireSession();
      if (!current.commandAdmissionOpen) {
        throw new BriosaLifecycleError('mp-command-admission-closed');
      }
      current.activeCommands += 1;
      if (current.activeCommands === 1) {
        current.commandsDrained = new Promise<void>((resolvePromise) => {
          current.resolveCommandsDrained = resolvePromise;
        });
      }
      return current;
    });
    try {
      return await session.transport.getWorkingDirectory(
        this.#options.commandTimeoutMs ?? null,
        options.signal,
      );
    } catch (error) {
      throw mapTransportFailure(error, session.applicationState);
    } finally {
      await this.#withLock(() => {
        session.activeCommands -= 1;
        if (session.activeCommands === 0) {
          session.resolveCommandsDrained?.();
          session.resolveCommandsDrained = null;
        }
      });
    }
  }

  async [invokeOperationInternal]<TRequest, TResponse>(
    service: string,
    rpc: string,
    request: TRequest,
    requestCodec: OperationCodec<TRequest>,
    responseCodec: OperationCodec<TResponse>,
    options: BriosaCallOptions = {},
  ): Promise<TResponse> {
    const session = await this.#withLock(() => {
      this.#ensureOpen();
      if (this.#startTask !== null) {
        throw new BriosaLifecycleError('client-start-in-progress');
      }
      const current = this.#requireSession();
      if (!current.commandAdmissionOpen) {
        throw new BriosaLifecycleError('mp-command-admission-closed');
      }
      current.activeCommands += 1;
      if (current.activeCommands === 1) {
        current.commandsDrained = new Promise<void>((resolvePromise) => {
          current.resolveCommandsDrained = resolvePromise;
        });
      }
      return current;
    });
    try {
      return await session.transport.invokeOperation(
        service,
        rpc,
        request,
        requestCodec,
        responseCodec,
        this.#options.commandTimeoutMs ?? null,
        options.signal,
      );
    } catch (error) {
      throw mapTransportFailure(error, session.applicationState);
    } finally {
      await this.#withLock(() => {
        session.activeCommands -= 1;
        if (session.activeCommands === 0) {
          session.resolveCommandsDrained?.();
          session.resolveCommandsDrained = null;
        }
      });
    }
  }

  async #runStart(options: NormalizedBriosaStartOptions): Promise<void> {
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      options.startupTimeoutMs,
    );
    try {
      await this.#startInner(options, controller.signal);
    } catch (error) {
      if (controller.signal.aborted) {
        throw new BriosaStartupError('startup-timeout', { cause: error });
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  async #startInner(
    options: NormalizedBriosaStartOptions,
    signal: AbortSignal,
  ): Promise<void> {
    let server: OwnedServer | null = null;
    let transport: ClientTransport | null = null;
    let session: Session | null = null;
    try {
      server = await this.#serverLauncher.launch();
      transport = this.#transportFactory(server.target);
      const snapshot = await this.#waitForServer(server, transport, signal);
      session = createSession(server, transport, snapshot);
      await this.#withLock(() => {
        this.#ensureOpen();
        this.#session = session;
      });
      server = null;
      transport = null;

      if (options.startSpatialAnalyzerSdk) {
        updateSdkState(
          session,
          mapSdkState(await session.transport.startSdk(signal)),
        );
      }
      if (options.launchSpatialAnalyzer) {
        session.applicationState = mapApplicationState(
          await session.transport.launchApplication(
            options.launchOptions,
            signal,
          ),
        );
      }
      if (options.connectToSpatialAnalyzer) {
        const sdk = await this.#ensureSdkState(session, signal);
        const generation = requireGeneration(
          sdk.sdkGeneration,
          'sdk-generation-unavailable',
        );
        const connected = mapSdkState(
          await session.transport.connectSdk(generation, false, signal),
        );
        updateSdkState(session, connected);
        updateSnapshot(
          session,
          mapSnapshot(...(await session.transport.getServerSnapshot(signal))),
        );
        if (!connected.readyForMp || !session.snapshot.readyForMp) {
          throw new BriosaProtocolError('startup-readiness-not-established');
        }
      }
      publishStartup(session);
    } catch (error) {
      throw mapTransportFailure(error, session?.applicationState ?? null);
    } finally {
      if (session === null) {
        transport?.close();
        await server?.close();
      }
    }
  }

  async #waitForServer(
    server: OwnedServer,
    transport: ClientTransport,
    signal: AbortSignal,
  ): Promise<BriosaServerSnapshot> {
    while (true) {
      if (server.hasExited) {
        throw new BriosaStartupError('server-process-exited');
      }
      try {
        return mapSnapshot(...(await transport.getServerSnapshot(signal)));
      } catch (error) {
        if (!isServiceError(error) || error.code !== status.UNAVAILABLE) {
          throw error;
        }
        await abortableDelay(50, signal);
      }
    }
  }

  #connectSdk(
    reconnect: boolean,
    signal: AbortSignal | undefined,
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    return this.#runLifecycle(async (session) => {
      const current = await this.#ensureSdkState(session, signal);
      const generation = requireGeneration(
        current.sdkGeneration,
        'sdk-generation-unavailable',
      );
      try {
        const state = mapSdkState(
          await session.transport.connectSdk(generation, reconnect, signal),
        );
        updateSdkState(session, state);
        return state;
      } catch (error) {
        throw mapTransportFailure(error, session.applicationState);
      }
    });
  }

  #sdkGenerationTransition(
    transition: (
      transport: ClientTransport,
      generation: number,
    ) => Promise<unknown>,
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    return this.#runLifecycle(async (session) => {
      const current = await this.#ensureSdkState(session);
      const generation = requireGeneration(
        current.sdkGeneration,
        'sdk-generation-unavailable',
      );
      try {
        const state = mapSdkState(
          (await transition(session.transport, generation)) as Parameters<
            typeof mapSdkState
          >[0],
        );
        updateSdkState(session, state);
        return state;
      } catch (error) {
        throw mapTransportFailure(error, session.applicationState);
      }
    });
  }

  #runLifecycle<T>(operation: (session: Session) => Promise<T>): Promise<T> {
    return this.#withLock(async () => {
      this.#ensureOpen();
      if (this.#startTask !== null) {
        throw new BriosaLifecycleError('client-start-in-progress');
      }
      if (this.#stopTask !== null) {
        throw new BriosaLifecycleError('client-stop-in-progress');
      }
      return await operation(this.#requireSession());
    });
  }

  async #refreshApplicationState(
    session: Session,
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerLifecycleState> {
    try {
      const state = mapApplicationState(
        await session.transport.getApplicationState(signal),
      );
      session.applicationState = state;
      return state;
    } catch (error) {
      throw mapTransportFailure(error, session.applicationState);
    }
  }

  #ensureApplicationState(
    session: Session,
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerLifecycleState> {
    return session.applicationState === null
      ? this.#refreshApplicationState(session, signal)
      : Promise.resolve(session.applicationState);
  }

  async #refreshSdkState(
    session: Session,
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    try {
      const state = mapSdkState(await session.transport.getSdkState(signal));
      updateSdkState(session, state);
      return state;
    } catch (error) {
      throw mapTransportFailure(error, session.applicationState);
    }
  }

  #ensureSdkState(
    session: Session,
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    return session.sdkState === null
      ? this.#refreshSdkState(session, signal)
      : Promise.resolve(session.sdkState);
  }

  #getOrCreateStopTask(): Promise<void> {
    if (this.#stopTask === null) {
      const task = this.#stopInner(this.#startTask);
      this.#stopTask = task;
      void task
        .finally(() => {
          if (this.#stopTask === task) this.#stopTask = null;
        })
        .catch(() => undefined);
    }
    return this.#stopTask;
  }

  async #stopInner(pendingStart: Promise<void> | null): Promise<void> {
    if (pendingStart !== null) {
      try {
        await pendingStart;
      } catch (error) {
        if (!(error instanceof BriosaError)) throw error;
      }
    }
    const session = await this.#withLock(() => {
      const current = this.#session;
      this.#session = null;
      if (current !== null) {
        current.commandAdmissionOpen = false;
        if (current.activeCommands === 0) current.resolveCommandsDrained?.();
      }
      return current;
    });
    if (session === null) return;
    await session.commandsDrained;
    await this.#stopSdkBestEffort(session);
    session.transport.close();
    await session.server.close();
  }

  async #stopSdkBestEffort(session: Session): Promise<void> {
    try {
      const state = await this.#ensureSdkState(session);
      if (state.sdkGeneration !== null && state.sdkState !== 'stopped') {
        await session.transport.stopSdk(state.sdkGeneration);
      }
    } catch (error) {
      if (!(error instanceof BriosaError) && !isServiceError(error))
        throw error;
    }
  }

  async #withLock<T>(operation: () => T | Promise<T>): Promise<T> {
    const previous = this.#lockTail;
    let release!: () => void;
    this.#lockTail = new Promise<void>((resolvePromise) => {
      release = resolvePromise;
    });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }

  #requireSession(): Session {
    if (this.#session === null) {
      throw new BriosaLifecycleError('client-not-started');
    }
    return this.#session;
  }

  #ensureOpen(): void {
    if (this.#finallyDisposed) {
      throw new BriosaLifecycleError('client-finally-disposed');
    }
  }
}

export function createBriosaClient(
  options: BriosaClientOptions = {},
): BriosaClient {
  return new BriosaClientImplementation(options);
}

export function getWorkingDirectory(
  client: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<string> {
  if (!(client instanceof BriosaClientImplementation)) {
    return Promise.reject(
      new TypeError('client must be created by createBriosaClient().'),
    );
  }
  return client[getWorkingDirectoryInternal](options);
}

/** @internal Shared admission and error mapping for handwritten MP functions. */
export function invokeClientOperation<TRequest, TResponse>(
  client: BriosaClient,
  service: string,
  rpc: string,
  request: TRequest,
  requestCodec: OperationCodec<TRequest>,
  responseCodec: OperationCodec<TResponse>,
  options: BriosaCallOptions = {},
): Promise<TResponse> {
  if (!(client instanceof BriosaClientImplementation)) {
    return Promise.reject(
      new TypeError('client must be created by createBriosaClient().'),
    );
  }
  return client[invokeOperationInternal](
    service,
    rpc,
    request,
    requestCodec,
    responseCodec,
    options,
  );
}

function createSession(
  server: OwnedServer,
  transport: ClientTransport,
  snapshot: BriosaServerSnapshot,
): Session {
  return {
    server,
    transport,
    snapshot,
    applicationState: null,
    sdkState: null,
    startupCompleted: false,
    commandAdmissionOpen: false,
    activeCommands: 0,
    commandsDrained: Promise.resolve(),
    resolveCommandsDrained: null,
  };
}

function updateSdkState(
  session: Session,
  state: SpatialAnalyzerSdkLifecycleState,
): void {
  session.sdkState = state;
  refreshCommandAdmission(session);
}

function updateSnapshot(
  session: Session,
  snapshot: BriosaServerSnapshot,
): void {
  session.snapshot = snapshot;
  refreshCommandAdmission(session);
}

function publishStartup(session: Session): void {
  session.startupCompleted = true;
  refreshCommandAdmission(session);
}

function refreshCommandAdmission(session: Session): void {
  session.commandAdmissionOpen =
    session.snapshot.readyForMp && session.sdkState?.readyForMp === true;
}

function requireGeneration(
  generation: number | null,
  diagnosticCode: string,
): number {
  if (generation === null || generation <= 0) {
    throw new BriosaLifecycleError(diagnosticCode);
  }
  return generation;
}

function mapTransportFailure(
  error: unknown,
  applicationState: SpatialAnalyzerLifecycleState | null,
): Error {
  if (error instanceof BriosaError) {
    return error;
  }
  return isServiceError(error)
    ? mapServiceError(error, applicationState)
    : error instanceof Error
      ? error
      : new Error('Briosa transport operation failed.', { cause: error });
}

function waitForCaller(
  task: Promise<void>,
  signal: AbortSignal | undefined,
): Promise<void> {
  if (signal === undefined) return task;
  if (signal.aborted) {
    return Promise.reject(new BriosaCallAbortedError(signal.reason));
  }
  return new Promise<void>((resolvePromise, reject) => {
    const aborted = (): void => {
      signal.removeEventListener('abort', aborted);
      reject(new BriosaCallAbortedError(signal.reason));
    };
    signal.addEventListener('abort', aborted, { once: true });
    void task.then(
      () => {
        signal.removeEventListener('abort', aborted);
        resolvePromise();
      },
      (error: unknown) => {
        signal.removeEventListener('abort', aborted);
        reject(
          error instanceof Error
            ? error
            : new Error('Briosa startup failed.', { cause: error }),
        );
      },
    );
  });
}

function abortableDelay(
  milliseconds: number,
  signal: AbortSignal,
): Promise<void> {
  return new Promise<void>((resolvePromise, reject) => {
    if (signal.aborted) {
      reject(new BriosaCallAbortedError(signal.reason));
      return;
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', aborted);
      resolvePromise();
    }, milliseconds);
    const aborted = (): void => {
      clearTimeout(timer);
      reject(new BriosaCallAbortedError(signal.reason));
    };
    signal.addEventListener('abort', aborted, { once: true });
  });
}
