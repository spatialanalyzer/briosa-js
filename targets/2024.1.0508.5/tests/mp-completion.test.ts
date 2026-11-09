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
import { MpExecutionState } from '../src/generated/protocol/briosa/operation_outcomes.js';
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

void test('without onMpCompletion the completion details are not required', async () => {
  const { client, transport } = await startedClient();
  transport.respond = () => units;
  assert.deepEqual(await getActiveUnits(client), units);
  await client.stop();
});

void test('a requested completion that is missing or not a success fails closed', async () => {
  const { client, transport } = await startedClient();
  const onMpCompletion = (): void => undefined;
  for (const [execution, diagnosticCode] of [
    [undefined, 'mp-completion-missing'],
    [
      {
        state: MpExecutionState.MP_EXECUTION_STATE_FAILED,
        mpResultCode: 3,
        outputRetrievals: [],
      },
      'mp-completion-invalid',
    ],
    [
      {
        state: MpExecutionState.MP_EXECUTION_STATE_SUCCEEDED,
        outputRetrievals: [],
      },
      'mp-completion-invalid',
    ],
  ] as const) {
    transport.respond = () => ({ ...units, execution });
    await assert.rejects(
      () => getActiveUnits(client, { onMpCompletion }),
      (error: unknown) =>
        error instanceof BriosaProtocolError &&
        error.diagnosticCode === diagnosticCode,
    );
  }
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
