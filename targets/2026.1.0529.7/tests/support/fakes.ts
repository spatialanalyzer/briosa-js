/* eslint-disable @typescript-eslint/require-await -- Async test doubles implement the transport contract. */

// Shared test doubles for the major-3 facade, discovery, and completion tests.
// The transport records every built request with its codecs, so tests can
// inspect field presence on the encoded wire message.

import {
  BriosaClientImplementation,
  type BriosaClient,
} from '../../src/client.js';
import { briosaProtocolIdentity } from '../../src/generated/protocolIdentity.js';
import {
  SpatialAnalyzerConnectionState,
  SpatialAnalyzerExecutionReadinessState,
  TargetIsolationMode,
  WorkerRuntimeState,
  type GetServerInfoResponse,
  type ListCapabilitiesResponse,
} from '../../src/generated/protocol/briosa/discovery.js';
import type { GetWorkingDirectoryResult } from '../../src/generated/protocol/briosa/file_operations.js';
import {
  SpatialAnalyzerApplicationState,
  SpatialAnalyzerOwnership,
  SpatialAnalyzerSdkRecoveryState,
  SpatialAnalyzerSdkState,
  type SpatialAnalyzerLifecycleState,
  type SpatialAnalyzerSdkLifecycleState,
} from '../../src/generated/protocol/briosa/lifecycle.js';
import {
  MpExecutionState,
  type MpExecutionDetails,
} from '../../src/generated/protocol/briosa/operation_outcomes.js';
import type { OwnedServer, ServerLauncher } from '../../src/serverLauncher.js';
import type { ClientTransport, OperationCodec } from '../../src/transport.js';

export class FakeServer implements OwnedServer {
  readonly target = '127.0.0.1:49152';
  readonly hasExited = false;
  closed = false;
  async close(): Promise<void> {
    this.closed = true;
  }
}

export class FakeLauncher implements ServerLauncher {
  readonly server = new FakeServer();
  async launch(): Promise<OwnedServer> {
    return this.server;
  }
}

export interface RecordedOperation {
  readonly service: string;
  readonly rpc: string;
  readonly request: unknown;
  readonly requestCodec: OperationCodec<unknown>;
  readonly responseCodec: OperationCodec<unknown>;
  /** The caller's abort signal, as the client handed it to the transport. */
  readonly signal: AbortSignal | undefined;
}

/** Builds the response (or a promise of it) for one scripted operation. */
export type OperationResponder = (operation: RecordedOperation) => unknown;

export function succeeded(code = 2): MpExecutionDetails {
  return {
    state: MpExecutionState.MP_EXECUTION_STATE_SUCCEEDED,
    mpResultCode: code,
    outputRetrievals: [],
  };
}

export function partialSuccess(): MpExecutionDetails {
  return {
    state: MpExecutionState.MP_EXECUTION_STATE_PARTIAL_SUCCESS,
    mpResultCode: 4,
    outputRetrievals: [],
  };
}

export class ScriptedTransport implements ClientTransport {
  readonly operations: RecordedOperation[] = [];
  readonly capabilityRequests: boolean[] = [];
  readonly workingDirectoryResults: GetWorkingDirectoryResult[] = [];
  workingDirectoryCalls = 0;
  /** The abort signal of the last getWorkingDirectory call. */
  workingDirectorySignal: AbortSignal | undefined;
  respond: OperationResponder = () => ({ execution: succeeded() });
  capabilities: ListCapabilitiesResponse = defaultCapabilities();
  deniedCapabilities: ListCapabilitiesResponse | null = null;
  #sdkGeneration = 0;
  #connected = false;

  get lastOperation(): RecordedOperation {
    const operation = this.operations.at(-1);
    if (operation === undefined) throw new Error('No operation was sent.');
    return operation;
  }

  /** Round-trips the last request through its codec, as the wire sees it. */
  lastWireRequest<T = Record<string, unknown>>(): T {
    const { request, requestCodec } = this.lastOperation;
    return requestCodec.decode(requestCodec.encode(request).finish()) as T;
  }

