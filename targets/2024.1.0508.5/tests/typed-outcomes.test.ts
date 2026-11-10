import assert from 'node:assert/strict';
import { test } from 'node:test';

import { Metadata, status, type ServiceError } from '@grpc/grpc-js';

import {
  BriosaOperationError,
  BriosaSpatialAnalyzerError,
  BriosaSpatialAnalyzerSdkError,
  BriosaTransportError,
} from '../src/index.js';
import { mapServiceError } from '../src/errors.js';
import {
  SpatialAnalyzerConnectionState,
  SpatialAnalyzerExecutionReadinessState,
} from '../src/generated/protocol/briosa/discovery.js';
import {
  LifecycleRecoveryGuidance,
  SpatialAnalyzerApplicationState,
  SpatialAnalyzerLifecycleError,
  SpatialAnalyzerLifecycleFailureKind,
  SpatialAnalyzerOwnership,
  SpatialAnalyzerSdkLifecycleError,
  SpatialAnalyzerSdkLifecycleFailureKind,
  SpatialAnalyzerSdkRecoveryState,
  SpatialAnalyzerSdkState,
  type SpatialAnalyzerSdkLifecycleState,
} from '../src/generated/protocol/briosa/lifecycle.js';
import {
  ExecutionDisposition,
  MpExecutionState,
  OperationError,
  OperationFailureKind,
  OutputRetrievalState,
  RecoveryGuidance,
  ReplayGuidance,
  ReplaySafety,
  type MpExecutionDetails,
} from '../src/generated/protocol/briosa/operation_outcomes.js';

const operationTrailer = 'briosa-operation-error-bin';
const sdkTrailer = 'briosa-spatial-analyzer-sdk-lifecycle-error-bin';
const applicationTrailer = 'briosa-spatial-analyzer-lifecycle-error-bin';

function serviceError(
  code: status,
  key: string,
  detail: Uint8Array,
): ServiceError {
  const metadata = new Metadata();
  metadata.set(key, Buffer.from(detail));
  return Object.assign(new Error('status text must not be parsed'), {
    code,
    details: 'status text must not be parsed',
    metadata,
  });
}

function operationError(
  code: status,
  detail: Partial<OperationError>,
): BriosaOperationError {
  const mapped = mapServiceError(
    serviceError(
      code,
      operationTrailer,
      OperationError.encode(
        OperationError.fromPartial({
          operationId: 'file_operations.get_working_directory',
          replaySafety: ReplaySafety.REPLAY_SAFETY_SAFE,
          recoveryGuidance: RecoveryGuidance.RECOVERY_GUIDANCE_NONE,
          ...detail,
        }),
      ).finish(),
    ),
  );
  assert.ok(mapped instanceof BriosaOperationError);
  return mapped;
}

function connectingSdkState(): SpatialAnalyzerSdkLifecycleState {
  return {
    stateRevision: 7n,
    sdkState: SpatialAnalyzerSdkState.SPATIAL_ANALYZER_SDK_STATE_CONNECTING,
    sdkGeneration: 3,
    connectionState:
      SpatialAnalyzerConnectionState.SPATIAL_ANALYZER_CONNECTION_STATE_CONNECTING,
    executionReadinessState:
      SpatialAnalyzerExecutionReadinessState.SPATIAL_ANALYZER_EXECUTION_READINESS_STATE_UNVERIFIED,
    readyForMp: false,
    recoveryState:
      SpatialAnalyzerSdkRecoveryState.SPATIAL_ANALYZER_SDK_RECOVERY_STATE_NOT_REQUIRED,
  };
}

function sdkError(
  code: status,
  kind: SpatialAnalyzerSdkLifecycleFailureKind,
  diagnosticCode: string,
  recoveryGuidance: LifecycleRecoveryGuidance,
  state: SpatialAnalyzerSdkLifecycleState = connectingSdkState(),
): unknown {
  return mapServiceError(
    serviceError(
      code,
      sdkTrailer,
      SpatialAnalyzerSdkLifecycleError.encode({
        rpc: 'ConnectToSpatialAnalyzer',
        kind,
        diagnosticCode,
        recoveryGuidance,
        state,
      }).finish(),
    ),
  );
}

