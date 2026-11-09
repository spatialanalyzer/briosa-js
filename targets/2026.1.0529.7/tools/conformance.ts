import { readFile, unlink, writeFile } from 'node:fs/promises';

import {
  BriosaCallAbortedError,
  BriosaCompatibilityError,
  BriosaOperationError,
  BriosaSpatialAnalyzerSdkError,
  BriosaStartupError,
  BriosaTransportError,
  createBriosaClient,
  discoverInstallations,
  cloudDisplayControl,
  getWorkingDirectory,
  type BriosaClient,
  type BriosaStartOptions,
  type ExecutionDisposition,
  type MpCompletion,
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
  if (process.env.BRIOSA_CONFORMANCE_EXPECT_INCOMPATIBLE === '1') {
    requireCondition(
      scenario === 'control-plane-only',
      'Rejection must run without SDK or application startup.',
    );
    const executablePath = process.env.BRIOSA_SERVER_PATH;
    requireCondition(
      executablePath !== undefined,
      'The conformance server path is required.',
    );
    const serverSelection = { executablePath, allowPrerelease: true };
    const report = await discoverInstallations(serverSelection);
    requireCondition(
      report.selected === null &&
        report.diagnosticCode === 'server-installation-incompatible',
      'The packaged server was not rejected for contract incompatibility.',
    );
    const rejected = createBriosaClient();
    try {
      const error = await captureError(() =>
        rejected.start({
          serverSelection,
          startSpatialAnalyzerSdk: false,
          launchSpatialAnalyzer: false,
          connectToSpatialAnalyzer: false,
        }),
      );
      requireCondition(
        error instanceof BriosaStartupError &&
          error.diagnosticCode === 'server-installation-incompatible',
        'Startup did not reject the incompatible server.',
      );
    } finally {
      await rejected.stop();
    }
    return;
  }

  const briosa = createBriosaClient({
    commandTimeoutMs: scenario === 'deadline' ? 250 : null,
  });
  let startupSucceeded = false;
  try {
    let startOptions: BriosaStartOptions = {};
    // lifecycle-cancellation drives the SDK lifecycle itself, against the
    // external fake application that the runner started.
    if (
      scenario === 'control-plane-only' ||
      scenario === 'lifecycle-cancellation'
    ) {
      startOptions = {
        startSpatialAnalyzerSdk: false,
        launchSpatialAnalyzer: false,
        connectToSpatialAnalyzer: false,
      };
    } else if (scenario === 'attach-existing') {
      startOptions = { launchSpatialAnalyzer: false };
    }

    const executablePath = process.env.BRIOSA_SERVER_PATH;
    requireCondition(
      executablePath !== undefined,
      'The conformance server path is required.',
    );
    startOptions = {
      ...startOptions,
      serverSelection: { executablePath, allowPrerelease: true },
    };

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
      case 'sdk-call-faulted':
        await assertSdkCallFaulted(briosa);
        break;
      case 'mp-partial-success':
        await assertMpPartialSuccess(briosa);
        break;
      case 'lifecycle-cancellation':
        await assertLifecycleCancellation(briosa);
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
  // This fixture also consumes retained packages that still use the old key.
  const display = { thin: 3, thinDrawIncrement: 3, pointSize: 2 };
  await cloudDisplayControl(briosa, display);
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

  // Contract major 3: the admission profile, the reviewed classification of
  // every admitted capability, and the include_denied diagnostic listing.
  requireCondition(
    snapshot.admissionProfile === 'standard',
    'The packaged admission profile is not standard.',
  );
  requireCondition(
    snapshot.policyFingerprint.length > 0,
    'Discovery reported no policy fingerprint.',
  );
  requireCondition(
    snapshot.operations.length > 0 &&
      snapshot.operations.every(
        (operation) =>
          operation.admission === 'admitted' &&
          operation.durationClass !== 'unspecified' &&
          operation.durationClass !== 'unknown' &&
          operation.validationStatus !== 'unspecified' &&
          operation.validationStatus !== 'unknown',
      ),
    'An admitted capability lacks its reviewed classification.',
  );
  const listing = await briosa.listCapabilities({ includeDenied: true });
  requireCondition(
    listing.admissionProfile === snapshot.admissionProfile &&
      listing.policyFingerprint === snapshot.policyFingerprint,
    'The diagnostic listing reported another admission policy.',
  );
  requireCondition(
    listing.operations.some(
      (operation) =>
        operation.fullyQualifiedMethod === workingDirectoryMethod &&
        operation.admission === 'deniedOverride',
    ),
    'The diagnostic listing did not report the override denial.',
  );
  requireCondition(
    !(await briosa.getServerSnapshot()).supports(workingDirectoryMethod),
    'The diagnostic listing made a denied operation callable.',
  );
}

async function assertSdkCallFaulted(briosa: BriosaClient): Promise<void> {
  const error = await captureError(() => getWorkingDirectory(briosa));
  requireCondition(
    error instanceof BriosaOperationError,
    'The SDK call fault did not expose a typed public error.',
  );
  requireCondition(
    error.kind === 'sdkCallFaulted',
    'The SDK call fault was folded into another kind.',
  );
  requireCondition(
    error.diagnosticCode === 'sdk-execute-step-faulted',
    'The SDK call fault diagnostic changed.',
  );
  requireCondition(
    error.executionDisposition === 'startedOutcomeUnknown' &&
      error.recoveryGuidance === 'none' &&
      error.replayGuidance === 'reconcileBeforeReplay',
    'The SDK call fault phase or guidance changed.',
  );
  requireCondition(
    error.mpExecution?.state === 'resultUnavailable' &&
      error.mpExecution.mpResultCode === null,
    'The SDK call fault reported an MP result.',
  );
  // A per-call SDK fault keeps the worker generation in service.
  await getWorkingDirectory(briosa);
}

async function assertMpPartialSuccess(briosa: BriosaClient): Promise<void> {
  const completions: MpCompletion[] = [];
  const onMpCompletion = (completion: MpCompletion): void => {
    completions.push(completion);
  };
  // A partial success is a success: the output is returned, and the call's
  // own completion says it was partial.
  const partial = await getWorkingDirectory(briosa, { onMpCompletion });
  const full = await getWorkingDirectory(briosa, { onMpCompletion });
  requireCondition(
    partial.length > 0 && full.length > 0,
    'A successful call returned no output.',
  );
  requireCondition(
    completions.length === 2 &&
      completions[0]?.state === 'partialSuccess' &&
      completions[0].mpResultCode === 4 &&
      completions[1]?.state === 'succeeded' &&
      completions[1].mpResultCode === 2,
    'The per-call MP completions changed.',
  );
  // Code 4 without its output: the typed failure keeps PartialSuccess.
  const error = await captureError(() =>
    getWorkingDirectory(briosa, { onMpCompletion }),
  );
  requireCondition(
    error instanceof BriosaOperationError &&
      error.kind === 'outputRetrievalFailure' &&
      error.executionDisposition === 'completed' &&
      error.replayGuidance === 'doNotReplay',
    'The output failure after a partial success changed.',
  );
  requireCondition(
    error.mpExecution?.state === 'partialSuccess' &&
      error.mpExecution.mpResultCode === 4 &&
      error.mpExecution.outputRetrievals.some(
        (retrieval) => retrieval.state === 'failed',
      ),
    'The typed failure did not keep the partial success.',
  );
  requireCondition(
    completions.length === 2,
    'A failed call reported an MP completion.',
  );
}

// #305: a lifecycle call whose caller stops waiting after the server accepted
// it continues detached. The caller sees only its own deadline, a concurrent
// Connect learns that the transition still runs, and refreshing state finds
// the same generation ready.
async function assertLifecycleCancellation(
  briosa: BriosaClient,
): Promise<void> {
  const application = await briosa.getSpatialAnalyzerState();
  requireCondition(
    application.applicationState === 'running' &&
      application.ownership === 'external' &&
      application.applicationGeneration !== null,
    'The external fake application is required.',
  );
  const started = await briosa.startSpatialAnalyzerSdk();
  const generation = started.sdkGeneration;
  requireCondition(
    generation !== null &&
      started.sdkState === 'running' &&
      started.connectionState === 'disconnected' &&
      !started.readyForMp,
    'The SDK did not start disconnected.',
  );

  // 1. The deadline ends only this caller's wait: the native abort, with no
  //    invented execution disposition and no retry.
  const interrupted = await captureError(() =>
    briosa.connectToSpatialAnalyzer({ signal: AbortSignal.timeout(1_000) }),
  );
  requireCondition(
    interrupted instanceof BriosaCallAbortedError &&
      interrupted.reason instanceof DOMException &&
      interrupted.reason.name === 'TimeoutError' &&
      !('executionDisposition' in interrupted),
    'The interrupted Connect did not report the caller deadline.',
  );

  // 2. The accepted Connect still holds the lifecycle.
  const inProgress = await captureError(() =>
    briosa.connectToSpatialAnalyzer(),
  );
  requireCondition(
    inProgress instanceof BriosaSpatialAnalyzerSdkError &&
      inProgress.kind === 'stateConflict' &&
      inProgress.diagnosticCode === 'sdk-lifecycle-transition-in-progress' &&
      inProgress.recoveryGuidance === 'refreshState' &&
      inProgress.state.sdkGeneration === generation,
    'The concurrent Connect was not rejected as a transition in progress.',
  );

  // 3. Refreshing state shows the detached Connect finish on the same
  //    generation. Only the Connect's own phases may come first.
  const ready = await waitForSdk(
    briosa,
    (state) => {
      requireCondition(
        state.sdkGeneration === generation &&
          ['connecting', 'verifying', 'ready'].includes(state.sdkState),
        'The detached Connect ended without readiness.',
      );
      return state.readyForMp;
    },
    20_000,
  );
  requireCondition(
    ready.sdkState === 'ready' &&
      ready.connectionState === 'connected' &&
      ready.executionReadinessState === 'executionReady' &&
      ready.recoveryState === 'notRequired' &&
      ready.lastIncident === null &&
      ready.applicationGeneration === application.applicationGeneration,
    'The detached Connect left the generation faulted or quarantined.',
  );

  // 4. MP work runs on that generation once discovery reports readiness.
  requireCondition(
    (await briosa.getServerSnapshot()).readyForMp,
    'The server did not report readiness after the detached Connect.',
  );
  await getWorkingDirectory(briosa);

  // 5. A clean stop leaves the external application running.
  const stopped = await briosa.stopSpatialAnalyzerSdk();
  const after = await briosa.getSpatialAnalyzerState();
  requireCondition(
    stopped.sdkState === 'stopped' &&
      !stopped.readyForMp &&
      after.applicationState === 'running' &&
      after.ownership === 'external' &&
      after.applicationGeneration === application.applicationGeneration,
    'The lifecycle shutdown was not clean.',
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
  try {
    await getWorkingDirectory(briosa);
  } catch (recoveryError) {
    if (
      !(recoveryError instanceof BriosaTransportError) ||
      recoveryError.diagnosticCode !== 'transport-deadline-exceeded'
    ) {
      throw recoveryError;
    }
    // If the initial deadline expired before worker dispatch, this call consumes
    // the one scripted delay. A final caller-initiated read verifies recovery.
    await delay(400);
    await getWorkingDirectory(briosa);
  }
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
  timeoutMs = 10_000,
): Promise<SpatialAnalyzerSdkLifecycleState> {
  const deadline = Date.now() + timeoutMs;
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
