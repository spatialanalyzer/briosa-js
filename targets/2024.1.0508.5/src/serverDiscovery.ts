import { readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BriosaStartupError } from './errors.js';
import { briosaProtocolIdentity as identity } from './generated/protocolIdentity.js';

interface DiscoveryPaths {
  configured?: string | undefined;
  moduleDirectory: string;
  localAppData: string;
  commonAppData: string;
}

// Internal module; the package exports only its public facade.
export function resolveServerExecutable(
  paths: DiscoveryPaths = defaultPaths(),
): string {
  for (const candidate of [
    paths.configured,
    join(paths.moduleDirectory, 'briosa-server', 'Briosa.Server.exe'),
  ]) {
    if (
      candidate &&
      basename(candidate).toLowerCase() === 'briosa.server.exe' &&
      isFile(candidate)
    ) {
      return resolve(candidate);
    }
  }
  for (const root of [paths.localAppData, paths.commonAppData]) {
    if (!isAbsolute(root)) continue;
    const candidate = managedExecutable(join(root, 'Briosa', 'Packages'));
    if (candidate !== undefined) return candidate;
  }
  if (isAbsolute(paths.localAppData)) {
    const legacy = join(
      paths.localAppData,
      'Briosa',
      'servers',
      identity.briosaVersion,
      `sa-${identity.spatialAnalyzerTarget}`,
      'Briosa.Server.exe',
    );
    if (isFile(legacy)) return resolve(legacy);
  }
  throw new BriosaStartupError('server-distribution-not-found');
}

function defaultPaths(): DiscoveryPaths {
  return {
    configured: process.env.BRIOSA_SERVER_PATH,
    moduleDirectory: dirname(fileURLToPath(import.meta.url)),
    localAppData:
      process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'),
    commonAppData: process.env.PROGRAMDATA ?? '',
  };
}

function isFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function managedExecutable(store: string): string | undefined {
  const id = `briosa-${identity.briosaVersion}-sa-${identity.spatialAnalyzerTarget}-win-x64`;
  const product = join(store, 'products', id);
  const payload = join(product, 'payload');
  try {
    const receipt = object(
      JSON.parse(
        readFileSync(join(product, 'receipt.json'), 'utf8'),
      ) as unknown,
    );
    const manifest = object(
      JSON.parse(
        readFileSync(join(payload, 'manifest.json'), 'utf8'),
      ) as unknown,
    );
    const pkg = object(receipt.package);
    if (
      receipt.schemaVersion !== 1 ||
      manifest.schemaVersion !== 2 ||
      pkg.id !== id ||
      pkg.component !== 'server' ||
      pkg.version !== identity.briosaVersion ||
      pkg.runtimeIdentifier !== 'win-x64' ||
      pkg.spatialAnalyzerTarget !== identity.spatialAnalyzerTarget ||
      manifest.artifactName !== id ||
      manifest.briosaVersion !== identity.briosaVersion ||
      manifest.spatialAnalyzerTarget !== identity.spatialAnalyzerTarget ||
      manifest.runtimeIdentifier !== 'win-x64' ||
      manifest.sourceRevision !== identity.sourceRevision ||
      manifest.protocolPackage !== 'briosa' ||
      manifest.spatialAnalyzerBundled !== false
    )
      return undefined;
    const files = object(receipt.files);
    for (const name of [
      'manifest.json',
      'Briosa.Server.exe',
      'Briosa.Worker.exe',
    ]) {
      const digest = files[name];
      if (
        typeof digest !== 'string' ||
        !/^[0-9a-f]{64}$/.test(digest) ||
        !isFile(join(payload, name))
      )
        return undefined;
    }
    return resolve(payload, 'Briosa.Server.exe');
  } catch {
    return undefined;
  }
}
