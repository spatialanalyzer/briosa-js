import {
  credentials,
  Client,
  Metadata,
  type CallOptions,
  type ChannelCredentials,
  type ChannelOptions,
  type ClientOptions,
  type ClientUnaryCall,
  type ServiceError,
} from '@grpc/grpc-js';

import {
  DiscoveryServiceClient,
  type GetServerInfoResponse,
  type ListCapabilitiesResponse,
} from './generated/protocol/briosa/discovery.js';
import {
  FileOperationsClient,
  type GetWorkingDirectoryResult,
} from './generated/protocol/briosa/file_operations.js';
import {
  SpatialAnalyzerLifecycleClient,
  SpatialAnalyzerSdkLifecycleClient,
  SpatialAnalyzerSdkRecoveryMode,
  type CloseOwnedSpatialAnalyzerResponse,
  type ConnectToSpatialAnalyzerResponse,
  type GetSpatialAnalyzerSdkStateResponse,
  type GetSpatialAnalyzerStateResponse,
  type LaunchSpatialAnalyzerResponse,
  type RecoverSpatialAnalyzerSdkResponse,
  type ReconnectToSpatialAnalyzerResponse,
  type StartSpatialAnalyzerSdkResponse,
  type StopSpatialAnalyzerSdkResponse,
  type SpatialAnalyzerLifecycleState,
  type SpatialAnalyzerSdkLifecycleState,
} from './generated/protocol/briosa/lifecycle.js';
import { BriosaCallAbortedError, BriosaProtocolError } from './errors.js';
import type { SpatialAnalyzerLaunchOptions } from './models.js';

