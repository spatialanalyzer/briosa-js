import type {
  GetServerInfoResponse,
  ListCapabilitiesResponse,
  OperationCapability as WireOperationCapability,
} from './generated/protocol/briosa/discovery.js';
import { briosaProtocolIdentity } from './generated/protocolIdentity.js';
import type {
  SpatialAnalyzerLifecycleState as WireApplicationState,
  SpatialAnalyzerSdkLifecycleState as WireSdkState,
} from './generated/protocol/briosa/lifecycle.js';
import {
  BriosaCompatibilityError,
  validateBriosaCompatibility,
} from './compatibility.js';
import { BriosaProtocolError } from './errors.js';
import type {
  BriosaCapabilityListing,
  BriosaOperationCapability,
  BriosaServerSnapshot,
  ExecutionDisposition,
  OperationAdmission,
  OperationDurationClass,
  OperationRiskFlag,
  OperationValidationStatus,
  SpatialAnalyzerApplicationState,
  SpatialAnalyzerConnectionState,
  SpatialAnalyzerExecutionReadinessState,
  SpatialAnalyzerLifecycleState,
  SpatialAnalyzerOwnership,
  SpatialAnalyzerSdkLifecycleState,
  SpatialAnalyzerSdkRecoveryState,
  SpatialAnalyzerSdkState,
  SpatialAnalyzerSdkTerminationKind,
} from './models.js';

export function mapSnapshot(
  server: GetServerInfoResponse,
  capabilities: ListCapabilitiesResponse,
): BriosaServerSnapshot {
  validateBriosaCompatibility(server, capabilities);
  const version = server.version;
  if (version === undefined)
    throw new BriosaProtocolError('server-version-missing');
  return {
    briosaVersion: version.briosaVersion ?? '',
    sourceRevision: version.sourceRevision ?? '',
    protocolPackage: version.protocolPackage ?? '',
    spatialAnalyzerTarget: version.spatialAnalyzerTarget ?? '',
    readyForMp: server.readyForMp ?? false,
    admissionProfile: capabilities.admissionProfile ?? '',
    policyFingerprint: capabilities.policyFingerprint ?? '',
    operations: (capabilities.operations ?? []).map(mapCapability),
    supports(fullyQualifiedMethod: string): boolean {
      return this.operations.some(
        (operation) => operation.fullyQualifiedMethod === fullyQualifiedMethod,
      );
    },
  };
}

/** Maps a diagnostic listing; the generation's admitted set never changes. */
export function mapCapabilityListing(
  capabilities: ListCapabilitiesResponse,
): BriosaCapabilityListing {
  if (capabilities.protocolPackage !== briosaProtocolIdentity.protocolPackage)
    throw new BriosaCompatibilityError('capability-protocol-package-mismatch');
  if (
    capabilities.spatialAnalyzerTarget !==
    briosaProtocolIdentity.spatialAnalyzerTarget
  )
    throw new BriosaCompatibilityError('capability-sa-target-mismatch');
  return {
    admissionProfile: capabilities.admissionProfile ?? '',
    policyFingerprint: capabilities.policyFingerprint ?? '',
    operations: (capabilities.operations ?? []).map(mapCapability),
  };
}

const riskFlags: readonly OperationRiskFlag[] = [
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
];
const durationClasses: readonly OperationDurationClass[] = [
  'unspecified',
  'quick',
  'longRunning',
  'interactive',
];
const validationStatuses: readonly OperationValidationStatus[] = [
  'unspecified',
  'noRecordedGap',
  'fixturePending',
  'atRiskUnvalidated',
];
const admissions: readonly OperationAdmission[] = [
  'unspecified',
  'admitted',
  'deniedProfile',
  'deniedFlag',
  'deniedOverride',
  'deniedExclusive',
  'deniedUnreviewed',
];

function mapCapability(
  operation: WireOperationCapability,
): BriosaOperationCapability {
  return {
    operationId: operation.operationId ?? '',
    grpcService: operation.grpcService ?? '',
    rpc: operation.rpc ?? '',
    fullyQualifiedMethod: operation.fullyQualifiedMethod ?? '',
    // An ordered set: the server's order, without repeats.
    riskFlags: [
      ...new Set(
        (operation.riskFlags ?? []).map((flag) =>
          classificationValue(riskFlags, flag),
        ),
      ),
    ],
    durationClass: classificationValue(
      durationClasses,
      operation.durationClass,
    ),
    validationStatus: classificationValue(
      validationStatuses,
      operation.validationStatus,
    ),
    admission: classificationValue(admissions, operation.admission),
  };
}

