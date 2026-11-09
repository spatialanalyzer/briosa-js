// Contract major 3 discovery: the admission profile, the opaque policy
// fingerprint, each capability's reviewed classification, and an explicit
// include_denied diagnostic listing (client-library-behavioral-contract.md,
// "Compatibility and capabilities").

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  BriosaCompatibilityError,
  type BriosaOperationCapability,
} from '../src/index.js';
import {
  OperationAdmission,
  OperationDurationClass,
  OperationRiskFlag,
  OperationValidationStatus,
  type ListCapabilitiesResponse,
  type OperationCapability,
} from '../src/generated/protocol/briosa/discovery.js';
import { briosaProtocolIdentity } from '../src/generated/protocolIdentity.js';
import { startedClient, ScriptedTransport } from './support/fakes.js';

const fingerprint = `sha256:${'A1'.repeat(32)}`;
const workingDirectory = '/briosa.FileOperations/GetWorkingDirectory';
const deleteFile = '/briosa.FileOperations/DeleteFile';

function capability(
  rpc: string,
  classification: Partial<OperationCapability>,
): OperationCapability {
  return {
    operationId: `file_operations.${rpc}`,
    grpcService: 'briosa.FileOperations',
    rpc,
    fullyQualifiedMethod: `/briosa.FileOperations/${rpc}`,
    ...classification,
  };
}

function listing(operations: OperationCapability[]): ListCapabilitiesResponse {
  return {
    protocolPackage: briosaProtocolIdentity.protocolPackage,
    spatialAnalyzerTarget: briosaProtocolIdentity.spatialAnalyzerTarget,
    operations,
    admissionProfile: 'standard',
    policyFingerprint: fingerprint,
  };
}

const admittedWorkingDirectory = capability('GetWorkingDirectory', {
  riskFlags: [OperationRiskFlag.OPERATION_RISK_FLAG_FILESYSTEM_METADATA],
  durationClass: OperationDurationClass.OPERATION_DURATION_CLASS_QUICK,
  validationStatus:
    OperationValidationStatus.OPERATION_VALIDATION_STATUS_NO_RECORDED_GAP,
  admission: OperationAdmission.OPERATION_ADMISSION_ADMITTED,
});

function scripted(): ScriptedTransport {
  const transport = new ScriptedTransport();
  transport.capabilities = listing([admittedWorkingDirectory]);
  return transport;
}

void test('the snapshot exposes the admission profile and the policy fingerprint', async () => {
  const { client } = await startedClient(scripted());
  const snapshot = await client.getServerSnapshot();
  assert.equal(snapshot.admissionProfile, 'standard');
  assert.equal(snapshot.policyFingerprint, fingerprint);
  await client.stop();
});

void test('each capability carries its reviewed classification', async () => {
  const transport = scripted();
  transport.capabilities = listing([
    admittedWorkingDirectory,
    capability('SetProbeOffsetFrameOffline', {
      // Admission comes from the server, never recomputed from the flags,
      // and the validation status is informational.
      riskFlags: [
        OperationRiskFlag.OPERATION_RISK_FLAG_FILESYSTEM_WRITE,
        OperationRiskFlag.OPERATION_RISK_FLAG_DEVICE_CONFIG,
        OperationRiskFlag.OPERATION_RISK_FLAG_INTERACTIVE_UI,
      ],
      durationClass:
        OperationDurationClass.OPERATION_DURATION_CLASS_LONG_RUNNING,
      validationStatus:
        OperationValidationStatus.OPERATION_VALIDATION_STATUS_AT_RISK_UNVALIDATED,
      admission: OperationAdmission.OPERATION_ADMISSION_ADMITTED,
    }),
    capability('GetNothing', {}),
  ]);
  const { client } = await startedClient(transport);
  const operations = (await client.getServerSnapshot()).operations;

  assert.deepEqual(
    operations.map((operation) => [
      operation.riskFlags,
      operation.durationClass,
      operation.validationStatus,
      operation.admission,
    ]),
    [
      [['filesystemMetadata'], 'quick', 'noRecordedGap', 'admitted'],
      [
        ['filesystemWrite', 'deviceConfig', 'interactiveUi'],
        'longRunning',
        'atRiskUnvalidated',
        'admitted',
      ],
      [[], 'unspecified', 'unspecified', 'unspecified'],
    ],
  );
  assert.equal(
    (await client.getServerSnapshot()).supports(
      '/briosa.FileOperations/SetProbeOffsetFrameOffline',
    ),
    true,
  );
  await client.stop();
});

