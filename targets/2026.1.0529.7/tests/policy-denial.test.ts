// Typed policy denial detail and request options, with Server 0.10.1 and later
// (spatialanalyzer/briosa#397; client-library-behavioral-contract.md,
// "Compatibility and capabilities"). Server 0.10.0 sends neither, and the
// client then behaves as Client 0.5.0 did.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { Metadata, status, type ServiceError } from '@grpc/grpc-js';

import {
  BriosaOperationError,
  BriosaTransportError,
  getWorkingDirectory,
  type PolicyDenialDetails,
} from '../src/index.js';
import { mapServiceError } from '../src/errors.js';
import {
  ListCapabilitiesResponse,
  OperationAdmission,
  OperationDurationClass,
  OperationRequestOptionCondition,
  OperationRequestOptionEffect,
  OperationRequestOptionOmission,
  OperationRiskFlag,
  OperationValidationStatus,
  type OperationCapability,
} from '../src/generated/protocol/briosa/discovery.js';
import {
  ExecutionDisposition,
  OperationError,
  OperationFailureKind,
  PolicyDenialRule,
  RecoveryGuidance,
  ReplayGuidance,
  ReplaySafety,
  type PolicyDenialDetails as WirePolicyDenialDetails,
} from '../src/generated/protocol/briosa/operation_outcomes.js';
import { briosaProtocolIdentity } from '../src/generated/protocolIdentity.js';
import {
  mapCapabilityListing,
  riskFlagFromName,
} from '../src/protocolMapping.js';
import { ScriptedTransport, startedClient } from './support/fakes.js';

const operationTrailer = 'briosa-operation-error-bin';

function deniedCall(policyDenial?: WirePolicyDenialDetails): OperationError {
  return OperationError.fromPartial({
    operationId: 'file_operations.get_working_directory',
    kind: OperationFailureKind.OPERATION_FAILURE_KIND_POLICY_DENIED,
    diagnosticCode: 'operation-policy-denied',
    executionDisposition:
      ExecutionDisposition.EXECUTION_DISPOSITION_NOT_STARTED,
    recoveryGuidance: RecoveryGuidance.RECOVERY_GUIDANCE_NONE,
    replayGuidance: ReplayGuidance.REPLAY_GUIDANCE_DO_NOT_REPLAY,
    replaySafety: ReplaySafety.REPLAY_SAFETY_SAFE,
    ...(policyDenial === undefined ? {} : { policyDenial }),
  });
}

function trailerError(bytes: Uint8Array): ServiceError {
  const metadata = new Metadata();
  metadata.set(operationTrailer, Buffer.from(bytes));
  return Object.assign(new Error('status text must not be parsed'), {
    code: status.PERMISSION_DENIED,
    details: 'status text must not be parsed',
    metadata,
  });
}

function mapped(detail: OperationError): BriosaOperationError {
  const error = mapServiceError(
    trailerError(OperationError.encode(detail).finish()),
  );
  assert.ok(error instanceof BriosaOperationError);
  return error;
}

// Everything about a typed failure except the denial detail.
function failure(error: BriosaOperationError): readonly unknown[] {
  return [
    error.operationId,
    error.kind,
    error.diagnosticCode,
    error.executionDisposition,
    error.recoveryGuidance,
    error.replayGuidance,
    error.replaySafety,
    error.mpExecution,
    error.completionUnknown,
    error.reconciliationRequired,
  ];
}

const server0100Failure = failure(mapped(deniedCall()));

void test('Server 0.10.0: a policy denial without detail is unchanged and has none', () => {
  const error = mapped(deniedCall());
  assert.equal(error.policyDenial, null);
  assert.deepEqual(server0100Failure, [
    'file_operations.get_working_directory',
    'policyDenied',
    'operation-policy-denied',
    'notStarted',
    'none',
    'doNotReplay',
    'safe',
    null,
    false,
    false,
  ]);
});

