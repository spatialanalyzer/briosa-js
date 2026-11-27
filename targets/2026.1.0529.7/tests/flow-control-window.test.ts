// The HTTP/2 flow-control window of the gRPC transport
// (https://github.com/spatialanalyzer/briosa-js/issues/55). Calls after a
// response larger than the client's window were observed to get no reply,
// consistent with a defect in ASP.NET Core 10.0.15
// (https://github.com/dotnet/aspnetcore/issues/70124). These tests check that
// only the shared constructor builds gRPC clients, that every service client is
// built with the raised window, and, against a real loopback HTTP/2 server,
// which windows the client advertises.

import assert from 'node:assert/strict';
import { once } from 'node:events';
import {
  createServer,
  type Http2Server,
  type Http2Session,
  type ServerHttp2Stream,
} from 'node:http2';
import type { AddressInfo } from 'node:net';
import { dirname, relative, resolve, sep } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  ChannelCredentials,
  Client,
  credentials,
  Metadata,
  status,
  type ChannelOptions,
  type ServiceError,
} from '@grpc/grpc-js';
import { DEFAULT_MAX_RECEIVE_MESSAGE_LENGTH } from '@grpc/grpc-js/build/src/constants.js';
import ts from 'typescript';

import { DiscoveryServiceClient } from '../src/generated/protocol/briosa/discovery.js';
import { FileOperationsClient } from '../src/generated/protocol/briosa/file_operations.js';
import {
  SpatialAnalyzerLifecycleClient,
  SpatialAnalyzerSdkLifecycleClient,
} from '../src/generated/protocol/briosa/lifecycle.js';
import {
  GrpcClientTransport,
  grpcChannelOptions,
  http2FlowControlWindowBytes,
  type OperationCodec,
} from '../src/transport.js';

const productRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const flowControlWindow = 'grpc-node.flow_control_window';
/** The window a grpc-js channel advertises without the option, as in Client 0.5.1. */
const defaultWindowBytes = 65_535;
/** The largest response message the client accepts. */
const receiveLimit =
  grpcChannelOptions['grpc.max_receive_message_length'] ??
  DEFAULT_MAX_RECEIVE_MESSAGE_LENGTH;
/** The largest accepted response on the wire: the message and its 5-byte prefix. */
const largestResponseBytes = receiveLimit + 5;
/** Ends a call to a fixture that does not answer, long before the CI job limit. */
const callTimeoutMs = 10_000;
/** Bounds each real-connection test as a whole. */
const realConnectionTest = { timeout: 60_000 };

const rawCodec: OperationCodec<Uint8Array> = {
  encode: (message) => ({ finish: () => message }),
  decode: (input) => input,
};

function callSignal(): AbortSignal {
  return AbortSignal.timeout(callTimeoutMs);
}

/** What the client had advertised when the server started a response. */
interface ObservedResponse {
  readonly path: string;
  readonly session: Http2Session;
  /** SETTINGS_INITIAL_WINDOW_SIZE from the client: each stream's window. */
  readonly streamWindow: number | undefined;
  /** What the server may still send on the connection. */
  readonly connectionWindow: number | undefined;
}

/**
 * A loopback h2c server that answers every unary gRPC call and records, as it
 * starts each response, the client's SETTINGS and the connection window left.
 */
class WindowObserver {
  readonly sessions: Http2Session[] = [];
  readonly responses: ObservedResponse[] = [];
  readonly #server: Http2Server = createServer({ maxSessionMemory: 256 });

  constructor() {
    this.#server.on('session', (session) => this.sessions.push(session));
    this.#server.on('stream', (stream: ServerHttp2Stream, headers) =>
      this.#answer(stream, String(headers[':path'])),
    );
  }

  async listen(): Promise<string> {
    this.#server.listen(0, '127.0.0.1');
    await once(this.#server, 'listening');
    return `127.0.0.1:${(this.#server.address() as AddressInfo).port}`;
  }

  close(): void {
    for (const session of this.sessions) session.destroy();
    this.#server.close();
  }

  #answer(stream: ServerHttp2Stream, path: string): void {
    // The client resets a stream whose response exceeds its receive limit.
    stream.on('error', () => undefined);
    stream.resume();
    stream.once('end', () => {
      const session = stream.session;
      if (session === undefined) return;
      this.responses.push({
        path,
        session,
        streamWindow: session.remoteSettings.initialWindowSize,
        connectionWindow: session.state.remoteWindowSize,
      });
      const message = responseMessage(path);
      const frame = Buffer.alloc(5 + message.length);
      frame.writeUInt32BE(message.length, 1);
      message.copy(frame, 5);
      stream.respond(
        { ':status': 200, 'content-type': 'application/grpc' },
        { waitForTrailers: true },
      );
      stream.once('wantTrailers', () =>
        stream.sendTrailers({ 'grpc-status': String(status.OK) }),
      );
      stream.end(frame);
    });
  }
}

