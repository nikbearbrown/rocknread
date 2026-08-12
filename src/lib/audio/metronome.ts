import { beatsDue, isFinished, type BeatEvent } from "./scheduler";
import { getAudioContext } from "./context";

/**
 * The MetronomeEngine.
 *
 * Sound: a short filtered noise-free "click" built from a square-ish blip with
 * a fast exponential decay. Two pitches — an accented downbeat and a plain
 * beat — because an unaccented click is hard for a small child to lock onto.
 *
 * The scheduling maths lives in scheduler.ts and is unit tested. This class is
 * the thin, untestable-without-a-browser shell around it: it owns the
 * AudioContext, the lookahead timer, and the oscillators.
 */

const LOOKAHEAD_MS = 25; // how often the JS timer wakes up
const SCHEDULE_AHEAD_S = 0.12; // how far ahead of the audio clock we book beats

export interface MetronomeOptions {
  bpm: number;
  beatsPerBar?: number;
  /** Total beats then stop. Omit for endless. Used for the count-in. */
  totalBeats?: number;
  /** Fires (from a timer, not exactly on the beat) once each beat is booked. */
  onBeatScheduled?: (beat: BeatEvent) => void;
  onFinished?: () => void;
  volume?: number;
}

export class Metronome {
  private timer: ReturnType<typeof setInterval> | null = null;
  private startTime = 0;
  private nextIndex = 0;
  private opts: Required<Omit<MetronomeOptions, "onBeatScheduled" | "onFinished" | "totalBeats">> &
    Pick<MetronomeOptions, "onBeatScheduled" | "onFinished" | "totalBeats">;

  constructor(options: MetronomeOptions) {
    this.opts = {
      beatsPerBar: 4,
      volume: 0.35,
      ...options,
    };
  }

  get isRunning(): boolean {
    return this.timer !== null;
  }

  /** Idempotent — calling start() on a running metronome does nothing. */
  start(): void {
    if (this.timer) return; // debounces double-taps (C1 edge case 3)
    const ctx = getAudioContext();
    this.nextIndex = 0;
    // Small offset so the very first beat is booked in the future, not in the
    // past — a beat scheduled at a time already gone plays instantly and late.
    this.startTime = ctx.currentTime + 0.1;
    this.tick();
    this.timer = setInterval(() => this.tick(), LOOKAHEAD_MS);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** Changing tempo restarts the beat grid, which is what a user expects. */
  setBpm(bpm: number): void {
    const wasRunning = this.isRunning;
    this.opts.bpm = bpm;
    if (wasRunning) {
      this.stop();
      this.start();
    }
  }

  private tick(): void {
    const ctx = getAudioContext();
    const horizon = ctx.currentTime + SCHEDULE_AHEAD_S;

    const due = beatsDue({
      startTime: this.startTime,
      bpm: this.opts.bpm,
      beatsPerBar: this.opts.beatsPerBar,
      fromIndex: this.nextIndex,
      horizon,
      totalBeats: this.opts.totalBeats,
    });

    for (const beat of due) {
      this.click(ctx, beat.time, beat.isDownbeat);
      this.nextIndex = beat.index + 1;
      this.opts.onBeatScheduled?.(beat);
    }

    if (isFinished(this.nextIndex, this.opts.totalBeats)) {
      const lastBeat = this.startTime + ((this.nextIndex - 1) * 60) / this.opts.bpm;
      const msLeft = Math.max(0, (lastBeat - ctx.currentTime) * 1000) + 120;
      this.stop();
      setTimeout(() => this.opts.onFinished?.(), msLeft);
    }
  }

  private click(ctx: AudioContext, at: number, accented: boolean): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Two clearly different pitches. 1600/1000 Hz sits well above a child's
    // voice and a piano, so the click does not blur into the singing.
    osc.type = "square";
    osc.frequency.value = accented ? 1600 : 1000;

    const peak = this.opts.volume * (accented ? 1 : 0.72);
    const decay = 0.055;

    // Ramp from a tiny non-zero value: exponentialRamp cannot touch zero.
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);

    osc.start(at);
    osc.stop(at + decay + 0.01);
  }
}
