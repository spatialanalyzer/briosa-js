// Compares the packed declarations with those of the published baseline
// release. Every name the baseline exports from its entry point, including the
// operation and value surfaces re-exported with `export *`, gets a generated
// check that is type-checked with and without exactOptionalPropertyTypes:
//
// - a type must accept every baseline value (no new required member, nothing
//   narrowed) and fit wherever the baseline type was used (nothing removed,
//   no union member added);
// - a value (function, constant, or class) must be usable wherever its
//   baseline counterpart was;
// - every method of an exported interface or class must accept the baseline
//   method's arguments, checked on its own because TypeScript compares method
//   parameters bivariantly inside the type checks above;
// - a name the candidate no longer exports fails to resolve.
//
// Usage: npm run package:declarations [-- --baseline <published tarball>]
// Without --baseline the tarball is downloaded from the npm registry. Either
// way its SHA-256 must match the pinned release.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const metadata = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
// The published release this package must stay compatible with.
const baseline = {
  version: '0.5.0',
  // The names its entry point exports; a different count means the baseline
  // was not read.
  exports: 1769,
  sha256: '4e1389726d5135cfb2f815de3e5d8220513bc145ccd976089a18a0fd70297f7a',
};
const npm = process.env.npm_execpath;
if (!npm) throw new Error('Run through npm run package:declarations.');

function option(name) {
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
}

function run(command, arguments_, cwd) {
  const result = spawnSync(command, arguments_, { cwd, encoding: 'utf8' });
  assert.equal(
    result.status,
    0,
    result.error?.message || result.stdout || result.stderr,
  );
  return result.stdout;
}

