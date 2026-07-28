import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Metadata, status, type ServiceError } from '@grpc/grpc-js';

import {
  BriosaCallError,
  BriosaCompatibilityError,
  ExecutionDisposition,
  GetServerInfoResponse,
  GetWorkingDirectoryResult,
  ListCapabilitiesResponse,
  OperationError,
  OperationFailureKind,
  ReplayGuidance,
  ReplaySafety,
  RecoveryGuidance,
  briosaProtocolIdentity,
  validateBriosaCompatibility,
} from '../src/index.js';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function serviceError(code: status, detail?: Uint8Array): ServiceError {
  const metadata = new Metadata();
  if (detail !== undefined) {
    metadata.set('briosa-operation-error-bin', Buffer.from(detail));
  }
  return Object.assign(new Error('status text must not be parsed'), {
    code,
    details: 'status text must not be parsed',
    metadata,
  });
}

function compatibleResponses() {
  return {
    serverInfo: GetServerInfoResponse.create({
      version: {
        coreProtocolPackage: briosaProtocolIdentity.coreProtocolPackage,
        spatialAnalyzerTarget: briosaProtocolIdentity.spatialAnalyzerTarget,
        targetProtocolPackage: briosaProtocolIdentity.targetProtocolPackage,
        catalogRevision: briosaProtocolIdentity.catalogRevision,
      },
    }),
    capabilities: ListCapabilitiesResponse.create({
      catalogId: briosaProtocolIdentity.catalogId,
      catalogRevision: briosaProtocolIdentity.catalogRevision,
      spatialAnalyzerTarget: briosaProtocolIdentity.spatialAnalyzerTarget,
      targetProtocolPackage: briosaProtocolIdentity.targetProtocolPackage,
    }),
  };
}

void test('records the immutable protocol artifact and JavaScript semantics', () => {
  assert.equal(
    briosaProtocolIdentity.artifactSha256,
    '4ce33ac6ecc9db382e870aa2c005f90a25128ad863fcf007c855d00470ea3e39',
  );
  assert.equal(
    briosaProtocolIdentity.sourceRevision,
    '1a0714345981592b37e26a90ffc4db0de32fe388',
  );
  assert.equal(briosaProtocolIdentity.int64Representation, 'bigint');
  assert.equal(briosaProtocolIdentity.optionalFieldRepresentation, 'undefined');

  const lock = JSON.parse(
    readFileSync(resolve(repositoryRoot, 'protocol.lock.json'), 'utf8'),
  ) as {
    protocol: {
      generator: { options: string[] };
      javascript_semantics: { int64: string; optional_fields: string };
    };
  };
  assert.ok(lock.protocol.generator.options.includes('forceLong=bigint'));
  assert.equal(lock.protocol.javascript_semantics.int64, 'bigint');
  assert.equal(lock.protocol.javascript_semantics.optional_fields, 'undefined');
});

void test('preserves optional field presence rather than substituting defaults', () => {
  const absent = GetWorkingDirectoryResult.decode(
    GetWorkingDirectoryResult.encode({}).finish(),
  );
  const presentEmpty = GetWorkingDirectoryResult.decode(
    GetWorkingDirectoryResult.encode({ directory: '' }).finish(),
  );

  assert.equal(absent.directory, undefined);
  assert.equal(presentEmpty.directory, '');
});

void test('validates exact target and catalog coordinates', () => {
  const { serverInfo, capabilities } = compatibleResponses();
  assert.doesNotThrow(() =>
    validateBriosaCompatibility(serverInfo, capabilities),
  );

  const mismatch = ListCapabilitiesResponse.create({
    ...capabilities,
    catalogRevision: 'unexpected',
  });
  assert.throws(
    () => validateBriosaCompatibility(serverInfo, mismatch),
    (error: unknown) =>
      error instanceof BriosaCompatibilityError &&
      error.diagnosticCode === 'capability-catalog-revision-mismatch',
  );
});

void test('decodes typed operation errors without parsing status text', () => {
  const detail = OperationError.create({
    operationId: 'conformance.mutating_operation',
    kind: OperationFailureKind.OPERATION_FAILURE_KIND_WORKER_FAILURE,
    diagnosticCode: 'worker-execution-control-failed',
    executionDisposition:
      ExecutionDisposition.EXECUTION_DISPOSITION_STARTED_OUTCOME_UNKNOWN,
    recoveryGuidance: RecoveryGuidance.RECOVERY_GUIDANCE_WORKER_REPLACEMENT,
    replayGuidance: ReplayGuidance.REPLAY_GUIDANCE_RECONCILE_BEFORE_REPLAY,
    replaySafety: ReplaySafety.REPLAY_SAFETY_UNSAFE,
  });
  const mapped = BriosaCallError.fromServiceError(
    serviceError(status.UNAVAILABLE, OperationError.encode(detail).finish()),
  );

  assert.equal(mapped.code, status.UNAVAILABLE);
  assert.deepEqual(mapped.operationError, detail);
  assert.equal(mapped.completionUnknown, true);
  assert.equal(mapped.reconciliationRequired, true);
  assert.equal(mapped.operationErrorMalformed, false);
});

void test('reports a malformed typed trailer without inventing operation policy', () => {
  const mapped = BriosaCallError.fromServiceError(
    serviceError(status.UNAVAILABLE, Buffer.from('not binary')),
  );
  assert.equal(mapped.operationError, undefined);
  assert.equal(mapped.operationErrorMalformed, true);
  assert.equal(mapped.completionUnknown, false);
  assert.equal(mapped.reconciliationRequired, false);
});