void test('every risk flag, duration class, status and admission value maps', async () => {
  const transport = scripted();
  // Wire values 1 to 11, in OperationRiskFlag declaration order.
  const flags = Array.from({ length: 11 }, (_, index) => index + 1);
  transport.capabilities = listing([
    capability('AllFlags', { riskFlags: flags }),
    ...[1, 2, 3].map((value) =>
      capability(`Duration${value}`, { durationClass: value }),
    ),
    ...[1, 2, 3].map((value) =>
      capability(`Status${value}`, { validationStatus: value }),
    ),
    ...[1, 2, 3, 4, 5, 6].map((value) =>
      capability(`Admission${value}`, { admission: value }),
    ),
  ]);
  const { client } = await startedClient(transport);
  const byRpc = new Map(
    (await client.getServerSnapshot()).operations.map(
      (operation) => [operation.rpc, operation] as const,
    ),
  );
  const get = (rpc: string): BriosaOperationCapability => {
    const operation = byRpc.get(rpc);
    assert.ok(operation !== undefined);
    return operation;
  };
  assert.deepEqual(get('AllFlags').riskFlags, [
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
  ]);
  assert.deepEqual(
    [1, 2, 3].map((value) => get(`Duration${value}`).durationClass),
    ['quick', 'longRunning', 'interactive'],
  );
  assert.deepEqual(
    [1, 2, 3].map((value) => get(`Status${value}`).validationStatus),
    ['noRecordedGap', 'fixturePending', 'atRiskUnvalidated'],
  );
  assert.deepEqual(
    [1, 2, 3, 4, 5, 6].map((value) => get(`Admission${value}`).admission),
    [
      'admitted',
      'deniedProfile',
      'deniedFlag',
      'deniedOverride',
      'deniedExclusive',
      'deniedUnreviewed',
    ],
  );
  await client.stop();
});

void test('a value from a later revision maps to a distinct unknown member', async () => {
  const transport = scripted();
  transport.capabilities = listing([
    capability('Later', {
      riskFlags: [
        OperationRiskFlag.OPERATION_RISK_FLAG_DESTRUCTIVE,
        99 as OperationRiskFlag,
      ],
      durationClass: 99 as OperationDurationClass,
      validationStatus: 99 as OperationValidationStatus,
      admission: 99 as OperationAdmission,
    }),
  ]);
  const { client } = await startedClient(transport);
  const [later] = (await client.getServerSnapshot()).operations;
  assert.ok(later !== undefined);
  assert.deepEqual(later.riskFlags, ['destructive', 'unknown']);
  assert.equal(later.durationClass, 'unknown');
  assert.equal(later.validationStatus, 'unknown');
  assert.equal(later.admission, 'unknown');
  await client.stop();
});

void test('the include_denied listing reports denials without making them callable', async () => {
  const transport = scripted();
  transport.capabilities = listing([
    capability('DeleteFile', {
      // A denied entry in the default listing would be a server defect;
      // the admitted set comes only from the default listing.
      admission: OperationAdmission.OPERATION_ADMISSION_ADMITTED,
    }),
  ]);
  transport.deniedCapabilities = listing([
    capability('DeleteFile', {
      admission: OperationAdmission.OPERATION_ADMISSION_ADMITTED,
    }),
    capability('GetWorkingDirectory', {
      riskFlags: [OperationRiskFlag.OPERATION_RISK_FLAG_FILESYSTEM_METADATA],
      durationClass: OperationDurationClass.OPERATION_DURATION_CLASS_QUICK,
      validationStatus:
        OperationValidationStatus.OPERATION_VALIDATION_STATUS_NO_RECORDED_GAP,
      admission: OperationAdmission.OPERATION_ADMISSION_DENIED_OVERRIDE,
    }),
    capability('StartInstrumentInterface', {
      admission: OperationAdmission.OPERATION_ADMISSION_DENIED_EXCLUSIVE,
    }),
  ]);
  const { client } = await startedClient(transport);

  const diagnostic = await client.listCapabilities({ includeDenied: true });
  assert.equal(transport.capabilityRequests.at(-1), true);
  assert.equal(diagnostic.admissionProfile, 'standard');
  assert.equal(diagnostic.policyFingerprint, fingerprint);
  assert.deepEqual(
    diagnostic.operations.map((operation) => [
      operation.fullyQualifiedMethod,
      operation.admission,
    ]),
    [
      [deleteFile, 'admitted'],
      [workingDirectory, 'deniedOverride'],
      ['/briosa.FileOperations/StartInstrumentInterface', 'deniedExclusive'],
    ],
  );

  // The listing never changes the generation's admitted set.
  const snapshot = await client.getServerSnapshot();
  assert.equal(snapshot.supports(workingDirectory), false);
  assert.equal(snapshot.supports(deleteFile), true);
  assert.deepEqual(
    snapshot.operations.map((operation) => operation.fullyQualifiedMethod),
    [deleteFile],
  );

  const admitted = await client.listCapabilities();
  assert.equal(transport.capabilityRequests.at(-1), false);
  assert.deepEqual(
    admitted.operations.map((operation) => operation.fullyQualifiedMethod),
    [deleteFile],
  );
  await client.stop();
});

void test('the diagnostic listing keeps the exact target identity', async () => {
  const transport = scripted();
  transport.deniedCapabilities = {
    ...listing([admittedWorkingDirectory]),
    spatialAnalyzerTarget: '1900.1.0000.0',
  };
  const { client } = await startedClient(transport);
  await assert.rejects(
    () => client.listCapabilities({ includeDenied: true }),
    (error: unknown) =>
      error instanceof BriosaCompatibilityError &&
      error.diagnosticCode === 'capability-sa-target-mismatch',
  );
  await client.stop();
});
