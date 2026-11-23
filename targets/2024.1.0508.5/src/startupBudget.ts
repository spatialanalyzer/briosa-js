// The one overall startup budget of `start()`, and its adoption of the startup
// allowance that Server 0.10.1 and later publish (client-library-behavioral-
// contract.md, "Startup budget from published lifecycle bounds"). Against a
// server that publishes no allowance, such as Server 0.10.0, the budget is the
// fixed bootstrap deadline that Client 0.5.0 arms.

import type { BriosaLifecycleBounds } from './models.js';

/** The default startup budget, and the floor of one sized from an allowance. */
export const defaultStartupTimeoutMs = 120_000;

/** Server host startup, discovery, process observation, and round trips. */
export const startupMarginMs = 20_000;

/** The longest delay a Node.js timer schedules; a longer one fires at once. */
export const maximumTimerDelayMs = 2_147_483_647;

/** A monotonic clock and the timer that arms the startup deadline. */
export interface StartupClock {
  /** Monotonic milliseconds. */
  now(): number;
  setTimer(callback: () => void, delayMs: number): unknown;
  clearTimer(handle: unknown): void;
}

export const systemStartupClock: StartupClock = {
  now: () => performance.now(),
  setTimer: (callback, delayMs) => setTimeout(callback, delayMs),
  clearTimer: (handle) => {
    clearTimeout(handle as ReturnType<typeof setTimeout>);
  },
};

/** The startup phases the caller selected. */
export interface StartupPhases {
  readonly startSpatialAnalyzerSdk: boolean;
  readonly launchSpatialAnalyzer: boolean;
  readonly connectToSpatialAnalyzer: boolean;
}

/**
 * The published server allowance for the selected phases, or null when there is
 * no server phase or the selection needs an allowance that is unavailable. A
 * partial budget is never summed.
 */
export function selectStartupAllowance(
  bounds: BriosaLifecycleBounds | undefined,
  phases: StartupPhases,
): number | null {
  if (bounds === undefined) return null;
  const startSdk = phases.startSpatialAnalyzerSdk;
  const launch = phases.launchSpatialAnalyzer;
  const connect = phases.connectToSpatialAnalyzer;
  if (startSdk && launch && connect) return bounds.startupWithLaunchMs;
  if (startSdk && connect) return bounds.startupWithoutLaunchMs;
  // Connect without Start SDK is invalid and never reaches this point.
  if (connect) return null;
  if (startSdk && launch) {
    return bounds.startSdkMs === null || bounds.launchSpatialAnalyzerMs === null
      ? null
      : bounds.startSdkMs + bounds.launchSpatialAnalyzerMs;
  }
  if (startSdk) return bounds.startSdkMs;
  if (launch) return bounds.launchSpatialAnalyzerMs;
  return null;
}

/** What adopting a published allowance did to the deadline. */
export type StartupAdoption = 'kept' | 'extended' | 'expired';

/**
 * One startup's deadline. It owns the startup's single abort signal and replaces
 * only its timer when it adopts an allowance; it never restarts the startup.
 */
export class StartupBudget {
  readonly #controller = new AbortController();
  readonly #clock: StartupClock;
  readonly #startedAt: number;
  #deadline: number;
  #timer: unknown;
  #adoptable: boolean;
  #finished = false;

  constructor(timeoutMs: number, explicit: boolean, clock: StartupClock) {
    this.#clock = clock;
    // The one monotonic start instant, before host launch or discovery.
    this.#startedAt = clock.now();
    this.#deadline = this.#startedAt + timeoutMs;
    // An explicit caller timeout always wins, including an explicit 120000.
    this.#adoptable = !explicit;
    this.#timer = clock.setTimer(() => this.#expire(), timeoutMs);
  }

  get signal(): AbortSignal {
    return this.#controller.signal;
  }

  /**
   * Adopts, once, the allowance published in the first validated startup
   * snapshot. Returns `expired` when the startup was already at or past its
   * deadline; the caller then submits no further phase.
   */
  adopt(
    bounds: BriosaLifecycleBounds | undefined,
    phases: StartupPhases,
  ): StartupAdoption {
    if (!this.#adoptable) return 'kept';
    this.#adoptable = false;
    const allowance = selectStartupAllowance(bounds, phases);
    if (allowance === null) return 'kept';
    // Adoption never revives a startup that is finished or cancelled.
    if (this.#finished || this.#controller.signal.aborted) return 'kept';
    const now = this.#clock.now();
    if (now >= this.#deadline) {
      // The deadline passed before its timer ran: never extend it.
      this.#expire();
      return 'expired';
    }
    // From the start instant, so that time already spent counts.
    const deadline =
      this.#startedAt +
      Math.max(defaultStartupTimeoutMs, allowance + startupMarginMs);
    if (deadline <= now) {
      // Unreachable while the floor equals the bootstrap budget, kept so that
      // the rule holds as written.
      this.#expire();
      return 'expired';
    }
    if (deadline <= this.#deadline) return 'kept';
    const delayMs = Math.ceil(deadline - now);
    // A Node.js timer cannot be armed this far ahead; never clamp it.
    if (!(delayMs <= maximumTimerDelayMs)) return 'kept';
    this.#clock.clearTimer(this.#timer);
    this.#deadline = deadline;
    this.#timer = this.#clock.setTimer(() => this.#expire(), delayMs);
    return 'extended';
  }

  /**
   * Whether the startup has run out: its signal has aborted, or the monotonic
   * clock is at or past the deadline, in which case this ends it now, without
   * waiting for the timer callback. Called before each later startup step on
   * the published-bounds path only; Server 0.10.0 keeps Client 0.5.0's timing.
   */
  expired(): boolean {
    if (this.#controller.signal.aborted) return true;
    if (this.#finished) return false;
    if (this.#clock.now() < this.#deadline) return false;
    this.#expire();
    return true;
  }

  /** Ends the budget when startup settles; its timer never fires afterwards. */
  finish(): void {
    this.#finished = true;
    this.#clock.clearTimer(this.#timer);
  }

  #expire(): void {
    if (this.#finished) return;
    this.#clock.clearTimer(this.#timer);
    this.#controller.abort();
  }
}
