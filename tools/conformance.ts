import { readFile, unlink, writeFile } from 'node:fs/promises';

import {
  BriosaCallAbortedError,
  BriosaCompatibilityError,
  BriosaOperationError,
  BriosaTransportError,
  createBriosaClient,
  getWorkingDirectory,
  type BriosaClient,
  type BriosaStartOptions,
  type ExecutionDisposition,
  type OperationFailureKind,
  type SpatialAnalyzerSdkLifecycleState,
} from '../src/index.js';

const contractId = 'briosa.first-party-client.v1';
const workingDirectoryMethod = '/briosa.FileOperations/GetWorkingDirectory';

function requireCondition(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new Error(message);
}

function argument(name: string): string {
  const index = process.argv.indexOf(name);
  const value = index < 0 ? undefined : process.argv[index + 1];
  requireCondition(value !== undefined, `${name} is required.`);
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function captureError(
  operation: () => Promise<unknown>,
): Promise<unknown> {
  try {
    await operation();
  } catch (error) {
    return error;
  }
  throw new Error('Expected the operation to fail.');
}

async function runScenario(scenario: string): Promise<void> {
  const briosa = createBriosaClient({
    commandTimeoutMs: scenario === 'deadline' ? 150 : null,
  });
  let startupSucceeded = false;
  try {
    let startOptions: BriosaStartOptions = {};
    if (scenario === 'control-plane-only') {
      startOptions = {
        startSpatialAnalyzerSdk: false,
        launchSpatialAnalyzer: false,
        connectToSpatialAnalyzer: false,
      };
    } else if (scenario === 'attach-existing') {
      startOptions = { launchSpatialAnalyzer: false };
    }

    if (scenario === 'identity-mismatch') {
      const error = await captureError(() => briosa.start(startOptions));
      requireCondition(
        error instanceof BriosaCompatibilityError,
        'Identity mismatch did not map to the compatibility error.',
      );
      await cleanupApplication(briosa);
      return;
    }

    await briosa.start(startOptions);
    startupSucceeded = true;

    switch (scenario) {
      case 'control-plane-only':
        await assertControlPlaneOnly(briosa);
        break;
      case 'default-ready':
        await assertDefaultReady(briosa);
        break;
      case 'attach-existing':
        await assertAttachExisting(briosa);
        break;
      case 'capability-denied':
        await assertCapabilityDenied(briosa);
        break;
      case 'mp-failure':
        await assertOperationFailure(briosa, 'mpFailure', 'completed');
        break;
      case 'output-failure':
        await assertOperationFailure(
          briosa,
          'outputRetrievalFailure',
          'completed',
        );
        break;
      case 'deadline':
        await assertDeadline(briosa);
        break;
      case 'cancellation':
        await assertCancellation(briosa);
        break;
      case 'watchdog-recovery':
        await assertWatchdogRecovery(briosa);
        break;
      case 'sdk-loss-recovery':
        await assertSdkLossRecovery(briosa);
        break;
      case 'owned-cleanup':
        await assertDefaultReady(briosa);
        break;
      default:
        throw new Error(`Unsupported conformance scenario '${scenario}'.`);
    }

    await cleanupApplication(briosa);
  } finally {
    if (startupSucceeded || scenario === 'identity-mismatch') {
      await briosa.stop();
    }
  }
}

async function assertControlPlaneOnly(briosa: BriosaClient): Promise<void> {
  const snapshot = await briosa.getServerSnapshot();
  const sdk = await briosa.getSpatialAnalyzerSdkState();
  const application = await briosa.getSpatialAnalyzerState();
  requireCondition(!snapshot.readyForMp, 'An inert server reported readiness.');
  requireCondition(sdk.sdkState === 'stopped', 'The SDK started implicitly.');
  requireCondition(
    application.applicationState === 'notRunning',
    'SpatialAnalyzer started implicitly.',
  );
}

async function assertDefaultReady(briosa: BriosaClient): Promise<void> {
  const snapshot = await briosa.getServerSnapshot();
  const sdk = await briosa.getSpatialAnalyzerSdkState();
  const application = await briosa.getSpatialAnalyzerState();
  requireCondition(
    snapshot.readyForMp,
    'Default startup did not establish readiness.',
  );
  requireCondition(
    snapshot.supports(workingDirectoryMethod),
    'The expected operation is absent.',
  );
  requireCondition(
    sdk.sdkState === 'ready' && sdk.readyForMp,
    'The SDK is not ready after default startup.',
  );
  requireCondition(
    application.ownership === 'serverLaunched',
    'Default startup did not launch an owned application.',
  );
  await getWorkingDirectory(briosa);
}

async function assertAttachExisting(briosa: BriosaClient): Promise<void> {
  const application = await briosa.getSpatialAnalyzerState();
  const sdk = await briosa.getSpatialAnalyzerSdkState();
  requireCondition(
    application.ownership === 'external',
    'The pre-existing application was incorrectly claimed as owned.',
  );
  requireCondition(
    sdk.readyForMp,
    'Attach-existing did not establish readiness.',
  );
}

async function assertCapabilityDenied(briosa: BriosaClient): Promise<void> {
  const snapshot = await briosa.getServerSnapshot();
  requireCondition(
    !snapshot.supports(workingDirectoryMethod),
    'A policy-denied operation remained advertised.',
  );
  const error = await captureError(() => getWorkingDirectory(briosa));
  requireCondition(
    error instanceof BriosaOperationError,
    'Policy denial did not map to the public error.',
  );
  requireCondition(error.kind === 'policyDenied', 'The failure kind changed.');
  requireCondition(
    error.executionDisposition === 'notStarted',
    'Policy denial reported an invalid execution disposition.',
  );
}

async function assertOperationFailure(
  briosa: BriosaClient,
  expectedKind: OperationFailureKind,
  expectedDisposition: ExecutionDisposition,
): Promise<void> {
  const error = await captureError(() => getWorkingDirectory(briosa));
  requireCondition(
    error instanceof BriosaOperationError,
    'The operation did not expose a typed public error.',
  );
  requireCondition(error.kind === expectedKind, 'The failure kind changed.');
  requireCondition(
    error.executionDisposition === expectedDisposition,
    'The execution disposition changed.',
  );
  requireCondition(
    error.operationId === 'file_operations.get_working_directory',
    'The operation identity changed.',
  );
}

async function assertDeadline(briosa: BriosaClient): Promise<void> {
  const error = await captureError(() => getWorkingDirectory(briosa));
  requireCondition(
    error instanceof BriosaTransportError,
    'The deadline did not remain a transport outcome.',
  );
  requireCondition(
    error.diagnosticCode === 'transport-deadline-exceeded',
    'The deadline diagnostic changed.',
  );
  await delay(400);
  await getWorkingDirectory(briosa);
}

async function assertCancellation(briosa: BriosaClient): Promise<void> {
  const controller = new AbortController();
  const operation = getWorkingDirectory(briosa, { signal: controller.signal });
  setTimeout(() => controller.abort(), 50);
  const error = await captureError(() => operation);
  requireCondition(
    error instanceof BriosaCallAbortedError,
    'Caller cancellation did not map to the abort error.',
  );
  await getWorkingDirectory(briosa);
}

async function assertWatchdogRecovery(briosa: BriosaClient): Promise<void> {
  const error = await captureError(() => getWorkingDirectory(briosa));
  requireCondition(
    error instanceof BriosaOperationError,
    'The watchdog did not expose a typed operation error.',
  );
  requireCondition(
    error.kind === 'workerWatchdogTimeout',
    'The watchdog failure kind changed.',
  );
  requireCondition(
    error.executionDisposition === 'startedOutcomeUnknown',
    'The watchdog outcome was not preserved as ambiguous.',
  );
  requireCondition(
    error.recoveryGuidance === 'workerReplacement',
    'The watchdog recovery guidance changed.',
  );
  requireCondition(
    error.replayGuidance === 'mayReplay' && error.replaySafety === 'safe',
    'The operation-specific replay guidance changed.',
  );
  const faulted = await waitForSdk(
    briosa,
    (state) => state.sdkState === 'faulted',
  );
  requireCondition(
    faulted.lastIncident?.terminationKind === 'watchdogTerminated',
    'The watchdog incident was not retained.',
  );
  await recoverAndReconnect(briosa);
}

async function assertSdkLossRecovery(briosa: BriosaClient): Promise<void> {
  const signalPath = process.env.BRIOSA_CONFORMANCE_WORKER_EXIT_SIGNAL_PATH;
  requireCondition(
    signalPath !== undefined,
    'The shared host did not provide a worker-loss signal.',
  );
  await writeFile(signalPath, 'exit', 'utf8');
  const faulted = await waitForSdk(
    briosa,
    (state) => state.sdkState === 'faulted',
  );
  requireCondition(
    faulted.lastIncident?.terminationKind === 'workerProcessExited',
    'Unexpected worker loss was not diagnosed.',
  );
  await unlink(signalPath);
  await recoverAndReconnect(briosa);
}

async function recoverAndReconnect(briosa: BriosaClient): Promise<void> {
  const recovered = await briosa.recoverSpatialAnalyzerSdk(
    'replaceWithoutReplay',
  );
  requireCondition(
    recovered.sdkState === 'running' &&
      recovered.connectionState === 'disconnected',
    'SDK replacement did not create a disconnected generation.',
  );
  const connected = await briosa.connectToSpatialAnalyzer();
  requireCondition(
    connected.readyForMp,
    'The replacement SDK did not restore readiness.',
  );
  await getWorkingDirectory(briosa);
}

async function waitForSdk(
  briosa: BriosaClient,
  predicate: (state: SpatialAnalyzerSdkLifecycleState) => boolean,
): Promise<SpatialAnalyzerSdkLifecycleState> {
  const deadline = Date.now() + 10_000;
  while (true) {
    if (Date.now() >= deadline)
      throw new Error('Timed out waiting for the SDK.');
    const state = await briosa.getSpatialAnalyzerSdkState();
    if (predicate(state)) return state;
    await delay(50);
  }
}

async function cleanupApplication(briosa: BriosaClient): Promise<void> {
  const sdk = await briosa.getSpatialAnalyzerSdkState();
  if (sdk.sdkGeneration !== null && sdk.sdkState !== 'stopped') {
    await briosa.stopSpatialAnalyzerSdk();
  }
  const application = await briosa.getSpatialAnalyzerState();
  if (
    application.ownership === 'serverLaunched' &&
    application.applicationGeneration !== null &&
    application.applicationState !== 'exited' &&
    application.applicationState !== 'notRunning'
  ) {
    await briosa.closeOwnedSpatialAnalyzer();
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolvePromise) =>
    setTimeout(resolvePromise, milliseconds),
  );
}

const scenario = argument('--scenario');
const contractPath = argument('--contract');
const parsedContract = JSON.parse(
  await readFile(contractPath, 'utf8'),
) as unknown;
requireCondition(
  isRecord(parsedContract),
  'The conformance contract is invalid.',
);
requireCondition(
  parsedContract.contract_id === contractId,
  'The fixture received an unsupported conformance contract.',
);
const scenarios = parsedContract.scenarios;
requireCondition(
  Array.isArray(scenarios),
  'The scenario collection is invalid.',
);
requireCondition(
  scenarios.some((item: unknown) => isRecord(item) && item.id === scenario),
  'The requested scenario is absent from the conformance contract.',
);

await runScenario(scenario);
process.stdout.write(
  `${JSON.stringify({
    schema_version: 1,
    contract_id: contractId,
    scenario,
    success: true,
  })}\n`,
);