const ruleCases: readonly {
  readonly name: string;
  readonly wire: WirePolicyDenialDetails;
  readonly expected: PolicyDenialDetails;
}[] = [
  {
    name: 'a flag denial names the public risk flag',
    wire: {
      rule: PolicyDenialRule.POLICY_DENIAL_RULE_FLAG,
      deniedFlag: 'filesystem_write',
    },
    expected: {
      rule: 'flag',
      deniedFlag: 'filesystemWrite',
      admissionProfile: null,
      requestOptionField: null,
    },
  },
  {
    name: 'an option-attributed flag denial names the request field',
    wire: {
      rule: PolicyDenialRule.POLICY_DENIAL_RULE_FLAG,
      deniedFlag: 'interactive_ui',
      requestOptionField: 'show_results_dialog',
    },
    expected: {
      rule: 'flag',
      deniedFlag: 'interactiveUi',
      admissionProfile: null,
      requestOptionField: 'show_results_dialog',
    },
  },
  {
    name: 'a profile denial names the profile and no flag',
    wire: {
      rule: PolicyDenialRule.POLICY_DENIAL_RULE_PROFILE,
      admissionProfile: 'standard',
    },
    expected: {
      rule: 'profile',
      deniedFlag: null,
      admissionProfile: 'standard',
      requestOptionField: null,
    },
  },
  {
    name: 'an override denial',
    wire: { rule: PolicyDenialRule.POLICY_DENIAL_RULE_OVERRIDE },
    expected: {
      rule: 'override',
      deniedFlag: null,
      admissionProfile: null,
      requestOptionField: null,
    },
  },
  {
    name: 'an exclusive denial attributed to a request option',
    wire: {
      rule: PolicyDenialRule.POLICY_DENIAL_RULE_EXCLUSIVE,
      requestOptionField: 'acknowledge_arrival',
    },
    expected: {
      rule: 'exclusive',
      deniedFlag: null,
      admissionProfile: null,
      requestOptionField: 'acknowledge_arrival',
    },
  },
  {
    name: 'an unreviewed denial',
    wire: { rule: PolicyDenialRule.POLICY_DENIAL_RULE_UNREVIEWED },
    expected: {
      rule: 'unreviewed',
      deniedFlag: null,
      admissionProfile: null,
      requestOptionField: null,
    },
  },
  {
    name: 'an unknown rule and flag are unknown metadata',
    wire: { rule: 99 as PolicyDenialRule, deniedFlag: 'quantum_flux' },
    expected: {
      rule: 'unknown',
      deniedFlag: 'unknown',
      admissionProfile: null,
      requestOptionField: null,
    },
  },
  {
    name: 'inconsistent fields are reported as sent',
    wire: {
      rule: PolicyDenialRule.POLICY_DENIAL_RULE_PROFILE,
      deniedFlag: 'destructive',
      admissionProfile: '',
    },
    expected: {
      rule: 'profile',
      deniedFlag: 'destructive',
      admissionProfile: '',
      requestOptionField: null,
    },
  },
  {
    name: 'a present but empty detail',
    wire: {},
    expected: {
      rule: 'unspecified',
      deniedFlag: null,
      admissionProfile: null,
      requestOptionField: null,
    },
  },
];

for (const { name, wire, expected } of ruleCases) {
  void test(`denied call: ${name}, and the failure stays the same`, () => {
    const error = mapped(deniedCall(wire));
    assert.deepEqual(error.policyDenial, expected);
    assert.deepEqual(failure(error), server0100Failure);
  });
}

void test('detail on another failure kind never changes that kind', () => {
  const detail = OperationError.fromPartial({
    ...deniedCall({ rule: PolicyDenialRule.POLICY_DENIAL_RULE_OVERRIDE }),
    kind: OperationFailureKind.OPERATION_FAILURE_KIND_MP_FAILURE,
    executionDisposition: ExecutionDisposition.EXECUTION_DISPOSITION_COMPLETED,
  });
  const error = mapped(detail);
  assert.equal(error.kind, 'mpFailure');
  assert.equal(error.executionDisposition, 'completed');
  assert.equal(error.policyDenial?.rule, 'override');
});

