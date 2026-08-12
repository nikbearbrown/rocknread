"use client";

import { useState } from "react";
import type { TaskDefinition } from "@/lib/assessment/types";
import { TWINKLE_BEATS } from "@/lib/assessment/tasks";

export function TaskInstructions({ task }: { task: TaskDefinition }) {
  const [showAdapted, setShowAdapted] = useState(false);
  const adapted = task.steps.filter((s) => s.adaptedFrom);

  return (
    <section>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted">
        Task {task.number} of 5
      </p>
      <h2 className="mt-1 font-serif text-2xl">{task.title}</h2>

      <ol className="mt-4 space-y-3">
        {task.steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-[1.02rem] leading-relaxed">
            <span
              aria-hidden="true"
              className="mt-[0.15rem] flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand"
            >
              {i + 1}
            </span>
            <span>{step.text}</span>
          </li>
        ))}
      </ol>

      {task.id === "keep-the-beat-with-a-song" ? <BeatLyrics /> : null}

      {adapted.length ? (
        <div className="mt-4 text-sm">
          <button
            type="button"
            onClick={() => setShowAdapted((v) => !v)}
            className="text-muted underline underline-offset-4 hover:text-ink"
          >
            {showAdapted ? "Hide" : "How this differs from the paper form"}
          </button>
          {showAdapted ? (
            <ul className="mt-2 space-y-1 border-l-2 border-line pl-3 text-muted">
              {adapted.map((s, i) => (
                <li key={i}>
                  Paper form: &ldquo;{s.adaptedFrom}&rdquo; &mdash; replaced by the control on this
                  screen. The task itself is unchanged.
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

/**
 * The lyric with the beat-bearing syllables underlined, as on the paper form.
 * Each underlined chunk is one beat — that marking IS the instruction, so it
 * has to survive the move to a screen rather than collapsing into plain text.
 */
function BeatLyrics() {
  return (
    <div className="mt-5 rounded-2xl border border-line bg-white p-5">
      <p className="text-sm font-semibold">Pat once per underline</p>
      <p className="mt-3 font-serif text-xl leading-[2.4]">
        {TWINKLE_BEATS.map((chunk, i) => (
          // Each beat is one unbroken chunk — a line break inside "won-der"
          // would show two underlines where the form shows one beat.
          <span key={i} className="mr-2 inline-block whitespace-nowrap border-b-2 border-accent pb-1">
            {chunk}
          </span>
        ))}
      </p>
      <p className="mt-4 text-sm text-muted">
        Eight beats, slower than the metronome tempo. Sing it together first, then ask the child to
        sing it alone while patting.
      </p>
    </div>
  );
}