export interface ClientTransport {
  getServerSnapshot(
    signal?: AbortSignal,
    beforeSubmit?: () => void,
  ): Promise<readonly [GetServerInfoResponse, ListCapabilitiesResponse]>;
  listCapabilities(
    includeDenied: boolean,
    signal?: AbortSignal,
    beforeSubmit?: () => void,
  ): Promise<ListCapabilitiesResponse>;
  getApplicationState(
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerLifecycleState>;
  launchApplication(
    options: SpatialAnalyzerLaunchOptions,
    signal?: AbortSignal,
    beforeSubmit?: () => void,
  ): Promise<SpatialAnalyzerLifecycleState>;
  closeApplication(
    expectedGeneration: number,
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerLifecycleState>;
  getSdkState(signal?: AbortSignal): Promise<SpatialAnalyzerSdkLifecycleState>;
  startSdk(
    signal?: AbortSignal,
    beforeSubmit?: () => void,
  ): Promise<SpatialAnalyzerSdkLifecycleState>;
  connectSdk(
    expectedGeneration: number,
    reconnect: boolean,
    signal?: AbortSignal,
    beforeSubmit?: () => void,
  ): Promise<SpatialAnalyzerSdkLifecycleState>;
  stopSdk(
    expectedGeneration: number,
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerSdkLifecycleState>;
  recoverSdk(
    expectedGeneration: number,
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerSdkLifecycleState>;
  getWorkingDirectory(
    timeoutMs: number | null,
    signal?: AbortSignal,
  ): Promise<GetWorkingDirectoryResult>;
  invokeOperation<TRequest, TResponse>(
    service: string,
    rpc: string,
    request: TRequest,
    requestCodec: OperationCodec<TRequest>,
    responseCodec: OperationCodec<TResponse>,
    timeoutMs: number | null,
    signal?: AbortSignal,
  ): Promise<TResponse>;
  close(): void;
}

export interface OperationCodec<T> {
  encode(message: T): { finish(): Uint8Array };
  decode(input: Uint8Array): T;
}

type UnaryInvoker<TResponse> = (
  callback: (error: ServiceError | null, response: TResponse) => void,
) => ClientUnaryCall;

/**
 * @internal The HTTP/2 flow-control window, in bytes, of every channel the
 * transport opens: 16 MiB.
 *
 * The transport sets no receive limit, so grpc-js 1.14.6 accepts response
 * messages of up to 4 MiB (its DEFAULT_MAX_RECEIVE_MESSAGE_LENGTH). The largest
 * accepted response is that message plus the 5-byte gRPC prefix. grpc-js
 * advertises this value as the initial window of every stream, in its SETTINGS
 * frame, and raises the connection window to it when the server's SETTINGS
 * arrive. Node.js returns connection credit only once at least half the window
 * has been consumed, so a response can start with just over half the
 * connection window free. 16 MiB is the smallest power of two for which both
 * windows hold the largest accepted response when calls run one at a time.
 * Concurrent responses share connection credit and can still have to wait.
 *
 * At grpc-js's default of 65,535 bytes, a large response such as the
 * capability listing waits for credit. Calls after such a response were
 * observed to get no reply, consistent with a defect in ASP.NET Core 10.0.15
 * (https://github.com/spatialanalyzer/briosa/issues/450,
 * https://github.com/dotnet/aspnetcore/issues/70124).
 */
export const http2FlowControlWindowBytes = 16 * 1024 * 1024;

/**
 * @internal Options of every channel the transport opens. The five service
 * clients share this object and one credentials object, so grpc-js keeps them
 * on one connection; a client built without it would open another connection
 * with the 65,535-byte default window.
 */
export const grpcChannelOptions: Readonly<ChannelOptions> = Object.freeze({
  'grpc-node.flow_control_window': http2FlowControlWindowBytes,
});

/** @internal A grpc-js client class: a generated service client or Client. */
export type GrpcServiceClientClass<TClient extends Client> = new (
  address: string,
  channelCredentials: ChannelCredentials,
  options: Partial<ClientOptions>,
) => TClient;

/** @internal Builds one service client; tests substitute a recorder. */
export type GrpcServiceClientFactory = <TClient extends Client>(
  clientClass: GrpcServiceClientClass<TClient>,
  target: string,
  channelCredentials: ChannelCredentials,
  options: Readonly<ChannelOptions>,
) => TClient;

// The one place in hand-written code that constructs a grpc-js client; a
// test fails if any other code constructs a client or channel.
function newServiceClient<TClient extends Client>(
  clientClass: GrpcServiceClientClass<TClient>,
  target: string,
  channelCredentials: ChannelCredentials,
  options: Readonly<ChannelOptions>,
): TClient {
  return new clientClass(target, channelCredentials, options);
}

export class GrpcClientTransport implements ClientTransport {
  readonly #discovery: DiscoveryServiceClient;
  readonly #application: SpatialAnalyzerLifecycleClient;
  readonly #sdk: SpatialAnalyzerSdkLifecycleClient;
  readonly #fileOperations: FileOperationsClient;
  readonly #operations: Client;

  constructor(
    target: string,
    createClient: GrpcServiceClientFactory = newServiceClient,
  ) {
    const channelCredentials = credentials.createInsecure();
    // Every client is built here, with the same options and credentials.
    const create = <TClient extends Client>(
      clientClass: GrpcServiceClientClass<TClient>,
    ): TClient =>
      createClient(clientClass, target, channelCredentials, grpcChannelOptions);
    this.#discovery = create(DiscoveryServiceClient);
    this.#application = create(SpatialAnalyzerLifecycleClient);
    this.#sdk = create(SpatialAnalyzerSdkLifecycleClient);
    this.#fileOperations = create(FileOperationsClient);
    this.#operations = create(Client);
  }

  async getServerSnapshot(
    signal?: AbortSignal,
    beforeSubmit?: () => void,
  ): Promise<readonly [GetServerInfoResponse, ListCapabilitiesResponse]> {
    const server = await invokeUnary<GetServerInfoResponse>(
      (callback) =>
        this.#discovery.getServerInfo({}, new Metadata(), {}, callback),
      signal,
      beforeSubmit,
    );
    // The guard runs again here, between the two discovery requests.
    const capabilities = await this.listCapabilities(
      false,
      signal,
      beforeSubmit,
    );
    return [server, capabilities];
  }

  listCapabilities(
    includeDenied: boolean,
    signal?: AbortSignal,
    beforeSubmit?: () => void,
  ): Promise<ListCapabilitiesResponse> {
    return invokeUnary<ListCapabilitiesResponse>(
      (callback) =>
        this.#discovery.listCapabilities(
          includeDenied ? { includeDenied: true } : {},
          new Metadata(),
          {},
          callback,
        ),
      signal,
      beforeSubmit,
    );
  }

  async getApplicationState(
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerLifecycleState> {
    const response = await invokeUnary<GetSpatialAnalyzerStateResponse>(
      (callback) =>
        this.#application.getSpatialAnalyzerState(
          {},
          new Metadata(),
          {},
          callback,
        ),
      signal,
    );
    return requireState(response.state, 'application-state-missing');
  }

  async launchApplication(
    options: SpatialAnalyzerLaunchOptions,
    signal?: AbortSignal,
    beforeSubmit?: () => void,
  ): Promise<SpatialAnalyzerLifecycleState> {
    const initialContent =
      options.jobFilePath !== undefined
        ? ({ $case: 'jobFilePath', value: options.jobFilePath } as const)
        : options.quickStartInstrumentName !== undefined
          ? ({
              $case: 'quickStartInstrumentName',
              value: options.quickStartInstrumentName,
            } as const)
          : undefined;
    // The request is built inside the call setup, where Client 0.5.0 built it:
    // after the signal is sampled and inside the setup's error handling. The
    // guard then runs after every option is read and before the call is made.
    const response = await invokeUnary<LaunchSpatialAnalyzerResponse>(
      (callback) => {
        const request = {
          ...(initialContent === undefined ? {} : { initialContent }),
          startMinimized: options.startMinimized ?? false,
        };
        beforeSubmit?.();
        return this.#application.launchSpatialAnalyzer(
          request,
          new Metadata(),
          {},
          callback,
        );
      },
      signal,
    );
    return requireState(response.state, 'application-state-missing');
  }

  async closeApplication(
    expectedGeneration: number,
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerLifecycleState> {
    const response = await invokeUnary<CloseOwnedSpatialAnalyzerResponse>(
      (callback) =>
        this.#application.closeOwnedSpatialAnalyzer(
          { expectedApplicationGeneration: expectedGeneration },
          new Metadata(),
          {},
          callback,
        ),
      signal,
    );
    return requireState(response.state, 'application-state-missing');
  }

  async getSdkState(
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    const response = await invokeUnary<GetSpatialAnalyzerSdkStateResponse>(
      (callback) =>
        this.#sdk.getSpatialAnalyzerSdkState({}, new Metadata(), {}, callback),
      signal,
    );
    return requireState(response.state, 'sdk-state-missing');
  }

  async startSdk(
    signal?: AbortSignal,
    beforeSubmit?: () => void,
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    const response = await invokeUnary<StartSpatialAnalyzerSdkResponse>(
      (callback) =>
        this.#sdk.startSpatialAnalyzerSdk({}, new Metadata(), {}, callback),
      signal,
      beforeSubmit,
    );
    return requireState(response.state, 'sdk-state-missing');
  }

  async connectSdk(
    expectedGeneration: number,
    reconnect: boolean,
    signal?: AbortSignal,
    beforeSubmit?: () => void,
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    const response = reconnect
      ? await invokeUnary<ReconnectToSpatialAnalyzerResponse>(
          (callback) =>
            this.#sdk.reconnectToSpatialAnalyzer(
              { expectedSdkGeneration: expectedGeneration },
              new Metadata(),
              {},
              callback,
            ),
          signal,
          beforeSubmit,
        )
      : await invokeUnary<ConnectToSpatialAnalyzerResponse>(
          (callback) =>
            this.#sdk.connectToSpatialAnalyzer(
              { expectedSdkGeneration: expectedGeneration },
              new Metadata(),
              {},
              callback,
            ),
          signal,
          beforeSubmit,
        );
    return requireState(response.state, 'sdk-state-missing');
  }

