import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BriosaStartupError } from './errors.js';
import { briosaProtocolIdentity as identity } from './generated/protocolIdentity.js';
import {
  installationId,
  noLinks,
  object,
  parseMetadata,
  readInstallation,
  textField,
} from './installationMetadata.js';
import {
  localPath,
  normalizeSelection,
  pathKey,
  type BriosaDiscoveryDiagnostic,
  type BriosaDiscoveryReport,
  type BriosaInstallation,
  type BriosaServerSelection,
  type InstallationScope,
} from './installationModels.js';
import { legacyVersion, selectInstallation } from './installationPolicy.js';
import {
  isProtectedInstallation,
  readWindowsRegistrations,
} from './windowsDiscovery.js';

// Internal injection keeps portable tests independent of the native Registry.
export interface DiscoveryPlatform {
  readonly platform: string;
  readonly moduleDirectory: string;
  readonly localAppData: string;
  readonly commonAppData: string;
  readonly environmentOverride: string | undefined;
  readRegistry(): Promise<Record<string, unknown>>;
  isProtected(path: string): Promise<boolean>;
}
const defaultPlatform: DiscoveryPlatform = {
  platform: process.platform,
  moduleDirectory: dirname(fileURLToPath(import.meta.url)),
  get localAppData() {
    return process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local');
  },
  get commonAppData() {
    return process.env.PROGRAMDATA ?? '';
  },
  get environmentOverride() {
    return process.env.BRIOSA_SERVER_PATH;
  },
  readRegistry: readWindowsRegistrations,
  isProtected: isProtectedInstallation,
};
/** Enumerates local installation evidence without launching Briosa, the SDK, or SA. */
export async function discoverWithPlatform(
  selection: BriosaServerSelection = {},
  platform: DiscoveryPlatform = defaultPlatform,
): Promise<BriosaDiscoveryReport> {
  const options = normalizeSelection(selection);
  if (platform.platform !== 'win32')
    return {
      installations: [],
      diagnostics: [],
      selected: null,
      diagnosticCode: 'server-platform-unsupported',
    };
  let explicit = options.executablePath;
  if (
    explicit === undefined &&
    options.installationId === undefined &&
    options.useLegacyEnvironmentOverride
  )
    explicit = platform.environmentOverride;
  if (explicit !== undefined) {
    try {
      const candidate = readInstallation(explicit, 'portable');
      return {
        installations: [candidate],
        diagnostics: [],
        ...selectInstallation([candidate], {
          ...options,
          executablePath: explicit,
        }),
      };
    } catch {
      return {
        installations: [],
        diagnostics: [{ path: explicit, code: 'server-installation-invalid' }],
        selected: null,
        diagnosticCode: 'server-installation-invalid',
      };
    }
  }
  const candidates: BriosaInstallation[] = [],
    diagnostics: BriosaDiscoveryDiagnostic[] = [];
  let registry: Record<string, unknown>;
  try {
    registry = await platform.readRegistry();
  } catch {
    return {
      installations: [],
      diagnostics: [
        { path: 'Registry64', code: 'server-registration-unavailable' },
      ],
      selected: null,
      diagnosticCode: 'server-registration-unavailable',
    };
  }
  const elevated = registry.elevated === true;
  async function add(
    path: string,
    scope: InstallationScope,
    hint?: Record<string, unknown>,
  ): Promise<void> {
    if (
      !(options.allowedScopes ?? []).includes(scope) ||
      (elevated && scope !== 'machine')
    )
      return;
    try {
      const candidate = readInstallation(path, scope);
      if (
        hint !== undefined &&
        (hint.installationId !== candidate.installationId ||
          hint.serverVersion !== candidate.version ||
          hint.spatialAnalyzerTarget !== candidate.spatialAnalyzerTarget ||
          hint.runtimeIdentifier !== candidate.runtimeIdentifier ||
          hint.packageId !==
            'briosa-' +
              candidate.version +
              '-sa-' +
              candidate.spatialAnalyzerTarget +
              '-' +
              candidate.runtimeIdentifier)
      )
        throw new Error('Registration mismatch.');
      if (elevated && !(await platform.isProtected(path))) {
        diagnostics.push({ path, code: 'server-installation-unprotected' });
        return;
      }
      if (
        !candidates.some(
          (c) =>
            pathKey(c.executablePath) === pathKey(candidate.executablePath),
        )
      )
        candidates.push(candidate);
    } catch {
      diagnostics.push({ path, code: 'server-installation-invalid' });
    }
  }
  for (const raw of Array.isArray(registry.diagnostics)
    ? registry.diagnostics
    : []) {
    const d = object(raw);
    diagnostics.push({
      path: textField(d, 'path'),
      code: textField(d, 'code'),
    });
  }
  for (const raw of Array.isArray(registry.registrations)
    ? registry.registrations
    : []) {
    try {
      const entry = object(raw),
        scope = textField(entry, 'scope');
      if (scope !== 'user' && scope !== 'machine')
        throw new Error('Invalid scope.');
      const registration = textField(entry, 'registration');
      if (registration.length > 32768)
        throw new Error('Registration size limit.');
      const hint = parseMetadata(registration),
        directory = textField(hint, 'productDirectory');
      if (
        hint.schemaVersion !== 1 ||
        !localPath(directory) ||
        entry.id !== hint.installationId ||
        hint.installationId !== installationId(directory)
      )
        throw new Error('Registration mismatch.');
      await add(join(directory, 'payload', 'Briosa.Server.exe'), scope, hint);
    } catch {
      diagnostics.push({
        path: 'Registry64',
        code: 'server-registration-invalid',
      });
    }
  }
  const roots: [string, InstallationScope][] = [
    [join(platform.localAppData, 'Briosa', 'Packages'), 'user'],
    ...(platform.commonAppData
      ? [
          [join(platform.commonAppData, 'Briosa', 'Packages'), 'machine'] as [
            string,
            InstallationScope,
          ],
        ]
      : []),
    ...(options.searchRoots ?? []).map(
      (path) => [path, 'portable'] as [string, InstallationScope],
    ),
  ];
  for (const [root, scope] of roots) {
    if (
      !localPath(root) ||
      !(options.allowedScopes ?? []).includes(scope) ||
      (elevated && scope !== 'machine')
    )
      continue;
    try {
      noLinks(root);
      const products = join(root, 'products');
      if (!existsSync(products)) continue;
      noLinks(products);
      for (const product of readdirSync(products, {
        withFileTypes: true,
      }).slice(0, 1000))
        if (product.isDirectory())
          await add(
            join(products, product.name, 'payload', 'Briosa.Server.exe'),
            scope,
          );
    } catch {
      diagnostics.push({ path: root, code: 'server-store-unavailable' });
    }
  }
  if (!elevated)
    for (const path of [
      join(platform.moduleDirectory, 'briosa-server', 'Briosa.Server.exe'),
      join(
        platform.localAppData,
        'Briosa',
        'servers',
        legacyVersion,
        'sa-' + identity.spatialAnalyzerTarget,
        'Briosa.Server.exe',
      ),
    ])
      if (existsSync(path)) await add(path, 'portable');
  const result = selectInstallation(candidates, options);
  for (const candidate of candidates) {
    const { diagnosticCode } = selectInstallation([candidate], options);
    if (diagnosticCode)
      diagnostics.push({
        path: candidate.executablePath,
        code: diagnosticCode,
      });
  }
  if (!candidates.length && diagnostics.length)
    result.diagnosticCode = 'server-installation-invalid';
  return {
    installations: Object.freeze(candidates),
    diagnostics: Object.freeze(diagnostics),
    ...result,
  };
}
export async function resolveInstallation(
  selection: BriosaServerSelection = {},
): Promise<BriosaInstallation> {
  const report = await discoverInstallations(selection);
  if (report.selected === null)
    throw new BriosaStartupError(
      report.diagnosticCode ?? 'server-distribution-not-found',
    );
  return report.selected;
}

export async function discoverInstallations(
  selection: BriosaServerSelection = {},
): Promise<BriosaDiscoveryReport> {
  return await discoverWithPlatform(selection, defaultPlatform);
}
