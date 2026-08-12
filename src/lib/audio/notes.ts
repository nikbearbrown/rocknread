/**
 * Note / frequency maths.
 *
 * Adapted from guitarboard (github.com/gaurav-bakale/guitarboard), MIT licensed.
 * See THIRD-PARTY.md.
 *
 * Why this file exists at all, rather than a hardcoded 293.66 somewhere:
 * the paper assessment specifies "D (D4 if using a tone generator)". Storing
 * the *note* (MIDI 62) rather than the *frequency* means an administrator who
 * transposes for a child with a lower voice still gets a musically correct
 * pitch, and the results can record which note was actually used.
 */

export const NOTE_NAMES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

/** MIDI note number for D4 — the pitch the paper form specifies. */
export const D4_MIDI = 62;

/** A4 = 440 Hz = MIDI 69. */
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function midiToName(midi: number): string {
  const rounded = Math.round(midi);
  const name = NOTE_NAMES[((rounded % 12) + 12) % 12];
  const octave = Math.floor(rounded / 12) - 1;
  return `${name}${octave}`;
}

/** Parse "D4", "F#3", "Bb2" into a MIDI number. Returns null if unparseable. */
export function nameToMidi(input: string): number | null {
  const m = /^([A-Ga-g])([#b]?)(-?\d+)$/.exec(input.trim());
  if (!m) return null;
  const base: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const semitone = base[m[1].toUpperCase()];
  const accidental = m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0;
  const octave = parseInt(m[3], 10);
  return (octave + 1) * 12 + semitone + accidental;
}
