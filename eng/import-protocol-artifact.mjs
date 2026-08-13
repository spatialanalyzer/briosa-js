import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const generatedRoot = resolve(repositoryRoot, 'src', 'generated');
const lockPath = resolve(repositoryRoot, 'protocol.lock.json');
const generationOptions = [
  'env=node',
  'esModuleInterop=true',
  'exportCommonSymbols=false',
  'forceLong=bigint',
  'importSuffix=.js',
  'lowerCaseServiceMethods=true',
  'oneof=unions-value',
  'outputJsonMethods=false',
  'outputServices=grpc-js',
  'useExactTypes=false',
  'useOptionals=all',
].sort();

function parseArguments(arguments_) {
  const values = { update: false, sourceChannel: 'github_release' };
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === '--update') {
      values.update = true;
    } else if (argument === '--artifact') {
      values.artifact = arguments_[index + 1];
      index += 1;
    } else if (argument === '--source-channel') {
      values.sourceChannel = arguments_[index + 1];
      index += 1;
    } else {
      throw new Error(`Unknown argument '${argument ?? ''}'.`);
    }
  }
  if (!values.artifact) {
    throw new Error('Use --artifact <path> to select one protocol ZIP.');
  }
  if (
    !['github_release', 'source_commit_bootstrap'].includes(
      values.sourceChannel,
    )
  ) {
    throw new Error('Unsupported protocol source channel.');
  }
  return values;
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message);
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeText(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content.replaceAll('\r\n', '\n'), 'utf8');
}

function relativeFiles(root) {
  const files = [];
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(path);
      } else if (entry.isFile()) {
        files.push(relative(root, path).split(sep).join('/'));
      }
    }
  }
  visit(root);
  return files.sort((left, right) => left.localeCompare(right, 'en'));
}

function compareTrees(expected, actual) {
  const expectedFiles = relativeFiles(expected);
  const actualFiles = relativeFiles(actual);
  assertEqual(
    JSON.stringify(actualFiles),
    JSON.stringify(expectedFiles),
    'Generated protocol file paths have drifted.',
  );
  for (const path of expectedFiles) {
    assertEqual(
      sha256(readFileSync(resolve(actual, path))),
      sha256(readFileSync(resolve(expected, path))),
      `Generated protocol file '${path}' has drifted.`,
    );
  }
}

function extractArchive(artifactPath, extractRoot) {
  const zip = new AdmZip(artifactPath);
  const entries = zip.getEntries();
  const roots = new Set();
  for (const entry of entries) {
    const normalized = entry.entryName.replaceAll('\\', '/');
    if (normalized.startsWith('/') || normalized.split('/').includes('..')) {
      throw new Error('Protocol ZIP contains an unsafe entry path.');
    }
    const root = normalized.split('/')[0];
    if (root) roots.add(root);
  }
  if (roots.size !== 1) {
    throw new Error(
      'The protocol artifact must contain exactly one top-level directory.',
    );
  }
  zip.extractAllTo(extractRoot, true, false);
  return resolve(extractRoot, [...roots][0]);
}