void test('an SDK call fault is its own kind in every proven phase', () => {
  const notStarted = operationError(status.INTERNAL, {
    kind: OperationFailureKind.OPERATION_FAILURE_KIND_SDK_CALL_FAULTED,
    diagnosticCode: 'sdk-set-step-faulted',
    executionDisposition:
      ExecutionDisposition.EXECUTION_DISPOSITION_NOT_STARTED,
    replayGuidance: ReplayGuidance.REPLAY_GUIDANCE_DO_NOT_REPLAY,
  });
  assert.equal(notStarted.kind, 'sdkCallFaulted');
  assert.equal(notStarted.executionDisposition, 'notStarted');
  assert.equal(notStarted.replayGuidance, 'doNotReplay');
  assert.equal(notStarted.completionUnknown, false);
  assert.equal(notStarted.mpExecution, null);

  const unknown = operationError(status.INTERNAL, {
    kind: OperationFailureKind.OPERATION_FAILURE_KIND_SDK_CALL_FAULTED,
    diagnosticCode: 'sdk-execute-step-faulted',
    executionDisposition:
      ExecutionDisposition.EXECUTION_DISPOSITION_STARTED_OUTCOME_UNKNOWN,
    replayGuidance: ReplayGuidance.REPLAY_GUIDANCE_RECONCILE_BEFORE_REPLAY,
    mpExecution: {
      state: MpExecutionState.MP_EXECUTION_STATE_RESULT_UNAVAILABLE,
      outputRetrievals: [],
    },
  });
  assert.equal(unknown.kind, 'sdkCallFaulted');
  assert.equal(unknown.diagnosticCode, 'sdk-execute-step-faulted');
  assert.equal(unknown.executionDisposition, 'startedOutcomeUnknown');
  assert.equal(unknown.reconciliationRequired, true);
  assert.deepEqual(unknown.mpExecution, {
    state: 'resultUnavailable',
    mpResultCode: null,
    outputRetrievals: [],
  });

  const completed = operationError(status.INTERNAL, {
    kind: OperationFailureKind.OPERATION_FAILURE_KIND_SDK_CALL_FAULTED,
    diagnosticCode: 'sdk-output-getter-faulted',
    executionDisposition: ExecutionDisposition.EXECUTION_DISPOSITION_COMPLETED,
    replayGuidance: ReplayGuidance.REPLAY_GUIDANCE_DO_NOT_REPLAY,
    mpExecution: {
      state: MpExecutionState.MP_EXECUTION_STATE_SUCCEEDED,
      mpResultCode: 2,
      outputRetrievals: [
        {
          fieldName: 'first',
          state: OutputRetrievalState.OUTPUT_RETRIEVAL_STATE_RETRIEVED,
        },
        {
          fieldName: 'second',
          state: OutputRetrievalState.OUTPUT_RETRIEVAL_STATE_FAILED,
          diagnosticCode: 'sdk-output-getter-faulted',
        },
      ],
    },
  });
  assert.equal(completed.kind, 'sdkCallFaulted');
  assert.equal(completed.executionDisposition, 'completed');
  assert.deepEqual(completed.mpExecution, {
    state: 'succeeded',
    mpResultCode: 2,
    outputRetrievals: [
      { fieldName: 'first', state: 'retrieved', diagnosticCode: null },
      {
        fieldName: 'second',
        state: 'failed',
        diagnosticCode: 'sdk-output-getter-faulted',
      },
    ],
  });
});