  async getServerSnapshot(): Promise<
    readonly [GetServerInfoResponse, ListCapabilitiesResponse]
  > {
    return [serverInfo(this.#connected), await this.listCapabilities(false)];
  }

  async listCapabilities(
    includeDenied: boolean,
  ): Promise<ListCapabilitiesResponse> {
    this.capabilityRequests.push(includeDenied);
    return includeDenied && this.deniedCapabilities !== null
      ? this.deniedCapabilities
      : this.capabilities;
  }

  async getApplicationState(): Promise<SpatialAnalyzerLifecycleState> {
    return {
      stateRevision: 1n,
      applicationState:
        SpatialAnalyzerApplicationState.SPATIAL_ANALYZER_APPLICATION_STATE_NOT_RUNNING,
      ownership: SpatialAnalyzerOwnership.SPATIAL_ANALYZER_OWNERSHIP_NONE,
    };
  }

  async launchApplication(): Promise<SpatialAnalyzerLifecycleState> {
    return {
      stateRevision: 2n,
      applicationState:
        SpatialAnalyzerApplicationState.SPATIAL_ANALYZER_APPLICATION_STATE_RUNNING,
      ownership:
        SpatialAnalyzerOwnership.SPATIAL_ANALYZER_OWNERSHIP_SERVER_LAUNCHED,
      applicationGeneration: 2,
    };
  }

  async closeApplication(): Promise<SpatialAnalyzerLifecycleState> {
    return this.getApplicationState();
  }

  async getSdkState(): Promise<SpatialAnalyzerSdkLifecycleState> {
    return this.#sdkState();
  }

  async startSdk(): Promise<SpatialAnalyzerSdkLifecycleState> {
    this.#sdkGeneration += 1;
    this.#connected = false;
    return this.#sdkState();
  }

  async connectSdk(): Promise<SpatialAnalyzerSdkLifecycleState> {
    this.#connected = true;
    return this.#sdkState();
  }

  async stopSdk(): Promise<SpatialAnalyzerSdkLifecycleState> {
    this.#sdkGeneration = 0;
    this.#connected = false;
    return this.#sdkState();
  }

  async recoverSdk(): Promise<SpatialAnalyzerSdkLifecycleState> {
    return this.startSdk();
  }

  async getWorkingDirectory(
    _timeoutMs: number | null,
    signal?: AbortSignal,
  ): Promise<GetWorkingDirectoryResult> {
    this.workingDirectoryCalls += 1;
    this.workingDirectorySignal = signal;
    const result = this.workingDirectoryResults.shift();
    return (
      result ?? { directory: String.raw`C:\Working`, execution: succeeded() }
    );
  }

  async invokeOperation<TRequest, TResponse>(
    service: string,
    rpc: string,
    request: TRequest,
    requestCodec: OperationCodec<TRequest>,
    responseCodec: OperationCodec<TResponse>,
    _timeoutMs: number | null,
    signal?: AbortSignal,
  ): Promise<TResponse> {
    const operation: RecordedOperation = {
      service,
      rpc,
      request,
      requestCodec,
      responseCodec,
      signal,
    };
    this.operations.push(operation);
    return (await this.respond(operation)) as TResponse;
  }

  close(): void {}

  #sdkState(): SpatialAnalyzerSdkLifecycleState {
    return {
      stateRevision: 3n,
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

export function serverInfo(ready: boolean): GetServerInfoResponse {
  return {
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
    compatibility: {
      major: briosaProtocolIdentity.compatibilityMajor,
      revision: briosaProtocolIdentity.compatibilityRevision,
    },
    readyForMp: ready,
  };
}

export function defaultCapabilities(): ListCapabilitiesResponse {
  return {
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
  };
}

/** A started client whose generation is ready for MP work. */
export async function startedClient(
  transport: ScriptedTransport = new ScriptedTransport(),
): Promise<{ client: BriosaClient; transport: ScriptedTransport }> {
  const client = new BriosaClientImplementation(
    {},
    new FakeLauncher(),
    () => transport,
  );
  await client.start();
  return { client, transport };
}