void test('an undecodable trailer keeps the existing malformed handling', () => {
  const valid = OperationError.encode(deniedCall()).finish();
  // Field 11, length-delimited, claiming more bytes than follow.
  const truncated = Buffer.concat([valid, Buffer.from([0x5a, 0x10, 0x08])]);
  const error = mapServiceError(trailerError(truncated));
  assert.ok(error instanceof BriosaTransportError);
  assert.equal(error.diagnosticCode, 'typed-error-malformed');
});

void test('one helper maps every published flag name and nothing else', () => {
  // Every published value, with its lowercase name suffix; the generated
  // enum's UNSPECIFIED and UNRECOGNIZED members are not flags.
  const names: [string, OperationRiskFlag][] = [];
  for (const [key, value] of Object.entries(OperationRiskFlag)) {
    if (typeof value !== 'number') continue;
    if (value <= OperationRiskFlag.OPERATION_RISK_FLAG_UNSPECIFIED) continue;
    names.push([
      key.replace(/^OPERATION_RISK_FLAG_/u, '').toLowerCase(),
      value,
    ]);
  }
  assert.equal(names.length, 11);
  for (const [name] of names) {
    assert.notEqual(riskFlagFromName(name), 'unknown', name);
  }
  // The same flag through the risk flag list and through the name.
  const byNumber = mapCapabilityListing({
    protocolPackage: briosaProtocolIdentity.protocolPackage,
    spatialAnalyzerTarget: briosaProtocolIdentity.spatialAnalyzerTarget,
    operations: [
      capability('GetWorkingDirectory', {
        riskFlags: names.map(([, value]) => value),
      }),
    ],
  }).operations[0]?.riskFlags;
  assert.deepEqual(
    names.map(([name]) => riskFlagFromName(name)),
    byNumber,
  );
  for (const unknown of [
    'unspecified',
    'PHYSICAL_MOTION',
    'physicalMotion',
    ' physical_motion',
    '',
  ]) {
    assert.equal(riskFlagFromName(unknown), 'unknown', unknown);
  }
});

function capability(
  rpc: string,
  fields: Partial<OperationCapability>,
): OperationCapability {
  return {
    operationId: `file_operations.${rpc}`,
    grpcService: 'briosa.FileOperations',
    rpc,
    fullyQualifiedMethod: `/briosa.FileOperations/${rpc}`,
    riskFlags: [OperationRiskFlag.OPERATION_RISK_FLAG_FILESYSTEM_METADATA],
    durationClass: OperationDurationClass.OPERATION_DURATION_CLASS_QUICK,
    validationStatus:
      OperationValidationStatus.OPERATION_VALIDATION_STATUS_NO_RECORDED_GAP,
    admission: OperationAdmission.OPERATION_ADMISSION_ADMITTED,
    ...fields,
  };
}

// Through the generated codec, as the bytes arrive from a server.
function overTheWire(
  operations: OperationCapability[],
): ListCapabilitiesResponse {
  return ListCapabilitiesResponse.decode(
    ListCapabilitiesResponse.encode({
      protocolPackage: briosaProtocolIdentity.protocolPackage,
      spatialAnalyzerTarget: briosaProtocolIdentity.spatialAnalyzerTarget,
      admissionProfile: 'standard',
      policyFingerprint: `sha256:${'0'.repeat(64)}`,
      operations,
    }).finish(),
  );
}

const showResultsDialog = {
  fieldName: 'show_results_dialog',
  effect:
    OperationRequestOptionEffect.OPERATION_REQUEST_OPTION_EFFECT_INTERACTIVE_UI,
  condition:
    OperationRequestOptionCondition.OPERATION_REQUEST_OPTION_CONDITION_WHEN_TRUE,
  omission:
    OperationRequestOptionOmission.OPERATION_REQUEST_OPTION_OMISSION_DOES_NOT_ACTIVATE,
  admission: OperationAdmission.OPERATION_ADMISSION_DENIED_FLAG,
  policyDenial: {
    rule: PolicyDenialRule.POLICY_DENIAL_RULE_FLAG,
    deniedFlag: 'interactive_ui',
    requestOptionField: 'show_results_dialog',
  },
};

