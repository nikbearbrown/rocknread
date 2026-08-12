"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Metronome } from "@/lib/audio/metronome";
import { ensureAudioReady, getAudioContext } from "@/lib/audio/context";

export interface UseMetronomeOptions {
  bpm: number;
  beatsPerBar?: number;
  /** Omit for an endless click; set for a fixed-length count-in. */
  totalBeats?: number;
  onFinished?: () => void;
}

export function useMetronome({ bpm, beatsPerBar = 4, totalBeats, onFinished }: UseMetronomeOptions) {
  const engineRef = useRef<Metronome | null>(null);
  const queueRef = useRef<Array<{ index: number; time: number }>>([]);
  const rafRef = useRef<number | null>(null);
  const finishedRef = useRef(onFinished);
  useEffect(() => {
    finishedRef.current = onFinished;
  }, [onFinished]);

  const [isRunning, setIsRunning] = useState(false);
  const [beat, setBeat] = useState(-1);
  const [blocked, setBlocked] = useState(false);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    engineRef.current = null;
    queueRef.current = [];
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setIsRunning(false);
    setBeat(-1);
  }, []);

  const start = useCallback(async () => {
    if (engineRef.current) return; // double-tap guard
    const ready = await ensureAudioReady();
    if (!ready) {
      setBlocked(true);
      return;
    }
    setBlocked(false);

    const engine = new Metronome({
      bpm,
      beatsPerBar,
      totalBeats,
      // Beats are booked up to ~120ms ahead of time, so lighting the visual
      // pulse when one is *scheduled* would flash early. Queue them instead
      // and let a rAF loop fire each one when the audio clock actually
      // reaches it — the light and the click then land together.
      onBeatScheduled: (b) => queueRef.current.push({ index: b.index, time: b.time }),
      onFinished: () => {
        stop();
        finishedRef.current?.();
      },
    });
    engineRef.current = engine;
    engine.start();
    setIsRunning(true);

    const pump = () => {
      if (queueRef.current.length) {
        let now = 0;
        try {
          now = getAudioContext().currentTime;
        } catch {
          now = 0;
        }
        while (queueRef.current.length && queueRef.current[0].time <= now) {
          setBeat(queueRef.current.shift()!.index);
        }
      }
      rafRef.current = requestAnimationFrame(pump);
    };
    rafRef.current = requestAnimationFrame(pump);
  }, [bpm, beatsPerBar, totalBeats, stop]);

  // A metronome clicking in a backgrounded tab is confusing and drains
  // battery — and browsers throttle the scheduling timer there anyway, so it
  // would stutter. Stop cleanly instead. (C1 edge case 2)
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") stop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { isRunning, beat, blocked, start, stop, beatsPerBar };
}
