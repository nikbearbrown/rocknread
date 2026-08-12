"use client";

import { useMetronome } from "@/hooks/useMetronome";
import { Button } from "./Buttons";

/**
 * The metronome as the administrator sees it: one big start/stop button, a
 * visible beat pulse, and the tempo stated in words.
 *
 * The pulse is not decoration. The assessment is often run in a noisy room
 * with a child who is not looking at the screen; the administrator needs to
 * confirm at a glance that the click is really running, and a deaf or
 * hard-of-hearing administrator needs it to run the task at all.
 */
export function MetronomeControl({ bpm }: { bpm: number }) {
  const { isRunning, beat, blocked, start, stop, beatsPerBar } = useMetronome({ bpm });
  const beatInBar = beat < 0 ? -1 : beat % beatsPerBar;

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Metronome</p>
          <p className="text-sm text-muted">{bpm} beats per minute</p>
        </div>
        <Button onClick={() => (isRunning ? stop() : void start())} aria-pressed={isRunning}>
          {isRunning ? "Stop" : "Start metronome"}
        </Button>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3" aria-hidden="true">
        {Array.from({ length: beatsPerBar }, (_, i) => {
          const active = beatInBar === i;
          return (
            <span key={i} className="relative flex h-6 w-6 items-center justify-center">
              <span
                className={`h-4 w-4 rounded-full transition-colors ${
                  active ? (i === 0 ? "bg-accent" : "bg-brand") : "bg-line"
                }`}
              />
              {active ? (
                <span
                  key={beat}
                  className={`beat-ring absolute inset-0 rounded-full ${
                    i === 0 ? "bg-accent/40" : "bg-brand/40"
                  }`}
                />
              ) : null}
            </span>
          );
        })}
      </div>
      <p className="sr-only" aria-live="off">
        {isRunning ? "Metronome running" : "Metronome stopped"}
      </p>

      {blocked ? (
        <p className="mt-4 rounded-lg bg-[#fdf1ee] px-3 py-2 text-sm text-no">
          This browser is blocking sound. Tap &ldquo;Start metronome&rdquo; once more, and check that
          the device is not on silent.
        </p>
      ) : null}
    </div>
  );
}