// Lifecycle responses carry their state in field 1; an empty one decodes to a
// state with default values. A probe answers with as many bytes as its name.
function responseMessage(path: string): Buffer {
  const probe = /^\/briosa\.FlowControlProbe\/Bytes(\d+)$/.exec(path);
  if (probe?.[1] !== undefined) return Buffer.alloc(Number(probe[1]));
  return /^\/briosa\.SpatialAnalyzer(Sdk)?Lifecycle\//.test(path)
    ? Buffer.from([0x0a, 0x00])
    : Buffer.alloc(0);
}

function probe(transport: GrpcClientTransport, bytes: number) {
  return transport.invokeOperation(
    'FlowControlProbe',
    `Bytes${bytes}`,
    new Uint8Array(),
    rawCodec,
    rawCodec,
    callTimeoutMs,
    callSignal(),
  );
}

function serviceOf(path: string): string {
  return path.split('/')[1] ?? '';
}

/** Where hand-written production code constructs a grpc-js client or channel. */
interface ConstructionSite {
  readonly file: string;
  readonly within: string;
  readonly code: string;
}

function enclosingName(node: ts.Node): string {
  const names: string[] = [];
  for (
    let current = node.parent;
    current !== undefined;
    current = current.parent
  ) {
    if (ts.isFunctionDeclaration(current) || ts.isClassDeclaration(current)) {
      names.unshift(current.name?.text ?? '(anonymous)');
    } else if (
      ts.isMethodDeclaration(current) &&
      ts.isIdentifier(current.name)
    ) {
      names.unshift(current.name.text);
    } else if (ts.isConstructorDeclaration(current)) {
      names.unshift('constructor');
    }
  }
  return names.join('.') || '(module)';
}

/**
 * Type-checks the hand-written sources under src/ (generated code and
 * declaration files excluded) and lists every expression that constructs a
 * grpc-js client or channel:
 * - `new X(...)` whose type is a grpc-js `Client` (generated service clients
 *   included), `Channel` or `ChannelInterface`;
 * - `Reflect.construct(X, ...)`, resolved to the standard library, where a
 *   construct signature of X returns one of those types;
 * - calls that resolve, through import aliases, to grpc-js
 *   `makeClientConstructor`, `makeGenericClientConstructor` or
 *   `loadPackageDefinition`.
 * Values typed `any` are not judged. Lint also bans `Reflect.construct` in
 * src/, destructured or not.
 */
