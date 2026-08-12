# Musical Fitness Assessment

A browser version of the Rock 'n' Read **Musical Fitness Assessment** (6th edition 2025).

The paper form asks an adult to run five short tasks with a child and tick No / Partly / Yes for
each. Two of those tasks need equipment: a metronome at 120 BPM and a pitch pipe playing D4. On
paper, that means telling a parent to go install two more apps and alt-tab between three things
while a four-year-old waits. **This app is the form and the equipment on one screen.**

```bash
npm install
npm run dev      # http://localhost:3000
```

Node 20.9+. Then `npm test`, `npm run build`, `npm run lint`.

---

## What it does

- The five tasks in order, with the instructions as printed on the form.
- A **metronome** with an audible click and a visible beat pulse, accurate to the audio clock.
- A **pitch player** for D4.
- A **sound check** before Task 1, which both unlocks browser audio and catches a muted device.
- **Results** you can print, save as PDF, or download as CSV or JSON.
- **Baseline / Follow-up** marking, so pre-and-post comparisons are possible without a database.

## What it deliberately does not do

- **It does not listen.** There is no microphone, no recording, no automatic scoring. The adult
  administering the test is the instrument; the app hands them the tools and writes down what they
  decide. See `docs/DECISIONS.md`, ADR-001 — this is a considered position, not a missing feature.
- **It has no accounts and no backend.** Not "not yet" — it makes no network requests at all after
  the page loads. Nothing about a child leaves the device unless the administrator exports a file.
- **It does not score, classify, or flag.** The results screen shows five answers and says, in
  words, that this is a snapshot and not a diagnosis.

## Deploying

It is a fully static Next.js app with no environment variables and no server-side code.

1. Push to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. **If this folder sits inside a larger repo, set Root Directory to the folder
   containing this `package.json`.** That is the only setting that matters.
4. Accept every other default — framework, build command, and output directory are
   auto-detected. There are no environment variables.

Node is pinned to 22 in `engines` and `.nvmrc`, so local and deployed builds match.

Any static host works — Netlify, GitHub Pages, a folder on a school server.

## Where things live

```
src/lib/audio/       scheduler.ts is the beat maths (pure, tested)
                     metronome.ts, tone.ts, context.ts make the sound
src/lib/assessment/  tasks.ts is the assessment text — read the warning at the top
                     export.ts, session.ts, types.ts
src/hooks/           React wrappers around the audio engines
src/components/      UI
src/__tests__/       41 tests, no browser required
docs/                DECISIONS.md, ROADMAP.md, FIDELITY.md
```

**Start with `src/lib/audio/scheduler.ts`.** The long comment at the top explains why the metronome
is built the way it is, and it is the one piece of this codebase where the obvious approach is
wrong.

## For contributors

Read `docs/ROADMAP.md` — the open work is numbered, sized, and claimable. Read `docs/DECISIONS.md`
before proposing anything that changes what the tool *is*; several tempting features are ruled out
there for reasons that are not obvious.

This is a **measurement instrument**. If you change the task wording, the tempo, the pitch, or the
response scales, results collected before your change stop being comparable to results collected
after it. `src/__tests__/tasks.test.ts` will fail if you do — that is on purpose. Talk to Rock 'n'
Read before you make that test pass.

## Status

Starter. It runs, it is tested, and it is honest about what it is. It has not been used with a real
child in a real classroom, and it has not been tested on a real iPad. Those are items 1 and 2 on
the roadmap.
