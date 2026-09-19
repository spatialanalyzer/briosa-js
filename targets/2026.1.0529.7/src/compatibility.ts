import type {
  GetServerInfoResponse,
  ListCapabilitiesResponse,
} from './generated/protocol/briosa/discovery.js';
import { TargetIsolationMode } from './generated/protocol/briosa/discovery.js';
import { briosaProtocolIdentity } from './generated/protocolIdentity.js';
import { compatible } from './installationPolicy.js';
import { validVersion, type BriosaInstallation } from './installationModels.js';

/** Indicates that a runtime does not match this package's exact identity. */
export class BriosaCompatibilityError extends Error {
  constructor(readonly diagnosticCode: string) {
    super(`Briosa compatibility check failed: ${diagnosticCode}.`);
    this.name = 'BriosaCompatibilityError';
  }
}

/** Validates discovery without exposing generated messages to callers. */
export function validateBriosaCompatibility(
  serverInfo: GetServerInfoResponse,
  capabilities: ListCapabilitiesResponse,
): void {
  const version = serverInfo.version;
  if (version === undefined) {
    throw new BriosaCompatibilityError('server-version-missing');
  }
  const checks: readonly (readonly [string | undefined, string, string])[] = [
    [
      version.protocolPackage,
      briosaProtocolIdentity.protocolPackage,
      'server-protocol-package-mismatch',
    ],
    [
      version.spatialAnalyzerTarget,
      briosaProtocolIdentity.spatialAnalyzerTarget,
      'server-sa-target-mismatch',
    ],
    [
      capabilities.protocolPackage,
      briosaProtocolIdentity.protocolPackage,
      'capability-protocol-package-mismatch',
    ],
    [
      capabilities.spatialAnalyzerTarget,
      briosaProtocolIdentity.spatialAnalyzerTarget,
      'capability-sa-target-mismatch',
    ],
  ];
  for (const [actual, expected, diagnosticCode] of checks) {
    if (actual !== expected) {
      throw new BriosaCompatibilityError(diagnosticCode);
    }
  }
  if (
    serverInfo.targetIsolationMode !==
    TargetIsolationMode.TARGET_ISOLATION_MODE_SINGLE_TENANT
  ) {
    throw new BriosaCompatibilityError('target-isolation-mode-mismatch');
  }
  if (
    typeof version.briosaVersion !== 'string' ||
    typeof version.sourceRevision !== 'string' ||
    !validVersion(version.briosaVersion) ||
    !/^[0-9a-f]{40}$/.test(version.sourceRevision) ||
    version.sourceRevision.length !== 40
  )
    throw new BriosaCompatibilityError('server-identity-invalid');
  const contract = serverInfo.compatibility;
  if (
    (contract !== undefined && (contract.major ?? 0) === 0) ||
    !compatible(
      contract?.major ?? 0,
      contract?.revision ?? 0,
      version.briosaVersion,
      version.sourceRevision,
    )
  )
    throw new BriosaCompatibilityError('server-contract-incompatible');
}

export function validateInstallation(
  serverInfo: GetServerInfoResponse,
  installation: BriosaInstallation | undefined,
): void {
  if (installation === undefined) return;
  const version = serverInfo.version;
  if (
    version?.briosaVersion !== installation.version ||
    version.sourceRevision !== installation.sourceRevision ||
    version.spatialAnalyzerTarget !== installation.spatialAnalyzerTarget ||
    (serverInfo.compatibility?.major ?? 0) !== installation.contractMajor ||
    (serverInfo.compatibility?.revision ?? 0) !== installation.contractRevision
  )
    throw new BriosaCompatibilityError('server-installation-identity-mismatch');
}