function verifyBundle(bundleRoot, artifactPath, artifactHash, update) {
  const manifest = readJson(resolve(bundleRoot, 'manifest.json'));
  assertEqual(
    manifest.schema_version,
    2,
    'Unsupported protocol manifest schema.',
  );
  assertEqual(
    manifest.artifact_kind,
    'briosa_protocol',
    'Unexpected artifact kind.',
  );
  assertEqual(
    manifest.client_generation_contract,
    'standard-protobuf-grpc',
    'Unsupported client generation contract.',
  );
  assertEqual(
    basename(artifactPath, '.zip'),
    manifest.artifact_name,
    'The artifact filename does not match its manifest.',
  );

  const checksumLines = readFileSync(
    resolve(bundleRoot, 'files.sha256'),
    'utf8',
  )
    .trim()
    .split(/\r?\n/u);
  const checksums = new Map();
  for (const line of checksumLines) {
    const match = /^([0-9a-f]{64}) {2}(.+)$/u.exec(line);
    if (!match) throw new Error('Malformed files.sha256 entry.');
    checksums.set(match[2], match[1]);
  }
  for (const [path, expected] of checksums) {
    const contentPath = resolve(bundleRoot, path);
    if (
      !contentPath.startsWith(`${bundleRoot}${sep}`) ||
      !existsSync(contentPath)
    ) {
      throw new Error(`Protocol content '${path}' is missing or unsafe.`);
    }
    assertEqual(
      sha256(readFileSync(contentPath)),
      expected,
      `Protocol content checksum mismatch for '${path}'.`,
    );
  }
  const actualCheckedPaths = relativeFiles(bundleRoot).filter(
    (path) => path !== 'files.sha256',
  );
  const recordedCheckedPaths = [...checksums.keys()].sort((left, right) =>
    left.localeCompare(right, 'en'),
  );
  assertEqual(
    JSON.stringify(actualCheckedPaths),
    JSON.stringify(recordedCheckedPaths),
    'The artifact contains missing or unchecked files.',
  );

  const manifestFiles = [...manifest.files].sort((left, right) =>
    left.path.localeCompare(right.path, 'en'),
  );
  const expectedManifestPaths = actualCheckedPaths.filter(
    (path) => path !== 'manifest.json',
  );
  assertEqual(
    JSON.stringify(manifestFiles.map(({ path }) => path)),
    JSON.stringify(expectedManifestPaths),
    'The manifest file list is incomplete.',
  );
  for (const file of manifestFiles) {
    assertEqual(
      file.sha256,
      checksums.get(file.path),
      `Manifest checksum drift for '${file.path}'.`,
    );
  }

  if (!update) {
    const lock = readJson(lockPath);
    assertEqual(lock.schema_version, 2, 'Unsupported protocol lock schema.');
    assertEqual(
      artifactHash,
      lock.artifact.sha256,
      'Protocol ZIP checksum drift.',
    );
    assertEqual(
      manifest.artifact_name,
      lock.artifact.name,
      'Artifact name drift.',
    );
    assertEqual(
      manifest.briosa_version,
      lock.artifact.briosa_version,
      'Briosa version drift.',
    );
    assertEqual(
      manifest.source_revision,
      lock.artifact.source_revision,
      'Source revision drift.',
    );
    assertEqual(
      manifest.protocol_schema_sha256,
      lock.protocol.schema_sha256,
      'Protocol schema drift.',
    );
    assertEqual(
      manifest.descriptor_set_sha256,
      lock.protocol.descriptor_sha256,
      'Descriptor drift.',
    );
    assertEqual(
      manifest.spatial_analyzer_target,
      lock.target.spatial_analyzer,
      'SA target drift.',
    );
    assertEqual(
      manifest.protocol_package,
      lock.protocol.package,
      'Protocol package drift.',
    );
    assertEqual(
      manifest.client_generation_contract,
      lock.protocol.generation_contract,
      'Client generation contract drift.',
    );
    assertEqual(
      JSON.stringify(lock.protocol.generator.options),
      JSON.stringify(generationOptions),
      'Generator option drift.',
    );
  }
  return manifest;
}

