// A program written against the Client 0.5.0 declarations. It builds a
// structurally compatible value of every exported data interface and error
// class, lists every member of every exported union as Client 0.5.0 had it,
// and calls the constructors with 0.5.0 arguments. It is type-checked, never
// run: by `npm test` against this source, and by `npm run package:consumer`
// against the packed declarations, so a new required member, a removed or
// narrowed one, or a changed constructor fails the build. The same file
// type-checks against the published 0.5.0 package.

import {
  BriosaCallAbortedError,
  BriosaCompatibilityError,
  type BriosaError,
  BriosaLifecycleError,
  BriosaOperationError,
  BriosaProtocolError,
  BriosaSpatialAnalyzerError,
  BriosaSpatialAnalyzerSdkError,
  BriosaStartupError,
  BriosaTransportError,
  type BriosaCallOptions,
  type BriosaCapabilityListing,
  type BriosaCapabilityListOptions,
  type BriosaClientOptions,
  type BriosaDiscoveryDiagnostic,
  type BriosaDiscoveryReport,
  type BriosaInstallation,
  type BriosaLifecycleCallOptions,
  type BriosaLoggingOptions,
  type BriosaLogLevel,
  type BriosaOperationCapability,
  type BriosaServerSelection,
  type BriosaServerSnapshot,
  type BriosaStartOptions,
  type ExecutionDisposition,
  type InstallationScope,
  type LifecycleRecoveryGuidance,
  type MpCompletion,
  type MpCompletionState,
  type MpExecutionDetails,
  type MpExecutionState,
  type OperationAdmission,
  type OperationDurationClass,
  type OperationFailureKind,
  type OperationRiskFlag,
  type OperationValidationStatus,
  type OutputRetrievalDetails,
  type OutputRetrievalState,
  type RecoveryGuidance,
  type ReplayGuidance,
  type ReplaySafety,
  type SpatialAnalyzerApplicationState,
  type SpatialAnalyzerConnectionState,
  type SpatialAnalyzerExecutionReadinessState,
  type SpatialAnalyzerLaunchOptions,
  type SpatialAnalyzerLifecycleFailureKind,
  type SpatialAnalyzerLifecycleState,
  type SpatialAnalyzerOwnership,
  type SpatialAnalyzerSdkIncident,
  type SpatialAnalyzerSdkLifecycleFailureKind,
  type SpatialAnalyzerSdkLifecycleState,
  type SpatialAnalyzerSdkRecoveryMode,
  type SpatialAnalyzerSdkRecoveryState,
  type SpatialAnalyzerSdkState,
  type SpatialAnalyzerSdkTerminationKind,
} from '../../src/index.js';

