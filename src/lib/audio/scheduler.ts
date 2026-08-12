/**
 * The beat scheduler — pure, no Web Audio, no DOM. This is deliberately
 * separated from the sound-making so it can be unit tested without a browser.
 *
 * WHY A LOOKAHEAD SCHEDULER AND NOT setInterval
 * ---------------------------------------------
 * The obvious way to build a metronome is setInterval(tick, 60000 / bpm).
 * Don't. JavaScript timers are not real-time: they are queued behind whatever
 * else the main thread is doing, they are clamped to >= 4ms, and they are
 * throttled hard in background tabs. Over a 60-second assessment the error
 * accumulates and audibly drifts.
 *
 * The standard fix (Chris Wilson, "A Tale of Two Clocks") is to let the audio
 * hardware clock keep time instead. A slow, sloppy JS timer wakes up every
 * ~25ms and asks: "which beats fall inside the next ~120ms?" Those beats are
 * scheduled on the AudioContext at exact sample-accurate times. The JS timer
 * can be late by tens of milliseconds and it does not matter, because it is
 * only *booking* the beats, never *playing* them.
 *
 * That accuracy is not a nicety here. The assessment asks whether a child can
 * match a 120 BPM beat, and the answer gets written down as data. A click track
 * that drifts turns an instrument into a coin flip.
 */

export interface BeatEvent {
  /** 0-based beat number since the metronome started. */
  index: number;
  /** AudioContext time (seconds) at which this beat should sound. */
  time: number;
  /** True on the first beat of each bar — used for the accented click. */
  isDownbeat: boolean;
}

export interface BeatsDueParams {
  /** AudioContext time of beat 0. */
  startTime: number;
  bpm: number;
  /** Beats per bar; the first beat of each bar is accented. Use 4 for the form. */
  beatsPerBar: number;
  /** First beat index not yet scheduled. */
  fromIndex: number;
  /** Schedule every beat at or before this AudioContext time. */
  horizon: number;
  /** Optional total beat count. Omit for an endless click. */
  totalBeats?: number;
}

/** AudioContext time of a given beat index. */
export function beatTime(startTime: number, bpm: number, index: number): number {
  if (bpm <= 0) throw new RangeError(`bpm must be positive, got ${bpm}`);
  return startTime + (index * 60) / bpm;
}

/**
 * Every beat from `fromIndex` onward whose time falls at or before `horizon`.
 * Returns [] when there is nothing to schedule yet — the common case, called
 * ~40x/second.
 */
export function beatsDue(params: BeatsDueParams): BeatEvent[] {
  const { startTime, bpm, beatsPerBar, fromIndex, horizon, totalBeats } = params;
  if (bpm <= 0) throw new RangeError(`bpm must be positive, got ${bpm}`);
  if (beatsPerBar <= 0) throw new RangeError(`beatsPerBar must be positive, got ${beatsPerBar}`);

  const out: BeatEvent[] = [];
  // Hard cap: if a caller ever passes a horizon far in the future (a bug, or a
  // machine that slept), we book a bounded number of beats rather than looping
  // for minutes and freezing the tab.
  const MAX_PER_CALL = 512;

  for (let i = Math.max(0, fromIndex); out.length < MAX_PER_CALL; i++) {
    if (totalBeats !== undefined && i >= totalBeats) break;
    const time = beatTime(startTime, bpm, i);
    if (time > horizon) break;
    out.push({ index: i, time, isDownbeat: i % beatsPerBar === 0 });
  }
  return out;
}

/** True once every beat has been scheduled. Endless metronomes never finish. */
export function isFinished(nextIndex: number, totalBeats?: number): boolean {
  return totalBeats !== undefined && nextIndex >= totalBeats;
}
