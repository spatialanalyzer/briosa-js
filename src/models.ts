/** Handwritten public lifecycle and discovery types. */

export interface BriosaClientOptions {
  readonly commandTimeoutMs?: number | null;
}

export interface BriosaLifecycleCallOptions {
  readonly signal?: AbortSignal;
}

export interface BriosaCallOptions {
  readonly signal?: AbortSignal;
}

export interface SpatialAnalyzerLaunchOptions {
  readonly jobFilePath?: string;
  readonly quickStartInstrumentName?: string;
  readonly startMinimized?: boolean;
}

export interface BriosaStartOptions extends BriosaLifecycleCallOptions {
  readonly startSpatialAnalyzerSdk?: boolean;
  readonly launchSpatialAnalyzer?: boolean;
  readonly connectToSpatialAnalyzer?: boolean;
  readonly launchOptions?: SpatialAnalyzerLaunchOptions;
  readonly startupTimeoutMs?: number;
}

export type SpatialAnalyzerApplicationState =
  | 'unspecified'
  | 'notRunning'
  | 'starting'
  | 'running'
  | 'closing'
  | 'exited'
  | 'ambiguous'
  | 'faulted';

export type SpatialAnalyzerOwnership =
  'unspecified' | 'none' | 'external' | 'serverLaunched';

export type SpatialAnalyzerSdkState =
  | 'unspecified'
  | 'stopped'
  | 'starting'
  | 'running'
  | 'connecting'
  | 'verifying'
  | 'ready'
  | 'stopping'
  | 'recovering'
  | 'faulted';

export type SpatialAnalyzerSdkRecoveryState =
  | 'unspecified'
  | 'notRequired'
  | 'recoveryAvailable'
  | 'operatorActionRequired'
  | 'blocked';

export type SpatialAnalyzerSdkTerminationKind =
  | 'unspecified'
  | 'startFailed'
  | 'sdkProcessExited'
  | 'sdkConnectionLost'
  | 'workerProcessExited'
  | 'controlChannelLost'
  | 'watchdogTerminated';

export type SpatialAnalyzerSdkRecoveryMode = 'replaceWithoutReplay';

export type SpatialAnalyzerConnectionState =
  | 'unspecified'
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'faulted'
  | 'stopping';

export type SpatialAnalyzerExecutionReadinessState =
  | 'unspecified'
  | 'unverified'
  | 'verifying'
  | 'executionReady'
  | 'competingClientSuspected'
  | 'operatorRecoveryRequired';

export type ExecutionDisposition =
  'unspecified' | 'notStarted' | 'startedOutcomeUnknown' | 'completed';

export type OperationFailureKind =
  | 'unspecified'
  | 'validation'
  | 'unsupported'
  | 'spatialAnalyzerUnavailable'
  | 'workerUnavailable'
  | 'callerCancelled'
  | 'callerDeadlineExceeded'
  | 'workerWatchdogTimeout'
  | 'workerFailure'
  | 'executeStepRejected'
  | 'mpFailure'
  | 'outputRetrievalFailure'
  | 'internal'
  | 'policyDenied'
  | 'mpResultRetrievalFailure'
  | 'sdkArgumentRejected';

export type RecoveryGuidance =
  | 'unspecified'
  | 'none'
  | 'waitForReadiness'
  | 'workerReplacement'
  | 'operatorInterventionRequired';

export type ReplayGuidance =
  'unspecified' | 'doNotReplay' | 'mayReplay' | 'reconcileBeforeReplay';

export type ReplaySafety = 'unspecified' | 'safe' | 'unsafe' | 'unknown';

export type SpatialAnalyzerLifecycleFailureKind =
  | 'unspecified'
  | 'validation'
  | 'stateConflict'
  | 'applicationNotFound'
  | 'applicationAmbiguous'
  | 'launchFailed'
  | 'notOwned'
  | 'sdkNotStopped'
  | 'timeout'
  | 'internal';

export type SpatialAnalyzerSdkLifecycleFailureKind =
  | 'unspecified'
  | 'validation'
  | 'stateConflict'
  | 'applicationNotFound'
  | 'applicationAmbiguous'
  | 'sdkAlreadyActive'
  | 'sdkNotRunning'
  | 'sdkStartFailed'
  | 'sdkStopFailed'
  | 'recoveryNotRequired'
  | 'sdkRecoveryFailed'
  | 'identityMismatch'
  | 'operatorActionRequired'
  | 'timeout'
  | 'internal'
  | 'sdkAlreadyConnected'
  | 'sdkConnectionFailed'
  | 'reconnectNotRequired'
  | 'sdkRecoveryRequired';

export type LifecycleRecoveryGuidance =
  | 'unspecified'
  | 'none'
  | 'refreshState'
  | 'retryAfterStateChange'
  | 'correctEnvironment'
  | 'stopSdkFirst'
  | 'recoverSdkWithoutReplay'
  | 'operatorActionRequired';

