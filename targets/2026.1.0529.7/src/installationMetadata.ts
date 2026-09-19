import { createHash } from 'node:crypto';
import {
  closeSync,
  existsSync,
  lstatSync,
  openSync,
  readSync,
  statSync,
} from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import {
  localPath,
  pathKey,
  validVersion,
  type BriosaInstallation,
  type InstallationScope,
} from './installationModels.js';

export function object(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Metadata must be an object.');
  return value as Record<string, unknown>;
}
export function parseMetadata(data: string): Record<string, unknown> {
  const result: unknown = JSON.parse(data);
  // JSON.parse accepts duplicate properties. Reject them before using identity data.
  const scopes: Set<string>[] = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i] === '{') {
      scopes.push(new Set());
      if (scopes.length > 64) throw new Error('Metadata nesting limit.');
    } else if (data[i] === '}') scopes.pop();
    else if (data[i] === '"') {
      const start = i++;
      for (; i < data.length; i++) {
        if (data[i] === '\\') i++;
        else if (data[i] === '"') break;
      }
      let next = i + 1;
      while (/\s/.test(data[next] ?? '') && next < data.length) next++;
      if (data[next] === ':') {
        const key = JSON.parse(data.slice(start, i + 1)) as string;
        const scope = scopes.at(-1)!;
        if (scope.has(key)) throw new Error('Duplicate metadata property.');
        scope.add(key);
      }
    }
  }
  return object(result);
}
export function noLinks(path: string): void {
  for (let current = resolve(path); ; current = dirname(current)) {
    if (existsSync(current) && lstatSync(current).isSymbolicLink())
      throw new Error('Linked installations are not eligible.');
    if (dirname(current) === current) break;
  }
}
function readBounded(path: string, limit: number): Buffer {
  noLinks(path);
  const fd = openSync(path, 'r');
  try {
    const buffer = Buffer.alloc(limit + 1);
    let length = 0;
    while (length < buffer.length) {
      const count = readSync(fd, buffer, length, buffer.length - length, null);
      if (!count) break;
      length += count;
    }
    if (length > limit) throw new Error('Metadata size limit.');
    return buffer.subarray(0, length);
  } finally {
    closeSync(fd);
  }
}
export function textField(value: Record<string, unknown>, key: string): string {
  const item = value[key];
  if (typeof item !== 'string') throw new Error('Invalid string metadata.');
  return item;
}
function uint(value: Record<string, unknown>, key: string): number {
  const item = value[key];
  if (
    typeof item !== 'number' ||
    !Number.isInteger(item) ||
    item < 0 ||
    item > 4294967295
  )
    throw new Error('Invalid numeric metadata.');
  return item;
}
function hex(value: string, length: number): boolean {
  return value.length === length && /^[0-9a-f]+$/.test(value);
}
export function installationId(directory: string): string {
  const normalized = pathKey(directory);
  return createHash('sha256').update(normalized, 'utf8').digest('hex');
}
export function readInstallation(
  path: string,
  scope: InstallationScope,
): BriosaInstallation {
  if (!localPath(path) || basename(path).toLowerCase() !== 'briosa.server.exe')
    throw new Error('Invalid server path.');
  path = resolve(path);
  noLinks(path);
  if (!statSync(path).isFile()) throw new Error('Missing server.');
  const payload = dirname(path),
    product = dirname(payload),
    managed = basename(payload).toLowerCase() === 'payload';
  const bytes = readBounded(join(payload, 'manifest.json'), 1024 * 1024);
  const manifest = parseMetadata(bytes.toString('utf8'));
  const schema = uint(manifest, 'schemaVersion'),
    version = textField(manifest, 'briosaVersion'),
    target = textField(manifest, 'spatialAnalyzerTarget'),
    rid = textField(manifest, 'runtimeIdentifier'),
    source = textField(manifest, 'sourceRevision');
  const artifact = 'briosa-' + version + '-sa-' + target + '-' + rid;
  if (
    ![2, 3].includes(schema) ||
    !validVersion(version) ||
    !hex(source, 40) ||
    target.length < 1 ||
    target.length > 64 ||
    rid.length < 1 ||
    rid.length > 64 ||
    manifest.artifactName !== artifact ||
    manifest.protocolPackage !== 'briosa' ||
    manifest.spatialAnalyzerBundled !== false
  )
    throw new Error('Invalid server manifest.');
  let major = 0,
    revision = 0;
  if (schema === 3) {
    const contract = object(manifest.compatibility);
    major = uint(contract, 'major');
    revision = uint(contract, 'revision');
    if (!major) throw new Error('Invalid contract major.');
  }
  const digest = createHash('sha256').update(bytes).digest('hex');
  const required = ['manifest.json', 'Briosa.Server.exe', 'Briosa.Worker.exe'];
  for (const name of required) {
    const file = join(payload, name);
    noLinks(file);
    if (!statSync(file).isFile()) throw new Error('Missing runtime file.');
  }
  if (managed) {
    if (
      basename(product) !== artifact ||
      basename(dirname(product)).toLowerCase() !== 'products'
    )
      throw new Error('Not a committed product.');
    const receipt = parseMetadata(
        readBounded(join(product, 'receipt.json'), 8 * 1024 * 1024).toString(
          'utf8',
        ),
      ),
      pkg = object(receipt.package),
      files = object(receipt.files);
    if (
      uint(receipt, 'schemaVersion') !== 1 ||
      pkg.id !== artifact ||
      pkg.component !== 'server' ||
      pkg.version !== version ||
      pkg.spatialAnalyzerTarget !== target ||
      pkg.runtimeIdentifier !== rid
    )
      throw new Error('Receipt mismatch.');
    if (
      required.some((name) => !hex(textField(files, name), 64)) ||
      files['manifest.json'] !== digest
    )
      throw new Error('Missing or mismatched file evidence.');
  }
  return Object.freeze({
    installationId: installationId(managed ? product : payload),
    executablePath: resolve(path),
    version,
    sourceRevision: source,
    spatialAnalyzerTarget: target,
    runtimeIdentifier: rid,
    contractMajor: major,
    contractRevision: revision,
    manifestSha256: digest,
    scope,
  });
}
