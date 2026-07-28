import { readFile } from 'node:fs/promises';

import {
  Client,
  Metadata,
  credentials,
  status,
  type ServiceError,
} from '@grpc/grpc-js';

import {
  BriosaCallError,
  BriosaClient,
  ExecutionDisposition,
  MpExecutionState,
  OperationError,
  OperationFailureKind,
  OutputRetrievalState,
  ReplayGuidance,
  ReplaySafety,
  RecoveryGuidance,
  type OperationError as OperationErrorDetail,
  type GetWorkingDirectoryResult,
} from '../src/index.js';

interface ErrorFixture {
  fixture_set_id: string;
  cases: Array<{
    grpc_status: string;
    operation_error: {
      operation_id: string;
      kind: string;
      diagnostic_code: string;
      execution_disposition: string;
      recovery_guidance: string;
      replay_guidance: string;
      replay_safety: string;
    };
    client_behavior: {
      automatic_replay: boolean;
      reconciliation_required: boolean;
    };
  }>;
}

interface LiveFixture {
  fixture_set_id: string;
  scenarios: Array<{
    id: string;
    expected: {
      grpc_status: string;
      ready_for_mp: boolean;
      operation_advertised: boolean;
      operation_succeeded: boolean;
      recovery_succeeded: boolean;
      typed_error_required: boolean;
      failure_kinds: string[];
    };
  }>;
}

const operationMethod =
  '/briosa.sa.v2026_1_0529_7.v1alpha1.FileOperations/GetWorkingDirectory';

async function main(): Promise<void> {
  const errorFixturePath = argument('--error-fixture');
  if (errorFixturePath !== undefined) {
    await verifyErrorFixtures(errorFixturePath);
    report('typed-errors');
    return;
  }

  const address = requiredArgument('--address');
  const fixturePath = requiredArgument('--fixture');
  const scenarioId = requiredArgument('--scenario');
  await runLiveScenario(address, fixturePath, scenarioId);
  report(scenarioId);
}

async function verifyErrorFixtures(path: string): Promise<void> {
  const fixture = JSON.parse(await readFile(path, 'utf8')) as ErrorFixture;
  require(fixture.fixture_set_id ===
    'briosa.client.operation-errors.v1', 'error-fixture-identity');

  for (const item of fixture.cases) {
    const json = item.operation_error;
    const detail = OperationError.create({
      operationId: json.operation_id,
      kind: enumNumber(OperationFailureKind, json.kind),
      diagnosticCode: json.diagnostic_code,
      executionDisposition: enumNumber(
        ExecutionDisposition,
        json.execution_disposition,
      ),
      recoveryGuidance: enumNumber(RecoveryGuidance, json.recovery_guidance),
      replayGuidance: enumNumber(ReplayGuidance, json.replay_guidance),
      replaySafety: enumNumber(ReplaySafety, json.replay_safety),
    });
    const mapped = BriosaCallError.fromServiceError(
      serviceError(
        statusNumber(item.grpc_status),
        OperationError.encode(detail).finish(),
      ),
    );
    require(mapped.code ===
      statusNumber(item.grpc_status), 'offline-status-mismatch');
    require(operationErrorsEqual(
      mapped.operationError,
      detail,
    ), 'offline-error-mismatch');
    require(mapped.completionUnknown ===
      (detail.executionDisposition ===
        ExecutionDisposition.EXECUTION_DISPOSITION_STARTED_OUTCOME_UNKNOWN), 'offline-disposition-mismatch');
    require(mapped.reconciliationRequired ===
      item.client_behavior
        .reconciliation_required, 'offline-reconciliation-mismatch');
    require(!item.client_behavior
      .automatic_replay, 'automatic-replay-prohibited');
  }
}

