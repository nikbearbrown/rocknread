import { TASKS, FORM_EDITION } from "./tasks";
import type { AssessmentRecord, ResponseValue } from "./types";
import { midiToName } from "../audio/notes";

export const RESPONSE_LABEL: Record<ResponseValue, string> = {
  no: "No",
  partly: "Partly",
  yes: "Yes",
};

export function isComplete(record: AssessmentRecord): boolean {
  return TASKS.every((t) => record.responses[t.id] !== undefined);
}

export function completedCount(record: AssessmentRecord): number {
  return TASKS.filter((t) => record.responses[t.id] !== undefined).length;
}

/**
 * True when the administrator ran the assessment with something other than the
 * printed defaults. Results collected this way are still useful, but they are
 * not directly comparable to the paper instrument, and the results screen and
 * the export both say so rather than quietly pretending otherwise.
 */
export function usedNonStandardSettings(record: AssessmentRecord): boolean {
  return record.settings.bpm !== 120 || record.settings.pitchMidi !== 62;
}

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** One row per assessment — appendable, so a program can aggregate by hand. */
export function toCsv(records: AssessmentRecord[]): string {
  const header = [
    "child_name",
    "date",
    "phase",
    ...TASKS.map((t) => t.id.replace(/-/g, "_")),
    "bpm",
    "pitch",
    "non_standard_settings",
    "form_edition",
  ];
  const rows = records.map((r) => [
    r.childName,
    r.date,
    r.phase,
    ...TASKS.map((t) => (r.responses[t.id] ? RESPONSE_LABEL[r.responses[t.id]!] : "Not completed")),
    String(r.settings.bpm),
    midiToName(r.settings.pitchMidi),
    usedNonStandardSettings(r) ? "yes" : "no",
    r.formEdition,
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

export function toJson(record: AssessmentRecord): string {
  return JSON.stringify(record, null, 2);
}

/** Plain-text version, for pasting into an email or a note. */
export function toPlainText(record: AssessmentRecord): string {
  const lines = [
    "Musical Fitness Assessment",
    `Child: ${record.childName || "(not recorded)"}`,
    `Date: ${record.date}`,
    `Assessment: ${record.phase === "baseline" ? "Baseline" : "Follow-up"}`,
    "",
    ...TASKS.map((t) => {
      const r = record.responses[t.id];
      return `${t.number}. ${t.title} — ${t.question} ${r ? RESPONSE_LABEL[r] : "Not completed"}`;
    }),
    "",
    `Form: ${FORM_EDITION}`,
  ];
  if (usedNonStandardSettings(record)) {
    lines.push(
      `Note: run at ${record.settings.bpm} BPM and ${midiToName(record.settings.pitchMidi)} — ` +
        "not the standard 120 BPM / D4, so this is not directly comparable to a standard administration.",
    );
  }
  lines.push("", "This is a snapshot of current skills, not a diagnosis.");
  return lines.join("\n");
}

/** Safe filename stem: no path separators, no leading dots, never empty. */
export function exportFilename(record: AssessmentRecord, ext: string): string {
  const name = (record.childName || "assessment")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40)
    .replace(/^-+/, "");
  return `musical-fitness_${name || "assessment"}_${record.date}.${ext}`;
}
