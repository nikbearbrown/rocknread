import { describe, it, expect } from "vitest";
import { midiToFrequency, midiToName, nameToMidi, D4_MIDI } from "@/lib/audio/notes";

describe("note maths", () => {
  it("puts D4 at 293.66 Hz, the pitch the paper form specifies", () => {
    expect(midiToFrequency(D4_MIDI)).toBeCloseTo(293.66, 2);
  });

  it("anchors A4 at 440", () => {
    expect(midiToFrequency(69)).toBe(440);
  });

  it("names notes back", () => {
    expect(midiToName(62)).toBe("D4");
    expect(midiToName(69)).toBe("A4");
    expect(midiToName(60)).toBe("C4");
  });

  it("round-trips names through MIDI", () => {
    for (const n of ["C4", "D4", "F#3", "A2", "B5"]) {
      expect(midiToName(nameToMidi(n)!)).toBe(n);
    }
  });

  it("reads flats", () => {
    expect(nameToMidi("Bb3")).toBe(58);
  });

  it("returns null rather than NaN for junk", () => {
    expect(nameToMidi("banana")).toBeNull();
    expect(nameToMidi("")).toBeNull();
    expect(nameToMidi("H4")).toBeNull();
  });
});
