import { spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { dirname } from 'node:path';

import { BriosaStartupError } from './errors.js';
import {
  loggingArguments,
  type BriosaLoggingOptions,
} from './loggingOptions.js';
import { resolveServerExecutable } from './serverDiscovery.js';

export interface OwnedServer {
  readonly target: string;
  readonly hasExited: boolean;
  close(): Promise<void>;
}

export interface ServerLauncher {
  launch(logging?: BriosaLoggingOptions): Promise<OwnedServer>;
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
  async launch(logging?: BriosaLoggingOptions): Promise<OwnedServer> {
    const executable = resolveServerExecutable();
    const port = await reserveLoopbackPort();
    let child: ChildProcess;
    try {
      child = spawn(
        executable,
        [
          `--Briosa:Endpoint:Port=${String(port)}`,
          ...loggingArguments(logging),
        ],
        {
          cwd: dirname(executable),
          detached: false,
          stdio: 'ignore',
          windowsHide: true,
        },
      );
    } catch (cause) {
      throw new BriosaStartupError('server-process-start-failed', { cause });
    }
    return new ChildProcessServer(`127.0.0.1:${String(port)}`, child);
  }
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
