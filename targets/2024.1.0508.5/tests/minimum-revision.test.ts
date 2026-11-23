// This client is generated from a checkpoint that declares compatibility 3.1
// (Server 0.10.1) and still works with Server 0.10.0, which declares 3.0. Its
// minimum revision stays 0 in installation selection and in live discovery,
// while live coordinates must still match the selected installation.

import assert from 'node:assert/strict';
import { test } from 'node:test';

/* eslint-disable @typescript-eslint/require-await -- Async test doubles implement the launcher contract. */

import { BriosaClientImplementation } from '../src/client.js';
import {
  BriosaCompatibilityError,
  validateBriosaCompatibility,
  validateInstallation,
} from '../src/compatibility.js';
import { briosaProtocolIdentity } from '../src/generated/protocolIdentity.js';
import type { BriosaInstallation } from '../src/installationModels.js';
import {
  compatible,
  minimumCompatibilityRevision,
  selectInstallation,
} from '../src/installationPolicy.js';
import type { OwnedServer, ServerLauncher } from '../src/serverLauncher.js';
import {
  ScriptedTransport,
  defaultCapabilities,
  serverInfo,
} from './support/fakes.js';

function installation(
  version: string,
  revision: number,
  sourceRevision: string = briosaProtocolIdentity.sourceRevision,
): BriosaInstallation {
  return {
    installationId: `briosa-${version}`,
    executablePath: `C:/Briosa/${version}/Briosa.Server.exe`,
    version,
    sourceRevision,
    spatialAnalyzerTarget: briosaProtocolIdentity.spatialAnalyzerTarget,
    runtimeIdentifier: 'win-x64',
    contractMajor: 3,
    contractRevision: revision,
    manifestSha256: 'b'.repeat(64),
    scope: 'machine',
  };
}

void test('the pinned checkpoint declares 3.1 and the client requires only 3.0', () => {
  assert.equal(briosaProtocolIdentity.compatibilityMajor, 3);
  assert.equal(briosaProtocolIdentity.compatibilityRevision, 1);
  assert.equal(minimumCompatibilityRevision, 0);
  assert.equal(compatible(3, 0, '0.10.0', 'source'), true);
  assert.equal(compatible(3, 1, '0.10.1', 'source'), true);
  assert.equal(compatible(3, 2, '0.10.2', 'source'), true);
  assert.equal(compatible(2, 0, '0.9.2', 'source'), false);
  assert.equal(compatible(4, 0, '1.0.0', 'source'), false);
});

void test('installation selection accepts Server 0.10.0 (3.0) and Server 0.10.1 (3.1)', () => {
  const server0100 = installation('0.10.0', 0, 'a'.repeat(40));
  const server0101 = installation('0.10.1', 1);
  assert.equal(
    selectInstallation([server0100], {}).selected?.installationId,
    'briosa-0.10.0',
  );
  assert.equal(
    selectInstallation([server0101], {}).selected?.installationId,
    'briosa-0.10.1',
  );
  assert.equal(
    selectInstallation([server0100, server0101], {}).selected?.installationId,
    'briosa-0.10.1',
  );
  assert.equal(
    selectInstallation([server0100, server0101], { version: '0.10.0' }).selected
      ?.installationId,
    'briosa-0.10.0',
  );
});

void test('live discovery accepts a server declaring 3.0 and one declaring 3.1', () => {
  for (const revision of [0, 1]) {
    assert.doesNotThrow(() =>
      validateBriosaCompatibility(
        { ...serverInfo(false), compatibility: { major: 3, revision } },
        defaultCapabilities(),
      ),
    );
  }
  assert.throws(
    () =>
      validateBriosaCompatibility(
        { ...serverInfo(false), compatibility: { major: 2, revision: 1 } },
        defaultCapabilities(),
      ),
    (error: unknown) =>
      error instanceof BriosaCompatibilityError &&
      error.diagnosticCode === 'server-contract-incompatible',
  );
});

void test('live coordinates must still match the selected installation', () => {
  const live = (revision: number) => ({
    ...serverInfo(false),
    compatibility: { major: 3, revision },
  });
  const selected = (revision: number) =>
    installation(briosaProtocolIdentity.briosaVersion, revision);
  assert.doesNotThrow(() => validateInstallation(live(0), selected(0)));
  assert.doesNotThrow(() => validateInstallation(live(1), selected(1)));
  for (const [server, manifest] of [
    [1, 0],
    [0, 1],
  ] as const) {
    assert.throws(
      () => validateInstallation(live(server), selected(manifest)),
      (error: unknown) =>
        error instanceof BriosaCompatibilityError &&
        error.diagnosticCode === 'server-installation-identity-mismatch',
    );
  }
});

class InstalledLauncher implements ServerLauncher {
  constructor(readonly installation: BriosaInstallation) {}
  async launch(): Promise<OwnedServer> {
    return {
      installation: this.installation,
      target: '127.0.0.1:49152',
      hasExited: false,
      close: async () => undefined,
    };
  }
}

for (const revision of [0, 1]) {
  void test(`start() succeeds against a selected server declaring 3.${revision}`, async () => {
    const transport = new ScriptedTransport();
    transport.serverInfoFields = { compatibility: { major: 3, revision } };
    const client = new BriosaClientImplementation(
      {},
      new InstalledLauncher(
        installation(briosaProtocolIdentity.briosaVersion, revision),
      ),
      () => transport,
    );
    try {
      await client.start();
      assert.equal((await client.getServerSnapshot()).readyForMp, true);
    } finally {
      await client.stop();
    }
  });
}

void test('start() rejects a live server whose revision differs from its installation', async () => {
  const transport = new ScriptedTransport();
  transport.serverInfoFields = { compatibility: { major: 3, revision: 1 } };
  const client = new BriosaClientImplementation(
    {},
    new InstalledLauncher(
      installation(briosaProtocolIdentity.briosaVersion, 0),
    ),
    () => transport,
  );
  await assert.rejects(
    client.start(),
    (error: unknown) =>
      error instanceof BriosaCompatibilityError &&
      error.diagnosticCode === 'server-installation-identity-mismatch',
  );
  await client.stop();
});