function grpcConstructionSites(): ConstructionSite[] {
  const configPath = resolve(productRoot, 'tsconfig.json');
  const config = ts.readConfigFile(configPath, (path) => ts.sys.readFile(path));
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    productRoot,
  );
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const checker = program.getTypeChecker();
  const grpcIndex = program
    .getSourceFiles()
    .find((file) =>
      file.fileName.endsWith('/@grpc/grpc-js/build/src/index.d.ts'),
    );
  assert.ok(grpcIndex, 'the grpc-js declarations are part of the program');
  const grpcModule = checker.getSymbolAtLocation(grpcIndex);
  assert.ok(grpcModule);
  const exported = (name: string): ts.Symbol => {
    const symbol = checker
      .getExportsOfModule(grpcModule)
      .find((candidate) => candidate.name === name);
    assert.ok(symbol, `grpc-js exports ${name}`);
    return symbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(symbol)
      : symbol;
  };
  const constructedTypes = ['Client', 'Channel', 'ChannelInterface'].map(
    (name) => checker.getDeclaredTypeOfSymbol(exported(name)),
  );
  const classFactories = new Set(
    [
      'makeClientConstructor',
      'makeGenericClientConstructor',
      'loadPackageDefinition',
    ].map(exported),
  );
  const resolveCallee = (expression: ts.Expression): ts.Symbol | undefined => {
    const symbol = checker.getSymbolAtLocation(expression);
    return symbol !== undefined && symbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(symbol)
      : symbol;
  };
  const isGrpcInstance = (type: ts.Type): boolean =>
    (type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) === 0 &&
    constructedTypes.some((target) => checker.isTypeAssignableTo(type, target));
  // The standard library's Reflect.construct, however it is reached.
  const isReflectConstruct = (expression: ts.Expression): boolean => {
    const declaration = resolveCallee(expression)?.declarations?.[0];
    if (
      declaration === undefined ||
      !program.isSourceFileDefaultLibrary(declaration.getSourceFile()) ||
      !ts.isFunctionDeclaration(declaration) ||
      declaration.name?.text !== 'construct'
    ) {
      return false;
    }
    const namespace = declaration.parent.parent;
    return (
      ts.isModuleDeclaration(namespace) && namespace.name.text === 'Reflect'
    );
  };

  const sites: ConstructionSite[] = [];
  const generated = resolve(productRoot, 'src', 'generated') + sep;
  for (const file of program.getSourceFiles()) {
    const path = resolve(file.fileName);
    if (file.isDeclarationFile || path.startsWith(generated)) continue;
    if (!path.startsWith(resolve(productRoot, 'src') + sep)) continue;
    const visit = (node: ts.Node): void => {
      let constructs = false;
      if (ts.isNewExpression(node)) {
        constructs = isGrpcInstance(checker.getTypeAtLocation(node));
      } else if (ts.isCallExpression(node)) {
        const callee = resolveCallee(node.expression);
        const constructed = node.arguments[0];
        if (callee !== undefined && classFactories.has(callee)) {
          constructs = true;
        } else if (
          constructed !== undefined &&
          isReflectConstruct(node.expression)
        ) {
          // Judge the class it is given: one Reflect.construct overload
          // returns any.
          constructs = checker
            .getTypeAtLocation(constructed)
            .getConstructSignatures()
            .some((signature) =>
              isGrpcInstance(checker.getReturnTypeOfSignature(signature)),
            );
        }
      }
      if (constructs) {
        sites.push({
          file: relative(productRoot, path).split(sep).join('/'),
          within: enclosingName(node),
          code: node.getText(file),
        });
      }
      ts.forEachChild(node, visit);
    };
    visit(file);
  }
  return sites;
}

void test('hand-written code constructs gRPC clients and channels only in the shared constructor', () => {
  // A client built anywhere else, for example `new Client(target,
  // credentials)` in the transport, would not get the raised window.
  // newServiceClient supplies grpcChannelOptions itself.
  assert.deepEqual(grpcConstructionSites(), [
    {
      file: 'src/transport.ts',
      within: 'newServiceClient',
      code: 'new clientClass(target, channelCredentials, grpcChannelOptions)',
    },
  ]);
});

void test('the window holds the largest response the client accepts', () => {
  // The transport sets no receive limit, so the grpc-js default applies.
  assert.equal(
    grpcChannelOptions['grpc.max_receive_message_length'],
    undefined,
  );
  assert.equal(receiveLimit, 4 * 1024 * 1024);
  assert.equal(http2FlowControlWindowBytes, 16 * 1024 * 1024);
  assert.equal(
    grpcChannelOptions[flowControlWindow],
    http2FlowControlWindowBytes,
  );
  assert.ok(Object.isFrozen(grpcChannelOptions));
  // Each stream starts with the whole window. The connection can start a
  // response with just over half of it free, because Node.js returns
  // connection window once half of it has been used.
  assert.ok(
    Math.floor(http2FlowControlWindowBytes / 2) + 1 >= largestResponseBytes,
  );
  // HTTP/2 caps a window at 2^31 - 1 bytes; Node.js rejects a larger setting.
  assert.ok(http2FlowControlWindowBytes <= 2 ** 31 - 1);
});

void test('every service client is constructed with the raised window', () => {
  const built: {
    readonly clientClass: unknown;
    readonly target: unknown;
    readonly channelCredentials: unknown;
    readonly options: unknown;
    readonly argumentCount: number;
  }[] = [];
  // The proxy records the arguments of the real `new` in newServiceClient.
  const transport = new GrpcClientTransport(
    '127.0.0.1:1',
    (clientClass) =>
      new Proxy(clientClass, {
        construct(constructor, args: unknown[], newTarget) {
          const [target, channelCredentials, options] = args;
          built.push({
            clientClass,
            target,
            channelCredentials,
            options,
            argumentCount: args.length,
          });
          return Reflect.construct(constructor, args, newTarget) as object;
        },
      }),
  );
  transport.close();

  assert.deepEqual(
    built.map(({ clientClass }) => clientClass),
    [
      DiscoveryServiceClient,
      SpatialAnalyzerLifecycleClient,
      SpatialAnalyzerSdkLifecycleClient,
      FileOperationsClient,
      Client,
    ],
  );
  for (const construction of built) {
    assert.equal(construction.argumentCount, 3);
    assert.equal(construction.target, '127.0.0.1:1');
    // The frozen options object itself, as newServiceClient passes it.
    assert.equal(construction.options, grpcChannelOptions);
    assert.equal(
      (construction.options as ChannelOptions)[flowControlWindow],
      http2FlowControlWindowBytes,
    );
    // One credentials object and one options object keep the five clients on
    // one shared connection.
    assert.ok(construction.channelCredentials instanceof ChannelCredentials);
    assert.equal(construction.channelCredentials, built[0]?.channelCredentials);
  }
});

