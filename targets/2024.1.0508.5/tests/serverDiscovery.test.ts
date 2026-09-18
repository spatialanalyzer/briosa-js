import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';

import { BriosaStartupError } from '../src/errors.js';
import { briosaProtocolIdentity as identity } from '../src/generated/protocolIdentity.js';
import { resolveServerExecutable } from '../src/serverDiscovery.js';

const id = `briosa-${identity.briosaVersion}-sa-${identity.spatialAnalyzerTarget}-win-x64`;

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'briosa-discovery-'));
  const paths = {
    moduleDirectory: join(root, 'client'),
    localAppData: join(root, 'user'),
    commonAppData: join(root, 'machine'),
  };
  return {
    root,
    paths,
    cleanup: () => {
      rmSync(root, { recursive: true, force: true });
    },
  };
}

function touch(path: string): string {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, 'fixture');
  return path;
}

function install(root: string): string {
  const product = join(root, 'Briosa', 'Packages', 'products', id);
  const payload = join(product, 'payload');
  const server = touch(join(payload, 'Briosa.Server.exe'));
  touch(join(payload, 'Briosa.Worker.exe'));
  writeFileSync(
    join(payload, 'manifest.json'),
    JSON.stringify({
      schemaVersion: 2,
      artifactName: id,
      briosaVersion: identity.briosaVersion,
      spatialAnalyzerTarget: identity.spatialAnalyzerTarget,
      runtimeIdentifier: 'win-x64',
      sourceRevision: identity.sourceRevision,
      protocolPackage: 'briosa',
      spatialAnalyzerBundled: false,
    }),
  );
  writeFileSync(
    join(product, 'receipt.json'),
    JSON.stringify({
      schemaVersion: 1,
      package: {
        id,
        component: 'server',
        version: identity.briosaVersion,
        spatialAnalyzerTarget: identity.spatialAnalyzerTarget,
        runtimeIdentifier: 'win-x64',
      },
      files: Object.fromEntries(
        ['manifest.json', 'Briosa.Server.exe', 'Briosa.Worker.exe'].map(
          (name) => [name, 'a'.repeat(64)],
        ),
      ),
    }),
  );
  return server;
}

void test('explicit, client-local, user store, machine store, and legacy precedence', () => {
  const f = fixture();
  try {
    const legacy = touch(
      join(
        f.paths.localAppData,
        'Briosa',
        'servers',
        identity.briosaVersion,
        `sa-${identity.spatialAnalyzerTarget}`,
        'Briosa.Server.exe',
      ),
    );
    assert.equal(resolveServerExecutable(f.paths), legacy);
    const machine = install(f.paths.commonAppData);
    assert.equal(resolveServerExecutable(f.paths), machine);
    const user = install(f.paths.localAppData);
    assert.equal(resolveServerExecutable(f.paths), user);
    const local = touch(
      join(f.paths.moduleDirectory, 'briosa-server', 'Briosa.Server.exe'),
    );
    assert.equal(resolveServerExecutable(f.paths), local);
    const custom = touch(join(f.root, 'custom', 'Briosa.Server.exe'));
    assert.equal(
      resolveServerExecutable({ ...f.paths, configured: custom }),
      custom,
    );
    assert.equal(
      resolveServerExecutable({
        ...f.paths,
        configured: join(f.root, 'absent', 'Briosa.Server.exe'),
      }),
      local,
    );
    assert.equal(
      resolveServerExecutable({
        ...f.paths,
        configured: touch(join(f.root, 'not-Briosa.Server.exe')),
      }),
      local,
    );
  } finally {
    f.cleanup();
  }
});