void test('request options: absent is "not described", empty is "none apply"', () => {
  const listing = mapCapabilityListing(
    overTheWire([
      capability('GetWorkingDirectory', {}),
      capability('SetWorkingDirectory', { requestOptions: { options: [] } }),
      capability('RunReport', {
        requestOptions: { options: [showResultsDialog] },
      }),
    ]),
  );
  assert.deepEqual(
    listing.operations.map((operation) => operation.requestOptions),
    [
      null,
      [],
      [
        {
          fieldName: 'show_results_dialog',
          effect: 'interactiveUi',
          condition: 'whenTrue',
          enablingEnumValues: [],
          omission: 'doesNotActivate',
          admission: 'deniedFlag',
          policyDenial: {
            rule: 'flag',
            deniedFlag: 'interactiveUi',
            admissionProfile: null,
            requestOptionField: 'show_results_dialog',
          },
        },
      ],
    ],
  );
  // The option describes a request; the reviewed row stays admitted.
  assert.deepEqual(
    listing.operations.map((operation) => [
      operation.admission,
      operation.policyDenial,
    ]),
    [
      ['admitted', null],
      ['admitted', null],
      ['admitted', null],
    ],
  );
});

void test('every request option value maps, and unknown ones are unknown metadata', () => {
  const options = [
    {
      fieldName: 'mode',
      effect:
        OperationRequestOptionEffect.OPERATION_REQUEST_OPTION_EFFECT_BACKGROUND_WORK,
      condition:
        OperationRequestOptionCondition.OPERATION_REQUEST_OPTION_CONDITION_WHEN_ONE_OF,
      enablingEnumValues: ['MODE_CONTINUOUS', 'MODE_TRIGGERED'],
      omission:
        OperationRequestOptionOmission.OPERATION_REQUEST_OPTION_OMISSION_ACTIVATES,
      admission: OperationAdmission.OPERATION_ADMISSION_DENIED_EXCLUSIVE,
      policyDenial: {
        rule: PolicyDenialRule.POLICY_DENIAL_RULE_EXCLUSIVE,
        requestOptionField: 'mode',
      },
    },
    {
      fieldName: 'acknowledge_arrival',
      condition:
        OperationRequestOptionCondition.OPERATION_REQUEST_OPTION_CONDITION_WHEN_FALSE,
      omission:
        OperationRequestOptionOmission.OPERATION_REQUEST_OPTION_OMISSION_REQUIRED,
      admission: OperationAdmission.OPERATION_ADMISSION_ADMITTED,
    },
    {
      fieldName: 'template',
      condition:
        OperationRequestOptionCondition.OPERATION_REQUEST_OPTION_CONDITION_WHEN_PRESENT,
    },
    {
      fieldName: 'title',
      condition:
        OperationRequestOptionCondition.OPERATION_REQUEST_OPTION_CONDITION_WHEN_NON_EMPTY,
    },
    {
      fieldName: 'future',
      effect: 7 as OperationRequestOptionEffect,
      condition: 8 as OperationRequestOptionCondition,
      omission: 9 as OperationRequestOptionOmission,
      admission: 10 as OperationAdmission,
      policyDenial: { rule: 11 as PolicyDenialRule },
    },
  ];
  const [operation] = mapCapabilityListing(
    overTheWire([capability('Measure', { requestOptions: { options } })]),
  ).operations;
  assert.deepEqual(
    operation?.requestOptions?.map((option) => [
      option.fieldName,
      option.effect,
      option.condition,
      option.enablingEnumValues,
      option.omission,
      option.admission,
      option.policyDenial?.rule ?? null,
    ]),
    [
      [
        'mode',
        'backgroundWork',
        'whenOneOf',
        ['MODE_CONTINUOUS', 'MODE_TRIGGERED'],
        'activates',
        'deniedExclusive',
        'exclusive',
      ],
      [
        'acknowledge_arrival',
        'unspecified',
        'whenFalse',
        [],
        'required',
        'admitted',
        null,
      ],
      [
        'template',
        'unspecified',
        'whenPresent',
        [],
        'unspecified',
        'unspecified',
        null,
      ],
      [
        'title',
        'unspecified',
        'whenNonEmpty',
        [],
        'unspecified',
        'unspecified',
        null,
      ],
      ['future', 'unknown', 'unknown', [], 'unknown', 'unknown', 'unknown'],
    ],
  );
  // Unknown option metadata never fails discovery or changes admission.
  assert.equal(operation?.admission, 'admitted');
});