void test(
  'every channel advertises the raised stream and connection window on a real HTTP/2 connection',
  realConnectionTest,
  async () => {
    const observer = new WindowObserver();
    const transport = new GrpcClientTransport(await observer.listen());
    try {
      // Every transport method, so every service client makes a call.
      await transport.getServerSnapshot(callSignal());
      await transport.listCapabilities(true, callSignal());
      await transport.getApplicationState(callSignal());
      await transport.launchApplication({}, callSignal());
      await transport.closeApplication(1, callSignal());
      await transport.getSdkState(callSignal());
      await transport.startSdk(callSignal());
      await transport.connectSdk(1, false, callSignal());
      await transport.connectSdk(1, true, callSignal());
      await transport.stopSdk(1, callSignal());
      await transport.recoverSdk(1, callSignal());
      await transport.getWorkingDirectory(callTimeoutMs, callSignal());
      assert.equal((await probe(transport, receiveLimit)).length, receiveLimit);
    } finally {
      transport.close();
      observer.close();
    }

    assert.deepEqual(
      [
        ...new Set(observer.responses.map(({ path }) => serviceOf(path))),
      ].sort(),
      [
        'briosa.DiscoveryService',
        'briosa.FileOperations',
        'briosa.FlowControlProbe',
        'briosa.SpatialAnalyzerLifecycle',
        'briosa.SpatialAnalyzerSdkLifecycle',
      ],
    );
    assert.equal(observer.responses.length, 14);
    // A client built without the option would have opened its own connection.
    assert.equal(observer.sessions.length, 1);
    // grpc-js raised the connection window before its first request.
    assert.equal(
      observer.responses[0]?.connectionWindow,
      http2FlowControlWindowBytes,
    );
    for (const response of observer.responses) {
      assert.equal(response.session, observer.sessions[0], response.path);
      assert.equal(
        response.streamWindow,
        http2FlowControlWindowBytes,
        response.path,
      );
      assert.ok(
        (response.connectionWindow ?? 0) >= largestResponseBytes,
        `${response.path}: connection window ${response.connectionWindow}`,
      );
    }
  },
);

void test(
  'the observer sees the 65,535-byte default of a channel built without the option',
  realConnectionTest,
  async () => {
    const observer = new WindowObserver();
    // Client 0.5.1 built its clients this way.
    const client = new Client(
      await observer.listen(),
      credentials.createInsecure(),
    );
    try {
      await new Promise<void>((resolve, reject) => {
        client.makeUnaryRequest(
          '/briosa.DiscoveryService/GetServerInfo',
          (value: Buffer) => value,
          (value: Buffer) => value,
          Buffer.alloc(0),
          new Metadata(),
          { deadline: new Date(Date.now() + callTimeoutMs) },
          (error) => (error === null ? resolve() : reject(error)),
        );
      });
    } finally {
      client.close();
      observer.close();
    }

    assert.equal(observer.responses.length, 1);
    assert.equal(observer.responses[0]?.streamWindow, defaultWindowBytes);
    assert.equal(observer.responses[0]?.connectionWindow, defaultWindowBytes);
  },
);

void test(
  'the largest accepted response never waits for window credit, call after call',
  realConnectionTest,
  async () => {
    const observer = new WindowObserver();
    const transport = new GrpcClientTransport(await observer.listen());
    try {
      for (let call = 0; call < 6; call += 1) {
        assert.equal(
          (await probe(transport, receiveLimit)).length,
          receiveLimit,
        );
      }
      // One byte more is beyond the receive limit, which confirms the limit.
      await assert.rejects(
        probe(transport, receiveLimit + 1),
        (error: ServiceError) => error.code === status.RESOURCE_EXHAUSTED,
      );
    } finally {
      transport.close();
      observer.close();
    }

    assert.equal(observer.sessions.length, 1);
    assert.equal(observer.responses.length, 7);
    for (const response of observer.responses) {
      assert.ok((response.streamWindow ?? 0) >= largestResponseBytes);
      assert.ok(
        (response.connectionWindow ?? 0) >= largestResponseBytes,
        `connection window ${response.connectionWindow}`,
      );
    }
  },
);
