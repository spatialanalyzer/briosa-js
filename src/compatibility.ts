import type {
  GetServerInfoResponse,
  ListCapabilitiesResponse,
} from './generated/protocol/briosa/discovery.js';
import { TargetIsolationMode } from './generated/protocol/briosa/discovery.js';
import { briosaProtocolIdentity } from './generated/protocolIdentity.js';

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
      version.briosaVersion,
      briosaProtocolIdentity.briosaVersion,
      'server-version-mismatch',
    ],
    [
      version.sourceRevision,
      briosaProtocolIdentity.sourceRevision,
      'server-source-revision-mismatch',
    ],
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
}
