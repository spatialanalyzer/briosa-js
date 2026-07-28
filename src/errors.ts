import { status, type ServiceError } from '@grpc/grpc-js';

import {
  ExecutionDisposition,
  OperationError,
  ReplayGuidance,
  type OperationError as OperationErrorDetail,
} from './generated/protocol/briosa/core/v1alpha1/operation_outcomes.js';

const operationErrorTrailer = 'briosa-operation-error-bin';

/** A failed Briosa call with its canonical gRPC status and optional typed detail. */
export class BriosaCallError extends Error {
  readonly code: status;
  readonly operationError: OperationErrorDetail | undefined;
  readonly operationErrorMalformed: boolean;

  private constructor(
    error: ServiceError,
    operationError: OperationErrorDetail | undefined,
    operationErrorMalformed: boolean,
  ) {
    super(
      `Briosa call failed with gRPC status ${status[error.code] ?? error.code}.`,
      {
        cause: error,
      },
    );
    this.name = 'BriosaCallError';
    this.code = error.code;
    this.operationError = operationError;
    this.operationErrorMalformed = operationErrorMalformed;
  }

  /** True only when Briosa can prove execution started but cannot prove its outcome. */
  get completionUnknown(): boolean {
    return (
      this.operationError?.executionDisposition ===
      ExecutionDisposition.EXECUTION_DISPOSITION_STARTED_OUTCOME_UNKNOWN
    );
  }

  /** True when a caller must reconcile state before considering a manual replay. */
  get reconciliationRequired(): boolean {
    return (
      this.completionUnknown &&
      this.operationError?.replayGuidance ===
        ReplayGuidance.REPLAY_GUIDANCE_RECONCILE_BEFORE_REPLAY
    );
  }

  /** Maps grpc-js metadata without parsing status text. */
  static fromServiceError(error: ServiceError): BriosaCallError {
    const values = error.metadata.get(operationErrorTrailer);
    if (values.length === 0) {
      return new BriosaCallError(error, undefined, false);
    }

    const value = values[0];
    if (!Buffer.isBuffer(value)) {
      return new BriosaCallError(error, undefined, true);
    }

    try {
      return new BriosaCallError(error, OperationError.decode(value), false);
    } catch {
      return new BriosaCallError(error, undefined, true);
    }
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
