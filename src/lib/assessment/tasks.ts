import type { TaskDefinition } from "./types";

/**
 * The five tasks, transcribed from the Rock 'n' Read Musical Fitness
 * Assessment, 6th edition 2025.
 *
 * DO NOT EDIT THE WORDING casually. This is a measurement instrument: if the
 * script changes, results stop being comparable to results collected on paper
 * and to each other. Every place the app departs from the printed form is
 * marked with `adaptedFrom` so the change is visible rather than silent, and
 * the departures are all the same kind — replacing "open a separate app" with
 * "use the control on this screen", which is the entire point of the tool.
 */

export const FORM_EDITION = "6th edition 2025";

export const ASSESSMENT_NOTE =
  "Don't worry if you aren't able to match a pitch or sing in tune yourself. " +
  "You can probably hear whether others are able to do it, even if you can't.";

export const SUBTITLE = "Musical fitness is the ability to perform basic music skills";

/** Twinkle, with the beat-bearing syllables marked as on the paper form. */
export const TWINKLE_BEATS = [
  "Twin-kle,", "Twin-kle", "lit-tle", "star,",
  "how I", "won-der", "what you", "are.",
] as const;

export const TASKS: TaskDefinition[] = [
  {
    id: "keep-the-beat",
    number: 1,
    title: "Keep the Beat",
    tool: "metronome",
    steps: [
      {
        text: "Start the metronome below. It is set to 120 beats per minute.",
        adaptedFrom: "Open Online Metronome (or app). Set to 120 beats/minute.",
      },
      { text: "Show how to pat with both hands on your lap exactly at the same time as the click sound." },
      { text: "Ask child to pat the beat with both hands." },
    ],
    question: "Did they match the beat?",
    scale: ["no", "partly", "yes"],
  },
  {
    id: "keep-the-beat-with-a-song",
    number: 2,
    title: "Keep the Beat with a Song",
    tool: "none",
    steps: [
      {
        text:
          "Together, pat a slower beat with both hands on lap and sing " +
          "“Twin-kle, Twin-kle lit-tle star, how I won-der what you are.” " +
          "(Each underline represents a beat.)",
      },
      { text: "Ask child to sing it again without you, while patting." },
      { text: "If they don’t know the words, just have them sing the tune using “Doot doot doot doot…”" },
    ],
    question: "Did they keep the steady beat?",
    scale: ["no", "partly", "yes"],
  },
  {
    id: "clap-the-rhythm",
    number: 3,
    title: "Clap the Rhythm",
    tool: "none",
    steps: [
      { text: "Ask child to clap how the words go in “Twinkle” while singing the song, one clap for each syllable." },
      { text: "Show them how to clap two times for “Twin-kle.”" },
      { text: "Ask child to sing and clap entire song alone." },
    ],
    question: "Did they clap each sound?",
    scale: ["no", "partly", "yes"],
  },
  {
    id: "match-a-pitch",
    number: 4,
    title: "Match a Pitch",
    tool: "tone",
    steps: [
      {
        text: "Use the pitch player below.",
        adaptedFrom: "Open pitch pipe app or online tone generator.",
      },
      { text: "Play D (D4)." },
      { text: "Ask child to match the pitch on “oo.”" },
    ],
    question: "Did they match the pitch?",
    // Two-point on the paper form. This is not an oversight to "fix".
    scale: ["no", "yes"],
  },
  {
    id: "sing-in-tune",
    number: 5,
    title: "Sing in Tune",
    tool: "none",
    steps: [{ text: "Ask child to sing “Twinkle” again." }],
    question: "Did they sing the song in tune?",
    scale: ["no", "partly", "yes"],
  },
];

export function taskById(id: string): TaskDefinition | undefined {
  return TASKS.find((t) => t.id === id);
}
