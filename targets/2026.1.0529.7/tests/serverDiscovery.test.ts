import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import {
  validateBriosaCompatibility,
  validateInstallation,
} from '../src/compatibility.js';
import {
  GetServerInfoResponse,
  ListCapabilitiesResponse,
  TargetIsolationMode,
} from '../src/generated/protocol/briosa/discovery.js';
import { briosaProtocolIdentity as identity } from '../src/generated/protocolIdentity.js';
import {
  installationId,
  parseMetadata,
  readInstallation,
} from '../src/installationMetadata.js';
import {
  normalizeSelection,
  type BriosaInstallation,
  type BriosaServerSelection,
  type InstallationScope,
} from '../src/installationModels.js';
import { legacySource, selectInstallation } from '../src/installationPolicy.js';
import {
  discoverWithPlatform as discoverInstallations,
  type DiscoveryPlatform,
} from '../src/serverDiscovery.js';
import {
  readWindowsRegistrations,
  runWindowsAdapter,
} from '../src/windowsDiscovery.js';

interface SelectionCase {
  name: string;
  target: string;
  requiredMajor: number;
  minimumRevision: number;
  selectedId: string | null;
  error?: string;
  options: BriosaServerSelection;
  candidates: {
    id: string;
    path: string;
    version: string;
    sourceRevision: string;
    target: string;
    rid: string;
    major: number;
    revision: number;
    manifestSha256: string;
    scope: InstallationScope;
  }[];
}
const vectors = JSON.parse(
  readFileSync(
    new URL('./fixtures/selection-cases.json', import.meta.url),
    'utf8',
  ),
) as { cases: SelectionCase[] };
for (const c of vectors.cases)
  void test('shared selection: ' + c.name, () => {
    const candidates = c.candidates.map((v) => ({
      installationId: v.id,
      executablePath: v.path,
      version: v.version,
      sourceRevision: v.sourceRevision,
      spatialAnalyzerTarget: v.target,
      runtimeIdentifier: v.rid,
      contractMajor: v.major,
      contractRevision: v.revision,
      manifestSha256: v.manifestSha256,
      scope: v.scope,
    }));
    const result = selectInstallation(
      candidates,
      c.options,
      c.target,
      c.requiredMajor,
      c.minimumRevision,
    );
    assert.equal(result.selected?.installationId ?? null, c.selectedId);
    assert.equal(result.diagnosticCode, c.error ?? null);
  });
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'briosa-Å 空間-'));
  const platform: DiscoveryPlatform = {
    platform: 'win32',
    moduleDirectory: join(root, 'client'),
    localAppData: join(root, 'user'),
    commonAppData: join(root, 'machine'),
    environmentOverride: undefined,
    readRegistry: () =>
      Promise.resolve({ elevated: false, registrations: [], diagnostics: [] }),
    isProtected: () => Promise.resolve(false),
  };
  return {
    root,
    platform,
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}
function install(
  root: string,
  version = '0.7.0',
  target: string = identity.spatialAnalyzerTarget,
): string {
  const id = 'briosa-' + version + '-sa-' + target + '-win-x64',
    product = join(root, 'Briosa', 'Packages', 'products', id),
    payload = join(product, 'payload');
  mkdirSync(payload, { recursive: true });
  const manifest = JSON.stringify({
    schemaVersion: 3,
    artifactName: id,
    briosaVersion: version,
    sourceRevision: 'a'.repeat(40),
    spatialAnalyzerTarget: target,
    runtimeIdentifier: 'win-x64',
    protocolPackage: 'briosa',
    spatialAnalyzerBundled: false,
    compatibility: { major: 2, revision: 0 },
  });
  writeFileSync(join(payload, 'manifest.json'), manifest);
  for (const name of ['Briosa.Server.exe', 'Briosa.Worker.exe'])
    writeFileSync(join(payload, name), 'inert');
  writeFileSync(
    join(product, 'receipt.json'),
    JSON.stringify({
      schemaVersion: 1,
      package: {
        id,
        component: 'server',
        version,
        spatialAnalyzerTarget: target,
        runtimeIdentifier: 'win-x64',
      },
      files: {
        'manifest.json': createHash('sha256').update(manifest).digest('hex'),
        'Briosa.Server.exe': 'a'.repeat(64),
        'Briosa.Worker.exe': 'a'.repeat(64),
      },
    }),
  );
  return join(payload, 'Briosa.Server.exe');
}
void test('multiple targets and versions select only the highest compatible build', async () => {
  const f = fixture();
  try {
    install(f.platform.localAppData, '0.7.0');
    const latest = install(f.platform.localAppData, '0.8.0');
    install(f.platform.commonAppData, '9.0.0', 'other-target');
    assert.equal(
      (await discoverInstallations({}, f.platform)).selected?.executablePath,
      latest,
    );
    assert.equal(
      (await discoverInstallations({ version: '0.7.0' }, f.platform)).selected
        ?.version,
      '0.7.0',
    );
  } finally {
    f.cleanup();
  }
});
void test('explicit invalid choice and opt-in legacy override never fall back', async () => {
  const f = fixture();
  try {
    const valid = install(f.platform.localAppData);
    const platform = {
      ...f.platform,
      environmentOverride: join(f.root, 'absent', 'Briosa.Server.exe'),
    };
    assert.equal(
      (await discoverInstallations({}, platform)).selected?.executablePath,
      valid,
    );
    assert.equal(
      (
        await discoverInstallations(
          { useLegacyEnvironmentOverride: true },
          platform,
        )
      ).diagnosticCode,
      'server-installation-invalid',
    );
    assert.equal(
      (
        await discoverInstallations(
          { executablePath: platform.environmentOverride },
          platform,
        )
      ).selected,
      null,
    );
    assert.throws(
      () => normalizeSelection({ executablePath: valid, installationId: 'id' }),
      TypeError,
    );
  } finally {
    f.cleanup();
  }
});
const defects: ReadonlyArray<readonly [string, readonly string[], unknown]> = [
  ['receipt.json', ['schemaVersion'], true],
  ['receipt.json', ['package'], null],
  ['receipt.json', ['package', 'id'], 'wrong'],
  ['receipt.json', ['package', 'version'], '99.0.0'],
  ['receipt.json', ['files'], {}],
  ['receipt.json', ['files', 'Briosa.Worker.exe'], 'a'.repeat(64) + '\n'],
  ['manifest.json', ['schemaVersion'], 99],
  ['manifest.json', ['sourceRevision'], 'wrong'],
  ['manifest.json', ['protocolPackage'], 'wrong'],
  ['manifest.json', ['spatialAnalyzerBundled'], true],
  ['manifest.json', ['compatibility', 'major'], 0],
  ['manifest.json', ['compatibility', 'revision'], -1],
];
for (const [name, keys, value] of defects)
  void test('rejects damaged ' + name + ': ' + keys.join('.'), () => {
    const f = fixture();
    try {
      const exe = install(f.platform.localAppData),
        payload = dirname(exe),
        path = join(name === 'receipt.json' ? dirname(payload) : payload, name);
      const data = JSON.parse(readFileSync(path, 'utf8')) as Record<
        string,
        unknown
      >;
      let parent = data;
      for (const key of keys.slice(0, -1))
        parent = parent[key] as Record<string, unknown>;
      parent[keys.at(-1)!] = value;
      writeFileSync(path, JSON.stringify(data));
      assert.throws(() => readInstallation(exe, 'user'));
    } finally {
      f.cleanup();
    }
  });
