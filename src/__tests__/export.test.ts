import { describe, it, expect } from "vitest";
import {
  completedCount,
  exportFilename,
  isComplete,
  toCsv,
  toPlainText,
  usedNonStandardSettings,
} from "@/lib/assessment/export";
import type { AssessmentRecord } from "@/lib/assessment/types";

const full = (): AssessmentRecord => ({
  childName: "A.K.",
  date: "2026-08-12",
  phase: "baseline",
  responses: {
    "keep-the-beat": "yes",
    "keep-the-beat-with-a-song": "partly",
    "clap-the-rhythm": "yes",
    "match-a-pitch": "no",
    "sing-in-tune": "partly",
  },
  settings: { bpm: 120, pitchMidi: 62 },
  formEdition: "6th edition 2025",
});

describe("completion", () => {
  it("counts recorded responses", () => {
    expect(completedCount(full())).toBe(5);
    expect(isComplete(full())).toBe(true);
  });

  it("does not call a partial assessment complete", () => {
    const r = full();
    delete r.responses["sing-in-tune"];
    expect(isComplete(r)).toBe(false);
    expect(completedCount(r)).toBe(4);
  });
});

describe("non-standard settings", () => {
  it("is quiet at the printed defaults", () => {
    expect(usedNonStandardSettings(full())).toBe(false);
  });

  it("flags a changed tempo or pitch", () => {
    expect(usedNonStandardSettings({ ...full(), settings: { bpm: 100, pitchMidi: 62 } })).toBe(true);
    expect(usedNonStandardSettings({ ...full(), settings: { bpm: 120, pitchMidi: 60 } })).toBe(true);
  });
});

describe("CSV", () => {
  it("writes a header and one row per assessment", () => {
    const lines = toCsv([full(), full()]).split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain("child_name");
    expect(lines[0]).toContain("match_a_pitch");
  });

  it("marks missing responses rather than leaving a blank cell", () => {
    const r = full();
    delete r.responses["clap-the-rhythm"];
    expect(toCsv([r])).toContain("Not completed");
  });

  it("escapes a name containing a comma or a quote", () => {
    const r = { ...full(), childName: 'Smith, "Bo"' };
    const row = toCsv([r]).split("\n")[1];
    expect(row.startsWith('"Smith, ""Bo"""')).toBe(true);
  });
});

describe("plain text", () => {
  it("always carries the not-a-diagnosis line", () => {
    expect(toPlainText(full())).toContain("not a diagnosis");
  });

  it("explains itself when settings were changed", () => {
    const text = toPlainText({ ...full(), settings: { bpm: 90, pitchMidi: 60 } });
    expect(text).toContain("90 BPM");
    expect(text).toContain("C4");
  });
});

describe("export filenames", () => {
  it("builds a readable name", () => {
    expect(exportFilename(full(), "csv")).toBe("musical-fitness_AK_2026-08-12.csv");
  });

  it("never emits a path separator, however odd the name", () => {
    const name = exportFilename({ ...full(), childName: "../../etc/passwd" }, "json");
    expect(name).not.toContain("/");
    expect(name).not.toContain("..");
  });

  it("falls back when the name is empty or entirely stripped", () => {
    expect(exportFilename({ ...full(), childName: "" }, "csv")).toContain("assessment");
    expect(exportFilename({ ...full(), childName: "***" }, "csv")).toContain("assessment");
  });
});
