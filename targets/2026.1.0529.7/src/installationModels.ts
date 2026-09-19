import { isAbsolute, resolve } from 'node:path';

export type InstallationScope = 'machine' | 'user' | 'portable';
export function pathKey(path: string): string {
  return resolve(path)
    .replaceAll('\\', '/')
    .replace(/\/+$/, '')
    .replace(/[A-Z]/g, (c) => c.toLowerCase());
}
export interface BriosaServerSelection {
  readonly executablePath?: string;
  readonly installationId?: string;
  readonly version?: string;
  readonly minimumVersion?: string;
  readonly maximumVersionExclusive?: string;
  readonly excludedVersions?: readonly string[];
  readonly searchRoots?: readonly string[];
  readonly allowedScopes?: readonly InstallationScope[];
  readonly allowPrerelease?: boolean;
  readonly useLegacyEnvironmentOverride?: boolean;
  readonly spatialAnalyzerExecutablePath?: string;
}
export interface BriosaInstallation {
  readonly installationId: string;
  readonly executablePath: string;
  readonly version: string;
  readonly sourceRevision: string;
  readonly spatialAnalyzerTarget: string;
  readonly runtimeIdentifier: string;
  readonly contractMajor: number;
  readonly contractRevision: number;
  readonly manifestSha256: string;
  readonly scope: InstallationScope;
}
export interface BriosaDiscoveryDiagnostic {
  readonly path: string;
  readonly code: string;
}
export interface BriosaDiscoveryReport {
  readonly installations: readonly BriosaInstallation[];
  readonly diagnostics: readonly BriosaDiscoveryDiagnostic[];
  readonly selected: BriosaInstallation | null;
  readonly diagnosticCode: string | null;
}
const versionPattern =
  /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-((?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
export function validVersion(value: string): boolean {
  return (
    value.length <= 128 && versionPattern.test(value) && !value.endsWith('\n')
  );
}
export function localPath(path: string): boolean {
  return isAbsolute(path) && !path.startsWith('\\\\') && !path.startsWith('//');
}
export function normalizeSelection(
  options: BriosaServerSelection = {},
): BriosaServerSelection {
  if (
    options.executablePath !== undefined &&
    options.installationId !== undefined
  )
    throw new TypeError(
      'executablePath and installationId are mutually exclusive.',
    );
  for (const path of [
    options.executablePath,
    options.spatialAnalyzerExecutablePath,
    ...(options.searchRoots ?? []),
  ])
    if (path !== undefined && !localPath(path))
      throw new TypeError('Selection paths must be absolute local paths.');
  for (const version of [
    options.version,
    options.minimumVersion,
    options.maximumVersionExclusive,
    ...(options.excludedVersions ?? []),
  ])
    if (version !== undefined && !validVersion(version))
      throw new TypeError('Invalid server version constraint.');
  if (options.installationId !== undefined && !options.installationId.trim())
    throw new TypeError('installationId must not be empty.');
  if (
    options.allowedScopes !== undefined &&
    (!options.allowedScopes.length ||
      options.allowedScopes.some(
        (s) => !['machine', 'user', 'portable'].includes(s),
      ))
  )
    throw new TypeError('Invalid installation scope.');
  return Object.freeze({
    ...options,
    searchRoots: Object.freeze([...(options.searchRoots ?? [])]),
    excludedVersions: Object.freeze([...(options.excludedVersions ?? [])]),
    allowedScopes: Object.freeze([
      ...(options.allowedScopes ?? ['machine', 'user', 'portable']),
    ] as InstallationScope[]),
  });
}
function ordinal(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
function numeric(a: string, b: string): number {
  return a.length - b.length || ordinal(a, b);
}
export function compareVersions(a: string, b: string): number {
  const ma = versionPattern.exec(a)!;
  const mb = versionPattern.exec(b)!;
  for (let index = 1; index <= 3; index++) {
    const difference = numeric(ma[index]!, mb[index]!);
    if (difference) return difference;
  }
  const pa = ma[4],
    pb = mb[4];
  if (pa === undefined || pb === undefined)
    return pa === pb ? 0 : pa === undefined ? 1 : -1;
  const aa = pa.split('.'),
    bb = pb.split('.');
  for (let index = 0; index < Math.min(aa.length, bb.length); index++) {
    const av = aa[index]!,
      bv = bb[index]!,
      an = /^[0-9]+$/.test(av),
      bn = /^[0-9]+$/.test(bv);
    const difference =
      an && bn ? numeric(av, bv) : an !== bn ? (an ? -1 : 1) : ordinal(av, bv);
    if (difference) return difference;
  }
  return aa.length - bb.length;
}
