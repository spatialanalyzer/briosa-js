/** Handwritten public lifecycle and discovery types. */
import { defaultStartupTimeoutMs } from './startupBudget.js';
import {
  normalizeSelection,
  type BriosaServerSelection,
} from './installationModels.js';
import {
  loggingArguments,
  type BriosaLoggingOptions,
} from './loggingOptions.js';

export interface BriosaClientOptions {
  readonly commandTimeoutMs?: number | null;
}

export interface BriosaLifecycleCallOptions {
  readonly signal?: AbortSignal;
}

export interface BriosaCallOptions {
  readonly signal?: AbortSignal;
  /**
   * Called once with this call's MP completion when the operation succeeds,
   * after the client has checked the completion and before it maps the outputs,
   * so the callback sees the completion even if output mapping then fails. A
   * partial success (MP code 4) did its work: when the server retrieves all the
   * outputs, the call returns them as usual and reports `partialSuccess` here.
   * Otherwise the call rejects with `BriosaOperationError`
   * (`outputRetrievalFailure` or `sdkCallFaulted`), whose `mpExecution` keeps
   * `partialSuccess`, and this callback isn't called. The client checks every
   * success, observed or not (`mp-completion-missing` or
   * `mp-completion-invalid` when the completion breaks the contract), so a
   * callback never changes how a completion is judged. An exception thrown by
   * the callback rejects the call, although the operation completed.
   */
  readonly onMpCompletion?: (completion: MpCompletion) => void;
}

/** How a successful MP command completed. */
export type MpCompletionState = 'succeeded' | 'partialSuccess';

/**
 * The MP completion of one successful call, with its MP result code: 2 for
 * `succeeded`, 4 for `partialSuccess`.
 */
export interface MpCompletion {
  readonly state: MpCompletionState;
  readonly mpResultCode: number;
}

export interface SpatialAnalyzerLaunchOptions {
  readonly jobFilePath?: string;
  readonly quickStartInstrumentName?: string;
  readonly startMinimized?: boolean;
}

