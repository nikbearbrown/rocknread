import { getAudioContext } from "./context";

/**
 * The reference pitch for MATCH A PITCH and SING IN TUNE.
 *
 * Adapted from guitarboard's useTheoryAudio (MIT, see THIRD-PARTY.md).
 *
 * Wave shape is a deliberate choice. A pure sine is the "correct" reference
 * tone and is also, for most people, the hardest thing in the world to sing
 * back — there are no harmonics to grab onto and it localises poorly. A
 * triangle wave is still unambiguously one pitch but has enough upper
 * partials that a child can find it. The paper form's intent is "give the
 * child a pitch to match", not "emit a calibration signal".
 */

export interface PlayToneOptions {
  frequency: number;
  durationSec?: number;
  volume?: number;
}

export class ToneGenerator {
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private endTimer: ReturnType<typeof setTimeout> | null = null;

  /** Playing while a tone is already sounding replaces it — never stacks. */
  play(options: PlayToneOptions, onEnded?: () => void): void {
    this.stop();

    const ctx = getAudioContext();
    const { frequency, durationSec = 3, volume = 0.25 } = options;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "triangle";
    osc.frequency.value = frequency;

    // Envelope with real attack and release. A hard start or stop on a
    // sustained tone produces an audible click that children find startling.
    const now = ctx.currentTime;
    const start = now + 0.02;
    const attack = 0.06;
    const release = 0.12;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + attack);
    gain.gain.setValueAtTime(volume, start + Math.max(attack, durationSec - release));
    gain.gain.linearRampToValueAtTime(0, start + durationSec);

    osc.start(start);
    osc.stop(start + durationSec + 0.02);

    this.osc = osc;
    this.gain = gain;
    this.endTimer = setTimeout(() => {
      this.osc = null;
      this.gain = null;
      this.endTimer = null;
      onEnded?.();
    }, (durationSec + 0.05) * 1000);
  }

  stop(): void {
    if (this.endTimer) {
      clearTimeout(this.endTimer);
      this.endTimer = null;
    }
    const ctx = this.osc ? getAudioContext() : null;
    if (this.gain && ctx) {
      const now = ctx.currentTime;
      this.gain.gain.cancelScheduledValues(now);
      this.gain.gain.setValueAtTime(this.gain.gain.value, now);
      this.gain.gain.linearRampToValueAtTime(0, now + 0.06);
    }
    if (this.osc && ctx) {
      try {
        this.osc.stop(ctx.currentTime + 0.07);
      } catch {
        /* already stopped */
      }
    }
    this.osc = null;
    this.gain = null;
  }
}
