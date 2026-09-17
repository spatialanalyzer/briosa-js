import { status, type ServiceError } from '@grpc/grpc-js';

import { BriosaCompatibilityError } from './compatibility.js';
import {
  SpatialAnalyzerLifecycleError,
  SpatialAnalyzerSdkLifecycleError,
  type SpatialAnalyzerSdkLifecycleFailureKind as WireSdkFailureKind,
} from './generated/protocol/briosa/lifecycle.js';
import { OperationError } from './generated/protocol/briosa/operation_outcomes.js';
import type {
  ExecutionDisposition,
  LifecycleRecoveryGuidance,
  OperationFailureKind,
  RecoveryGuidance,
  ReplayGuidance,
  ReplaySafety,
  SpatialAnalyzerLifecycleFailureKind,
  SpatialAnalyzerLifecycleState,
  SpatialAnalyzerSdkLifecycleFailureKind,
  SpatialAnalyzerSdkLifecycleState,
} from './models.js';
import { mapApplicationState, mapSdkState } from './protocolMapping.js';

const applicationErrorTrailer = 'briosa-spatial-analyzer-lifecycle-error-bin';
const sdkErrorTrailer = 'briosa-spatial-analyzer-sdk-lifecycle-error-bin';
const operationErrorTrailer = 'briosa-operation-error-bin';

/** Base class for handwritten Briosa client failures. */
export class BriosaError extends Error {}

export class BriosaStartupError extends BriosaError {
  constructor(
    readonly diagnosticCode: string,
    options?: ErrorOptions,
  ) {
    super(`Briosa startup failed (${diagnosticCode}).`, options);
    this.name = 'BriosaStartupError';
  }
}

export class BriosaLifecycleError extends BriosaError {
  constructor(readonly diagnosticCode: string) {
    super(`Briosa lifecycle operation is unavailable (${diagnosticCode}).`);
    this.name = 'BriosaLifecycleError';
  }
}

export class BriosaProtocolError extends BriosaError {
  constructor(
    readonly diagnosticCode: string,
    options?: ErrorOptions,
  ) {
    super(
      `Briosa returned invalid protocol data (${diagnosticCode}).`,
      options,
    );
    this.name = 'BriosaProtocolError';
  }
}

export class BriosaCallAbortedError extends BriosaError {
  constructor(readonly reason?: unknown) {
    super('The caller aborted its wait for a Briosa operation.');
    this.name = 'AbortError';
  }
}

export class BriosaSpatialAnalyzerError extends BriosaError {
  constructor(
    readonly kind: SpatialAnalyzerLifecycleFailureKind,
    readonly diagnosticCode: string,
    readonly recoveryGuidance: LifecycleRecoveryGuidance,
    readonly state: SpatialAnalyzerLifecycleState,
    options?: ErrorOptions,
  ) {
    super(
      `SpatialAnalyzer lifecycle operation failed (${diagnosticCode}).`,
      options,
    );
    this.name = 'BriosaSpatialAnalyzerError';
  }
}

export class BriosaSpatialAnalyzerSdkError extends BriosaError {
  constructor(
    readonly kind: SpatialAnalyzerSdkLifecycleFailureKind,
    readonly diagnosticCode: string,
    readonly recoveryGuidance: LifecycleRecoveryGuidance,
    readonly state: SpatialAnalyzerSdkLifecycleState,
    options?: ErrorOptions,
  ) {
    super(
      `SpatialAnalyzer SDK lifecycle operation failed (${diagnosticCode}).`,
      options,
    );
    this.name = 'BriosaSpatialAnalyzerSdkError';
  }
}

/** A valid typed MP failure with detached, value-free operation policy. */
export class BriosaOperationError extends BriosaError {
  constructor(
    readonly operationId: string,
    readonly kind: OperationFailureKind,
    readonly diagnosticCode: string,
    readonly executionDisposition: ExecutionDisposition,
    readonly recoveryGuidance: RecoveryGuidance,
    readonly replayGuidance: ReplayGuidance,
    readonly replaySafety: ReplaySafety,
  ) {
    super(`Briosa operation failed (${diagnosticCode}).`);
    this.name = 'BriosaOperationError';
  }