void test('partial success stays distinct inside typed failure details', () => {
  const outputFailure = operationError(status.DATA_LOSS, {
    kind: OperationFailureKind.OPERATION_FAILURE_KIND_OUTPUT_RETRIEVAL_FAILURE,
    diagnosticCode: 'sdk-output-retrieval-failed',
    executionDisposition: ExecutionDisposition.EXECUTION_DISPOSITION_COMPLETED,
    replayGuidance: ReplayGuidance.REPLAY_GUIDANCE_DO_NOT_REPLAY,
    mpExecution: {
      state: MpExecutionState.MP_EXECUTION_STATE_PARTIAL_SUCCESS,
      mpResultCode: 4,
      outputRetrievals: [
        {
          fieldName: 'directory',
          state: OutputRetrievalState.OUTPUT_RETRIEVAL_STATE_FAILED,
          diagnosticCode: 'sdk-output-retrieval-failed',
        },
      ],
    },
  });
  assert.equal(outputFailure.kind, 'outputRetrievalFailure');
  assert.equal(outputFailure.executionDisposition, 'completed');
  assert.deepEqual(outputFailure.mpExecution, {
    state: 'partialSuccess',
    mpResultCode: 4,
    outputRetrievals: [
      {
        fieldName: 'directory',
        state: 'failed',
        diagnosticCode: 'sdk-output-retrieval-failed',
      },
    ],
  });

  // Code 4 from an operation on the server's exception list is an ordinary
  // MP failure that keeps the code.
  const listed = operationError(status.FAILED_PRECONDITION, {
    operationId: 'file_operations.open_sa_file',
    kind: OperationFailureKind.OPERATION_FAILURE_KIND_MP_FAILURE,
    diagnosticCode: 'mp-command-failed',
    executionDisposition: ExecutionDisposition.EXECUTION_DISPOSITION_COMPLETED,
    replayGuidance: ReplayGuidance.REPLAY_GUIDANCE_DO_NOT_REPLAY,
    mpExecution: {
      state: MpExecutionState.MP_EXECUTION_STATE_FAILED,
      mpResultCode: 4,
      outputRetrievals: [],
    },
  });
  assert.equal(listed.kind, 'mpFailure');
  assert.deepEqual(listed.mpExecution, {
    state: 'failed',
    mpResultCode: 4,
    outputRetrievals: [],
  });
});

void test('an unknown MP execution state is a malformed typed error', () => {
  const mapped = mapServiceError(
    serviceError(
      status.DATA_LOSS,
      operationTrailer,
      OperationError.encode({
        operationId: 'file_operations.get_working_directory',
        kind: OperationFailureKind.OPERATION_FAILURE_KIND_OUTPUT_RETRIEVAL_FAILURE,
        diagnosticCode: 'sdk-output-retrieval-failed',
        executionDisposition:
          ExecutionDisposition.EXECUTION_DISPOSITION_COMPLETED,
        mpExecution: {
          state: 99 as MpExecutionState,
          mpResultCode: 4,
          outputRetrievals: [],
        } satisfies MpExecutionDetails,
      }).finish(),
    ),
  );
  assert.ok(mapped instanceof BriosaTransportError);
  assert.equal(mapped.diagnosticCode, 'typed-error-malformed');
});

void test('a modal dialog is surfaced as is on MP and readiness failures', () => {
  const watchdog = operationError(status.UNAVAILABLE, {
    kind: OperationFailureKind.OPERATION_FAILURE_KIND_WORKER_WATCHDOG_TIMEOUT,
    diagnosticCode: 'sa-modal-dialog-open',
    executionDisposition:
      ExecutionDisposition.EXECUTION_DISPOSITION_STARTED_OUTCOME_UNKNOWN,
    recoveryGuidance:
      RecoveryGuidance.RECOVERY_GUIDANCE_OPERATOR_INTERVENTION_REQUIRED,
    replayGuidance: ReplayGuidance.REPLAY_GUIDANCE_RECONCILE_BEFORE_REPLAY,
  });
  assert.equal(watchdog.kind, 'workerWatchdogTimeout');
  assert.equal(watchdog.diagnosticCode, 'sa-modal-dialog-open');
  assert.equal(watchdog.recoveryGuidance, 'operatorInterventionRequired');
  assert.equal(watchdog.executionDisposition, 'startedOutcomeUnknown');

  const readiness = sdkError(
    status.FAILED_PRECONDITION,
    SpatialAnalyzerSdkLifecycleFailureKind.SPATIAL_ANALYZER_SDK_LIFECYCLE_FAILURE_KIND_SDK_CONNECTION_FAILED,
    'sa-modal-dialog-open',
    LifecycleRecoveryGuidance.LIFECYCLE_RECOVERY_GUIDANCE_OPERATOR_ACTION_REQUIRED,
    {
      ...connectingSdkState(),
      sdkState: SpatialAnalyzerSdkState.SPATIAL_ANALYZER_SDK_STATE_FAULTED,
      executionReadinessState:
        SpatialAnalyzerExecutionReadinessState.SPATIAL_ANALYZER_EXECUTION_READINESS_STATE_OPERATOR_RECOVERY_REQUIRED,
      diagnosticCode: 'sa-modal-dialog-open',
    },
  );
  assert.ok(readiness instanceof BriosaSpatialAnalyzerSdkError);
  assert.equal(readiness.kind, 'sdkConnectionFailed');
  assert.equal(readiness.diagnosticCode, 'sa-modal-dialog-open');
  assert.equal(readiness.recoveryGuidance, 'operatorActionRequired');
  assert.equal(
    readiness.state.executionReadinessState,
    'operatorRecoveryRequired',
  );
  assert.equal(readiness.state.diagnosticCode, 'sa-modal-dialog-open');
});

