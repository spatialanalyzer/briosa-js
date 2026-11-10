// The public operations, enumerated by the TypeScript checker from the package
// exports and the client's operation groups, with a valid input built from
// each signature. Shared by the every-operation tests.

import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import * as briosaPackage from '../../src/index.js';

export const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

export type Mode = 'input' | 'wire';

export const program = ts.createProgram({
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
export const checker = program.getTypeChecker();

export function moduleExports(path: string): readonly ts.Symbol[] {
  const sourceFile = program.getSourceFile(path);
  assert.ok(sourceFile !== undefined, `Missing source file ${path}`);
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  assert.ok(moduleSymbol !== undefined, `Missing module symbol ${path}`);
  return checker.getExportsOfModule(moduleSymbol);
}

export function resolved(symbol: ts.Symbol): ts.Symbol {
  return symbol.flags & ts.SymbolFlags.Alias
    ? checker.getAliasedSymbol(symbol)
    : symbol;
}

function declaration(symbol: ts.Symbol): ts.Declaration {
  const node = symbol.valueDeclaration ?? symbol.declarations?.[0];
  assert.ok(node !== undefined, `No declaration for ${symbol.name}`);
  return node;
}

export function symbolType(symbol: ts.Symbol): ts.Type {
  return checker.getTypeOfSymbolAtLocation(symbol, declaration(symbol));
}

export function typeName(type: ts.Type): string {
  return (type.aliasSymbol ?? type.getSymbol())?.name ?? '';
}

/** An optional property, or an optional or defaulted parameter. */
export function isOptional(symbol: ts.Symbol): boolean {
  if (symbol.flags & ts.SymbolFlags.Optional) return true;
  const node = symbol.valueDeclaration;
  return (
    node !== undefined &&
    ts.isParameter(node) &&
    checker.isOptionalParameter(node)
  );
}

/** A valid value of a public input type, or a fully populated wire value. */
export function valueOf(
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
  if (checker.isTupleType(nonNullable)) {
    return checker
      .getTypeArguments(nonNullable as ts.TypeReference)
      .map((item) => valueOf(item, mode, owner, property, depth + 1));
  }
  if (checker.isArrayType(nonNullable) || name === 'Iterable') {
    const [item] = checker.getTypeArguments(nonNullable as ts.TypeReference);
    assert.ok(item !== undefined, `Untyped collection at ${owner}.${property}`);
    // The domain fixes two lengths: a Transform carries 16 values, and a
    // DoubleVector6 six.
    const length =
      property !== 'values'
        ? 1
        : owner === 'Transform'
          ? 16
          : owner === 'DoubleVector6'
            ? 6
            : 1;
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

export interface PublicOperation {
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

/** Every public operation: the flat facades and the operation groups. */
export function discover(
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

/** The public parameters of an operation, without the client and call options. */
export function inputParameters(
  operation: PublicOperation,
): readonly ts.Symbol[] {
  return operation.signature
    .getParameters()
    .filter(
      (parameter, index) =>
        !(operation.takesClient && index === 0) &&
        typeName(checker.getNonNullableType(symbolType(parameter))) !==
          'BriosaCallOptions',
    );
}

/** Valid arguments for a call: the client (for flat facades) and every input. */
export function argumentsFor(
  operation: PublicOperation,
  client: briosaPackage.BriosaClient,
): unknown[] {
  const args: unknown[] = operation.takesClient ? [client] : [];
  for (const parameter of inputParameters(operation))
    args.push(
      valueOf(symbolType(parameter), 'input', operation.label, parameter.name),
    );
  return args;
}
