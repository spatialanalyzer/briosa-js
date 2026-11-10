// Every public operation takes `BriosaCallOptions` as its optional last
// parameter and passes it on: the caller's abort signal reaches the transport,
// and the MP completion observer sees the call's completion
// (docs/design/v1-public-api-contract.md). Eleven `GdtOperations` methods once
// took no call options, so they could be neither cancelled nor observed.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BriosaProtocolError, type MpCompletion } from '../src/index.js';
import { startedClient, succeeded } from './support/fakes.js';
import {
  argumentsFor,
  checker,
  discover,
  isOptional,
  symbolType,
  typeName,
} from './support/publicOperations.js';

void test('every public operation takes call options as its optional last parameter', async () => {
  const { client } = await startedClient();
  try {
    const missing = discover(client)
      .filter((operation) => {
        const last = operation.signature.getParameters().at(-1);
        return (
          last === undefined ||
          !isOptional(last) ||
          typeName(checker.getNonNullableType(symbolType(last))) !==
            'BriosaCallOptions'
        );
      })
      .map((operation) => operation.label);
    assert.deepEqual(missing, []);
  } finally {
    await client.stop();
  }
});

void test('every public operation passes its abort signal and MP observer on', async () => {
  const { client, transport } = await startedClient();
  transport.respond = () => ({ execution: succeeded() });
  try {
    const problems: string[] = [];
    for (const operation of discover(client)) {
      const controller = new AbortController();
      const completions: MpCompletion[] = [];
      const callOptions = {
        signal: controller.signal,
        onMpCompletion: (completion: MpCompletion): void => {
          completions.push(completion);
        },
      };
      const operations = transport.operations.length;
      const workingDirectoryCalls = transport.workingDirectoryCalls;
      try {
        await operation.invoke([
          ...argumentsFor(operation, client),
          callOptions,
        ]);
      } catch (error) {
        // The scripted success has no outputs to map; the observer runs first.
        if (!(error instanceof BriosaProtocolError)) {
          problems.push(`${operation.label}: ${String(error)}`);
          continue;
        }
      }
      const signal =
        transport.operations.length > operations
          ? transport.lastOperation.signal
          : transport.workingDirectoryCalls > workingDirectoryCalls
            ? transport.workingDirectorySignal
            : undefined;
      if (signal !== controller.signal)
        problems.push(`${operation.label}: the signal is not passed on`);
      if (completions.length !== 1)
        problems.push(
          `${operation.label}: ${String(completions.length)} completions observed`,
        );
    }
    assert.deepEqual(problems, []);
  } finally {
    await client.stop();
  }
});