void test('a denied capability carries its detail; admission stays the server value', async () => {
  const transport = new ScriptedTransport();
  transport.deniedCapabilities = overTheWire([
    capability('GetWorkingDirectory', {}),
    capability('SaveAs', {
      riskFlags: [OperationRiskFlag.OPERATION_RISK_FLAG_FILESYSTEM_WRITE],
      admission: OperationAdmission.OPERATION_ADMISSION_DENIED_FLAG,
      policyDenial: {
        rule: PolicyDenialRule.POLICY_DENIAL_RULE_FLAG,
        deniedFlag: 'filesystem_write',
      },
      requestOptions: { options: [] },
    }),
    capability('DeleteFile', {
      admission: OperationAdmission.OPERATION_ADMISSION_DENIED_PROFILE,
      policyDenial: {
        rule: 42 as PolicyDenialRule,
        admissionProfile: 'standard',
      },
    }),
    // Inconsistent: an admitted row with denial detail.
    capability('GetNothing', {
      policyDenial: { rule: PolicyDenialRule.POLICY_DENIAL_RULE_OVERRIDE },
    }),
  ]);
  const { client } = await startedClient(transport);
  try {
    const listing = await client.listCapabilities({ includeDenied: true });
    assert.deepEqual(
      listing.operations.map((operation) => [
        operation.rpc,
        operation.admission,
        operation.policyDenial,
      ]),
      [
        ['GetWorkingDirectory', 'admitted', null],
        [
          'SaveAs',
          'deniedFlag',
          {
            rule: 'flag',
            deniedFlag: 'filesystemWrite',
            admissionProfile: null,
            requestOptionField: null,
          },
        ],
        [
          'DeleteFile',
          'deniedProfile',
          {
            rule: 'unknown',
            deniedFlag: null,
            admissionProfile: 'standard',
            requestOptionField: null,
          },
        ],
        [
          'GetNothing',
          'admitted',
          {
            rule: 'override',
            deniedFlag: null,
            admissionProfile: null,
            requestOptionField: null,
          },
        ],
      ],
    );
    // The diagnostic listing never changes the admitted set.
    assert.equal(
      (await client.getServerSnapshot()).supports(
        '/briosa.FileOperations/SaveAs',
      ),
      false,
    );
  } finally {
    await client.stop();
  }
});

void test('the client never pre-validates a request from its request options', async () => {
  const transport = new ScriptedTransport();
  transport.capabilities = overTheWire([
    capability('GetWorkingDirectory', {
      requestOptions: {
        options: [
          {
            ...showResultsDialog,
            admission: OperationAdmission.OPERATION_ADMISSION_DENIED_EXCLUSIVE,
          },
        ],
      },
    }),
  ]);
  const { client } = await startedClient(transport);
  try {
    assert.equal(
      (await getWorkingDirectory(client)).length > 0 &&
        transport.workingDirectoryCalls === 1,
      true,
    );
  } finally {
    await client.stop();
  }
});

void test('Server 0.10.0 discovery has no denial detail and no request options', async () => {
  const { client } = await startedClient();
  try {
    const [operation] = (await client.getServerSnapshot()).operations;
    assert.equal(operation?.policyDenial, null);
    assert.equal(operation?.requestOptions, null);
    assert.equal(operation?.admission, 'unspecified');
  } finally {
    await client.stop();
  }
});
