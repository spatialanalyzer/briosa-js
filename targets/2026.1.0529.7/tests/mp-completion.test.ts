// Contract major 3: an MP partial success (code 4) is a success, and each
// call can observe its own MP completion through onMpCompletion
// (client-library-behavioral-contract.md, "Partial success").

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  BriosaProtocolError,
  getActiveUnits,
  getWorkingDirectory,
  type MpCompletion,
} from '../src/index.js';
import {
  MpExecutionState,
  type MpExecutionDetails,
} from '../src/generated/protocol/briosa/operation_outcomes.js';
import {
  partialSuccess,
  startedClient,
  succeeded,
  ScriptedTransport,
} from './support/fakes.js';

const units = { length: 'mm', angular: 'deg', temperature: 'C' };

void test('a partial success returns its outputs and reports the completion', async () => {
  const { client, transport } = await startedClient();
  transport.respond = () => ({ ...units, execution: partialSuccess() });
  const completions: MpCompletion[] = [];

  const result = await getActiveUnits(client, {
    onMpCompletion: (completion) => completions.push(completion),
  });

  assert.deepEqual(result, units);
  assert.deepEqual(completions, [{ state: 'partialSuccess', mpResultCode: 4 }]);
  assert.equal(transport.operations.length, 1, 'never retried');
  await client.stop();
});

void test('a full success reports succeeded with its MP code', async () => {
  const { client, transport } = await startedClient();
  transport.respond = () => ({ ...units, execution: succeeded() });
  const completions: MpCompletion[] = [];

  await getActiveUnits(client, {
    onMpCompletion: (completion) => completions.push(completion),
  });

  assert.deepEqual(completions, [{ state: 'succeeded', mpResultCode: 2 }]);
  await client.stop();
});

void test('getWorkingDirectory reports its MP completion per call', async () => {
  const { client, transport } = await startedClient();
  transport.workingDirectoryResults.push(
    { directory: 'C:\\Partial', execution: partialSuccess() },
    { directory: 'C:\\Full', execution: succeeded() },
  );
  const completions: MpCompletion[] = [];
  const onMpCompletion = (completion: MpCompletion): void => {
    completions.push(completion);
  };

  assert.equal(
    await getWorkingDirectory(client, { onMpCompletion }),
    'C:\\Partial',
  );
  assert.equal(
    await getWorkingDirectory(client, { onMpCompletion }),
    'C:\\Full',
  );
  assert.deepEqual(completions, [
    { state: 'partialSuccess', mpResultCode: 4 },
    { state: 'succeeded', mpResultCode: 2 },
  ]);
  await client.stop();
});

void test('concurrent calls observe only their own completion', async () => {
  const transport = new ScriptedTransport();
  let call = 0;
  transport.respond = async () => {
    call += 1;
    const execution = call === 1 ? partialSuccess() : succeeded();
    // The first call finishes last.
    await new Promise((resolvePromise) =>
      setTimeout(resolvePromise, call === 1 ? 20 : 0),
    );
    return { ...units, execution };
  };
  const { client } = await startedClient(transport);
  const first: MpCompletion[] = [];
  const second: MpCompletion[] = [];

  await Promise.all([
    getActiveUnits(client, { onMpCompletion: (value) => first.push(value) }),
    getActiveUnits(client, { onMpCompletion: (value) => second.push(value) }),
  ]);

  assert.deepEqual(first, [{ state: 'partialSuccess', mpResultCode: 4 }]);
  assert.deepEqual(second, [{ state: 'succeeded', mpResultCode: 2 }]);
  await client.stop();
});

