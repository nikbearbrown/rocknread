"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Shell, Masthead } from "@/components/Shell";
import { Button } from "@/components/Buttons";
import { SoundCheck } from "@/components/SoundCheck";
import { TaskInstructions } from "@/components/TaskInstructions";
import { MetronomeControl } from "@/components/MetronomeControl";
import { ToneControl } from "@/components/ToneControl";
import { ResponseButtons } from "@/components/ResponseButtons";
import { ResultsSummary } from "@/components/ResultsSummary";
import { TASKS, ASSESSMENT_NOTE, SUBTITLE, FORM_EDITION } from "@/lib/assessment/tasks";
import type { AssessmentRecord, AssessmentPhase, ResponseValue } from "@/lib/assessment/types";
import { clearSession, loadSession, saveSession, todayIso } from "@/lib/assessment/session";
import { completedCount } from "@/lib/assessment/export";
import { D4_MIDI, midiToName, nameToMidi } from "@/lib/audio/notes";

type Screen = "start" | "soundCheck" | "task" | "results";

const DEFAULT_BPM = 120;

/** The stored value never changes underneath us, so there is nothing to subscribe to. */
const subscribeNever = () => () => {};

function emptyRecord(): AssessmentRecord {
  return {
    childName: "",
    date: todayIso(),
    phase: "baseline",
    responses: {},
    settings: { bpm: DEFAULT_BPM, pitchMidi: D4_MIDI },
    formEdition: FORM_EDITION,
  };
}

/**
 * The whole assessment is one screen with a state machine rather than five
 * routes. That is deliberate: with no per-task URL there is no way to deep-link
 * into Task 4 with an empty record, which removes a whole class of broken
 * states instead of defending against them. (See C3 edge case 2.)
 */
export default function Page() {
  const [screen, setScreen] = useState<Screen>("start");
  const [taskIndex, setTaskIndex] = useState(0);
  const [record, setRecord] = useState<AssessmentRecord>(emptyRecord);
  // Bumped whenever stored state is cleared, to force the resume check below
  // to look again.
  const [storageNonce, setStorageNonce] = useState(0);

  // sessionStorage does not exist during server rendering, so the first paint
  // must match the server's empty output and the real read happens after
  // hydration. useSyncExternalStore expresses that without a setState in an
  // effect, which would cost an extra render on every load.
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false);

  const resumable = useMemo(() => {
    void storageNonce;
    if (!hydrated || screen !== "start") return null;
    const saved = loadSession();
    return saved && completedCount(saved) > 0 ? saved : null;
  }, [hydrated, screen, storageNonce]);

  useEffect(() => {
    if (hydrated && screen !== "start") saveSession(record);
  }, [record, screen, hydrated]);

  const task = TASKS[taskIndex];
  const answered = record.responses[task?.id ?? ""] !== undefined;
  const done = completedCount(record);

  const setResponse = useCallback(
    (value: ResponseValue) => {
      setRecord((r) => ({ ...r, responses: { ...r.responses, [task.id]: value } }));
    },
    [task],
  );

  const restart = useCallback(() => {
    clearSession();
    setStorageNonce((n) => n + 1);
    setRecord(emptyRecord());
    setTaskIndex(0);
    setScreen("start");
  }, []);

  if (!hydrated) return null;

  return (
    <Shell>
      <Masthead subtitle={screen === "start" ? SUBTITLE : undefined} />

      {screen === "start" ? (
        <StartScreen
          record={record}
          setRecord={setRecord}
          resumable={resumable}
          onResume={() => {
            if (!resumable) return;
            setRecord(resumable);
            const firstUnanswered = TASKS.findIndex((t) => resumable.responses[t.id] === undefined);
            setTaskIndex(firstUnanswered === -1 ? TASKS.length - 1 : firstUnanswered);
            setScreen("task");
          }}
          onDiscardResume={() => {
            clearSession();
            setStorageNonce((n) => n + 1);
          }}
          onBegin={() => setScreen("soundCheck")}
        />
      ) : null}

      {screen === "soundCheck" ? (
        <>
          <SoundCheck onReady={() => setScreen("task")} />
          <div className="mt-5">
            <Button variant="ghost" onClick={() => setScreen("start")}>
              Back
            </Button>
          </div>
        </>
      ) : null}

      {screen === "task" && task ? (
        <>
          <Progress current={taskIndex} total={TASKS.length} answered={done} />

          <TaskInstructions task={task} />

          {task.tool === "metronome" ? (
            <div className="mt-6">
              <MetronomeControl bpm={record.settings.bpm} />
            </div>
          ) : null}
          {task.tool === "tone" ? (
            <div className="mt-6">
              <ToneControl midi={record.settings.pitchMidi} />
            </div>
          ) : null}

          <div className="mt-6">
            <ResponseButtons
              question={task.question}
              scale={task.scale}
              value={record.responses[task.id]}
              onChange={setResponse}
            />
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              onClick={() => (taskIndex === 0 ? setScreen("start") : setTaskIndex((i) => i - 1))}
            >
              Back
            </Button>
            <Button
              onClick={() =>
                taskIndex === TASKS.length - 1 ? setScreen("results") : setTaskIndex((i) => i + 1)
              }
              disabled={!answered}
            >
              {taskIndex === TASKS.length - 1 ? "See results" : "Next task"}
            </Button>
          </div>
          {!answered ? (
            <p className="mt-3 text-right text-sm text-muted">
              Record a response to continue. You can change it later.
            </p>
          ) : null}
        </>
      ) : null}

      {screen === "results" ? (
        <ResultsSummary
          record={record}
          onRestart={restart}
          onBackToTask={(i) => {
            setTaskIndex(i);
            setScreen("task");
          }}
        />
      ) : null}
    </Shell>
  );
}

