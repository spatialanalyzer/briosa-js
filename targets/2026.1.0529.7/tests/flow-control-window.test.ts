// The HTTP/2 flow-control window of the gRPC transport
// (https://github.com/spatialanalyzer/briosa-js/issues/55). When a response is
// larger than the window the client advertises, ASP.NET Core 10.0.15 can skip
// the next response on the connection
// (https://github.com/dotnet/aspnetcore/issues/70124). These tests check that
// every service client is built with the raised window, and, against a real
// loopback HTTP/2 server, which windows the client advertises.

import assert from 'node:assert/strict';
import { once } from 'node:events';
import {
  createServer,
  type Http2Server,
  type Http2Session,
  type ServerHttp2Stream,
} from 'node:http2';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';

import {
  Client,
  credentials,
  Metadata,
  status,
  type ChannelCredentials,
  type ChannelOptions,
  type ServiceError,
} from '@grpc/grpc-js';
import { DEFAULT_MAX_RECEIVE_MESSAGE_LENGTH } from '@grpc/grpc-js/build/src/constants.js';

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

const flowControlWindow = 'grpc-node.flow_control_window';
/** The window a grpc-js channel advertises without the option, as in Client 0.5.1. */
const defaultWindowBytes = 65_535;
/** The largest response message the client accepts. */
const receiveLimit =
  grpcChannelOptions['grpc.max_receive_message_length'] ??
  DEFAULT_MAX_RECEIVE_MESSAGE_LENGTH;
/** The largest accepted response on the wire: the message and its 5-byte prefix. */
const largestResponseBytes = receiveLimit + 5;

const rawCodec: OperationCodec<Uint8Array> = {
  encode: (message) => ({ finish: () => message }),
  decode: (input) => input,
};

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
    null,
  );
}

function serviceOf(path: string): string {
  return path.split('/')[1] ?? '';
}

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
    readonly target: string;
    readonly channelCredentials: ChannelCredentials;
    readonly options: Readonly<ChannelOptions>;
  }[] = [];
  const transport = new GrpcClientTransport(
    '127.0.0.1:1',
    (clientClass, target, channelCredentials, options) => {
      built.push({ clientClass, target, channelCredentials, options });
      return new clientClass(target, channelCredentials, options);
    },
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
    assert.equal(construction.target, '127.0.0.1:1');
    assert.equal(construction.options, grpcChannelOptions);
    assert.equal(
      construction.options[flowControlWindow],
      http2FlowControlWindowBytes,
    );
    // One credentials object and one options object keep the five clients on
    // one shared connection.
    assert.equal(construction.channelCredentials, built[0]?.channelCredentials);
  }
});

void test('every channel advertises the raised stream and connection window on a real HTTP/2 connection', async () => {
  const observer = new WindowObserver();
  const transport = new GrpcClientTransport(await observer.listen());
  try {
    // Every transport method, so every service client makes a call.
    await transport.getServerSnapshot();
    await transport.listCapabilities(true);
    await transport.getApplicationState();
    await transport.launchApplication({});
    await transport.closeApplication(1);
    await transport.getSdkState();
    await transport.startSdk();
    await transport.connectSdk(1, false);
    await transport.connectSdk(1, true);
    await transport.stopSdk(1);
    await transport.recoverSdk(1);
    await transport.getWorkingDirectory(null);
    assert.equal((await probe(transport, receiveLimit)).length, receiveLimit);
  } finally {
    transport.close();
    observer.close();
  }

  assert.deepEqual(
    [...new Set(observer.responses.map(({ path }) => serviceOf(path)))].sort(),
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
});

void test('the observer sees the 65,535-byte default of a channel built without the option', async () => {
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
        {},
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
});

void test('the largest accepted response never waits for window credit, call after call', async () => {
  const observer = new WindowObserver();
  const transport = new GrpcClientTransport(await observer.listen());
  try {
    for (let call = 0; call < 6; call += 1) {
      assert.equal((await probe(transport, receiveLimit)).length, receiveLimit);
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
});
