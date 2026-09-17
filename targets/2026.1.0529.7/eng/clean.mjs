import { rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(repositoryRoot, 'dist');
if (
  !output.startsWith(`${repositoryRoot}\\`) &&
  !output.startsWith(`${repositoryRoot}/`)
) {
  throw new Error('Build output escaped the repository.');
}

rmSync(output, { force: true, recursive: true });