function Progress({ current, total, answered }: { current: number; total: number; answered: number }) {
  return (
    <div className="mb-6">
      <div className="flex gap-1.5" role="presentation">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < answered ? "bg-brand" : i === current ? "bg-brand/40" : "bg-line"
            }`}
          />
        ))}
      </div>
      <p className="sr-only">
        Task {current + 1} of {total}. {answered} recorded.
      </p>
    </div>
  );
}

function StartScreen({
  record,
  setRecord,
  resumable,
  onResume,
  onDiscardResume,
  onBegin,
}: {
  record: AssessmentRecord;
  setRecord: React.Dispatch<React.SetStateAction<AssessmentRecord>>;
  resumable: AssessmentRecord | null;
  onResume: () => void;
  onDiscardResume: () => void;
  onBegin: () => void;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const pitchLabel = useMemo(() => midiToName(record.settings.pitchMidi), [record.settings.pitchMidi]);
  const nonStandard = record.settings.bpm !== DEFAULT_BPM || record.settings.pitchMidi !== D4_MIDI;

  return (
    <section>
      {resumable ? (
        <div className="mb-6 rounded-2xl border border-brand/30 bg-[#eff4fa] p-4">
          <p className="text-sm font-semibold">You have an assessment in progress</p>
          <p className="mt-1 text-sm text-muted">
            {resumable.childName || "Unnamed"} &middot; {resumable.date} &middot;{" "}
            {completedCount(resumable)} of {TASKS.length} tasks recorded.
          </p>
          <div className="mt-3 flex gap-3">
            <Button onClick={onResume}>Continue</Button>
            <Button variant="secondary" onClick={onDiscardResume}>
              Discard
            </Button>
          </div>
        </div>
      ) : null}

      <p className="rounded-2xl bg-[#f2f1ec] px-4 py-3 text-[0.95rem] italic leading-relaxed">
        {ASSESSMENT_NOTE}
      </p>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold">Child&rsquo;s name</span>
          <input
            type="text"
            value={record.childName}
            onChange={(e) => setRecord((r) => ({ ...r, childName: e.target.value }))}
            placeholder="Optional"
            autoComplete="off"
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-base
              focus:border-brand focus:outline-none"
          />
          <span className="mt-1.5 block text-sm text-muted">
            Initials or a program ID work just as well. Nothing you type is sent anywhere.
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Date</span>
          <input
            type="date"
            value={record.date}
            onChange={(e) => setRecord((r) => ({ ...r, date: e.target.value }))}
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-base
              focus:border-brand focus:outline-none"
          />
        </label>

        <fieldset>
          <legend className="text-sm font-semibold">Which assessment is this?</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-3">
            {(["baseline", "followUp"] as AssessmentPhase[]).map((phase) => (
              <button
                key={phase}
                type="button"
                aria-pressed={record.phase === phase}
                onClick={() => setRecord((r) => ({ ...r, phase }))}
                className={`min-h-[3rem] rounded-xl border-2 font-semibold transition ${
                  record.phase === phase
                    ? "border-brand bg-[#eff4fa] text-brand"
                    : "border-line bg-white text-muted hover:border-ink/25"
                }`}
              >
                {phase === "baseline" ? "Baseline" : "Follow-up"}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="text-sm text-muted underline underline-offset-4 hover:text-ink"
        >
          {showAdvanced ? "Hide settings" : "Tempo and pitch settings"}
        </button>

        {showAdvanced ? (
          <div className="mt-3 rounded-2xl border border-line bg-white p-5">
            <p className="text-sm leading-relaxed text-muted">
              The printed assessment specifies 120 BPM and D4. Changing them is sometimes right for a
              particular child, but the results are then not comparable to a standard administration
              &mdash; so the change is recorded alongside the results.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold">Tempo (BPM)</span>
                <input
                  type="number"
                  min={40}
                  max={220}
                  value={record.settings.bpm}
                  onChange={(e) =>
                    setRecord((r) => ({
                      ...r,
                      settings: {
                        ...r.settings,
                        bpm: Math.min(220, Math.max(40, Number(e.target.value) || DEFAULT_BPM)),
                      },
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Pitch</span>
                <input
                  type="text"
                  defaultValue={pitchLabel}
                  onBlur={(e) => {
                    const midi = nameToMidi(e.target.value);
                    if (midi !== null) {
                      setRecord((r) => ({ ...r, settings: { ...r.settings, pitchMidi: midi } }));
                    } else {
                      e.target.value = pitchLabel;
                    }
                  }}
                  className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5"
                />
                <span className="mt-1 block text-sm text-muted">Note name, e.g. D4, C4, F#3.</span>
              </label>
            </div>
            {nonStandard ? (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#fdf6e8] px-4 py-3">
                <p className="text-sm text-partly">Non-standard settings will be noted on results.</p>
                <button
                  type="button"
                  onClick={() =>
                    setRecord((r) => ({ ...r, settings: { bpm: DEFAULT_BPM, pitchMidi: D4_MIDI } }))
                  }
                  className="shrink-0 text-sm font-semibold text-brand underline underline-offset-4"
                >
                  Reset
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        <Button onClick={onBegin} className="w-full sm:w-auto">
          Begin assessment
        </Button>
      </div>

      <p className="mt-8 border-t border-line pt-5 text-sm leading-relaxed text-muted">
        <strong className="text-ink">Nothing leaves this device.</strong>{" "}
        There is no account, no
        server and no recording. Responses live in this browser tab only and are gone when you close
        it &mdash; print or export before you do. Takes about ten minutes.
      </p>
      <p className="mt-4 text-right text-xs text-muted">{FORM_EDITION}</p>
    </section>
  );
}