export interface BriosaStartOptions extends BriosaLifecycleCallOptions {
  readonly serverSelection?: BriosaServerSelection;
  readonly logging?: BriosaLoggingOptions;
  readonly startSpatialAnalyzerSdk?: boolean;
  readonly launchSpatialAnalyzer?: boolean;
  readonly connectToSpatialAnalyzer?: boolean;
  readonly launchOptions?: SpatialAnalyzerLaunchOptions;
  /**
   * One overall budget, in milliseconds, for the whole `start()`, whichever phases
   * are selected. Expiry raises `BriosaStartupError` with `startup-timeout`.
   *
   * When you set it, that value is the budget, whatever the server publishes,
   * including an explicit 120000.
   *
   * When you omit it, the budget is two minutes. With Server 0.10.1 and later,
   * the client then sizes the budget from the startup allowance that the server
   * publishes for the selected phases (`lifecycleBounds` on the server
   * snapshot): once, when it first reads the server's identity, it moves the
   * deadline to the start of `start()` plus the larger of two minutes and that
   * allowance plus 20 seconds. The budget never shrinks below two minutes, time
   * already spent counts, and a startup that has already reached its deadline
   * is not extended. When the selected phases need an allowance the server does
   * not publish, or the deadline would be too far away for a Node.js timer, the
   * two minutes stay. Against Server 0.10.0, which publishes no allowances, the
   * budget is two minutes, as in Client 0.5.0.
   *
   * The two minutes cover the server's default worst case of 100 seconds (SDK
   * start 10 s, SpatialAnalyzer launch 30 s, Connect with readiness probe and
   * application association 60 s) plus 20 seconds for server host startup,
   * process observation, and round trips. With Server 0.10.0, raise it when the
   * server's lifecycle bounds are raised. Expiry during an in-flight RPC is
   * reported the same way; aborting the caller's `signal` only stops that caller
   * from waiting. The server finishes an SDK start or connection it has accepted
   * after the client stops waiting (spatialanalyzer/briosa#315), so refresh the
   * SDK state before retrying.
   */
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
  | 'sdkArgumentRejected'
  | 'overloaded'
  | 'sdkCallFaulted';

/** What the MP command itself did, as the server reports it. */
export type MpExecutionState =
  | 'unspecified'
  | 'succeeded'
  | 'executeStepRejected'
  | 'failed'
  | 'resultUnavailable'
  | 'argumentRejected'
  | 'partialSuccess';

/** What happened when the server requested one result-only MP argument. */
export type OutputRetrievalState =
  'unspecified' | 'retrieved' | 'notAttempted' | 'failed';

export interface OutputRetrievalDetails {
  /** The protocol result field name. */
  readonly fieldName: string;
  readonly state: OutputRetrievalState;
  readonly diagnosticCode: string | null;
}

/**
 * Value-free MP execution details that accompany a typed MP failure. A
 * `partialSuccess` state means SpatialAnalyzer returned MP code 4: the command
 * did its work but not its full intended effect.
 */
export interface MpExecutionDetails {
  readonly state: MpExecutionState;
  readonly mpResultCode: number | null;
  readonly outputRetrievals: readonly OutputRetrievalDetails[];
}

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
  | 'internal'
  | 'callerCancelled'
  | 'callerDeadlineExceeded';

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
  | 'sdkRecoveryRequired'
  | 'callerCancelled'
  | 'callerDeadlineExceeded';

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

/**
 * A reviewed risk flag of an operation's classification row (#242). `unknown`
 * is a flag added by a later compatible server release.
 */
export type OperationRiskFlag =
  | 'unspecified'
  | 'filesystemMetadata'
  | 'filesystemRead'
  | 'filesystemWrite'
  | 'filesystemDelete'
  | 'destructive'
  | 'codeExecution'
  | 'physicalMotion'
  | 'deviceSession'
  | 'deviceConfig'
  | 'interactiveUi'
  | 'externalIo'
  | 'unknown';

/** The reviewed execution-duration class, which selects the server budget. */
export type OperationDurationClass =
  'unspecified' | 'quick' | 'longRunning' | 'interactive' | 'unknown';

/** The recorded validation gap. It is informational and never affects admission. */
export type OperationValidationStatus =
  | 'unspecified'
  | 'noRecordedGap'
  | 'fixturePending'
  | 'atRiskUnvalidated'
  | 'unknown';

/** The active policy's static decision for an operation's reviewed row. */
export type OperationAdmission =
  | 'unspecified'
  | 'admitted'
  | 'deniedProfile'
  | 'deniedFlag'
  | 'deniedOverride'
  | 'deniedExclusive'
  | 'deniedUnreviewed'
  | 'unknown';

/**
 * The step of the active admission policy that denied a call or an operation.
 * Each names the same step as the `OperationAdmission` value of the same name:
 * `profile` and `deniedProfile`, `flag` and `deniedFlag`, and so on. `unknown` is
 * a step that a later server release added.
 */
export type PolicyDenialRule =
  | 'unspecified'
  | 'profile'
  | 'flag'
  | 'override'
  | 'exclusive'
  | 'unreviewed'
  | 'unknown';

/**
 * Value-free detail of a policy denial, with Server 0.10.1 and later. It is
 * descriptive: it never changes a failure's kind, disposition, or guidance, or
 * a capability's admission, and the client reports its fields as the server
 * sent them without checking them against each other. Server 0.10.0 sends none.
 */
export interface PolicyDenialDetails {
  readonly rule: PolicyDenialRule;
  /**
   * For a `flag` denial, the risk flag set to deny that decided. `unknown` for a
   * flag that this client does not know, and null when the server named none.
   */
  readonly deniedFlag: OperationRiskFlag | null;
  /** For a `profile` denial, the active admission profile; otherwise null. */
  readonly admissionProfile: string | null;
  /**
   * The protobuf field name of the request option that the server attributed
   * the denial to, such as `show_results_dialog`, never a request value. Null
   * when the operation's reviewed row decided. When a request turns on several
   * options, it names the first in the server's reviewed order, which need not
   * be the only cause.
   */
  readonly requestOptionField: string | null;
}

/** What a request option turns on. `unknown` is a value a later server added. */
export type OperationRequestOptionEffect =
  'unspecified' | 'interactiveUi' | 'backgroundWork' | 'unknown';

/** Which values of a request option's field turn its effect on. */
export type OperationRequestOptionCondition =
  | 'unspecified'
  | 'whenTrue'
  | 'whenFalse'
  | 'whenPresent'
  | 'whenNonEmpty'
  | 'whenOneOf'
  | 'unknown';

/** What omitting a request option's field does. */
export type OperationRequestOptionOmission =
  'unspecified' | 'doesNotActivate' | 'activates' | 'required' | 'unknown';

/**
 * One reviewed request option of an operation, with Server 0.10.1 and later: a
 * request field that turns on operator UI or leaves work running after the call
 * returns. It is descriptive. The server still decides every request, so the
 * client never checks a request against it, and an `unknown` value is unknown
 * metadata, never a permission.
 */
export interface BriosaOperationRequestOption {
  /** The protobuf field name of the option in the operation's request message. */
  readonly fieldName: string;
  readonly effect: OperationRequestOptionEffect;
  readonly condition: OperationRequestOptionCondition;
  /**
   * For `whenOneOf`, the protobuf enum value names that turn the effect on; any
   * enum number the server does not recognize also turns it on. Empty otherwise.
   */
  readonly enablingEnumValues: readonly string[];
  readonly omission: OperationRequestOptionOmission;
  /**
   * What the active policy decides for a request that turns on this option
   * alone, with every other option inactive. A request that turns on several
   * options is decided with all of them together.
   */
  readonly admission: OperationAdmission;
  /** Which policy step denies such a request; null when the server sent none. */
  readonly policyDenial: PolicyDenialDetails | null;
}

export interface BriosaOperationCapability {
  readonly operationId: string;
  readonly grpcService: string;
  readonly rpc: string;
  readonly fullyQualifiedMethod: string;
  /**
   * The reviewed risk flags as an ordered set, in the server's declaration
   * order. Empty when no reviewed risk applies. A request option can still
   * open operator UI or leave work running; the server decides per request.
   */
  readonly riskFlags: readonly OperationRiskFlag[];
  readonly durationClass: OperationDurationClass;
  readonly validationStatus: OperationValidationStatus;
  /** The server's admission value, never recomputed by the client. */
  readonly admission: OperationAdmission;
  /**
   * Which policy step denied the operation, with Server 0.10.1 and later, which
   * send it with a denied admission. Null when the server sent none, as Server
   * 0.10.0 never does. It never changes `admission`.
   *
   * Added in Client 0.5.1. The client always sets it; the type marks it
   * optional only so that values written for Client 0.5.0 still type-check.
   */
  readonly policyDenial?: PolicyDenialDetails | null;
  /**
   * The operation's reviewed request options. With Server 0.10.1 and later it
   * is a list, empty when no option applies. Null when the server did not
   * describe request options, as Server 0.10.0 never does: null means "not
   * described", never "none apply". The client never checks a request against
   * these options.
   *
   * Added in Client 0.5.1. The client always sets it; the type marks it
   * optional only so that values written for Client 0.5.0 still type-check.
   */
  readonly requestOptions?: readonly BriosaOperationRequestOption[] | null;
}

/**
 * The server host's graceful shutdown allowance: `finite` with its duration,
 * explicitly `unbounded`, or `unavailable` when the server did not publish one
 * that this client can read. Unavailable is never read as unbounded.
 */
export type BriosaHostShutdownBound =
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'finite'; readonly milliseconds: number }
  | { readonly kind: 'unbounded' };

