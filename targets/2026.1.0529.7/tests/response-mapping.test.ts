// Every operation maps a fully populated response through its public facade
// (briosa contract major 3, client requirement 11). The TypeScript checker
// enumerates the public operations from the package exports and the client's
// operation groups, builds a valid input from each signature, and answers each
// call with every field of the operation's generated result message set.

import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';

import ts from 'typescript';

import * as briosaPackage from '../src/index.js';
import { briosaProtocolIdentity } from '../src/generated/protocolIdentity.js';
import type { OperationCodec } from '../src/transport.js';
import {
  startedClient,
  succeeded,
  type RecordedOperation,
} from './support/fakes.js';
import {
  argumentsFor,
  checker,
  discover,
  isOptional,
  moduleExports,
  repositoryRoot,
  symbolType,
  typeName,
  valueOf,
} from './support/publicOperations.js';

const generatedRoot = resolve(
  repositoryRoot,
  'src',
  'generated',
  'protocol',
  'briosa',
);

const expectedOperations: Readonly<Record<string, number>> = {
  '2026.1.0529.7': 1018,
  '2024.1.0508.5': 987,
};

/** Describes how a mapped value departs from its declared public type. */
function conformanceProblems(
  value: unknown,
  type: ts.Type,
  path: string,
  depth = 0,
): string[] {
  if (depth > 12) return [`${path}: nesting too deep`];
  if (value === undefined) {
    return type.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void) ||
      (type.isUnion() &&
        type.types.some((member) => member.flags & ts.TypeFlags.Undefined))
      ? []
      : [`${path}: missing`];
  }
  const nonNullable = checker.getNonNullableType(type);
  const flags = nonNullable.flags;
  if (flags & ts.TypeFlags.BooleanLike)
    return typeof value === 'boolean' ? [] : [`${path}: not a boolean`];
  if (flags & ts.TypeFlags.BigIntLike)
    return typeof value === 'bigint' ? [] : [`${path}: not a bigint`];
  if (flags & (ts.TypeFlags.StringLiteral | ts.TypeFlags.NumberLiteral))
    return value === (nonNullable as ts.LiteralType).value
      ? []
      : [`${path}: not ${checker.typeToString(nonNullable)}`];
  if (flags & ts.TypeFlags.String)
    return typeof value === 'string' ? [] : [`${path}: not a string`];
  if (flags & ts.TypeFlags.Number)
    return typeof value === 'number' ? [] : [`${path}: not a number`];
  if (nonNullable.isUnion()) {
    const fits = nonNullable.types.some(
      (member) =>
        conformanceProblems(value, member, path, depth + 1).length === 0,
    );
    return fits
      ? []
      : [`${path}: fits no member of ${checker.typeToString(nonNullable)}`];
  }
  const name = typeName(nonNullable);
  if (checker.isTupleType(nonNullable)) {
    if (!Array.isArray(value)) return [`${path}: not a tuple`];
    const items = checker.getTypeArguments(nonNullable as ts.TypeReference);
    if (value.length !== items.length)
      return [`${path}: ${value.length} items, expected ${items.length}`];
    return items.flatMap((item, index) =>
      conformanceProblems(value[index], item, `${path}[${index}]`, depth + 1),
    );
  }
  if (checker.isArrayType(nonNullable)) {
    if (!Array.isArray(value)) return [`${path}: not an array`];
    const [item] = checker.getTypeArguments(nonNullable as ts.TypeReference);
    assert.ok(item !== undefined);
    return value.flatMap((entry, index) =>
      conformanceProblems(entry, item, `${path}[${index}]`, depth + 1),
    );
  }
  if (flags & ts.TypeFlags.Object) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
      return [`${path}: not an object of type ${name}`];
    const record = value as Readonly<Record<string, unknown>>;
    const members = checker.getPropertiesOfType(nonNullable);
    const known = new Set(members.map((member) => member.name));
    const extra = Object.keys(record)
      .filter((key) => !known.has(key))
      .map((key) => `${path}.${key}: not declared by ${name}`);
    return [
      ...extra,
      ...members.flatMap((member) =>
        isOptional(member) && record[member.name] === undefined
          ? []
          : conformanceProblems(
              record[member.name],
              symbolType(member),
              `${path}.${member.name}`,
              depth + 1,
            ),
      ),
    ];
  }
  return [`${path}: unsupported type ${checker.typeToString(type)}`];
}

