import { spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { dirname } from 'node:path';

import { BriosaStartupError } from './errors.js';
import {
  loggingArguments,
  type BriosaLoggingOptions,
} from './loggingOptions.js';
import { resolveInstallation } from './serverDiscovery.js';
import { readInstallation } from './installationMetadata.js';
import {
  normalizeSelection,
  type BriosaInstallation,
  type BriosaServerSelection,
} from './installationModels.js';

export interface OwnedServer {
  readonly installation?: BriosaInstallation;
  readonly target: string;
  readonly hasExited: boolean;
  close(): Promise<void>;
}

export interface ServerLauncher {
  launch(
    logging?: BriosaLoggingOptions,
    selection?: BriosaServerSelection,
  ): Promise<OwnedServer>;
}

class ChildProcessServer implements OwnedServer {
  readonly #process: ChildProcess;

  constructor(
    readonly target: string,
    process: ChildProcess,
    readonly installation: BriosaInstallation,
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
  async launch(
    logging?: BriosaLoggingOptions,
    selection?: BriosaServerSelection,
  ): Promise<OwnedServer> {
    const options = normalizeSelection(selection);
    const installation = await resolveInstallation(options);
    const executable = installation.executablePath;
    const port = await reserveLoopbackPort();
    let child: ChildProcess;
    try {
      if (
        JSON.stringify(readInstallation(executable, installation.scope)) !==
        JSON.stringify(installation)
      )
        throw new BriosaStartupError('server-installation-changed');
      child = spawn(
        executable,
        [
          `--Briosa:Endpoint:Port=${String(port)}`,
          ...loggingArguments(logging),
          ...(options.spatialAnalyzerExecutablePath === undefined
            ? []
            : [
                '--Briosa:SpatialAnalyzer:ExecutablePath=' +
                  options.spatialAnalyzerExecutablePath,
              ]),
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
    await new Promise<void>((resolve, reject) => {
      child.once('error', (cause) =>
        reject(
          new BriosaStartupError('server-process-start-failed', { cause }),
        ),
      );
      child.once('spawn', resolve);
    });
    return new ChildProcessServer(
      `127.0.0.1:${String(port)}`,
      child,
      installation,
    );
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