// C1 (major3-client-consistency.md): every successful MP call is checked,
// whether or not the caller observes it. A success carries `execution` with
// SUCCEEDED and MP code 2, or PARTIAL_SUCCESS and MP code 4.
const invalidCompletions: readonly (readonly [
  string,
  MpExecutionDetails | undefined,
  string,
])[] = [
  ['no execution', undefined, 'mp-completion-missing'],
  [
    'no MP code',
    {
      state: MpExecutionState.MP_EXECUTION_STATE_SUCCEEDED,
      outputRetrievals: [],
    },
    'mp-completion-invalid',
  ],
  [
    'SUCCEEDED with code 4',
    {
      state: MpExecutionState.MP_EXECUTION_STATE_SUCCEEDED,
      mpResultCode: 4,
      outputRetrievals: [],
    },
    'mp-completion-invalid',
  ],
  [
    'PARTIAL_SUCCESS with code 2',
    {
      state: MpExecutionState.MP_EXECUTION_STATE_PARTIAL_SUCCESS,
      mpResultCode: 2,
      outputRetrievals: [],
    },
    'mp-completion-invalid',
  ],
  [
    'FAILED with code 3',
    {
      state: MpExecutionState.MP_EXECUTION_STATE_FAILED,
      mpResultCode: 3,
      outputRetrievals: [],
    },
    'mp-completion-invalid',
  ],
  [
    'an unspecified state with code 2',
    {
      state: MpExecutionState.MP_EXECUTION_STATE_UNSPECIFIED,
      mpResultCode: 2,
      outputRetrievals: [],
    },
    'mp-completion-invalid',
  ],
];

for (const [name, execution, diagnosticCode] of invalidCompletions) {
  void test(`a success with ${name} fails as a protocol error, with or without an observer`, async () => {
    const { client, transport } = await startedClient();
    const completions: MpCompletion[] = [];
    const observed = {
      onMpCompletion: (completion: MpCompletion): void => {
        completions.push(completion);
      },
    };
    const rejectsWith = (error: unknown): boolean =>
      error instanceof BriosaProtocolError &&
      error.diagnosticCode === diagnosticCode;
    transport.respond = () =>
      execution === undefined ? units : { ...units, execution };
    for (const options of [{}, observed]) {
      await assert.rejects(() => getActiveUnits(client, options), rejectsWith);
      transport.workingDirectoryResults.push(
        execution === undefined
          ? { directory: 'C:\\Working' }
          : { directory: 'C:\\Working', execution },
      );
      await assert.rejects(
        () => getWorkingDirectory(client, options),
        rejectsWith,
      );
    }
    assert.deepEqual(completions, [], 'the observer is never called');
    await client.stop();
  });
}

void test('the observer reports a success whose output mapping then fails', async () => {
  const { client, transport } = await startedClient();
  const completions: MpCompletion[] = [];
  const onMpCompletion = (completion: MpCompletion): void => {
    completions.push(completion);
  };
  // The completion is checked and reported before the outputs are mapped.
  transport.respond = () => ({ execution: partialSuccess() });
  await assert.rejects(
    () => getActiveUnits(client, { onMpCompletion }),
    BriosaProtocolError,
  );
  transport.workingDirectoryResults.push({ execution: succeeded() });
  await assert.rejects(
    () => getWorkingDirectory(client, { onMpCompletion }),
    (error: unknown) =>
      error instanceof BriosaProtocolError &&
      error.diagnosticCode === 'working-directory-missing',
  );
  assert.deepEqual(completions, [
    { state: 'partialSuccess', mpResultCode: 4 },
    { state: 'succeeded', mpResultCode: 2 },
  ]);
  await client.stop();
});

void test('onMpCompletion must be a function and is checked before any call', async () => {
  const { client, transport } = await startedClient();
  await assert.rejects(
    () =>
      getActiveUnits(client, {
        onMpCompletion: 'not a function' as unknown as () => void,
      }),
    TypeError,
  );
  await assert.rejects(
    () =>
      getWorkingDirectory(client, {
        onMpCompletion: 42 as unknown as () => void,
      }),
    TypeError,
  );
  assert.equal(transport.operations.length, 0);
  assert.equal(transport.workingDirectoryCalls, 0);
  await client.stop();
});
