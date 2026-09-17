import { invokeClientOperation, type BriosaClient } from './client.js';
import type { BriosaCallOptions } from './models.js';
import type {
  CollectionInstrumentId,
  CollectionName,
  CollectionObjectName,
} from './operationValues.js';
import {
  getOperationValueSchema,
  mapOperationResponse,
  operationScalarSchemas,
  repeatedOperationValue,
  requireOperationInput,
  toWireOperationValue,
} from './operationProtocol.js';
import * as Protocol from './generated/protocol/briosa/instrument_operations.js';

export interface RunCribSheetInput {
  readonly collection: CollectionName;
  readonly cribSheetName: string;
  readonly instrument: CollectionInstrumentId;
}

/** Run Crib Sheet with the selected instrument. */
export async function runCribSheet(
  briosa: BriosaClient,
  input: RunCribSheetInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = Protocol.RunCribSheetRequest.fromPartial({
    collection: toWireOperationValue(
      getOperationValueSchema('collectionName'),
      requireOperationInput(input.collection, 'collection'),
    ),
    cribSheetName: toWireOperationValue(
      operationScalarSchemas.string,
      requireOperationInput(input.cribSheetName, 'cribSheetName'),
    ),
    instrument: toWireOperationValue(
      getOperationValueSchema('collectionInstrumentId'),
      requireOperationInput(input.instrument, 'instrument'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'InstrumentOperations',
    'RunCribSheet',
    request,
    Protocol.RunCribSheetRequest,
    Protocol.RunCribSheetResult,
    options,
  );
  mapOperationResponse(response as Readonly<Record<string, unknown>>, []);
}

export interface ProjectObjectsInput {
  readonly instrument: CollectionInstrumentId;
  readonly objectsToProject: Iterable<CollectionObjectName>;
}

/** Project Objects; materialize and validate the iterable once before submitting. */
export async function projectObjects(
  briosa: BriosaClient,
  input: ProjectObjectsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = Protocol.ProjectObjectsRequest.fromPartial({
    instrument: toWireOperationValue(
      getOperationValueSchema('collectionInstrumentId'),
      requireOperationInput(input.instrument, 'instrument'),
    ),
    objectsToProject: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
      requireOperationInput(input.objectsToProject, 'objectsToProject'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'InstrumentOperations',
    'ProjectObjects',
    request,
    Protocol.ProjectObjectsRequest,
    Protocol.ProjectObjectsResult,
    options,
  );
  mapOperationResponse(response as Readonly<Record<string, unknown>>, []);
}

export interface StopProjectionInput {
  readonly instrument: CollectionInstrumentId;
}

/** Stop Projection on the selected instrument. */
export async function stopProjection(
  briosa: BriosaClient,
  input: StopProjectionInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = Protocol.StopProjectionRequest.fromPartial({
    instrument: toWireOperationValue(
      getOperationValueSchema('collectionInstrumentId'),
      requireOperationInput(input.instrument, 'instrument'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'InstrumentOperations',
    'StopProjection',
    request,
    Protocol.StopProjectionRequest,
    Protocol.StopProjectionResult,
    options,
  );
  mapOperationResponse(response as Readonly<Record<string, unknown>>, []);
}
