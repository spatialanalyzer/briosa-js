import { invokeClientOperation, type BriosaClient } from './client.js';
import * as ConstructionOperationsProtocol from './generated/protocol/briosa/construction_operations.js';
import type { BriosaCallOptions } from './models.js';
import {
  mapOperationResponse,
  operationScalarSchemas,
} from './operationProtocol.js';

/** Return the name of the active SpatialAnalyzer collection. */
export async function getActiveCollectionName(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<string> {
  const response = await invokeClientOperation(
    briosa,
    'ConstructionOperations',
    'GetActiveCollectionName',
    ConstructionOperationsProtocol.GetActiveCollectionNameRequest.fromPartial(
      {},
    ),
    ConstructionOperationsProtocol.GetActiveCollectionNameRequest,
    ConstructionOperationsProtocol.GetActiveCollectionNameResult,
    options,
  );
  return mapOperationResponse(response as Readonly<Record<string, unknown>>, [
    ['currentlyActiveCollectionName', operationScalarSchemas.string],
  ]) as string;
}