const consumer = mkdtempSync(join(tmpdir(), 'briosa-js-declarations-'));
try {
  const unscoped = metadata.name.slice(1).replace('/', '-');
  const baselineFile = join(consumer, `${unscoped}-${baseline.version}.tgz`);
  const supplied = option('--baseline');
  if (supplied !== undefined) {
    copyFileSync(resolve(supplied), baselineFile);
  } else {
    // npm downloads the published tarball under this same file name.
    const [downloaded] = JSON.parse(
      run(
        process.execPath,
        [
          npm,
          'pack',
          `${metadata.name}@${baseline.version}`,
          '--json',
          '--pack-destination',
          consumer,
        ],
        consumer,
      ),
    );
    assert.equal(
      join(consumer, downloaded.filename),
      baselineFile,
      'npm downloaded an unexpected baseline file.',
    );
  }
  assert.equal(
    createHash('sha256').update(readFileSync(baselineFile)).digest('hex'),
    baseline.sha256,
    'The baseline tarball differs from the published release.',
  );

  const [packed] = JSON.parse(
    run(
      process.execPath,
      [npm, 'pack', '--json', '--pack-destination', consumer],
      root,
    ),
  );
  writeFileSync(
    join(consumer, 'package.json'),
    JSON.stringify({
      name: 'briosa-declaration-comparison',
      private: true,
      type: 'module',
      dependencies: {
        'briosa-baseline': `file:./${baselineFile.split(/[\\/]/).at(-1)}`,
        'briosa-candidate': `file:./${packed.filename}`,
      },
    }),
  );
  run(
    process.execPath,
    [
      npm,
      'install',
      '--prefer-offline',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
    ],
    consumer,
  );

  const compilerOptions = {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ES2022,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
  };

  // Every name the baseline exports, with the meanings it has there.
  const probe = join(consumer, 'probe.ts');
  writeFileSync(
    probe,
    "import * as Baseline from 'briosa-baseline';\nexport { Baseline };\n",
  );
  const probeProgram = ts.createProgram([probe], compilerOptions);
  const checker = probeProgram.getTypeChecker();
  const importDeclaration = probeProgram
    .getSourceFile(probe)
    .statements.find(ts.isImportDeclaration);
  const moduleSymbol = checker.getSymbolAtLocation(
    importDeclaration.moduleSpecifier,
  );
  assert.ok(moduleSymbol, 'Could not resolve the baseline package.');
  const typeFlags =
    ts.SymbolFlags.Interface |
    ts.SymbolFlags.TypeAlias |
    ts.SymbolFlags.Class |
    ts.SymbolFlags.Enum;
  const valueFlags =
    ts.SymbolFlags.Variable |
    ts.SymbolFlags.Function |
    ts.SymbolFlags.Class |
    ts.SymbolFlags.Enum;
  // The members of an interface's or a class's instance type that are
  // declared with method syntax, whose parameters are compared bivariantly.
  function methodsOf(target) {
    if (
      (target.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.Class)) ===
      0
    )
      return [];
    const methods = [];
    const instance = checker.getDeclaredTypeOfSymbol(target);
    for (const property of checker.getPropertiesOfType(instance)) {
      const declarations = (property.declarations ?? []).filter(
        (declaration) =>
          ts.isMethodSignature(declaration) ||
          ts.isMethodDeclaration(declaration),
      );
      if (declarations.length === 0) continue;
      const name = declarations[0].name;
      // A computed key such as [Symbol.asyncDispose] is indexed by its type.
      const key = ts.isComputedPropertyName(name)
        ? `[typeof ${name.expression.getText()}]`
        : `[${JSON.stringify(property.name)}]`;
      methods.push({
        label: key.replace(/\W+/gu, '_').replace(/^_|_$/gu, ''),
        key,
        overloaded: declarations.length > 1,
        generic: declarations.some(
          (declaration) => (declaration.typeParameters?.length ?? 0) > 0,
        ),
      });
    }
    return methods;
  }

  const exportsList = checker
    .getExportsOfModule(moduleSymbol)
    .map((symbol) => {
      const target =
        symbol.flags & ts.SymbolFlags.Alias
          ? checker.getAliasedSymbol(symbol)
          : symbol;
      return {
        name: symbol.name,
        type: (target.flags & typeFlags) !== 0,
        value: (target.flags & valueFlags) !== 0,
        generic: (target.declarations ?? []).some(
          (declaration) => (declaration.typeParameters?.length ?? 0) > 0,
        ),
        methods: methodsOf(target),
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name, 'en'));
  assert.equal(
    exportsList.length,
    baseline.exports,
    'The baseline declarations did not export the expected names.',
  );
  // Parameters<> sees only the last overload and erases type parameters, so
  // such a method needs a hand-written check instead of a partial one.
  const unsupported = exportsList.flatMap((entry) =>
    entry.methods
      .filter((method) => method.overloaded || method.generic)
      .map((method) => `${entry.name}${method.key}`),
  );
  assert.deepEqual(
    unsupported,
    [],
    'An overloaded or generic method needs a hand-written check.',
  );
  const generic = exportsList.filter((entry) => entry.generic && entry.type);
  assert.deepEqual(
    generic.map((entry) => entry.name),
    [],
    'A generic exported type needs a hand-written check.',
  );
  const unclassified = exportsList.filter(
    (entry) => !entry.type && !entry.value,
  );
  assert.deepEqual(
    unclassified.map((entry) => entry.name),
    [],
    'An export is neither a type nor a value.',
  );

  // One named check per comparison, so a failure names the export.
  const lines = [
    "import type * as Old from 'briosa-baseline';",
    "import type * as New from 'briosa-candidate';",
    'type Extends<A, B> = [A] extends [B] ? true : false;',
    'type Check<T extends true> = T;',
  ];
  let types = 0;
  let values = 0;
  let methods = 0;
  for (const entry of exportsList) {
    if (entry.type) {
      lines.push(
        `export type T_${entry.name}_accepts_baseline = Check<Extends<Old.${entry.name}, New.${entry.name}>>;`,
        `export type T_${entry.name}_fits_baseline = Check<Extends<New.${entry.name}, Old.${entry.name}>>;`,
      );
      types += 1;
    }
    if (entry.value) {
      lines.push(
        `export type V_${entry.name}_replaces_baseline = Check<Extends<typeof New.${entry.name}, typeof Old.${entry.name}>>;`,
      );
      values += 1;
    }
  }
  // Method arguments that the baseline accepted must still be accepted.
  // NonNullable covers an optional method.
  for (const entry of exportsList) {
    for (const method of entry.methods) {
      lines.push(
        `export type M_${entry.name}_${method.label}_accepts_baseline_arguments = Check<Extends<Parameters<NonNullable<Old.${entry.name}${method.key}>>, Parameters<NonNullable<New.${entry.name}${method.key}>>>>;`,
      );
      methods += 1;
    }
  }
  assert.ok(methods > 0, 'No method parameter checks were generated.');
  const comparison = join(consumer, 'comparison.ts');
  writeFileSync(comparison, `${lines.join('\n')}\n`);

  for (const exactOptionalPropertyTypes of [false, true]) {
    const program = ts.createProgram([comparison], {
      ...compilerOptions,
      exactOptionalPropertyTypes,
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    if (diagnostics.length > 0) {
      // Each failing check is named after its export and direction.
      const failures = diagnostics.slice(0, 50).map((diagnostic) => {
        const message = ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          ' ',
        );
        if (diagnostic.file === undefined || diagnostic.start === undefined) {
          return message;
        }
        const { line } = diagnostic.file.getLineAndCharacterOfPosition(
          diagnostic.start,
        );
        const source = diagnostic.file.text.split('\n')[line] ?? '';
        const check = /export type (\w+)/u.exec(source)?.[1] ?? source.trim();
        return `${check}: ${message}`;
      });
      throw new Error(
        `${diagnostics.length} declaration incompatibilities with ${metadata.name}@${baseline.version} (exactOptionalPropertyTypes: ${exactOptionalPropertyTypes}):\n${failures.join('\n')}`,
      );
    }
  }
  console.log(
    `Verified ${metadata.name}@${metadata.version} against the published ${baseline.version} declarations: ${exportsList.length} exports (${types} types, ${values} values) and ${methods} method parameter lists, with and without exactOptionalPropertyTypes.`,
  );
} finally {
  if (dirname(consumer) === resolve(tmpdir())) {
    rmSync(consumer, { recursive: true, force: true });
  }
}