void test('manifest digest and required files are verified', () => {
  const f = fixture();
  try {
    const exe = install(f.platform.localAppData),
      manifest = join(dirname(exe), 'manifest.json');
    writeFileSync(manifest, readFileSync(manifest, 'utf8') + ' ');
    assert.throws(() => readInstallation(exe, 'user'));
    install(f.platform.localAppData);
    rmSync(join(dirname(exe), 'Briosa.Worker.exe'));
    assert.throws(() => readInstallation(exe, 'user'));
    assert.throws(() => parseMetadata('{"schemaVersion":1,"schemaVersion":3}'));
    assert.deepEqual(
      parseMetadata('{"text":"{\\"ok\\":true}","nested":{"x":1}}').nested,
      { x: 1 },
    );
  } finally {
    f.cleanup();
  }
});
void test('Registry64 hints find custom stores and cannot override receipt identity', async () => {
  const f = fixture();
  try {
    const exe = install(join(f.root, 'custom')),
      product = dirname(dirname(exe)),
      candidate = readInstallation(exe, 'user');
    const hint = {
      schemaVersion: 1,
      installationId: installationId(product),
      productDirectory: product,
      packageId:
        'briosa-0.7.0-sa-' + identity.spatialAnalyzerTarget + '-win-x64',
      serverVersion: '0.7.0',
      spatialAnalyzerTarget: identity.spatialAnalyzerTarget,
      runtimeIdentifier: 'win-x64',
    };
    const readRegistry = () =>
      Promise.resolve({
        elevated: false,
        diagnostics: [],
        registrations: [
          {
            id: candidate.installationId,
            scope: 'user',
            registration: JSON.stringify(hint),
          },
        ],
      });
    assert.equal(
      (await discoverInstallations({}, { ...f.platform, readRegistry }))
        .selected?.executablePath,
      exe,
    );
    hint.serverVersion = '99.0.0';
    assert.equal(
      (await discoverInstallations({}, { ...f.platform, readRegistry }))
        .selected,
      null,
    );
  } finally {
    f.cleanup();
  }
});
void test('elevated automatic discovery excludes user and unprotected machine payloads', async () => {
  const f = fixture();
  try {
    install(f.platform.localAppData);
    const machine = install(f.platform.commonAppData);
    const elevated = {
      ...f.platform,
      readRegistry: () =>
        Promise.resolve({ elevated: true, registrations: [], diagnostics: [] }),
    };
    assert.equal((await discoverInstallations({}, elevated)).selected, null);
    assert.equal(
      (
        await discoverInstallations(
          {},
          { ...elevated, isProtected: () => Promise.resolve(true) },
        )
      ).selected?.executablePath,
      machine,
    );
  } finally {
    f.cleanup();
  }
});
function snapshot() {
  return [
    GetServerInfoResponse.fromPartial({
      version: {
        briosaVersion: '0.9.0',
        sourceRevision: 'a'.repeat(40),
        protocolPackage: 'briosa',
        spatialAnalyzerTarget: identity.spatialAnalyzerTarget,
      },
      compatibility: { major: 2, revision: 0 },
      targetIsolationMode:
        TargetIsolationMode.TARGET_ISOLATION_MODE_SINGLE_TENANT,
    }),
    ListCapabilitiesResponse.fromPartial({
      protocolPackage: 'briosa',
      spatialAnalyzerTarget: identity.spatialAnalyzerTarget,
    }),
  ] as const;
}
void test('compatibility is independent of generation pins; selected runtime identity is exact', () => {
  const [server, caps] = snapshot();
  validateBriosaCompatibility(server, caps);
  const installation: BriosaInstallation = {
    installationId: 'id',
    executablePath: 'path',
    version: '0.9.0',
    sourceRevision: 'a'.repeat(40),
    spatialAnalyzerTarget: identity.spatialAnalyzerTarget,
    runtimeIdentifier: 'win-x64',
    contractMajor: 2,
    contractRevision: 0,
    manifestSha256: 'hash',
    scope: 'user',
  };
  validateInstallation(server, installation);
  server.version!.sourceRevision = 'b'.repeat(40);
  assert.throws(
    () => validateInstallation(server, installation),
    /server-installation-identity-mismatch/,
  );
  server.compatibility!.major = 1;
  assert.throws(
    () => validateBriosaCompatibility(server, caps),
    /server-contract-incompatible/,
  );
});
void test('missing compatibility is rejected including the legacy build', () => {
  const [server, caps] = snapshot();
  server.compatibility = undefined;
  assert.throws(() => validateBriosaCompatibility(server, caps));
  server.version!.briosaVersion = '0.6.1';
  server.version!.sourceRevision = legacySource;
  assert.throws(
    () => validateBriosaCompatibility(server, caps),
    /server-contract-incompatible/,
  );
  server.version!.sourceRevision = 'b'.repeat(40);
  assert.throws(() => validateBriosaCompatibility(server, caps));
});
void test(
  'native adapter reads without mutation and preserves Unicode data',
  { skip: process.platform !== 'win32' },
  async () => {
    const report = await readWindowsRegistrations();
    assert.equal(typeof report.elevated, 'boolean');
    const data = 'C:\\An installation\\Å 空間\\$(never-executed)';
    const result = await runWindowsAdapter(
      '[Console]::InputEncoding=[Text.UTF8Encoding]::new($false);[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false);[Console]::Write([Console]::In.ReadToEnd())',
      JSON.stringify(data),
    );
    assert.equal(JSON.parse(result) as string, data);
    await assert.rejects(() =>
      runWindowsAdapter("throw 'injected adapter failure'"),
    );
  },
);