  async stopSdk(
    expectedGeneration: number,
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    const response = await invokeUnary<StopSpatialAnalyzerSdkResponse>(
      (callback) =>
        this.#sdk.stopSpatialAnalyzerSdk(
          { expectedSdkGeneration: expectedGeneration },
          new Metadata(),
          {},
          callback,
        ),
      signal,
    );
    return requireState(response.state, 'sdk-state-missing');
  }

  async recoverSdk(
    expectedGeneration: number,
    signal?: AbortSignal,
  ): Promise<SpatialAnalyzerSdkLifecycleState> {
    const response = await invokeUnary<RecoverSpatialAnalyzerSdkResponse>(
      (callback) =>
        this.#sdk.recoverSpatialAnalyzerSdk(
          {
            expectedSdkGeneration: expectedGeneration,
            mode: SpatialAnalyzerSdkRecoveryMode.SPATIAL_ANALYZER_SDK_RECOVERY_MODE_REPLACE_WITHOUT_REPLAY,
          },
          new Metadata(),
          {},
          callback,
        ),
      signal,
    );
    return requireState(response.state, 'sdk-state-missing');
  }

  getWorkingDirectory(
    timeoutMs: number | null,
    signal?: AbortSignal,
  ): Promise<GetWorkingDirectoryResult> {
    return invokeUnary(
      (callback) =>
        this.#fileOperations.getWorkingDirectory(
          {},
          new Metadata(),
          callOptions(timeoutMs),
          callback,
        ),
      signal,
    );
  }

  invokeOperation<TRequest, TResponse>(
    service: string,
    rpc: string,
    request: TRequest,
    requestCodec: OperationCodec<TRequest>,
    responseCodec: OperationCodec<TResponse>,
    timeoutMs: number | null,
    signal?: AbortSignal,
  ): Promise<TResponse> {
    return invokeUnary<TResponse>(
      (callback) =>
        this.#operations.makeUnaryRequest(
          `/briosa.${service}/${rpc}`,
          (value: TRequest) => Buffer.from(requestCodec.encode(value).finish()),
          (value: Buffer) => responseCodec.decode(value),
          request,
          new Metadata(),
          callOptions(timeoutMs),
          (error, response) => callback(error, response as TResponse),
        ),
      signal,
    );
  }

  close(): void {
    this.#discovery.close();
    this.#application.close();
    this.#sdk.close();
    this.#fileOperations.close();
    this.#operations.close();
  }
}

