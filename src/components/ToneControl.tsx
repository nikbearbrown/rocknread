"use client";

import { useTone } from "@/hooks/useTone";
import { midiToName } from "@/lib/audio/notes";
import { Button } from "./Buttons";

export function ToneControl({ midi }: { midi: number }) {
  const { isPlaying, blocked, playMidi, stop } = useTone();
  const label = midiToName(midi);

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Pitch player</p>
          <p className="text-sm text-muted">Plays {label} for three seconds</p>
        </div>
        <Button onClick={() => (isPlaying ? stop() : void playMidi(midi, 3))} aria-pressed={isPlaying}>
          {isPlaying ? "Stop" : `Play ${label}`}
        </Button>
      </div>
      <p className="mt-4 text-sm text-muted">
        Play it as often as you need. Sing it yourself first if that helps &mdash; the child is
        matching a pitch, not a voice.
      </p>
      {blocked ? (
        <p className="mt-4 rounded-lg bg-[#fdf1ee] px-3 py-2 text-sm text-no">
          This browser is blocking sound. Tap &ldquo;Play {label}&rdquo; once more, and check that the
          device is not on silent.
        </p>
      ) : null}
    </div>
  );
}
