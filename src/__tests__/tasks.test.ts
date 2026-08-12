import { describe, it, expect } from "vitest";
import { TASKS, TWINKLE_BEATS, taskById } from "@/lib/assessment/tasks";

/**
 * These are fidelity tests, not logic tests. They exist so that a future
 * contributor who "tidies up" the assessment breaks a build instead of
 * silently invalidating everyone's data.
 */
describe("assessment fidelity", () => {
  it("has the five tasks in the order printed on the form", () => {
    expect(TASKS.map((t) => t.title)).toEqual([
      "Keep the Beat",
      "Keep the Beat with a Song",
      "Clap the Rhythm",
      "Match a Pitch",
      "Sing in Tune",
    ]);
  });

  it("keeps Match a Pitch on the two-point scale used by the paper form", () => {
    expect(taskById("match-a-pitch")!.scale).toEqual(["no", "yes"]);
  });

  it("keeps every other task on the three-point scale", () => {
    for (const t of TASKS.filter((t) => t.id !== "match-a-pitch")) {
      expect(t.scale).toEqual(["no", "partly", "yes"]);
    }
  });

  it("marks Twinkle with the eight beats underlined on the form", () => {
    expect(TWINKLE_BEATS).toHaveLength(8);
    expect(TWINKLE_BEATS[0]).toBe("Twin-kle,");
    expect(TWINKLE_BEATS.at(-1)).toBe("are.");
  });

  it("labels every departure from the paper form", () => {
    // Only the two steps that replace an external app may differ.
    const adapted = TASKS.flatMap((t) => t.steps.filter((s) => s.adaptedFrom));
    expect(adapted).toHaveLength(2);
  });

  it("uses unique ids, since responses are keyed by them", () => {
    expect(new Set(TASKS.map((t) => t.id)).size).toBe(TASKS.length);
  });
});