function snakeCase(service: string): string {
  return service.replace(
    /[A-Z]/g,
    (letter, offset: number) =>
      (offset === 0 ? '' : '_') + letter.toLowerCase(),
  );
}

const resultTypes = new Map<string, ts.Type>();

function resultType(service: string, rpc: string): ts.Type {
  const key = `${service}/${rpc}`;
  const cached = resultTypes.get(key);
  if (cached !== undefined) return cached;
  const path = resolve(generatedRoot, `${snakeCase(service)}.ts`);
  const symbol = moduleExports(path).find(
    (exported) => exported.name === `${rpc}Result`,
  );
  assert.ok(symbol !== undefined, `${key} has no generated ${rpc}Result`);
  const type = checker.getDeclaredTypeOfSymbol(symbol);
  resultTypes.set(key, type);
  return type;
}

async function fullyPopulatedResponse(
  operation: RecordedOperation,
): Promise<unknown> {
  const { service, rpc, responseCodec } = operation;
  const generated = (await import(
    pathToFileURL(resolve(generatedRoot, `${snakeCase(service)}.ts`)).href
  )) as Readonly<Record<string, unknown>>;
  assert.equal(
    generated[`${rpc}Result`],
    responseCodec,
    `${service}/${rpc} answers with its generated result message`,
  );
  const codec = responseCodec as OperationCodec<unknown> & {
    fromPartial(value: unknown): unknown;
  };
  const value = valueOf(
    resultType(service, rpc),
    'wire',
    `${rpc}Result`,
    '',
  ) as Record<string, unknown>;
  // Every field is set; the execution details are a valid success (C1).
  assert.ok('execution' in value, `${service}/${rpc} carries its execution`);
  value.execution = succeeded();
  // Decode the encoded message, exactly as the transport would.
  return codec.decode(codec.encode(codec.fromPartial(value)).finish());
}

void test('the 3D Auto Filter operations send their proximity settings', async () => {
  // SA 2024 lacked the FilterProximitySettings schema, so these threw.
  const { client, transport } = await startedClient();
  transport.respond = () => ({});
  const settings = {
    surfaceInclusionProximity: 0.5,
    surfaceProximityMode: 'both',
    projectToPlane: true,
  } as const;
  const relationships = [
    {
      collectionName: 'Inspection',
      itemName: 'R1',
      itemType: briosaPackage.ItemType.relationship,
    },
  ];
  try {
    await briosaPackage.autoFilterCloudsToNominalGeometry3D(client, {
      autoFilterTargetRelationships: relationships,
      clouds: [
        {
          collectionName: 'Inspection',
          objectName: 'Cloud',
          objectType: briosaPackage.ObjectType.cloud,
        },
      ],
      filterProximitySettings3D: settings,
    });
    await briosaPackage.autoFilterPointsToNominalGeometry3D(client, {
      autoFilterTargetRelationships: relationships,
      points: [
        { collectionName: 'Inspection', groupName: 'G', targetName: 'P1' },
      ],
      filterProximitySettings3D: settings,
    });
    for (const operation of transport.operations) {
      const wire = operation.requestCodec.decode(
        operation.requestCodec.encode(operation.request).finish(),
      ) as { filterProximitySettings3d?: Record<string, unknown> };
      const proximity = wire.filterProximitySettings3d;
      assert.ok(proximity !== undefined, operation.rpc);
      assert.equal(proximity.surfaceInclusionProximity, 0.5);
      assert.equal(proximity.projectToPlane, true);
    }
    assert.equal(transport.operations.length, 2);
  } finally {
    await client.stop();
  }
});

