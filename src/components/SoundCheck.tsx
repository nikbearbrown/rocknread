"use client";

import { useState } from "react";
import { useTone } from "@/hooks/useTone";
import { Button } from "./Buttons";

/**
 * The sound check exists for two reasons, one technical and one human.
 *
 * Technical: browsers will not produce audio until the user has interacted
 * with the page. This screen guarantees that gesture happens before Task 1,
 * rather than during it.
 *
 * Human: a browser cannot tell whether the device is muted or the volume is
 * at zero. Only a person can. Discovering a silent iPad halfway through Task 1
 * with a restless four-year-old on your lap is how an assessment gets
 * abandoned.
 */
export function SoundCheck({ onReady }: { onReady: () => void }) {
  const { playMidi, blocked } = useTone();
  const [tested, setTested] = useState(false);

  return (
    <section className="rounded-2xl border border-line bg-white p-6">
      <h2 className="font-serif text-2xl">Check your sound</h2>
      <p className="mt-2 text-[1.02rem] leading-relaxed text-muted">
        Turn the volume up and take the device off silent. Tap the button &mdash; you should hear a
        clear, steady note.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          variant="secondary"
          onClick={() => {
            void playMidi(62, 1.4);
            setTested(true);
          }}
        >
          Play a test note
        </Button>
        <Button onClick={onReady} disabled={!tested}>
          I heard it &mdash; begin
        </Button>
      </div>

      {tested && !blocked ? (
        <p className="mt-4 text-sm text-muted">
          Heard nothing? On an iPhone or iPad, check the silent switch on the side &mdash; it mutes
          the browser even when the volume is up.
        </p>
      ) : null}
      {blocked ? (
        <p className="mt-4 rounded-lg bg-[#fdf1ee] px-3 py-2 text-sm text-no">
          This browser is blocking sound. Tap &ldquo;Play a test note&rdquo; once more.
        </p>
      ) : null}
    </section>
  );
}