function callOptions(timeoutMs: number | null): Partial<CallOptions> {
  return timeoutMs === null
    ? {}
    : { deadline: new Date(Date.now() + timeoutMs) };
}

function requireState<T>(state: T | undefined, diagnosticCode: string): T {
  if (state === undefined) throw new BriosaProtocolError(diagnosticCode);
  return state;
}

// beforeSubmit, when given, runs immediately before the call is made, after
// the request is built. If it throws, the call is never made and its error
// rejects the promise. Without it the call behaves as in Client 0.5.0.
function invokeUnary<TResponse>(
  invoke: UnaryInvoker<TResponse>,
  signal: AbortSignal | undefined,
  beforeSubmit?: () => void,
): Promise<TResponse> {
  return new Promise<TResponse>((resolve, reject) => {
    if (beforeSubmit !== undefined) {
      try {
        beforeSubmit();
      } catch (cause) {
        reject(
          cause instanceof Error
            ? cause
            : new Error('Briosa call was not submitted.', { cause }),
        );
        return;
      }
    }
    let call: ClientUnaryCall | undefined;
    let aborted = signal?.aborted === true;
    let abortReason: unknown = aborted ? readAbortReason(signal) : undefined;
    const cancel = (): void => {
      aborted = true;
      abortReason = readAbortReason(signal);
      call?.cancel();
    };
    const cleanup = (): void => signal?.removeEventListener('abort', cancel);
    try {
      call = invoke((error, response) => {
        cleanup();
        if (aborted) reject(new BriosaCallAbortedError(abortReason));
        else if (error === null) resolve(response);
        else reject(error);
      });
      if (aborted) call.cancel();
      else signal?.addEventListener('abort', cancel, { once: true });
    } catch (cause) {
      cleanup();
      reject(
        cause instanceof Error
          ? cause
          : new Error('Briosa call setup failed.', { cause }),
      );
    }
  });
}

function readAbortReason(signal: AbortSignal | undefined): unknown {
  return signal?.reason as unknown;
}