  get completionUnknown(): boolean {
    return this.executionDisposition === 'startedOutcomeUnknown';
  }

  get reconciliationRequired(): boolean {
    return (
      this.completionUnknown && this.replayGuidance === 'reconcileBeforeReplay'
    );
  }
}

/** A transport failure for which no valid typed Briosa detail was available. */
export class BriosaTransportError extends BriosaError {
  constructor(readonly diagnosticCode: string) {
    super(`Briosa transport failed (${diagnosticCode}).`);
    this.name = 'BriosaTransportError';
  }
}

/** Maps grpc-js metadata without parsing status text. */
export function mapServiceError(
  error: ServiceError,
  applicationState: SpatialAnalyzerLifecycleState | null = null,
): BriosaError {
  const applicationDetail = decodeTrailer(
    error,
    applicationErrorTrailer,
    (value) => SpatialAnalyzerLifecycleError.decode(value),
  );
  if (applicationDetail !== undefined) {
    const kinds: readonly SpatialAnalyzerLifecycleFailureKind[] = [
      'unspecified',
      'validation',
      'stateConflict',
      'applicationNotFound',
      'applicationAmbiguous',
      'launchFailed',
      'notOwned',
      'sdkNotStopped',
      'timeout',
      'internal',
    ];
    return new BriosaSpatialAnalyzerError(
      requireEnum(kinds, applicationDetail.kind),
      applicationDetail.diagnosticCode ?? '',
      mapRecoveryGuidance(applicationDetail.recoveryGuidance),
      mapApplicationState(
        applicationDetail.state ??
          invalidProtocol('application-error-state-missing'),
      ),
    );
  }

  const sdkDetail = decodeTrailer(error, sdkErrorTrailer, (value) =>
    SpatialAnalyzerSdkLifecycleError.decode(value),
  );
  if (sdkDetail !== undefined) {
    const kind = mapSdkFailureKind(sdkDetail.kind);
    if (kind === 'identityMismatch') {
      return new BriosaCompatibilityError(sdkDetail.diagnosticCode ?? '');
    }
    if (kind === 'applicationNotFound' || kind === 'applicationAmbiguous') {
      return new BriosaSpatialAnalyzerError(
        kind,
        sdkDetail.diagnosticCode ?? '',
        mapRecoveryGuidance(sdkDetail.recoveryGuidance),
        applicationState ?? syntheticApplicationState(kind),
      );
    }
    return new BriosaSpatialAnalyzerSdkError(
      kind,
      sdkDetail.diagnosticCode ?? '',
      mapRecoveryGuidance(sdkDetail.recoveryGuidance),
      mapSdkState(
        sdkDetail.state ?? invalidProtocol('sdk-error-state-missing'),
      ),
    );
  }

  const values = error.metadata.get(operationErrorTrailer);
  if (values.length === 0) {
    return new BriosaTransportError(transportDiagnosticCode(error.code));
  }
  const value = values[0];
  if (!Buffer.isBuffer(value)) {
    return new BriosaTransportError('typed-error-malformed');
  }
  try {
    const detail = OperationError.decode(value);
    const operationId = detail.operationId;
    const diagnosticCode = detail.diagnosticCode;
    if (
      operationId === undefined ||
      operationId.trim().length === 0 ||
      diagnosticCode === undefined ||
      diagnosticCode.trim().length === 0
    ) {
      return new BriosaTransportError('typed-error-malformed');
    }
    return new BriosaOperationError(
      operationId,
      requireEnum(operationFailureKinds, detail.kind),
      diagnosticCode,
      requireEnum(executionDispositions, detail.executionDisposition),
      requireEnum(recoveryGuidanceValues, detail.recoveryGuidance),
      requireEnum(replayGuidanceValues, detail.replayGuidance),
      requireEnum(replaySafetyValues, detail.replaySafety),
    );
  } catch {
    return new BriosaTransportError('typed-error-malformed');
  }
}