void test('the 2D Auto Filter operation sends its settings and its own tolerance', async () => {
  // The facade sent surfaceInclusionProximity where the settings message
  // belongs, and filled the top-level tolerance from the settings.
  const { client, transport } = await startedClient();
  transport.respond = () => ({});
  const base = {
    autoFilterTargetRelationships: [
      {
        collectionName: 'Inspection',
        itemName: 'R1',
        itemType: briosaPackage.ItemType.relationship,
      },
    ],
    clouds: [
      {
        collectionName: 'Inspection',
        objectName: 'Cloud',
        objectType: briosaPackage.ObjectType.cloud,
      },
    ],
  };
  const wire = (): {
    filterProximitySettings2d?: Record<string, unknown>;
    geometryExtractionTolerance?: number;
  } => {
    const { request, requestCodec } = transport.lastOperation;
    return requestCodec.decode(requestCodec.encode(request).finish()) as never;
  };
  try {
    await briosaPackage.autoFilterCloudsToNominalGeometry2D(client, {
      ...base,
      filterProximitySettings2D: {
        surfaceInclusionProximity: 0.5,
        geometryExtractionTolerance: 0.3,
        planarProximityMode: 'positiveOnly',
      },
      geometryExtractionTolerance: 0.02,
    });
    const sent = wire();
    const settings = sent.filterProximitySettings2d;
    assert.ok(settings !== undefined);
    assert.equal(settings.surfaceInclusionProximity, 0.5);
    assert.equal(settings.geometryExtractionTolerance, 0.3);
    assert.equal(sent.geometryExtractionTolerance, 0.02);

    // The reviewed default of the 2D-only tolerance is 0.01.
    await briosaPackage.autoFilterCloudsToNominalGeometry2D(client, base);
    const defaulted = wire();
    assert.equal(defaulted.filterProximitySettings2d, undefined);
    assert.equal(defaulted.geometryExtractionTolerance, 0.01);
  } finally {
    await client.stop();
  }
});

void test('every operation maps a fully populated response without error', async () => {
  const { client, transport } = await startedClient();
  transport.respond = fullyPopulatedResponse;
  transport.workingDirectoryResults.push({
    directory: 'C:\\Working',
    execution: {
      state: 1,
      mpResultCode: 2,
      outputRetrievals: [{ fieldName: 'directory', state: 1 }],
    },
  });
  try {
    const operations = discover(client);
    assert.equal(
      operations.length,
      expectedOperations[briosaProtocolIdentity.spatialAnalyzerTarget],
      'every public operation is covered',
    );
    const failures: string[] = [];
    const rpcs = new Set<string>();
    for (const operation of operations) {
      const before =
        transport.operations.length + transport.workingDirectoryCalls;
      try {
        const result = await operation.invoke(argumentsFor(operation, client));
        // The mapped result has exactly its declared public shape.
        const declared = checker.getAwaitedType(
          checker.getReturnTypeOfSignature(operation.signature),
        );
        assert.ok(declared !== undefined, operation.label);
        failures.push(
          ...conformanceProblems(result, declared, operation.label),
        );
      } catch (error) {
        failures.push(
          `${operation.label}: ${error instanceof Error ? `${error.name} ${error.message}` : String(error)}`,
        );
        continue;
      }
      const after =
        transport.operations.length + transport.workingDirectoryCalls;
      if (after !== before + 1)
        failures.push(`${operation.label}: made ${after - before} calls`);
      const sent = transport.operations.at(-1);
      if (sent !== undefined && operation.label !== 'getWorkingDirectory')
        rpcs.add(`${sent.service}/${sent.rpc}`);
    }
    assert.deepEqual(failures, []);
    // One facade per RPC.
    assert.equal(rpcs.size, operations.length - 1);
  } finally {
    await client.stop();
  }
});