export const unions = {
  executionDisposition: [
    'unspecified',
    'notStarted',
    'startedOutcomeUnknown',
    'completed',
  ] satisfies ExecutionDisposition[],
  installationScope: [
    'machine',
    'user',
    'portable',
  ] satisfies InstallationScope[],
  lifecycleRecoveryGuidance: [
    'unspecified',
    'none',
    'refreshState',
    'retryAfterStateChange',
    'correctEnvironment',
    'stopSdkFirst',
    'recoverSdkWithoutReplay',
    'operatorActionRequired',
  ] satisfies LifecycleRecoveryGuidance[],
  logLevel: [
    'Trace',
    'Debug',
    'Information',
    'Warning',
    'Error',
    'Critical',
    'None',
  ] satisfies BriosaLogLevel[],
  mpCompletionState: [
    'succeeded',
    'partialSuccess',
  ] satisfies MpCompletionState[],
  mpExecutionState: [
    'unspecified',
    'succeeded',
    'executeStepRejected',
    'failed',
    'resultUnavailable',
    'argumentRejected',
    'partialSuccess',
  ] satisfies MpExecutionState[],
  operationAdmission: [
    'unspecified',
    'admitted',
    'deniedProfile',
    'deniedFlag',
    'deniedOverride',
    'deniedExclusive',
    'deniedUnreviewed',
    'unknown',
  ] satisfies OperationAdmission[],
  operationDurationClass: [
    'unspecified',
    'quick',
    'longRunning',
    'interactive',
    'unknown',
  ] satisfies OperationDurationClass[],
  operationFailureKind: [
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
    'overloaded',
    'sdkCallFaulted',
  ] satisfies OperationFailureKind[],
  operationRiskFlag: [
    'unspecified',
    'filesystemMetadata',
    'filesystemRead',
    'filesystemWrite',
    'filesystemDelete',
    'destructive',
    'codeExecution',
    'physicalMotion',
    'deviceSession',
    'deviceConfig',
    'interactiveUi',
    'externalIo',
    'unknown',
  ] satisfies OperationRiskFlag[],
  operationValidationStatus: [
    'unspecified',
    'noRecordedGap',
    'fixturePending',
    'atRiskUnvalidated',
    'unknown',
  ] satisfies OperationValidationStatus[],
  outputRetrievalState: [
    'unspecified',
    'retrieved',
    'notAttempted',
    'failed',
  ] satisfies OutputRetrievalState[],
  recoveryGuidance: [
    'unspecified',
    'none',
    'waitForReadiness',
    'workerReplacement',
    'operatorInterventionRequired',
  ] satisfies RecoveryGuidance[],
  replayGuidance: [
    'unspecified',
    'doNotReplay',
    'mayReplay',
    'reconcileBeforeReplay',
  ] satisfies ReplayGuidance[],
  replaySafety: [
    'unspecified',
    'safe',
    'unsafe',
    'unknown',
  ] satisfies ReplaySafety[],
  applicationState: [
    'unspecified',
    'notRunning',
    'starting',
    'running',
    'closing',
    'exited',
    'ambiguous',
    'faulted',
  ] satisfies SpatialAnalyzerApplicationState[],
  connectionState: [
    'unspecified',
    'disconnected',
    'connecting',
    'connected',
    'faulted',
    'stopping',
  ] satisfies SpatialAnalyzerConnectionState[],
  executionReadinessState: [
    'unspecified',
    'unverified',
    'verifying',
    'executionReady',
    'competingClientSuspected',
    'operatorRecoveryRequired',
  ] satisfies SpatialAnalyzerExecutionReadinessState[],
  lifecycleFailureKind: [
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
    'callerCancelled',
    'callerDeadlineExceeded',
  ] satisfies SpatialAnalyzerLifecycleFailureKind[],
  ownership: [
    'unspecified',
    'none',
    'external',
    'serverLaunched',
  ] satisfies SpatialAnalyzerOwnership[],
  sdkLifecycleFailureKind: [
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
    'callerCancelled',
    'callerDeadlineExceeded',
  ] satisfies SpatialAnalyzerSdkLifecycleFailureKind[],
  sdkRecoveryMode: [
    'replaceWithoutReplay',
  ] satisfies SpatialAnalyzerSdkRecoveryMode[],
  sdkRecoveryState: [
    'unspecified',
    'notRequired',
    'recoveryAvailable',
    'operatorActionRequired',
    'blocked',
  ] satisfies SpatialAnalyzerSdkRecoveryState[],
  sdkState: [
    'unspecified',
    'stopped',
    'starting',
    'running',
    'connecting',
    'verifying',
    'ready',
    'stopping',
    'recovering',
    'faulted',
  ] satisfies SpatialAnalyzerSdkState[],
  terminationKind: [
    'unspecified',
    'startFailed',
    'sdkProcessExited',
    'sdkConnectionLost',
    'workerProcessExited',
    'controlChannelLost',
    'watchdogTerminated',
  ] satisfies SpatialAnalyzerSdkTerminationKind[],
};

const applicationState: SpatialAnalyzerLifecycleState = {
  stateRevision: 1n,
  applicationState: 'running',
  ownership: 'serverLaunched',
  applicationGeneration: 1,
  diagnosticCode: null,
};