/**
 * The lifecycle wait allowances that the server computes from its own effective
 * configuration, in milliseconds, with Server 0.10.1 and later. Each covers only
 * the server's own work, from the event its server documentation names, and
 * none includes transport time or promises that a response arrives or a
 * process exits within it. Null means unavailable: Server 0.10.0 publishes
 * none, and an absent or zero allowance is unavailable. Each value is used on
 * its own, so a missing one never makes another unavailable.
 */
export interface BriosaLifecycleBounds {
  /** StartSpatialAnalyzerSdk, from the server's acceptance to its typed outcome. */
  readonly startSdkMs: number | null;
  /** LaunchSpatialAnalyzer, from the started process until its window is ready. */
  readonly launchSpatialAnalyzerMs: number | null;
  /** ConnectToSpatialAnalyzer and ReconnectToSpatialAnalyzer. */
  readonly connectSpatialAnalyzerMs: number | null;
  /** RecoverSpatialAnalyzerSdk, through the replacement's start. */
  readonly recoverSdkMs: number | null;
  /** StopSpatialAnalyzerSdk, after any MP command in flight has finished. */
  readonly stopSdkMs: number | null;
  /** CloseOwnedSpatialAnalyzer, from the accepted close request. */
  readonly closeOwnedSpatialAnalyzerMs: number | null;
  /**
   * A sizing rule, not a server deadline: Start SDK, Launch, and Connect, each
   * from its own acceptance, without the client's margin.
   */
  readonly startupWithLaunchMs: number | null;
  /** The same sizing rule without the launch: Start SDK, then Connect. */
  readonly startupWithoutLaunchMs: number | null;
  /** The most a graceful stop of the server host may wait. */
  readonly hostGracefulShutdown: BriosaHostShutdownBound;
}

