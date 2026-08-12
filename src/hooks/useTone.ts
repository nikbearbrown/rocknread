"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ToneGenerator } from "@/lib/audio/tone";
import { ensureAudioReady } from "@/lib/audio/context";
import { midiToFrequency } from "@/lib/audio/notes";

export function useTone() {
  const genRef = useRef<ToneGenerator | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const stop = useCallback(() => {
    genRef.current?.stop();
    setIsPlaying(false);
  }, []);

  const playMidi = useCallback(async (midi: number, durationSec = 3) => {
    const ready = await ensureAudioReady();
    if (!ready) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    if (!genRef.current) genRef.current = new ToneGenerator();
    setIsPlaying(true);
    genRef.current.play({ frequency: midiToFrequency(midi), durationSec }, () => setIsPlaying(false));
  }, []);

  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === "hidden") stop();
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, [stop]);

  useEffect(() => () => genRef.current?.stop(), []);

  return { isPlaying, blocked, playMidi, stop };
}