async function runLiveScenario(
  address: string,
  fixturePath: string,
  scenarioId: string,
): Promise<void> {
  const fixture = JSON.parse(
    await readFile(fixturePath, 'utf8'),
  ) as LiveFixture;
  require(fixture.fixture_set_id ===
    'briosa.client.live.v1', 'fixture-identity');
  const scenario = fixture.scenarios.find(({ id }) => id === scenarioId);
  if (scenario === undefined) throw new Error('scenario-missing');

  const client = new BriosaClient({ address, defaultTimeoutMs: 15_000 });
  try {
    const snapshot = await client.getServerSnapshot();
    const advertised = (snapshot.capabilities.operations ?? []).some(
      ({ fullyQualifiedMethod }) => fullyQualifiedMethod === operationMethod,
    );
    require(snapshot.readyForMp ===
      scenario.expected.ready_for_mp, 'readiness-mismatch');
    require(advertised ===
      scenario.expected.operation_advertised, 'capability-mismatch');

    let operationSucceeded = false;
    let recoverySucceeded = false;
    let typedErrorObserved = false;
    let failureKind: string | undefined;
    let grpcStatus = status.OK;

    if (scenarioId === 'unsupported-version') {
      grpcStatus = await unsupportedVersionStatus(address);
      failureKind = 'OPERATION_FAILURE_KIND_UNSUPPORTED';
    } else {
      try {
        if (scenarioId === 'deadline') {
          await client.getWorkingDirectory({ timeoutMs: 50 });
        } else if (scenarioId === 'cancellation') {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 50);
          try {
            await client.getWorkingDirectory({ signal: controller.signal });
          } finally {
            clearTimeout(timer);
          }
        } else {
          validateSuccessfulResult(await client.getWorkingDirectory());
          operationSucceeded = true;
        }
      } catch (error) {
        if (!(error instanceof BriosaCallError)) throw error;
        grpcStatus = error.code;
        typedErrorObserved = error.operationError !== undefined;
        if (error.operationError?.kind !== undefined) {
          failureKind = OperationFailureKind[error.operationError.kind];
        }
      }

      if (
        scenarioId === 'deadline' ||
        scenarioId === 'cancellation' ||
        scenarioId === 'watchdog-recovery'
      ) {
        validateSuccessfulResult(await client.getWorkingDirectory());
        recoverySucceeded = true;
      }
    }

    require(status[grpcStatus] ===
      scenario.expected.grpc_status, 'grpc-status-mismatch');
    require(operationSucceeded ===
      scenario.expected.operation_succeeded, 'operation-outcome-mismatch');
    require(recoverySucceeded ===
      scenario.expected.recovery_succeeded, 'recovery-outcome-mismatch');
    require(typedErrorObserved ===
      scenario.expected.typed_error_required, 'typed-error-presence-mismatch');
    require(failureKind === undefined
      ? scenario.expected.failure_kinds.length === 0
      : scenario.expected.failure_kinds.includes(
          failureKind,
        ), 'failure-kind-mismatch');
  } finally {
    client.close();
  }
}

function validateSuccessfulResult(result: GetWorkingDirectoryResult): void {
  require(result.directory !== undefined, 'directory-presence-missing');
  require(result.execution !== undefined, 'mp-execution-missing');
  require(result.execution?.state ===
    MpExecutionState.MP_EXECUTION_STATE_SUCCEEDED, 'mp-execution-not-successful');
  const retrievals = result.execution?.outputRetrievals ?? [];
  require(retrievals.length === 1 &&
    retrievals[0]?.state ===
      OutputRetrievalState.OUTPUT_RETRIEVAL_STATE_RETRIEVED, 'output-retrieval-not-successful');
}

async function unsupportedVersionStatus(address: string): Promise<status> {
  const client = new Client(address, credentials.createInsecure());
  try {
    return await new Promise<status>((resolve, reject) => {
      client.makeUnaryRequest(
        '/briosa.sa.v1900_1_0000_0.v1alpha1.FileOperations/GetWorkingDirectory',
        (value: Buffer) => value,
        (value: Buffer) => value,
        Buffer.alloc(0),
        new Metadata(),
        { deadline: new Date(Date.now() + 15_000) },
        (error) => {
          if (error === null) reject(new Error('unsupported-method-succeeded'));
          else resolve(error.code);
        },
      );
    });
  } finally {
    client.close();
  }
}

function operationErrorsEqual(
  actual: OperationErrorDetail | undefined,
  expected: OperationErrorDetail,
): boolean {
  return (
    actual !== undefined &&
    actual.operationId === expected.operationId &&
    actual.kind === expected.kind &&
    actual.diagnosticCode === expected.diagnosticCode &&
    actual.executionDisposition === expected.executionDisposition &&
    actual.recoveryGuidance === expected.recoveryGuidance &&
    actual.replayGuidance === expected.replayGuidance &&
    actual.replaySafety === expected.replaySafety
  );
}

function serviceError(code: status, detail: Uint8Array): ServiceError {
  const metadata = new Metadata();
  metadata.set('briosa-operation-error-bin', Buffer.from(detail));
  return Object.assign(new Error('not parsed'), {
    code,
    details: 'not parsed',
    metadata,
  });
}

function enumNumber<T extends Record<string, string | number>>(
  values: T,
  name: string,
): T[keyof T] & number {
  const value = values[name];
  if (typeof value !== 'number') throw new Error(`unknown-enum-${name}`);
  return value as T[keyof T] & number;
}

function statusNumber(name: string): status {
  const value = status[name as keyof typeof status];
  if (typeof value !== 'number') throw new Error(`unknown-status-${name}`);
  return value;
}

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function requiredArgument(name: string): string {
  const value = argument(name);
  if (value === undefined) throw new Error(`missing-argument-${name}`);
  return value;
}

function require(condition: boolean, failure: string): asserts condition {
  if (!condition) throw new Error(failure);
}

function report(scenario: string): void {
  console.log(JSON.stringify({ schema_version: 1, success: true, scenario }));
}

main().catch((error: unknown) => {
  console.error(
    JSON.stringify({
      schema_version: 1,
      success: false,
      failure: error instanceof Error ? error.name : 'UnknownError',
    }),
  );
  process.exitCode = 1;
});
