import { win32 } from 'node:path';

export type BriosaLogLevel =
  'Trace' | 'Debug' | 'Information' | 'Warning' | 'Error' | 'Critical' | 'None';

/** Startup-only server overrides. Omitted fields preserve server configuration. */
export interface BriosaLoggingOptions {
  readonly minimumLevel?: BriosaLogLevel;
  readonly categoryLevels?: Readonly<Record<string, BriosaLogLevel>>;
  readonly consoleEnabled?: boolean;
  readonly fileEnabled?: boolean;
  readonly fileDirectory?: string;
  readonly maxFileSizeMiB?: number;
  readonly retainedFileCount?: number;
  readonly maxAgeDays?: number;
  readonly maxTotalSizeMiB?: number;
}

const levels = new Set([
  'Trace',
  'Debug',
  'Information',
  'Warning',
  'Error',
  'Critical',
  'None',
]);

/** @internal Produces argument-list entries, never shell command text. */
export function loggingArguments(options: BriosaLoggingOptions = {}): string[] {
  const invalid = () => {
    throw new TypeError('Invalid server logging options.');
  };
  if (options.minimumLevel !== undefined && !levels.has(options.minimumLevel))
    invalid();
  for (const [category, level] of Object.entries(
    options.categoryLevels ?? {},
  )) {
    if (!/^[A-Za-z0-9_.]{1,256}$/u.test(category) || !levels.has(level))
      invalid();
  }
  for (const value of [options.consoleEnabled, options.fileEnabled]) {
    if (value !== undefined && typeof value !== 'boolean') invalid();
  }
  if (
    options.fileDirectory !== undefined &&
    (!win32.isAbsolute(options.fileDirectory) ||
      win32.parse(options.fileDirectory).root.length <= 1 ||
      [...options.fileDirectory].some((c) => c.charCodeAt(0) < 32))
  )
    invalid();
  for (const [value, max] of [
    [options.maxFileSizeMiB, 1024],
    [options.retainedFileCount, 1000],
    [options.maxAgeDays, 365],
    [options.maxTotalSizeMiB, 10240],
  ] as const) {
    if (
      value !== undefined &&
      (!Number.isInteger(value) || value < 1 || value > max)
    )
      invalid();
  }
  if (
    options.maxTotalSizeMiB !== undefined &&
    options.maxFileSizeMiB !== undefined &&
    options.maxTotalSizeMiB < options.maxFileSizeMiB
  )
    invalid();
  const args: string[] = [];
  const add = (key: string, value: string | number | boolean | undefined) => {
    if (value !== undefined) args.push('--' + key + '=' + String(value));
  };
  add('Logging:LogLevel:Default', options.minimumLevel);
  for (const [category, level] of Object.entries(options.categoryLevels ?? {}))
    add('Logging:LogLevel:' + category, level);
  add('Briosa:Logging:ConsoleEnabled', options.consoleEnabled);
  add('Briosa:Logging:File:Enabled', options.fileEnabled);
  add('Briosa:Logging:File:Directory', options.fileDirectory);
  add('Briosa:Logging:File:MaxFileSizeMiB', options.maxFileSizeMiB);
  add('Briosa:Logging:File:RetainedFileCount', options.retainedFileCount);
  add('Briosa:Logging:File:MaxAgeDays', options.maxAgeDays);
  add('Briosa:Logging:File:MaxTotalSizeMiB', options.maxTotalSizeMiB);
  return args;
}
