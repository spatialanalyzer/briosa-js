// Every operation maps a fully populated response through its public facade
// (briosa contract major 3, client requirement 11). The TypeScript checker
// enumerates the public operations from the package exports and the client's
// operation groups, builds a valid input from each signature, and answers each
// call with every field of the operation's generated result message set.

import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import ts from 'typescript';

import * as briosaPackage from '../src/index.js';
import { briosaProtocolIdentity } from '../src/generated/protocolIdentity.js';
import type { OperationCodec } from '../src/transport.js';
import { startedClient, type RecordedOperation } from './support/fakes.js';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
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

type Mode = 'input' | 'wire';

const program = ts.createProgram({
  rootNames: [resolve(repositoryRoot, 'src', 'index.ts')],
  options: {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ES2022,
    strict: true,
    exactOptionalPropertyTypes: true,
    noEmit: true,
    skipLibCheck: true,
  },
});
const checker = program.getTypeChecker();

function moduleExports(path: string): readonly ts.Symbol[] {
  const sourceFile = program.getSourceFile(path);
  assert.ok(sourceFile !== undefined, `Missing source file ${path}`);
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  assert.ok(moduleSymbol !== undefined, `Missing module symbol ${path}`);
  return checker.getExportsOfModule(moduleSymbol);
}

function resolved(symbol: ts.Symbol): ts.Symbol {
  return symbol.flags & ts.SymbolFlags.Alias
    ? checker.getAliasedSymbol(symbol)
    : symbol;
}

function declaration(symbol: ts.Symbol): ts.Declaration {
  const node = symbol.valueDeclaration ?? symbol.declarations?.[0];
  assert.ok(node !== undefined, `No declaration for ${symbol.name}`);
  return node;
}

function symbolType(symbol: ts.Symbol): ts.Type {
  return checker.getTypeOfSymbolAtLocation(symbol, declaration(symbol));
}

function typeName(type: ts.Type): string {
  return (type.aliasSymbol ?? type.getSymbol())?.name ?? '';
}

function isOptional(symbol: ts.Symbol): boolean {
  return (symbol.flags & ts.SymbolFlags.Optional) !== 0;
}

/** A valid value of a public input type, or a fully populated wire value. */
function valueOf(
  type: ts.Type,
  mode: Mode,
  owner: string,
  property: string,
  depth = 0,
): unknown {
  assert.ok(depth < 12, `Type nesting too deep at ${owner}.${property}`);
  const nonNullable = checker.getNonNullableType(type);
  const flags = nonNullable.flags;
  if (flags & ts.TypeFlags.BooleanLike) return true;
  if (flags & ts.TypeFlags.BigIntLike) return 1n;
  if (flags & ts.TypeFlags.StringLiteral)
    return (nonNullable as ts.StringLiteralType).value;
  if (flags & ts.TypeFlags.String) return 'Value';
  if (flags & ts.TypeFlags.NumberLiteral)
    return (nonNullable as ts.NumberLiteralType).value;
  if (flags & ts.TypeFlags.Number) return 1;
  if (nonNullable.isUnion()) {
    const members = nonNullable.types;
    if (members.every((member) => member.flags & ts.TypeFlags.EnumLiteral)) {
      // A generated protobuf enum: the smallest declared wire value above 0.
      const values = members
        .map((member) => (member as ts.NumberLiteralType).value)
        .filter((value) => value > 0)
        .sort((left, right) => left - right);
      assert.ok(
        values.length > 0,
        `Enum without values at ${owner}.${property}`,
      );
      return values[0];
    }
    // A literal union, or a oneof: the first member.
    const first = members[0];
    assert.ok(first !== undefined);
    return valueOf(first, mode, owner, property, depth + 1);
  }
  if (flags & ts.TypeFlags.EnumLike) {
    return (nonNullable as ts.NumberLiteralType).value;
  }
  const name = typeName(nonNullable);
  if (name === 'Buffer' || name === 'Uint8Array') return Buffer.from([1]);
  if (
    checker.isArrayType(nonNullable) ||
    checker.isTupleType(nonNullable) ||
    name === 'Iterable'
  ) {
    const [item] = checker.getTypeArguments(nonNullable as ts.TypeReference);
    assert.ok(item !== undefined, `Untyped collection at ${owner}.${property}`);
    // A Transform carries exactly 16 values.
    const length = owner === 'Transform' && property === 'values' ? 16 : 1;
    return Array.from({ length }, () =>
      valueOf(item, mode, owner, property, depth + 1),
    );
  }
  if (flags & ts.TypeFlags.Object) {
    const result: Record<string, unknown> = {};
    for (const member of checker.getPropertiesOfType(nonNullable)) {
      if (mode === 'input' && isOptional(member)) continue;
      result[member.name] = valueOf(
        symbolType(member),
        mode,
        name,
        member.name,
        depth + 1,
      );
    }
    return result;
  }
  assert.fail(
    `Unsupported type ${checker.typeToString(type)} at ${owner}.${property}`,
  );
}

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