function generateProtocol(bundleRoot, outputRoot, manifest, artifactHash) {
  const protoRoot = resolve(bundleRoot, 'proto');
  const generatedProtocolRoot = resolve(outputRoot, 'protocol');
  mkdirSync(generatedProtocolRoot, { recursive: true });
  const protoFiles = relativeFiles(protoRoot).filter((path) =>
    path.endsWith('.proto'),
  );
  const command = resolve(
    repositoryRoot,
    'node_modules',
    '.bin',
    process.platform === 'win32'
      ? 'grpc_tools_node_protoc.cmd'
      : 'grpc_tools_node_protoc',
  );
  const plugin = resolve(
    repositoryRoot,
    'node_modules',
    '.bin',
    process.platform === 'win32'
      ? 'protoc-gen-ts_proto.cmd'
      : 'protoc-gen-ts_proto',
  );
  if (!existsSync(command) || !existsSync(plugin)) {
    throw new Error('Run npm ci before importing the protocol artifact.');
  }
  const arguments_ = [
    `--plugin=protoc-gen-ts_proto=${plugin}`,
    `--proto_path=${protoRoot}`,
    `--ts_proto_out=${generatedProtocolRoot}`,
    `--ts_proto_opt=${generationOptions.join(',')}`,
    ...protoFiles,
  ];
  const result = spawnSync(command, arguments_, {
    cwd: protoRoot,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    throw new Error(
      `TypeScript protocol generation failed.\n${result.stdout ?? ''}${result.stderr ?? ''}`,
    );
  }

  const identity = `// <auto-generated />\n// Exact protocol artifact identity used to generate this package.\nexport const briosaProtocolIdentity = ${JSON.stringify(
    {
      artifactName: manifest.artifact_name,
      artifactSha256: artifactHash,
      briosaVersion: manifest.briosa_version,
      sourceRevision: manifest.source_revision,
      protocolSchemaSha256: manifest.protocol_schema_sha256,
      descriptorSetSha256: manifest.descriptor_set_sha256,
      protocolPackage: manifest.protocol_package,
      clientGenerationContract: manifest.client_generation_contract,
      spatialAnalyzerTarget: manifest.spatial_analyzer_target,
      int64Representation: 'bigint',
      optionalFieldRepresentation: 'undefined',
    },
    null,
    2,
  )} as const;\n`;
  writeText(resolve(outputRoot, 'protocolIdentity.ts'), identity);
}

const options = parseArguments(process.argv.slice(2));
const artifactPath = resolve(repositoryRoot, options.artifact);
if (!existsSync(artifactPath))
  throw new Error('The protocol artifact does not exist.');
if (!options.update && !existsSync(lockPath))
  throw new Error(
    'protocol.lock.json does not exist. Use --update for an intentional import.',
  );

const artifactHash = sha256(readFileSync(artifactPath));
const checksumPath = `${artifactPath}.sha256`;
if (!existsSync(checksumPath))
  throw new Error('The adjacent protocol ZIP checksum does not exist.');
assertEqual(
  readFileSync(checksumPath, 'utf8').trim(),
  `${artifactHash}  ${basename(artifactPath)}`,
  'The external protocol ZIP checksum does not match.',
);

const temporaryRoot = mkdtempSync(resolve(tmpdir(), 'briosa-js-protocol-'));
try {
  const bundleRoot = extractArchive(
    artifactPath,
    resolve(temporaryRoot, 'artifact'),
  );
  const manifest = verifyBundle(
    bundleRoot,
    artifactPath,
    artifactHash,
    options.update,
  );
  const generated = resolve(temporaryRoot, 'generated');
  generateProtocol(bundleRoot, generated, manifest, artifactHash);

  if (options.update) {
    if (!generatedRoot.startsWith(`${repositoryRoot}${sep}`))
      throw new Error('Generated path escaped the repository.');
    rmSync(generatedRoot, { force: true, recursive: true });
    cpSync(generated, generatedRoot, { recursive: true });
    const lock = {
      schema_version: 2,
      artifact: {
        name: manifest.artifact_name,
        file_name: basename(artifactPath),
        sha256: artifactHash,
        briosa_version: manifest.briosa_version,
        source_revision: manifest.source_revision,
        source_repository: 'https://github.com/spatialanalyzer/briosa',
        source_channel: options.sourceChannel,
      },
      protocol: {
        generation_contract: manifest.client_generation_contract,
        schema_sha256: manifest.protocol_schema_sha256,
        descriptor_sha256: manifest.descriptor_set_sha256,
        package: manifest.protocol_package,
        generator: {
          name: 'ts-proto',
          version: '2.12.0',
          options: generationOptions,
        },
        javascript_semantics: { int64: 'bigint', optional_fields: 'undefined' },
      },
      target: {
        spatial_analyzer: manifest.spatial_analyzer_target,
      },
    };
    writeText(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
    console.log('Updated generated protocol code and protocol.lock.json.');
  } else {
    compareTrees(generated, generatedRoot);
    console.log(
      'Verified protocol artifact identity and generated-code drift.',
    );
  }
} finally {
  if (temporaryRoot.startsWith(resolve(tmpdir())))
    rmSync(temporaryRoot, { force: true, recursive: true });
}
