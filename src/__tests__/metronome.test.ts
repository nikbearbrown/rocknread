import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Proves the claim the whole instrument rests on: the click lands on an exact
 * grid even when the JavaScript timer driving it is late.
 *
 * A fake AudioContext records the time every click is *scheduled for*. We then
 * run the lookahead loop with deliberately uneven, sometimes very late, timer
 * ticks — the behaviour of a real browser under load or on a cheap tablet —
 * and check that the scheduled times are still perfectly spaced.
 */

interface StartedOsc {
  at: number;
  frequency: number;
}

const started: StartedOsc[] = [];
let now = 0;

const fakeCtx = {
  get currentTime() {
    return now;
  },
  state: "running" as AudioContextState,
  createOscillator() {
    const osc = {
      type: "square",
      frequency: { value: 0 },
      connect: () => {},
      start(at: number) {
        started.push({ at, frequency: osc.frequency.value });
      },
      stop: () => {},
    };
    return osc;
  },
  createGain() {
    return {
      gain: {
        value: 0,
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
        cancelScheduledValues: () => {},
      },
      connect: () => {},
    };
  },
};

vi.mock("@/lib/audio/context", () => ({
  getAudioContext: () => fakeCtx,
  ensureAudioReady: async () => true,
}));

const { Metronome } = await import("@/lib/audio/metronome");

/** Advance both the audio clock and the JS timers by the same amount. */
function advance(seconds: number) {
  now += seconds;
  vi.advanceTimersByTime(Math.round(seconds * 1000));
}

beforeEach(() => {
  started.length = 0;
  now = 0;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Metronome", () => {
  it("schedules 120 BPM clicks exactly half a second apart", () => {
    const m = new Metronome({ bpm: 120 });
    m.start();
    for (let i = 0; i < 200; i++) advance(0.025); // 5 seconds of normal ticks
    m.stop();

    expect(started.length).toBeGreaterThan(8);
    for (let i = 1; i < started.length; i++) {
      expect(started[i].at - started[i - 1].at).toBeCloseTo(0.5, 9);
    }
  });

  it("does not drift when the JavaScript timer stalls", () => {
    // This is the case a setInterval-based metronome fails: the main thread
    // blocks for 300ms (a re-render, a garbage collection, a slow tablet),
    // then several beats are booked at once. Their times must still be on the
    // original grid, not shifted by however long the stall was.
    const m = new Metronome({ bpm: 120 });
    m.start();
    advance(0.05);
    advance(0.3); // stall
    advance(0.025);
    advance(0.45); // another stall
    for (let i = 0; i < 100; i++) advance(0.025);
    m.stop();

    for (let i = 1; i < started.length; i++) {
      expect(started[i].at - started[i - 1].at).toBeCloseTo(0.5, 9);
    }
  });

  it("accents every fourth beat with a higher click", () => {
    const m = new Metronome({ bpm: 120, beatsPerBar: 4 });
    m.start();
    for (let i = 0; i < 200; i++) advance(0.025);
    m.stop();

    const accents = started.map((s) => s.frequency === 1600);
    expect(accents.slice(0, 8)).toEqual([true, false, false, false, true, false, false, false]);
  });

  it("stops itself after a fixed count-in", () => {
    const onFinished = vi.fn();
    const m = new Metronome({ bpm: 120, totalBeats: 4, onFinished });
    m.start();
    for (let i = 0; i < 200; i++) advance(0.025);

    expect(started).toHaveLength(4);
    expect(m.isRunning).toBe(false);
    expect(onFinished).toHaveBeenCalledTimes(1);
  });

  it("ignores a second start() — double-tapping cannot stack two click tracks", () => {
    const m = new Metronome({ bpm: 120 });
    m.start();
    m.start();
    m.start();
    for (let i = 0; i < 80; i++) advance(0.025);
    m.stop();

    const times = started.map((s) => s.at);
    expect(new Set(times).size).toBe(times.length); // no duplicated beats
  });

  it("books the first beat in the future, never in the past", () => {
    now = 12.34;
    const m = new Metronome({ bpm: 120 });
    m.start();
    advance(0.025);
    m.stop();
    expect(started[0].at).toBeGreaterThan(12.34);
  });

  it("schedules nothing more once stopped", () => {
    const m = new Metronome({ bpm: 120 });
    m.start();
    for (let i = 0; i < 40; i++) advance(0.025);
    const countAtStop = started.length;
    m.stop();
    for (let i = 0; i < 200; i++) advance(0.025);
    expect(started).toHaveLength(countAtStop);
  });
});