void test('lifecycle caller kinds are distinct from a state conflict', () => {
  const cancelled = sdkError(
    status.CANCELLED,
    SpatialAnalyzerSdkLifecycleFailureKind.SPATIAL_ANALYZER_SDK_LIFECYCLE_FAILURE_KIND_CALLER_CANCELLED,
    'sdk-lifecycle-caller-stopped-waiting',
    LifecycleRecoveryGuidance.LIFECYCLE_RECOVERY_GUIDANCE_REFRESH_STATE,
  );
  assert.ok(cancelled instanceof BriosaSpatialAnalyzerSdkError);
  assert.equal(cancelled.kind, 'callerCancelled');
  assert.equal(cancelled.recoveryGuidance, 'refreshState');

  const deadline = sdkError(
    status.DEADLINE_EXCEEDED,
    SpatialAnalyzerSdkLifecycleFailureKind.SPATIAL_ANALYZER_SDK_LIFECYCLE_FAILURE_KIND_CALLER_DEADLINE_EXCEEDED,
    'sdk-lifecycle-request-withdrawn',
    LifecycleRecoveryGuidance.LIFECYCLE_RECOVERY_GUIDANCE_NONE,
  );
  assert.ok(deadline instanceof BriosaSpatialAnalyzerSdkError);
  assert.equal(deadline.kind, 'callerDeadlineExceeded');
  assert.equal(deadline.diagnosticCode, 'sdk-lifecycle-request-withdrawn');

  const inProgress = sdkError(
    status.ABORTED,
    SpatialAnalyzerSdkLifecycleFailureKind.SPATIAL_ANALYZER_SDK_LIFECYCLE_FAILURE_KIND_STATE_CONFLICT,
    'sdk-lifecycle-transition-in-progress',
    LifecycleRecoveryGuidance.LIFECYCLE_RECOVERY_GUIDANCE_REFRESH_STATE,
  );
  assert.ok(inProgress instanceof BriosaSpatialAnalyzerSdkError);
  assert.equal(inProgress.kind, 'stateConflict');
  assert.equal(inProgress.recoveryGuidance, 'refreshState');
  assert.equal(inProgress.state.sdkState, 'connecting');
  assert.equal(inProgress.state.sdkGeneration, 3);

  for (const [kind, expected] of [
    [
      SpatialAnalyzerLifecycleFailureKind.SPATIAL_ANALYZER_LIFECYCLE_FAILURE_KIND_CALLER_CANCELLED,
      'callerCancelled',
    ],
    [
      SpatialAnalyzerLifecycleFailureKind.SPATIAL_ANALYZER_LIFECYCLE_FAILURE_KIND_CALLER_DEADLINE_EXCEEDED,
      'callerDeadlineExceeded',
    ],
  ] as const) {
    const application = mapServiceError(
      serviceError(
        status.CANCELLED,
        applicationTrailer,
        SpatialAnalyzerLifecycleError.encode({
          rpc: 'LaunchSpatialAnalyzer',
          kind,
          diagnosticCode: 'application-lifecycle-caller-stopped-waiting',
          recoveryGuidance:
            LifecycleRecoveryGuidance.LIFECYCLE_RECOVERY_GUIDANCE_REFRESH_STATE,
          state: {
            stateRevision: 4n,
            applicationState:
              SpatialAnalyzerApplicationState.SPATIAL_ANALYZER_APPLICATION_STATE_STARTING,
            ownership:
              SpatialAnalyzerOwnership.SPATIAL_ANALYZER_OWNERSHIP_SERVER_LAUNCHED,
            applicationGeneration: 2,
          },
        }).finish(),
      ),
    );
    assert.ok(application instanceof BriosaSpatialAnalyzerError);
    assert.equal(application.kind, expected);
    assert.equal(application.recoveryGuidance, 'refreshState');
    assert.equal(application.state.applicationState, 'starting');
  }
});
