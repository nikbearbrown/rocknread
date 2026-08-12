import { describe, it, expect } from "vitest";
import { beatTime, beatsDue, isFinished } from "@/lib/audio/scheduler";

describe("beatTime", () => {
  it("puts 120 BPM beats exactly half a second apart", () => {
    expect(beatTime(0, 120, 0)).toBe(0);
    expect(beatTime(0, 120, 1)).toBe(0.5);
    expect(beatTime(0, 120, 8)).toBe(4);
  });

  it("does not accumulate drift — beat 1000 is exact, not a running sum", () => {
    // The whole point of computing from an index rather than adding 60/bpm
    // repeatedly. A running sum at 120 BPM is off by ~1e-12 per beat; over a
    // long session that is inaudible, but the same bug at 25ms tick
    // granularity is not.
    expect(beatTime(10, 120, 1000)).toBe(510);
  });

  it("rejects a non-positive tempo instead of dividing by zero", () => {
    expect(() => beatTime(0, 0, 1)).toThrow(RangeError);
  });
});

describe("beatsDue", () => {
  const base = { startTime: 0, bpm: 120, beatsPerBar: 4, fromIndex: 0 };

  it("returns nothing when no beat has come into the window yet", () => {
    expect(beatsDue({ ...base, startTime: 5, horizon: 4.9 })).toEqual([]);
  });

  it("books every beat inside the lookahead window and no more", () => {
    const due = beatsDue({ ...base, horizon: 1.0 });
    expect(due.map((b) => b.index)).toEqual([0, 1, 2]);
    expect(due.map((b) => b.time)).toEqual([0, 0.5, 1.0]);
  });

  it("never re-books a beat already scheduled", () => {
    const first = beatsDue({ ...base, horizon: 0.6 });
    const next = beatsDue({ ...base, fromIndex: first.at(-1)!.index + 1, horizon: 1.6 });
    expect(first.map((b) => b.index)).toEqual([0, 1]);
    expect(next.map((b) => b.index)).toEqual([2, 3]);
  });

  it("accents the first beat of each bar", () => {
    const due = beatsDue({ ...base, horizon: 3 });
    expect(due.filter((b) => b.isDownbeat).map((b) => b.index)).toEqual([0, 4]);
  });

  it("stops at totalBeats, so a count-in ends where it should", () => {
    const due = beatsDue({ ...base, horizon: 100, totalBeats: 4 });
    expect(due).toHaveLength(4);
    expect(isFinished(4, 4)).toBe(true);
  });

  it("is bounded when the horizon is absurdly far away", () => {
    // A laptop waking from sleep can hand us a horizon minutes ahead. Booking
    // thousands of oscillators in one tick would freeze the tab.
    const due = beatsDue({ ...base, horizon: 1e6 });
    expect(due.length).toBeLessThanOrEqual(512);
  });

  it("treats an endless metronome as never finished", () => {
    expect(isFinished(9999, undefined)).toBe(false);
  });
});
