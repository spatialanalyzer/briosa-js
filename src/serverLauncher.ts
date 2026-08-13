import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createServer } from 'node:net';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BriosaStartupError } from './errors.js';
import { briosaProtocolIdentity } from './generated/protocolIdentity.js';

export interface OwnedServer {
  readonly target: string;
  readonly hasExited: boolean;
  close(): Promise<void>;
}

export interface ServerLauncher {
  launch(): Promise<OwnedServer>;
}

class ChildProcessServer implements OwnedServer {
  readonly #process: ChildProcess;

  constructor(
    readonly target: string,
    process: ChildProcess,
  ) {
    this.#process = process;
  }

  get hasExited(): boolean {
    return this.#process.exitCode !== null || this.#process.signalCode !== null;
  }

  async close(): Promise<void> {
    if (this.hasExited) return;
    await new Promise<void>((resolvePromise) => {
      this.#process.once('exit', () => resolvePromise());
      this.#process.kill();
    });
  }
}

export class LocalServerLauncher implements ServerLauncher {
  async launch(): Promise<OwnedServer> {
    const executable = resolveServerExecutable();
    const port = await reserveLoopbackPort();
    let child: ChildProcess;
    try {
      child = spawn(executable, [`--Briosa:Endpoint:Port=${String(port)}`], {
        cwd: dirname(executable),
        detached: false,
        stdio: 'ignore',
        windowsHide: true,
      });
    } catch (cause) {
      throw new BriosaStartupError('server-process-start-failed', { cause });
    }
    return new ChildProcessServer(`127.0.0.1:${String(port)}`, child);
  }
}

function resolveServerExecutable(): string {
  const moduleDirectory = dirname(fileURLToPath(import.meta.url));
  const localAppData =
    process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local');
  const candidates = [
    process.env.BRIOSA_SERVER_PATH,
    join(moduleDirectory, 'briosa-server', 'Briosa.Server.exe'),
    join(
      localAppData,
      'Briosa',
      'servers',
      briosaProtocolIdentity.briosaVersion,
      `sa-${briosaProtocolIdentity.spatialAnalyzerTarget}`,
      'Briosa.Server.exe',
    ),
  ];
  for (const candidate of candidates) {
    if (
      candidate !== undefined &&
      candidate.toLowerCase().endsWith('briosa.server.exe') &&
      existsSync(candidate)
    ) {
      return resolve(candidate);
    }
  }
  throw new BriosaStartupError('server-distribution-not-found');
}

async function reserveLoopbackPort(): Promise<number> {
  const server = createServer();
  return await new Promise<number>((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (address === null || typeof address === 'string') {
        server.close();
        reject(new BriosaStartupError('loopback-port-unavailable'));
        return;
      }
      const { port } = address;
      server.close((error) => {
        if (error === undefined) resolvePromise(port);
        else reject(error);
      });
    });
  });
}
