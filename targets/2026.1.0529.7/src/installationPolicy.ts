import { briosaProtocolIdentity as identity } from './generated/protocolIdentity.js';
import {
  compareVersions,
  pathKey,
  type BriosaInstallation,
  type BriosaServerSelection,
} from './installationModels.js';
export const legacyVersion = '0.6.1';
export const legacySource = '32a3b56ba4ae31ea5ec6ec3b2aa051eb61c866aa';
export function compatible(
  major: number,
  revision: number,
  version: string,
  source: string,
  requiredMajor: number = identity.compatibilityMajor,
  minimumRevision: number = identity.compatibilityRevision,
): boolean {
  return major === 0
    ? revision === 0 &&
        requiredMajor === 1 &&
        minimumRevision === 0 &&
        version === legacyVersion &&
        source === legacySource
    : major === requiredMajor && revision >= minimumRevision;
}
export function selectInstallation(
  candidates: readonly BriosaInstallation[],
  options: BriosaServerSelection,
  target: string = identity.spatialAnalyzerTarget,
  requiredMajor: number = identity.compatibilityMajor,
  minimumRevision: number = identity.compatibilityRevision,
): { selected: BriosaInstallation | null; diagnosticCode: string | null } {
  const eligible = candidates.filter(
    (c) =>
      c.spatialAnalyzerTarget === target &&
      c.runtimeIdentifier === 'win-x64' &&
      compatible(
        c.contractMajor,
        c.contractRevision,
        c.version,
        c.sourceRevision,
        requiredMajor,
        minimumRevision,
      ) &&
      (options.version === undefined || c.version === options.version) &&
      (options.installationId === undefined ||
        c.installationId === options.installationId) &&
      (options.executablePath === undefined ||
        pathKey(c.executablePath) === pathKey(options.executablePath)) &&
      (options.allowedScopes ?? ['machine', 'user', 'portable']).includes(
        c.scope,
      ) &&
      (options.allowPrerelease || !c.version.split('+')[0]!.includes('-')) &&
      !(options.excludedVersions ?? []).includes(c.version) &&
      (options.minimumVersion === undefined ||
        compareVersions(c.version, options.minimumVersion) >= 0) &&
      (options.maximumVersionExclusive === undefined ||
        compareVersions(c.version, options.maximumVersionExclusive) < 0),
  );
  if (!eligible.length)
    return {
      selected: null,
      diagnosticCode: candidates.length
        ? 'server-installation-incompatible'
        : 'server-distribution-not-found',
    };
  eligible.sort(
    (a, b) =>
      compareVersions(b.version, a.version) ||
      ['machine', 'user', 'portable'].indexOf(a.scope) -
        ['machine', 'user', 'portable'].indexOf(b.scope) ||
      Buffer.compare(
        Buffer.from(pathKey(a.executablePath), 'utf8'),
        Buffer.from(pathKey(b.executablePath), 'utf8'),
      ),
  );
  const selected = eligible[0]!;
  if (
    eligible.some(
      (c) =>
        compareVersions(c.version, selected.version) === 0 &&
        (c.manifestSha256 !== selected.manifestSha256 ||
          c.sourceRevision !== selected.sourceRevision),
    )
  )
    return { selected: null, diagnosticCode: 'server-installation-ambiguous' };
  return { selected, diagnosticCode: null };
}
