import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const metadata = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const npm = process.env.npm_execpath;
if (!npm) throw new Error('Run through npm run package:consumer.');
const consumer = mkdtempSync(join(tmpdir(), 'briosa-js-consumer-'));

function run(command, arguments_, cwd) {
  const result = spawnSync(command, arguments_, { cwd, encoding: 'utf8' });
  assert.equal(
    result.status,
    0,
    result.error?.message ?? result.stderr ?? result.stdout,
  );
  return result.stdout;
}

try {
  const [packed] = JSON.parse(
    run(
      process.execPath,
      [npm, 'pack', '--json', '--pack-destination', consumer],
      root,
    ),
  );
  assert.equal(packed.name, metadata.name);
  // Before registry publication, use the actual tarball under the same local
  // dependency name that npm's briosa@npm:<published-name>@<version> alias uses.
  writeFileSync(
    join(consumer, 'package.json'),
    JSON.stringify({
      name: 'briosa-consumer-smoke',
      private: true,
      type: 'module',
      dependencies: { briosa: `file:./${packed.filename}` },
    }),
  );
  run(
    process.execPath,
    [
      npm,
      'install',
      '--offline',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
    ],
    consumer,
  );
  const installed = JSON.parse(
    readFileSync(join(consumer, 'node_modules/briosa/package.json'), 'utf8'),
  );
  assert.equal(installed.name, metadata.name);
  const program = `import { createBriosaClient, getWorkingDirectory } from 'briosa';
const client = createBriosaClient();
if (typeof getWorkingDirectory !== 'function') throw new Error('Missing MP export');
await client.stop();
console.log('Verified short briosa import');
`;
  writeFileSync(join(consumer, 'consumer.mjs'), program);
  run(process.execPath, ['consumer.mjs'], consumer);
  writeFileSync(join(consumer, 'consumer.ts'), program);
  run(
    process.execPath,
    [
      join(root, 'node_modules/typescript/bin/tsc'),
      '--noEmit',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      '--target',
      'ES2022',
      '--strict',
      '--skipLibCheck',
      'consumer.ts',
    ],
    consumer,
  );
  console.log(
    `Verified packed ${metadata.name}@${metadata.version} with JavaScript and TypeScript imports from 'briosa'.`,
  );
} finally {
  if (dirname(consumer) === resolve(tmpdir())) {
    rmSync(consumer, { recursive: true, force: true });
  }
}