export interface SpatialAnalyzerLifecycleState {
  readonly stateRevision: bigint;
  readonly applicationState: SpatialAnalyzerApplicationState;
  readonly ownership: SpatialAnalyzerOwnership;
  readonly applicationGeneration: number | null;
  readonly diagnosticCode: string | null;
}

export interface SpatialAnalyzerSdkIncident {
  readonly sdkGeneration: number;
  readonly terminationKind: SpatialAnalyzerSdkTerminationKind;
  readonly executionDisposition: ExecutionDisposition | null;
  readonly operationId: string | null;
  readonly diagnosticCode: string | null;
}

export interface SpatialAnalyzerSdkLifecycleState {
  readonly stateRevision: bigint;
  readonly sdkState: SpatialAnalyzerSdkState;
  readonly sdkGeneration: number | null;
  readonly applicationGeneration: number | null;
  readonly connectionState: SpatialAnalyzerConnectionState;
  readonly executionReadinessState: SpatialAnalyzerExecutionReadinessState;
  readonly readyForMp: boolean;
  readonly recoveryState: SpatialAnalyzerSdkRecoveryState;
  readonly lastIncident: SpatialAnalyzerSdkIncident | null;
  readonly diagnosticCode: string | null;
}

export interface BriosaOperationCapability {
  readonly operationId: string;
  readonly grpcService: string;
  readonly rpc: string;
  readonly fullyQualifiedMethod: string;
}

export interface BriosaServerSnapshot {
  readonly briosaVersion: string;
  readonly sourceRevision: string;
  readonly protocolPackage: string;
  readonly spatialAnalyzerTarget: string;
  readonly readyForMp: boolean;
  readonly operations: readonly BriosaOperationCapability[];
  supports(fullyQualifiedMethod: string): boolean;
}

export interface NormalizedBriosaStartOptions {
  readonly startSpatialAnalyzerSdk: boolean;
  readonly launchSpatialAnalyzer: boolean;
  readonly connectToSpatialAnalyzer: boolean;
  readonly launchOptions: SpatialAnalyzerLaunchOptions;
  readonly startupTimeoutMs: number;
  readonly signal?: AbortSignal;
}

export function validateClientOptions(options: BriosaClientOptions): void {
  if (
    options.commandTimeoutMs !== undefined &&
    options.commandTimeoutMs !== null
  ) {
    requirePositiveTimeout(options.commandTimeoutMs, 'commandTimeoutMs');
  }
}

export function normalizeStartOptions(
  options: BriosaStartOptions,
): NormalizedBriosaStartOptions {
  const normalized: NormalizedBriosaStartOptions = {
    startSpatialAnalyzerSdk: options.startSpatialAnalyzerSdk ?? true,
    launchSpatialAnalyzer: options.launchSpatialAnalyzer ?? true,
    connectToSpatialAnalyzer: options.connectToSpatialAnalyzer ?? true,
    launchOptions: options.launchOptions ?? {},
    startupTimeoutMs: options.startupTimeoutMs ?? 30_000,
    ...(options.signal === undefined ? {} : { signal: options.signal }),
  };
  requirePositiveTimeout(normalized.startupTimeoutMs, 'startupTimeoutMs');
  validateLaunchOptions(normalized.launchOptions);
  if (
    normalized.connectToSpatialAnalyzer &&
    !normalized.startSpatialAnalyzerSdk
  ) {
    throw new TypeError(
      'connectToSpatialAnalyzer requires startSpatialAnalyzerSdk.',
    );
  }
  if (
    !normalized.launchSpatialAnalyzer &&
    !isDefaultLaunchOptions(normalized.launchOptions)
  ) {
    throw new TypeError(
      'launchOptions must be empty when launchSpatialAnalyzer is false.',
    );
  }
  return normalized;
}

export function validateLaunchOptions(
  options: SpatialAnalyzerLaunchOptions,
): void {
  if (
    options.jobFilePath !== undefined &&
    options.quickStartInstrumentName !== undefined
  ) {
    throw new TypeError(
      'jobFilePath and quickStartInstrumentName are mutually exclusive.',
    );
  }
  if (
    options.jobFilePath !== undefined &&
    (!/^[A-Za-z]:[\\/]/u.test(options.jobFilePath) ||
      options.jobFilePath.trim().length === 0)
  ) {
    throw new TypeError('jobFilePath must be an absolute Windows path.');
  }
  const instrument = options.quickStartInstrumentName;
  if (
    instrument !== undefined &&
    (instrument.trim().length === 0 ||
      instrument.length > 256 ||
      [...instrument].some((character) => character.charCodeAt(0) < 32))
  ) {
    throw new TypeError('quickStartInstrumentName is invalid.');
  }
}

function isDefaultLaunchOptions(
  options: SpatialAnalyzerLaunchOptions,
): boolean {
  return (
    options.jobFilePath === undefined &&
    options.quickStartInstrumentName === undefined &&
    options.startMinimized !== true
  );
}

function requirePositiveTimeout(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive finite number.`);
  }
}