const incident: SpatialAnalyzerSdkIncident = {
  sdkGeneration: 1,
  terminationKind: 'watchdogTerminated',
  executionDisposition: null,
  operationId: null,
  diagnosticCode: null,
};

const sdkState: SpatialAnalyzerSdkLifecycleState = {
  stateRevision: 1n,
  sdkState: 'ready',
  sdkGeneration: 1,
  applicationGeneration: 1,
  connectionState: 'connected',
  executionReadinessState: 'executionReady',
  readyForMp: true,
  recoveryState: 'notRequired',
  lastIncident: incident,
  diagnosticCode: null,
};

const retrieval: OutputRetrievalDetails = {
  fieldName: 'directory',
  state: 'retrieved',
  diagnosticCode: null,
};

const mpExecution: MpExecutionDetails = {
  state: 'partialSuccess',
  mpResultCode: 4,
  outputRetrievals: [retrieval],
};

const completion: MpCompletion = { state: 'succeeded', mpResultCode: 2 };

const capability: BriosaOperationCapability = {
  operationId: 'file_operations.get_working_directory',
  grpcService: 'briosa.FileOperations',
  rpc: 'GetWorkingDirectory',
  fullyQualifiedMethod: '/briosa.FileOperations/GetWorkingDirectory',
  riskFlags: ['filesystemMetadata'],
  durationClass: 'quick',
  validationStatus: 'noRecordedGap',
  admission: 'admitted',
};

const snapshot: BriosaServerSnapshot = {
  briosaVersion: '0.10.0',
  sourceRevision: 'a'.repeat(40),
  protocolPackage: 'briosa',
  spatialAnalyzerTarget: 'target',
  readyForMp: true,
  admissionProfile: 'standard',
  policyFingerprint: 'sha256:0',
  operations: [capability],
  supports: () => true,
};

const listing: BriosaCapabilityListing = {
  admissionProfile: 'standard',
  policyFingerprint: 'sha256:0',
  operations: [capability],
};

const installation: BriosaInstallation = {
  installationId: 'id',
  executablePath: 'C:/Briosa/Briosa.Server.exe',
  version: '0.10.0',
  sourceRevision: 'a'.repeat(40),
  spatialAnalyzerTarget: 'target',
  runtimeIdentifier: 'win-x64',
  contractMajor: 3,
  contractRevision: 0,
  manifestSha256: 'b'.repeat(64),
  scope: 'machine',
};

const diagnostic: BriosaDiscoveryDiagnostic = { path: 'C:/x', code: 'code' };

const report: BriosaDiscoveryReport = {
  installations: [installation],
  diagnostics: [diagnostic],
  selected: installation,
  diagnosticCode: null,
};

const selection: BriosaServerSelection = {
  executablePath: 'C:/Briosa/Briosa.Server.exe',
  installationId: 'id',
  version: '0.10.0',
  minimumVersion: '0.10.0',
  maximumVersionExclusive: '0.11.0',
  excludedVersions: [],
  searchRoots: [],
  allowedScopes: ['machine'],
  allowPrerelease: false,
  useLegacyEnvironmentOverride: false,
  spatialAnalyzerExecutablePath: 'C:/SA/Spatial Analyzer64.exe',
};

const logging: BriosaLoggingOptions = {
  minimumLevel: 'Information',
  categoryLevels: { Briosa: 'Debug' },
  consoleEnabled: false,
  fileEnabled: true,
  fileDirectory: 'C:/Logs',
  maxFileSizeMiB: 20,
  retainedFileCount: 10,
  maxAgeDays: 7,
  maxTotalSizeMiB: 200,
};

const launchOptions: SpatialAnalyzerLaunchOptions = {
  jobFilePath: 'C:/Jobs/job.xit64',
  startMinimized: true,
};

const lifecycleCallOptions: BriosaLifecycleCallOptions = {
  signal: AbortSignal.timeout(1_000),
};

