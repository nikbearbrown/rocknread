# Fidelity to the paper form

Source: **Rock 'n' Read, Musical Fitness Assessment, 6th edition 2025.**

The app is a digitisation, not a redesign. This file lists every departure so nobody has to diff
the screen against the PDF by hand. `src/__tests__/tasks.test.ts` fails if a departure is added
without being marked.

## Unchanged

- The five tasks, their order, and their titles.
- The numbered steps within each task, word for word, except where listed below.
- The checkbox questions, word for word.
- The response scales, including **Match a Pitch being two-point (No / Yes)** while the other four
  are three-point. This asymmetry is in the source. It is not a bug.
- The administrator's note ("Don't worry if you aren't able to match a pitch…").
- The beat markings in Twinkle — eight beats, each rendered as one unbroken underlined chunk.
- 120 BPM and D4 as the defaults.
- The edition line, "6th edition 2025."

## Changed

Two steps, both for the same reason: they instruct the administrator to open an external app, and
replacing those apps is the entire purpose of this tool.

| Task | Paper form | App |
| --- | --- | --- |
| 1. Keep the Beat, step 1 | "Open Online Metronome (or app). Set to 120 beats/minute." | "Start the metronome below. It is set to 120 beats per minute." |
| 4. Match a Pitch, step 1 | "Open pitch pipe app or online tone generator." | "Use the pitch player below." |

Both are marked in `src/lib/assessment/tasks.ts` via `adaptedFrom`, and the app shows them to the
administrator behind a "How this differs from the paper form" link on the task screen.

## Added

Material not on the paper form, all of it outside the tasks themselves:

- **A sound check** before Task 1. Technically required (browsers block audio until a user gesture)
  and practically required (nothing else can catch a muted tablet).
- **Baseline / Follow-up** marking, to support the pre-and-post reporting Rock 'n' Read asked for
  without storing anything.
- **A privacy statement** on the start screen.
- **"This is a snapshot of current skills, not a diagnosis"** on the results screen.
- **A non-standard settings warning** shown whenever tempo or pitch was changed from 120 BPM / D4.
- A note that the child's name is optional and initials are fine.

## Not carried over

The links to Metronome (Android), TrueMetronome Lite (Apple), Perfect Pitch by Swift Scales, and
Online Tone Generator. The app replaces all four.

## Approval

Not yet reviewed by Rock 'n' Read.

- Reviewed by: _____________
- Date: _____________