export function isServiceError(error: unknown): error is ServiceError {
  if (!(error instanceof Error)) return false;
  const candidate = error as Partial<ServiceError>;
  return (
    typeof candidate.code === 'number' &&
    candidate.code >= status.OK &&
    candidate.code <= status.UNAUTHENTICATED &&
    candidate.metadata !== undefined &&
    typeof candidate.metadata.get === 'function'
  );
}

function decodeTrailer<T>(
  error: ServiceError,
  key: string,
  decode: (value: Uint8Array) => T,
): T | undefined {
  const value = error.metadata.get(key)[0];
  if (value === undefined) return undefined;
  if (!Buffer.isBuffer(value)) {
    throw new BriosaProtocolError('typed-error-malformed');
  }
  try {
    return decode(value);
  } catch {
    throw new BriosaProtocolError('typed-error-malformed');
  }
}

function mapSdkFailureKind(
  value: WireSdkFailureKind | undefined,
): SpatialAnalyzerSdkLifecycleFailureKind {
  const values: readonly SpatialAnalyzerSdkLifecycleFailureKind[] = [
    'unspecified',
    'validation',
    'stateConflict',
    'applicationNotFound',
    'applicationAmbiguous',
    'sdkAlreadyActive',
    'sdkNotRunning',
    'sdkStartFailed',
    'sdkStopFailed',
    'recoveryNotRequired',
    'sdkRecoveryFailed',
    'identityMismatch',
    'operatorActionRequired',
    'timeout',
    'internal',
    'sdkAlreadyConnected',
    'sdkConnectionFailed',
    'reconnectNotRequired',
    'sdkRecoveryRequired',
  ];
  return requireEnum(values, value);
}

function mapRecoveryGuidance(
  value: number | undefined,
): LifecycleRecoveryGuidance {
  const values: readonly LifecycleRecoveryGuidance[] = [
    'unspecified',
    'none',
    'refreshState',
    'retryAfterStateChange',
    'correctEnvironment',
    'stopSdkFirst',
    'recoverSdkWithoutReplay',
    'operatorActionRequired',
  ];
  return requireEnum(values, value);
}

function syntheticApplicationState(
  kind: 'applicationNotFound' | 'applicationAmbiguous',
): SpatialAnalyzerLifecycleState {
  return {
    stateRevision: 0n,
    applicationState:
      kind === 'applicationNotFound' ? 'notRunning' : 'ambiguous',
    ownership: 'none',
    applicationGeneration: null,
    diagnosticCode: null,
  };
}

function requireEnum<T>(values: readonly T[], value: number | undefined): T {
  const mapped = value === undefined ? undefined : values[value];
  if (mapped === undefined) throw new BriosaProtocolError('unknown-enum-value');
  return mapped;
}

function invalidProtocol(diagnosticCode: string): never {
  throw new BriosaProtocolError(diagnosticCode);
}

function transportDiagnosticCode(value: status): string {
  const name = status[value];
  return typeof name === 'string'
    ? `transport-${name.toLowerCase().replaceAll('_', '-')}`
    : 'transport-failure';
}

const executionDispositions: readonly ExecutionDisposition[] = [
  'unspecified',
  'notStarted',
  'startedOutcomeUnknown',
  'completed',
];

const operationFailureKinds: readonly OperationFailureKind[] = [
  'unspecified',
  'validation',
  'unsupported',
  'spatialAnalyzerUnavailable',
  'workerUnavailable',
  'callerCancelled',
  'callerDeadlineExceeded',
  'workerWatchdogTimeout',
  'workerFailure',
  'executeStepRejected',
  'mpFailure',
  'outputRetrievalFailure',
  'internal',
  'policyDenied',
  'mpResultRetrievalFailure',
  'sdkArgumentRejected',
];

const recoveryGuidanceValues: readonly RecoveryGuidance[] = [
  'unspecified',
  'none',
  'waitForReadiness',
  'workerReplacement',
  'operatorInterventionRequired',
];

const replayGuidanceValues: readonly ReplayGuidance[] = [
  'unspecified',
  'doNotReplay',
  'mayReplay',
  'reconcileBeforeReplay',
];

const replaySafetyValues: readonly ReplaySafety[] = [
  'unspecified',
  'safe',
  'unsafe',
  'unknown',
];