interface PublicOperation {
  readonly label: string;
  readonly signature: ts.Signature;
  readonly invoke: (args: readonly unknown[]) => Promise<unknown>;
  /** Flat facades take the client as their first parameter. */
  readonly takesClient: boolean;
}

function callSignature(symbol: ts.Symbol): ts.Signature {
  const signatures = symbolType(symbol).getCallSignatures();
  assert.equal(signatures.length, 1, `${symbol.name} has one signature`);
  return signatures[0]!;
}

function firstParameterIsClient(signature: ts.Signature): boolean {
  const [first] = signature.getParameters();
  return first !== undefined && typeName(symbolType(first)) === 'BriosaClient';
}

function discover(
  client: briosaPackage.BriosaClient,
): readonly PublicOperation[] {
  const operations: PublicOperation[] = [];
  const runtime = briosaPackage as unknown as Readonly<Record<string, unknown>>;
  for (const exported of moduleExports(
    resolve(repositoryRoot, 'src', 'index.ts'),
  )) {
    const symbol = resolved(exported);
    if (!(symbol.flags & ts.SymbolFlags.Function)) continue;
    if (/^create\w*Operations$/.test(exported.name)) continue;
    const signature = callSignature(symbol);
    if (!firstParameterIsClient(signature)) continue;
    const implementation = runtime[exported.name];
    assert.equal(typeof implementation, 'function', exported.name);
    operations.push({
      label: exported.name,
      signature,
      takesClient: true,
      invoke: (args) =>
        (implementation as (...values: unknown[]) => Promise<unknown>)(...args),
    });
  }

  const clientInterface = moduleExports(
    resolve(repositoryRoot, 'src', 'client.ts'),
  )
    .map(resolved)
    .find((symbol) => symbol.name === 'BriosaClient');
  assert.ok(clientInterface !== undefined);
  for (const group of checker.getPropertiesOfType(
    checker.getDeclaredTypeOfSymbol(clientInterface),
  )) {
    const groupType = symbolType(group);
    if (!typeName(groupType).endsWith('Operations')) continue;
    const surface = (client as unknown as Readonly<Record<string, unknown>>)[
      group.name
    ] as Readonly<Record<string, unknown>>;
    for (const method of checker.getPropertiesOfType(groupType)) {
      const implementation = surface[method.name];
      assert.equal(typeof implementation, 'function', method.name);
      operations.push({
        label: `${group.name}.${method.name}`,
        signature: callSignature(method),
        takesClient: false,
        invoke: (args) =>
          (implementation as (...values: unknown[]) => Promise<unknown>)(
            ...args,
          ),
      });
    }
  }
  return operations;
}

function argumentsFor(
  operation: PublicOperation,
  client: briosaPackage.BriosaClient,
): unknown[] {
  const parameters = operation.signature.getParameters();
  const args: unknown[] = [];
  for (const [index, parameter] of parameters.entries()) {
    if (operation.takesClient && index === 0) {
      args.push(client);
      continue;
    }
    const type = symbolType(parameter);
    const name = typeName(checker.getNonNullableType(type));
    if (name === 'BriosaCallOptions') continue;
    args.push(valueOf(type, 'input', operation.label, parameter.name));
  }
  return args;
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
  const value = valueOf(resultType(service, rpc), 'wire', `${rpc}Result`, '');
  // Decode the encoded message, exactly as the transport would.
  return codec.decode(codec.encode(codec.fromPartial(value)).finish());
}

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
