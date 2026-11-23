import type {
  GetServerInfoResponse,
  GracefulShutdownBound as WireGracefulShutdownBound,
  LifecycleBounds as WireLifecycleBounds,
  ListCapabilitiesResponse,
  OperationCapability as WireOperationCapability,
  OperationRequestOption as WireOperationRequestOption,
} from './generated/protocol/briosa/discovery.js';
import type { PolicyDenialDetails as WirePolicyDenialDetails } from './generated/protocol/briosa/operation_outcomes.js';
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
  BriosaHostShutdownBound,
  BriosaLifecycleBounds,
  BriosaOperationCapability,
  BriosaOperationRequestOption,
  BriosaServerSnapshot,
  ConfiguredSpatialAnalyzerInteractionMode,
  ExecutionDisposition,
  OperationAdmission,
  OperationDurationClass,
  OperationRequestOptionCondition,
  OperationRequestOptionEffect,
  OperationRequestOptionOmission,
  OperationRiskFlag,
  OperationValidationStatus,
  PolicyDenialDetails,
  PolicyDenialRule,
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
    lifecycleBounds: mapLifecycleBounds(server.lifecycleBounds),
    configuredSpatialAnalyzerInteractionMode: classificationValue(
      interactionModes,
      server.configuredSpatialAnalyzerInteractionMode,
    ),
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
    policyDenial: optionalPolicyDenial(operation.policyDenial),
    // Absent means "not described" (Server 0.10.0); present and empty means
    // that no request option applies.
    requestOptions:
      operation.requestOptions === undefined
        ? null
        : (operation.requestOptions.options ?? []).map(mapRequestOption),
  };
}

const policyDenialRules: readonly PolicyDenialRule[] = [
  'unspecified',
  'profile',
  'flag',
  'override',
  'exclusive',
  'unreviewed',
];
const requestOptionEffects: readonly OperationRequestOptionEffect[] = [
  'unspecified',
  'interactiveUi',
  'backgroundWork',
];
const requestOptionConditions: readonly OperationRequestOptionCondition[] = [
  'unspecified',
  'whenTrue',
  'whenFalse',
  'whenPresent',
  'whenNonEmpty',
  'whenOneOf',
];
const requestOptionOmissions: readonly OperationRequestOptionOmission[] = [
  'unspecified',
  'doesNotActivate',
  'activates',
  'required',
];
// UNSPECIFIED (Server 0.10.0) and any value this client does not know are both
// unknown.
const interactionModes: readonly ConfiguredSpatialAnalyzerInteractionMode[] = [
  'unknown',
  'unchanged',
  'silent',
  'automatic',
  'manual',
];

// The wire names a denied flag by the lowercase suffix of its OperationRiskFlag
// value name, for example "physical_motion".
const riskFlagsByName: ReadonlyMap<string, OperationRiskFlag> = new Map(
  riskFlags
    .filter((flag) => flag !== 'unspecified')
    .map((flag) => [
      flag.replace(/[A-Z]/gu, (letter) => `_${letter.toLowerCase()}`),
      flag,
    ]),
);

/**
 * Maps a denied flag's wire name to the public risk flag. Every denial detail
 * uses this one helper. A name this client does not know, including
 * "unspecified", is `unknown`; names are compared exactly.
 */
export function riskFlagFromName(name: string): OperationRiskFlag {
  return riskFlagsByName.get(name) ?? 'unknown';
}

/**
 * Maps a decoded denial detail without validating it: an unknown rule or flag
 * becomes `unknown`, and fields that disagree with each other are reported as
 * sent. It never fails, so it never changes the enclosing failure or admission.
 */
export function mapPolicyDenial(
  detail: WirePolicyDenialDetails,
): PolicyDenialDetails {
  return {
    rule: classificationValue(policyDenialRules, detail.rule),
    deniedFlag:
      detail.deniedFlag === undefined
        ? null
        : riskFlagFromName(detail.deniedFlag),
    admissionProfile: detail.admissionProfile ?? null,
    requestOptionField: detail.requestOptionField ?? null,
  };
}

function optionalPolicyDenial(
  detail: WirePolicyDenialDetails | undefined,
): PolicyDenialDetails | null {
  return detail === undefined ? null : mapPolicyDenial(detail);
}

function mapRequestOption(
  option: WireOperationRequestOption,
): BriosaOperationRequestOption {
  return {
    fieldName: option.fieldName ?? '',
    effect: classificationValue(requestOptionEffects, option.effect),
    condition: classificationValue(requestOptionConditions, option.condition),
    enablingEnumValues: [...(option.enablingEnumValues ?? [])],
    omission: classificationValue(requestOptionOmissions, option.omission),
    admission: classificationValue(admissions, option.admission),
    policyDenial: optionalPolicyDenial(option.policyDenial),
  };
}

// An absent or zero allowance is unavailable, never unbounded.
function allowance(value: number | undefined): number | null {
  return value !== undefined && Number.isSafeInteger(value) && value > 0
    ? value
    : null;
}

function mapLifecycleBounds(
  bounds: WireLifecycleBounds | undefined,
): BriosaLifecycleBounds {
  return {
    startSdkMs: allowance(bounds?.startSdkMilliseconds),
    launchSpatialAnalyzerMs: allowance(
      bounds?.launchSpatialAnalyzerMilliseconds,
    ),
    connectSpatialAnalyzerMs: allowance(
      bounds?.connectSpatialAnalyzerMilliseconds,
    ),
    recoverSdkMs: allowance(bounds?.recoverSdkMilliseconds),
    stopSdkMs: allowance(bounds?.stopSdkMilliseconds),
    closeOwnedSpatialAnalyzerMs: allowance(
      bounds?.closeOwnedSpatialAnalyzerMilliseconds,
    ),
    startupWithLaunchMs: allowance(bounds?.startupWithLaunchMilliseconds),
    startupWithoutLaunchMs: allowance(bounds?.startupWithoutLaunchMilliseconds),
    hostGracefulShutdown: mapHostShutdownBound(bounds?.hostGracefulShutdown),
  };
}

// Read from the limit case, never from a bare finite value. An absent bound, an
// unset or unrecognized case, a zero, and a value too large to represent
// exactly as a number are unavailable.
function mapHostShutdownBound(
  bound: WireGracefulShutdownBound | undefined,
): BriosaHostShutdownBound {
  const limit = bound?.limit;
  if (limit?.$case === 'unbounded') return { kind: 'unbounded' };
  if (limit?.$case === 'finiteMilliseconds') {
    const value = limit.value;
    if (
      typeof value === 'bigint' &&
      value > 0n &&
      value <= BigInt(Number.MAX_SAFE_INTEGER)
    ) {
      return { kind: 'finite', milliseconds: Number(value) };
    }
  }
  // A fresh object each time: a caller may change what it receives.
  return { kind: 'unavailable' };
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
