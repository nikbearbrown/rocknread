export type ResponseValue = "no" | "partly" | "yes";

export type AssessmentPhase = "baseline" | "followUp";

export interface TaskStep {
  text: string;
  /**
   * Set when this step differs from the paper form because the app replaces
   * an external tool. Shown to the administrator on request, and listed in
   * docs/FIDELITY.md, so nobody has to diff the app against the PDF by hand.
   */
  adaptedFrom?: string;
}

export interface TaskDefinition {
  id: string;
  /** 1-based, matching the order on the paper form. */
  number: number;
  title: string;
  steps: TaskStep[];
  /** The exact wording of the checkbox question on the form. */
  question: string;
  /** Task 4 is a two-point scale on the paper form. The rest are three-point. */
  scale: ResponseValue[];
  /** Which built-in audio tool this task needs, if any. */
  tool: "metronome" | "tone" | "none";
}

export interface AssessmentRecord {
  childName: string;
  date: string; // ISO yyyy-mm-dd
  phase: AssessmentPhase;
  responses: Partial<Record<string, ResponseValue>>;
  /** Recorded so results are interpretable if someone changed the defaults. */
  settings: { bpm: number; pitchMidi: number };
  formEdition: string;
}