/**
 * The SpatialAnalyzer interaction mode that the server is configured to set
 * after each verified Connect, with Server 0.10.1 and later. It is the server's
 * configuration, never SpatialAnalyzer's live mode: SpatialAnalyzer has no way
 * to read its mode back, and an operator or an MP can change it at any time.
 * `unchanged` means the server leaves the mode alone. `unknown` means the
 * server did not report one, as Server 0.10.0 never does, or reported a value
 * this client does not know.
 */
export type ConfiguredSpatialAnalyzerInteractionMode =
  'unknown' | 'unchanged' | 'silent' | 'automatic' | 'manual';

export interface BriosaServerSnapshot {
  readonly briosaVersion: string;
  readonly sourceRevision: string;
  readonly protocolPackage: string;
  readonly spatialAnalyzerTarget: string;
  readonly readyForMp: boolean;
  /** The resolved named admission profile, such as `standard`. */
  readonly admissionProfile: string;
  /**
   * An opaque, value-free digest of every admission input. Compare it only for
   * equality, for example to tell whether a replacement generation runs under
   * the same policy.
   */
  readonly policyFingerprint: string;
  /** The operations the active policy admits. */
  readonly operations: readonly BriosaOperationCapability[];
  /**
   * The server's lifecycle wait allowances, with Server 0.10.1 and later.
   * Against Server 0.10.0 every allowance is null and the host shutdown bound
   * is unavailable.
   *
   * Added in Client 0.5.1. The client always sets it; the type marks it
   * optional only so that values written for Client 0.5.0 still type-check.
   */
  readonly lifecycleBounds?: BriosaLifecycleBounds;
  /**
   * The interaction mode the server is configured to set after each verified
   * Connect, with Server 0.10.1 and later; `unknown` against Server 0.10.0. It
   * is the server's configuration, never SpatialAnalyzer's live mode.
   *
   * Added in Client 0.5.1. The client always sets it; the type marks it
   * optional only so that values written for Client 0.5.0 still type-check.
   */
  readonly configuredSpatialAnalyzerInteractionMode?: ConfiguredSpatialAnalyzerInteractionMode;
  supports(fullyQualifiedMethod: string): boolean;
}

export interface BriosaCapabilityListOptions extends BriosaLifecycleCallOptions {
  /**
   * Also list every registered operation that the active policy denies, each
   * with its denial reason in `admission`.
   */
  readonly includeDenied?: boolean;
}

/**
 * A diagnostic capability listing. Denied entries never become callable and
 * never change the generation's admitted set.
 */
export interface BriosaCapabilityListing {
  readonly admissionProfile: string;
  readonly policyFingerprint: string;
  readonly operations: readonly BriosaOperationCapability[];
}

export interface NormalizedBriosaStartOptions {
  readonly serverSelection: BriosaServerSelection;
  readonly logging?: BriosaLoggingOptions;
  readonly startSpatialAnalyzerSdk: boolean;
  readonly launchSpatialAnalyzer: boolean;
  readonly connectToSpatialAnalyzer: boolean;
  readonly launchOptions: SpatialAnalyzerLaunchOptions;
  readonly startupTimeoutMs: number;
  /**
   * Whether the caller set `startupTimeoutMs`. Only an omitted timeout is sized
   * from the server's published startup allowance; an explicit one always wins,
   * including an explicit 120000.
   */
  readonly startupTimeoutExplicit: boolean;
  readonly signal?: AbortSignal;
}

export function validateCallOptions(options: BriosaCallOptions): void {
  if (
    options.onMpCompletion !== undefined &&
    typeof options.onMpCompletion !== 'function'
  ) {
    throw new TypeError('onMpCompletion must be a function.');
  }
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
  loggingArguments(options.logging);
  const normalized: NormalizedBriosaStartOptions = {
    serverSelection: normalizeSelection(options.serverSelection),
    startSpatialAnalyzerSdk: options.startSpatialAnalyzerSdk ?? true,
    launchSpatialAnalyzer: options.launchSpatialAnalyzer ?? true,
    connectToSpatialAnalyzer: options.connectToSpatialAnalyzer ?? true,
    launchOptions: options.launchOptions ?? {},
    // Read before the default fills it in, which would hide an explicit 120000.
    startupTimeoutExplicit: options.startupTimeoutMs !== undefined,
    startupTimeoutMs: options.startupTimeoutMs ?? defaultStartupTimeoutMs,
    ...(options.signal === undefined ? {} : { signal: options.signal }),
    ...(options.logging === undefined ? {} : { logging: options.logging }),
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