const defects: ReadonlyArray<readonly [string, readonly string[], unknown]> = [
  ['receipt.json', ['schemaVersion'], true],
  ['receipt.json', ['package'], null],
  ['receipt.json', ['package', 'id'], 'wrong'],
  ['receipt.json', ['package', 'component'], 'installer'],
  ['receipt.json', ['package', 'version'], '99.0.0'],
  ['receipt.json', ['package', 'spatialAnalyzerTarget'], 'other'],
  ['receipt.json', ['package', 'runtimeIdentifier'], 'win-arm64'],
  ['receipt.json', ['files'], {}],
  ['receipt.json', ['files', 'Briosa.Worker.exe'], 'invalid'],
  ['manifest.json', ['schemaVersion'], 99],
  ['manifest.json', ['artifactName'], 'wrong'],
  ['manifest.json', ['briosaVersion'], '99.0.0'],
  ['manifest.json', ['spatialAnalyzerTarget'], 'other'],
  ['manifest.json', ['runtimeIdentifier'], 'win-arm64'],
  ['manifest.json', ['sourceRevision'], 'wrong'],
  ['manifest.json', ['protocolPackage'], 'wrong'],
  ['manifest.json', ['spatialAnalyzerBundled'], true],
];

for (const [name, keys, value] of defects) {
  void test(`skips managed ${name} with invalid ${keys.join('.')}`, () => {
    const f = fixture();
    try {
      const payload = dirname(install(f.paths.localAppData));
      const path = join(
        name === 'receipt.json' ? dirname(payload) : payload,
        name,
      );
      const document = JSON.parse(readFileSync(path, 'utf8')) as Record<
        string,
        unknown
      >;
      let parent = document;
      for (const key of keys.slice(0, -1))
        parent = parent[key] as Record<string, unknown>;
      parent[keys[keys.length - 1]!] = value;
      writeFileSync(path, JSON.stringify(document));
      assert.throws(() => resolveServerExecutable(f.paths), BriosaStartupError);
      const machine = install(f.paths.commonAppData);
      assert.equal(resolveServerExecutable(f.paths), machine);
    } finally {
      f.cleanup();
    }
  });
}

for (const name of [
  'receipt.json',
  'manifest.json',
  'Briosa.Server.exe',
  'Briosa.Worker.exe',
]) {
  for (const damage of ['missing', 'directory', 'malformed']) {
    if (damage === 'malformed' && !name.endsWith('.json')) continue;
    void test(`skips ${damage} managed ${name}`, () => {
      const f = fixture();
      try {
        const payload = dirname(install(f.paths.localAppData));
        const path = join(
          name === 'receipt.json' ? dirname(payload) : payload,
          name,
        );
        rmSync(path);
        if (damage === 'directory') mkdirSync(path);
        if (damage === 'malformed') writeFileSync(path, '{');
        assert.throws(
          () => resolveServerExecutable(f.paths),
          BriosaStartupError,
        );
        const machine = install(f.paths.commonAppData);
        assert.equal(resolveServerExecutable(f.paths), machine);
      } finally {
        f.cleanup();
      }
    });
  }
}

void test('ignores other product directories, transactions, and unavailable roots', () => {
  const f = fixture();
  try {
    const product = dirname(dirname(install(f.paths.localAppData)));
    const other = `${product}-other`;
    renameSync(product, other);
    assert.throws(() => resolveServerExecutable(f.paths), BriosaStartupError);
    const staging = join(
      f.paths.localAppData,
      'Briosa',
      'Packages',
      'transactions',
      'pending',
      id,
    );
    mkdirSync(dirname(staging), { recursive: true });
    renameSync(other, staging);
    assert.throws(() => resolveServerExecutable(f.paths), BriosaStartupError);
    assert.throws(
      () =>
        resolveServerExecutable({
          ...f.paths,
          localAppData: '',
          commonAppData: '',
        }),
      BriosaStartupError,
    );
    assert.throws(
      () =>
        resolveServerExecutable({
          ...f.paths,
          localAppData: 'relative',
          commonAppData: 'relative',
        }),
      BriosaStartupError,
    );
  } finally {
    f.cleanup();
  }
});
