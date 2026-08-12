"use client";

import { TASKS, FORM_EDITION } from "@/lib/assessment/tasks";
import type { AssessmentRecord } from "@/lib/assessment/types";
import {
  RESPONSE_LABEL,
  exportFilename,
  isComplete,
  toCsv,
  toJson,
  toPlainText,
  usedNonStandardSettings,
} from "@/lib/assessment/export";
import { midiToName } from "@/lib/audio/notes";
import { Button } from "./Buttons";

function download(contents: string, filename: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ResultsSummary({
  record,
  onRestart,
  onBackToTask,
}: {
  record: AssessmentRecord;
  onRestart: () => void;
  onBackToTask: (index: number) => void;
}) {
  const complete = isComplete(record);

  return (
    <section>
      <h2 className="font-serif text-2xl">Results</h2>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-[0.95rem]">
        <div>
          <dt className="text-muted">Child</dt>
          <dd className="font-semibold">{record.childName || "Not recorded"}</dd>
        </div>
        <div>
          <dt className="text-muted">Date</dt>
          <dd className="font-semibold">{record.date}</dd>
        </div>
        <div>
          <dt className="text-muted">Assessment</dt>
          <dd className="font-semibold">{record.phase === "baseline" ? "Baseline" : "Follow-up"}</dd>
        </div>
        <div>
          <dt className="text-muted">Settings</dt>
          <dd className="font-semibold">
            {record.settings.bpm} BPM &middot; {midiToName(record.settings.pitchMidi)}
          </dd>
        </div>
      </dl>

      <ul className="mt-6 divide-y divide-line border-y border-line">
        {TASKS.map((task, i) => {
          const value = record.responses[task.id];
          return (
            <li key={task.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="font-semibold">
                  {task.number}. {task.title}
                </p>
                <p className="text-sm text-muted">{task.question}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                    value === "yes"
                      ? "bg-[#eef7f1] text-yes"
                      : value === "partly"
                        ? "bg-[#fdf6e8] text-partly"
                        : value === "no"
                          ? "bg-[#fdf1ee] text-no"
                          : "bg-[#f2f1ec] text-muted"
                  }`}
                >
                  {value ? RESPONSE_LABEL[value] : "Not completed"}
                </span>
                <button
                  type="button"
                  onClick={() => onBackToTask(i)}
                  className="no-print text-sm text-brand underline underline-offset-4"
                >
                  Change
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {usedNonStandardSettings(record) ? (
        <p className="mt-5 rounded-xl bg-[#fdf6e8] px-4 py-3 text-sm text-partly">
          This assessment was run at {record.settings.bpm} BPM and{" "}
          {midiToName(record.settings.pitchMidi)}, not the standard 120 BPM and D4. The results are
          still meaningful for this child, but they are not directly comparable to a standard
          administration.
        </p>
      ) : null}

      <p className="mt-5 rounded-xl bg-[#f2f1ec] px-4 py-3 text-sm leading-relaxed">
        <strong>This is a snapshot of current skills, not a diagnosis.</strong>{" "}
        Musical fitness
        develops with practice and exposure. A &ldquo;No&rdquo; today describes what a child could do
        in one session on one day &mdash; nothing more.
      </p>

      {!complete ? (
        <p className="no-print mt-4 text-sm text-partly">
          Some tasks have no response yet. You can still print or export &mdash; they will be marked
          &ldquo;Not completed&rdquo;.
        </p>
      ) : null}

      <div className="no-print mt-6 flex flex-wrap gap-3">
        <Button onClick={() => window.print()}>Print or save as PDF</Button>
        <Button
          variant="secondary"
          onClick={() => download(toCsv([record]), exportFilename(record, "csv"), "text/csv")}
        >
          Download CSV
        </Button>
        <Button
          variant="secondary"
          onClick={() => download(toJson(record), exportFilename(record, "json"), "application/json")}
        >
          Download JSON
        </Button>
        <Button variant="secondary" onClick={() => void navigator.clipboard?.writeText(toPlainText(record))}>
          Copy as text
        </Button>
      </div>

      <div className="no-print mt-8 border-t border-line pt-5">
        <Button variant="ghost" onClick={onRestart}>
          Start a new assessment
        </Button>
        <p className="mt-2 text-sm text-muted">
          This clears the current results from the browser. Export or print first if you need them.
        </p>
      </div>

      <p className="mt-8 text-right text-xs text-muted">{FORM_EDITION}</p>
    </section>
  );
}