const startOptions: BriosaStartOptions = {
  ...lifecycleCallOptions,
  serverSelection: selection,
  logging,
  startSpatialAnalyzerSdk: true,
  launchSpatialAnalyzer: true,
  connectToSpatialAnalyzer: true,
  launchOptions,
  startupTimeoutMs: 120_000,
};

const callOptions: BriosaCallOptions = {
  signal: AbortSignal.timeout(1_000),
  onMpCompletion: (observed: MpCompletion) => observed.state,
};

const listOptions: BriosaCapabilityListOptions = { includeDenied: true };

const clientOptions: BriosaClientOptions = { commandTimeoutMs: null };

// Structural doubles of every error class, as an application's tests might
// build them, then each constructor with its Client 0.5.0 arguments.
const errorBase = { name: 'Error', message: 'failed' };

const operationErrorDouble: BriosaOperationError = {
  ...errorBase,
  operationId: 'file_operations.get_working_directory',
  kind: 'policyDenied',
  diagnosticCode: 'operation-policy-denied',
  executionDisposition: 'notStarted',
  recoveryGuidance: 'none',
  replayGuidance: 'doNotReplay',
  replaySafety: 'safe',
  mpExecution: null,
  completionUnknown: false,
  reconciliationRequired: false,
};

export const doubles = {
  operationErrorDouble,
  briosaError: errorBase satisfies BriosaError,
  startupError: {
    ...errorBase,
    diagnosticCode: 'startup-timeout',
  } satisfies BriosaStartupError,
  lifecycleError: {
    ...errorBase,
    diagnosticCode: 'client-not-started',
  } satisfies BriosaLifecycleError,
  protocolError: {
    ...errorBase,
    diagnosticCode: 'unknown-enum-value',
  } satisfies BriosaProtocolError,
  abortError: {
    ...errorBase,
    reason: undefined,
  } satisfies BriosaCallAbortedError,
  transportError: {
    ...errorBase,
    diagnosticCode: 'transport-unavailable',
  } satisfies BriosaTransportError,
  compatibilityError: {
    ...errorBase,
    diagnosticCode: 'server-contract-incompatible',
  } satisfies BriosaCompatibilityError,
  applicationError: {
    ...errorBase,
    kind: 'stateConflict',
    diagnosticCode: 'application-lifecycle-transition-in-progress',
    recoveryGuidance: 'refreshState',
    state: applicationState,
  } satisfies BriosaSpatialAnalyzerError,
  sdkError: {
    ...errorBase,
    kind: 'stateConflict',
    diagnosticCode: 'sdk-lifecycle-transition-in-progress',
    recoveryGuidance: 'refreshState',
    state: sdkState,
  } satisfies BriosaSpatialAnalyzerSdkError,
};

export const constructed = [
  new BriosaOperationError(
    'file_operations.get_working_directory',
    'mpFailure',
    'mp-failed',
    'completed',
    'none',
    'doNotReplay',
    'unsafe',
    mpExecution,
  ),
  new BriosaOperationError(
    'file_operations.get_working_directory',
    'policyDenied',
    'operation-policy-denied',
    'notStarted',
    'none',
    'doNotReplay',
    'safe',
  ),
  new BriosaStartupError('startup-timeout', { cause: new Error('x') }),
  new BriosaLifecycleError('client-not-started'),
  new BriosaProtocolError('unknown-enum-value'),
  new BriosaCallAbortedError('reason'),
  new BriosaTransportError('transport-unavailable'),
  new BriosaCompatibilityError('server-contract-incompatible'),
  new BriosaSpatialAnalyzerError(
    'timeout',
    'code',
    'refreshState',
    applicationState,
  ),
  new BriosaSpatialAnalyzerSdkError(
    'timeout',
    'code',
    'refreshState',
    sdkState,
  ),
] satisfies BriosaError[] | Error[];

export const values = {
  completion,
  snapshot,
  listing,
  report,
  startOptions,
  callOptions,
  listOptions,
  clientOptions,
};
