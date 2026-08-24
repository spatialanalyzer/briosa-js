import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(
  readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8'),
);
const protocolLock = JSON.parse(
  readFileSync(resolve(repositoryRoot, 'protocol.lock.json'), 'utf8'),
);

function packageName(target) {
  return `@spatialanalyzer/briosa-${target}`;
}

function localAlias(target) {
  return `briosa-sa-${target.replaceAll('.', '-')}`;
}

const target = protocolLock.target.spatial_analyzer;
const expectedName = packageName(target);
if (packageJson.name !== expectedName) {
  throw new Error(
    `Package name ${packageJson.name} does not match exact target ${expectedName}.`,
  );
}
if (
  packageJson.repository?.url !==
  'https://github.com/spatialanalyzer/briosa-js.git'
) {
  throw new Error(
    'Package repository URL must identify spatialanalyzer/briosa-js.',
  );
}
if (packageJson.publishConfig?.access !== 'public') {
  throw new Error(
    'The scoped exact-target package must declare public access.',
  );
}

const simulatedName = packageName('2027.1.0000.0');
if (simulatedName === expectedName) {
  throw new Error(
    'Different exact targets must produce distinct package names.',
  );
}

const currentAlias = localAlias(target);
const simulatedAlias = localAlias('2027.1.0000.0');
const aliasedDependencies = {
  [currentAlias]: `npm:${expectedName}@${packageJson.version}`,
  [simulatedAlias]: `npm:${simulatedName}@${packageJson.version}`,
};
if (
  currentAlias === simulatedAlias ||
  aliasedDependencies[currentAlias] === aliasedDependencies[simulatedAlias]
) {
  throw new Error(
    'Different target packages must support distinct local npm aliases.',
  );
}

const npmExecutable = process.env.npm_execpath;
const command = npmExecutable
  ? process.execPath
  : process.platform === 'win32'
    ? 'npm.cmd'
    : 'npm';
const arguments_ = npmExecutable
  ? [npmExecutable, 'pack', '--dry-run', '--json']
  : ['pack', '--dry-run', '--json'];
const packed = spawnSync(command, arguments_, {
  cwd: repositoryRoot,
  encoding: 'utf8',
});
if (packed.status !== 0) {
  throw new Error(
    `npm pack failed:\n${packed.error?.message || packed.stderr || packed.stdout}`,
  );
}

const results = JSON.parse(packed.stdout);
if (!Array.isArray(results) || results.length !== 1) {
  throw new Error('npm pack must describe exactly one package.');
}
const result = results[0];
if (result.name !== expectedName || result.version !== packageJson.version) {
  throw new Error('Packed npm identity does not match package.json.');
}
const expectedFilename = `${expectedName.slice(1).replace('/', '-')}-${packageJson.version}.tgz`;
if (result.filename !== expectedFilename) {
  throw new Error(`Unexpected npm archive name ${result.filename}.`);
}

const files = new Set(result.files.map((file) => file.path));
for (const required of [
  'LICENSE',
  'README.md',
  'dist/index.d.ts',
  'dist/index.js',
  'package.json',
  'protocol.lock.json',
]) {
  if (!files.has(required)) {
    throw new Error(`Packed npm module is missing ${required}.`);
  }
}

console.log(
  `Verified ${expectedName} with stable exports, local aliasing, and distinct simulated target identity.`,
);