// A classification value from a later contract revision never fails
// discovery; it maps to the distinct unknown member.
function classificationValue<T extends string>(
  values: readonly T[],
  value: number | undefined,
): T | 'unknown' {
  if (value === undefined) return values[0]!;
  return values[value] ?? 'unknown';
}

export function mapApplicationState(
  state: WireApplicationState,
): SpatialAnalyzerLifecycleState {
  const applicationStates: readonly SpatialAnalyzerApplicationState[] = [
    'unspecified',
    'notRunning',
    'starting',
    'running',
    'closing',
    'exited',
    'ambiguous',
    'faulted',
  ];
  const ownershipValues: readonly SpatialAnalyzerOwnership[] = [
    'unspecified',
    'none',
    'external',
    'serverLaunched',
  ];
  return {
    stateRevision: state.stateRevision ?? 0n,
    applicationState: requireEnum(applicationStates, state.applicationState),
    ownership: requireEnum(ownershipValues, state.ownership),
    applicationGeneration: optionalGeneration(
      state.applicationGeneration,
      'application-generation-invalid',
    ),
    diagnosticCode: state.diagnosticCode ?? null,
  };
}

export function mapSdkState(
  state: WireSdkState,
): SpatialAnalyzerSdkLifecycleState {
  const sdkStates: readonly SpatialAnalyzerSdkState[] = [
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
  ];
  const connectionStates: readonly SpatialAnalyzerConnectionState[] = [
    'unspecified',
    'disconnected',
    'connecting',
    'connected',
    'faulted',
    'stopping',
  ];
  const readinessStates: readonly SpatialAnalyzerExecutionReadinessState[] = [
    'unspecified',
    'unverified',
    'verifying',
    'executionReady',
    'competingClientSuspected',
    'operatorRecoveryRequired',
  ];
  const recoveryStates: readonly SpatialAnalyzerSdkRecoveryState[] = [
    'unspecified',
    'notRequired',
    'recoveryAvailable',
    'operatorActionRequired',
    'blocked',
  ];
  const incident = state.lastIncident;
  return {
    stateRevision: state.stateRevision ?? 0n,
    sdkState: requireEnum(sdkStates, state.sdkState),
    sdkGeneration: optionalGeneration(
      state.sdkGeneration,
      'sdk-generation-invalid',
    ),
    applicationGeneration: optionalGeneration(
      state.applicationGeneration,
      'sdk-application-generation-invalid',
    ),
    connectionState: requireEnum(connectionStates, state.connectionState),
    executionReadinessState: requireEnum(
      readinessStates,
      state.executionReadinessState,
    ),
    readyForMp: state.readyForMp ?? false,
    recoveryState: requireEnum(recoveryStates, state.recoveryState),
    lastIncident:
      incident === undefined
        ? null
        : {
            sdkGeneration: requireGeneration(
              incident.sdkGeneration,
              'incident-generation-invalid',
            ),
            terminationKind: requireEnum(
              [
                'unspecified',
                'startFailed',
                'sdkProcessExited',
                'sdkConnectionLost',
                'workerProcessExited',
                'controlChannelLost',
                'watchdogTerminated',
              ] satisfies readonly SpatialAnalyzerSdkTerminationKind[],
              incident.terminationKind,
            ),
            executionDisposition:
              incident.executionDisposition === undefined
                ? null
                : requireEnum(
                    [
                      'unspecified',
                      'notStarted',
                      'startedOutcomeUnknown',
                      'completed',
                    ] satisfies readonly ExecutionDisposition[],
                    incident.executionDisposition,
                  ),
            operationId: incident.operationId ?? null,
            diagnosticCode: incident.diagnosticCode ?? null,
          },
    diagnosticCode: state.diagnosticCode ?? null,
  };
}

function optionalGeneration(
  value: number | undefined,
  diagnosticCode: string,
): number | null {
  return value === undefined ? null : requireGeneration(value, diagnosticCode);
}

function requireGeneration(
  value: number | undefined,
  diagnosticCode: string,
): number {
  if (value === undefined || !Number.isInteger(value) || value <= 0) {
    throw new BriosaProtocolError(diagnosticCode);
  }
  return value;
}

function requireEnum<T>(values: readonly T[], value: number | undefined): T {
  const mapped = value === undefined ? undefined : values[value];
  if (mapped === undefined) throw new BriosaProtocolError('unknown-enum-value');
  return mapped;
}
