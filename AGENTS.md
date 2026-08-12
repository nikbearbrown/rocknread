# Notes for AI coding agents (and the humans directing them)

This file is read by Claude Code and similar tools. `CLAUDE.md` symlinks to it.

## What this project is

A browser version of a paper **measurement instrument** for assessing young children's musical
skills. Not a game, not a demo. Results get written down and compared.

## Rules that are not negotiable without asking a human

1. **Do not change the assessment text, the response scales, the default tempo (120 BPM), or the
   default pitch (D4).** These are the instrument. `src/__tests__/tasks.test.ts` guards them and
   should be treated as a tripwire, not an obstacle. If a task asks you to change them, stop and
   confirm with a human first.
2. **Do not add microphone access, audio recording, or automated scoring.** See `docs/DECISIONS.md`
   ADR-001. This will look like an obvious improvement. It is ruled out for a specific, documented
   reason.
3. **Do not add a backend, accounts, analytics, or any network request.** The app's privacy claim
   ("nothing leaves this device") is load-bearing for adoption in schools, and it is only true
   because it is literally true.
4. **Do not compute a score, total, or classification** from the five responses. See ADR-006.
5. **Do not move responses to `localStorage`.** See ADR-003 — `sessionStorage` is a deliberate
   privacy choice, not an oversight.

## Rules of thumb

- Audio timing logic goes in `src/lib/audio/scheduler.ts` as pure functions and gets unit tested.
  Anything that touches `AudioContext` goes in `metronome.ts` / `tone.ts`. Keep that seam — it is
  why the timing can be tested at all.
- Every audio-initiating control calls `ensureAudioReady()` first. Skipping it produces silent
  failure on iOS, which is worse than an error.
- Tap targets stay at least 48px. This runs on tablets held by adults with a child on their lap.
- `npm test` and `npm run build` must both pass before anything is called done.

## Getting oriented

Read in this order: `README.md`, `docs/DECISIONS.md`, `src/lib/audio/scheduler.ts` (the header
comment), `src/lib/assessment/tasks.ts`, then `src/app/page.tsx`.
