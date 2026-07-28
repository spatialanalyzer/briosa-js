import type {
  GetServerInfoResponse,
  ListCapabilitiesResponse,
} from './generated/protocol/briosa/core/v1alpha1/discovery.js';
import { briosaProtocolIdentity } from './generated/protocolIdentity.js';

/** Indicates that a server does not implement this package's exact protocol identity. */
export class BriosaCompatibilityError extends Error {
  constructor(readonly diagnosticCode: string) {
    super(`Briosa compatibility check failed: ${diagnosticCode}.`);
    this.name = 'BriosaCompatibilityError';
  }
}

function requireCoordinate(
  actual: string | undefined,
  expected: string,
  diagnosticCode: string,
): void {
  if (actual !== expected) throw new BriosaCompatibilityError(diagnosticCode);
}

/** Validates server discovery against the immutable generation identity. */
export function validateBriosaCompatibility(
  serverInfo: GetServerInfoResponse,
  capabilities: ListCapabilitiesResponse,
): void {
  const version = serverInfo.version;
  if (version === undefined) {
    throw new BriosaCompatibilityError('server-version-missing');
  }

  requireCoordinate(
    version.coreProtocolPackage,
    briosaProtocolIdentity.coreProtocolPackage,
    'core-protocol-package-mismatch',
  );
  requireCoordinate(
    version.spatialAnalyzerTarget,
    briosaProtocolIdentity.spatialAnalyzerTarget,
    'server-sa-target-mismatch',
  );
  requireCoordinate(
    version.targetProtocolPackage,
    briosaProtocolIdentity.targetProtocolPackage,
    'server-target-package-mismatch',
  );
  requireCoordinate(
    version.catalogRevision,
    briosaProtocolIdentity.catalogRevision,
    'server-catalog-revision-mismatch',
  );
  requireCoordinate(
    capabilities.catalogId,
    briosaProtocolIdentity.catalogId,
    'capability-catalog-id-mismatch',
  );
  requireCoordinate(
    capabilities.catalogRevision,
    briosaProtocolIdentity.catalogRevision,
    'capability-catalog-revision-mismatch',
  );
  requireCoordinate(
    capabilities.spatialAnalyzerTarget,
    briosaProtocolIdentity.spatialAnalyzerTarget,
    'capability-sa-target-mismatch',
  );
  requireCoordinate(
    capabilities.targetProtocolPackage,
    briosaProtocolIdentity.targetProtocolPackage,
    'capability-target-package-mismatch',
  );
}
