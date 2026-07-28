import {
  credentials,
  Metadata,
  type CallOptions,
  type ChannelCredentials,
  type ClientOptions,
  type ClientUnaryCall,
  type ServiceError,
} from '@grpc/grpc-js';

import { validateBriosaCompatibility } from './compatibility.js';
import { BriosaCallError } from './errors.js';
import {
  DiscoveryServiceClient,
  SpatialAnalyzerExecutionReadinessState,
  type GetServerInfoResponse,
  type ListCapabilitiesResponse,
} from './generated/protocol/briosa/core/v1alpha1/discovery.js';
import {
  FileOperationsClient,
  type GetWorkingDirectoryResult,
} from './generated/protocol/briosa/sa/v2026_1_0529_7/v1alpha1/operations.js';

export interface BriosaClientOptions {
  /** grpc-js target, for example `127.0.0.1:50051`. */
  address: string;
  /** Default timeout applied independently to every RPC. */
  defaultTimeoutMs?: number;
  /** Channel credentials. Defaults to insecure loopback credentials. */
  credentials?: ChannelCredentials;
  /** Advanced grpc-js channel options. */
  channelOptions?: Partial<ClientOptions>;
}

export interface BriosaCallOptions {
  /** Positive timeout for this RPC, overriding the client default. */
  timeoutMs?: number;
  /** Cancels the one in-flight call. Cancellation never authorizes replay. */
  signal?: AbortSignal;
}

/** One identity-validated discovery and capability snapshot. */
export class BriosaServerSnapshot {
  constructor(
    readonly serverInfo: GetServerInfoResponse,
    readonly capabilities: ListCapabilitiesResponse,
  ) {}

  get readyForMp(): boolean {
    return (
      this.serverInfo.readyForMp === true &&
      this.serverInfo.spatialAnalyzerExecutionReadinessState ===
        SpatialAnalyzerExecutionReadinessState.SPATIAL_ANALYZER_EXECUTION_READINESS_STATE_EXECUTION_READY
    );
  }
}

type UnaryInvoker<TResponse> = (
  callback: (error: ServiceError | null, response: TResponse) => void,
) => ClientUnaryCall;

/** Thin asynchronous wrapper around generated Briosa gRPC clients. It performs no retries. */
export class BriosaClient {
  readonly #defaultTimeoutMs: number;
  readonly #discovery: DiscoveryServiceClient;
  readonly #fileOperations: FileOperationsClient;

  constructor(options: BriosaClientOptions) {
    if (options.address.trim().length === 0) {
      throw new RangeError('The Briosa address must not be empty.');
    }
    this.#defaultTimeoutMs = options.defaultTimeoutMs ?? 30_000;
    requirePositiveTimeout(this.#defaultTimeoutMs);
    const channelCredentials =
      options.credentials ?? credentials.createInsecure();
    this.#discovery = new DiscoveryServiceClient(
      options.address,
      channelCredentials,
      options.channelOptions,
    );
    this.#fileOperations = new FileOperationsClient(
      options.address,
      channelCredentials,
      options.channelOptions,
    );
  }

  /** Reads discovery and capabilities, then verifies every exact-target coordinate. */
  async getServerSnapshot(
    options: BriosaCallOptions = {},
  ): Promise<BriosaServerSnapshot> {
    const callOptions = this.#resolveCallOptions(options.timeoutMs);
    const serverInfo = await invokeUnary<GetServerInfoResponse>(
      (callback) =>
        this.#discovery.getServerInfo(
          {},
          new Metadata(),
          callOptions,
          callback,
        ),
      options.signal,
    );
    const capabilities = await invokeUnary<ListCapabilitiesResponse>(
      (callback) =>
        this.#discovery.listCapabilities(
          {},
          new Metadata(),
          callOptions,
          callback,
        ),
      options.signal,
    );
    validateBriosaCompatibility(serverInfo, capabilities);
    return new BriosaServerSnapshot(serverInfo, capabilities);
  }

  /** Executes exact-target Get Working Directory once, without automatic replay. */
  getWorkingDirectory(
    options: BriosaCallOptions = {},
  ): Promise<GetWorkingDirectoryResult> {
    const callOptions = this.#resolveCallOptions(options.timeoutMs);
    return invokeUnary<GetWorkingDirectoryResult>(
      (callback) =>
        this.#fileOperations.getWorkingDirectory(
          {},
          new Metadata(),
          callOptions,
          callback,
        ),
      options.signal,
    );
  }

  /** Closes both generated grpc-js clients. */
  close(): void {
    this.#discovery.close();
    this.#fileOperations.close();
  }

  #resolveCallOptions(timeoutMs: number | undefined): Partial<CallOptions> {
    const timeout = timeoutMs ?? this.#defaultTimeoutMs;
    requirePositiveTimeout(timeout);
    return { deadline: new Date(Date.now() + timeout) };
  }
}

function requirePositiveTimeout(timeoutMs: number): void {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new RangeError('The timeout must be a positive finite number.');
  }
}

function invokeUnary<TResponse>(
  invoke: UnaryInvoker<TResponse>,
  signal: AbortSignal | undefined,
): Promise<TResponse> {
  return new Promise<TResponse>((resolve, reject) => {
    let call: ClientUnaryCall | undefined;
    const removeAbortListener = (): void =>
      signal?.removeEventListener('abort', cancel);
    const cancel = (): void => call?.cancel();
    const callback = (
      error: ServiceError | null,
      response: TResponse,
    ): void => {
      removeAbortListener();
      if (error === null) resolve(response);
      else reject(BriosaCallError.fromServiceError(error));
    };

    try {
      call = invoke(callback);
      if (signal?.aborted === true) cancel();
      else signal?.addEventListener('abort', cancel, { once: true });
    } catch (error) {
      removeAbortListener();
      reject(
        error instanceof Error
          ? error
          : new Error('Briosa call setup failed.', { cause: error }),
      );
    }
  });
}
