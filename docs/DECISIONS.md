# Decisions

Short records of the choices that shaped this app, kept so that a future contributor can tell the
difference between "nobody got to it" and "we decided not to."

---

## ADR-001 — The app does not listen to the child

**Decision.** No microphone. No pitch detection. No automated scoring. The administrator listens
and records a judgment.

**Why.** There is a strong temptation here, and it is worth naming precisely so it can be argued
with rather than rediscovered.

Working browser pitch detection exists and is not hard to obtain — `guitarboard`
(github.com/gaurav-bakale/guitarboard, MIT) implements the McLeod Pitch Method, evaluates it
against two baselines, and would drop into this app in an afternoon. So the usual objection —
"that's a whole DSP project" — is false, and anyone who says it will lose the argument to the first
person who opens that repo.

The real objection is about **transfer of evidence**. That detector was measured on plucked guitar
strings: loud, harmonically stable, sustained, monophonic, one instrument in a quiet room. A
four-year-old's sung pitch is quiet, breathy, unstable, frequently between notes, and competing
with room noise and other children. The clarity thresholds and low-frequency handling were tuned
for the former case. **The evaluation does not carry over**, and shipping an automatic score on an
untransferred evaluation is how a tool ends up confidently telling a parent their child cannot
sing.

The paper form already anticipated this. Its own note says: *"Don't worry if you aren't able to
match a pitch or sing in tune yourself. You can probably hear whether others are able to do it,
even if you can't."* The instrument was designed around the adult's ear.

**Reopening this.** Legitimately reopenable, but only in this form: a live cents-deviation readout
displayed *beside* the response buttons, framed as a hint the administrator may ignore, never as a
score. That preserves the observer as the scorer. It would need its own evaluation on recorded
child-voice samples first, and a visible "this is a hint, not a score." See ROADMAP item 12.

---

## ADR-002 — The tempo and pitch defaults are part of the instrument

**Decision.** 120 BPM and D4 are the defaults, they live behind a collapsed "settings" disclosure,
and any change to them is recorded with the results and stated on the results screen and in every
export.

**Why.** The assessment asks whether a child can match a 120 BPM beat. If one administrator runs it
at 100 and another at 120, the two results are answers to different questions. Rather than locking
the values (sometimes a slower tempo is genuinely right for a particular child) or letting them
drift silently, the app makes the change visible wherever the result appears.

---

## ADR-003 — Responses live in `sessionStorage`, and that is not a placeholder

**Decision.** In-tab storage only. No database, no accounts, no sync.

**Why.** Three pressures:

1. An administrator who accidentally refreshes on Task 4 and loses everything will not come back.
   Pure in-memory state is hostile.
2. This is data about a preschool child, often on a shared classroom tablet. `localStorage` leaves
   the child's name sitting there for whoever picks the device up next.
3. Ann's stated requirement is that student information be stored anonymously — much easier to
   honour if it is never stored at all.

`sessionStorage` satisfies all three: it survives a refresh and dies with the tab.

**Reopening this.** If per-child longitudinal history is genuinely required, that is a backend, an
authentication story, and a COPPA/FERPA review — **not** a one-line change from `sessionStorage` to
`localStorage`. Do not let it arrive as a one-line change. See ROADMAP item 10.

---

## ADR-004 — A lookahead scheduler, not `setInterval`

**Decision.** The metronome books beats on the AudioContext clock from a coarse ~25ms JavaScript
timer, rather than firing a sound on each timer tick.

**Why.** `setInterval(tick, 60000 / bpm)` drifts. JS timers queue behind everything else on the main
thread and are throttled in background tabs. For a visual aid that is fine; for an instrument whose
whole question is "can this child match a steady beat," a click track that wanders turns the
measurement into noise.

The full reasoning is in the header comment of `src/lib/audio/scheduler.ts`, and
`src/__tests__/metronome.test.ts` proves the property directly: it runs the engine with deliberately
late, uneven timer ticks and asserts the scheduled click times are still exactly 0.5s apart.

---

## ADR-005 — One screen with a state machine, not five routes

**Decision.** The whole assessment is one route. Task position is React state.

**Why.** With no per-task URL there is no way to deep-link into Task 4 with an empty record, so an
entire class of broken states cannot occur rather than having to be defended against. The cost — no
browser Back button between tasks — is paid by explicit Back buttons, which are better on a tablet
anyway.

---

## ADR-006 — The results screen refuses to compute a score

**Decision.** Results show five answers. No total, no percentage, no band, no label.

**Why.** The paper form has no scoring key, so any number this app invented would be a new
instrument with no validation behind it — and it would immediately be read as one. "3 out of 5"
sounds like a grade for a child. Until Rock 'n' Read provides a scoring matrix (an outstanding item
from the 27 July meeting), the honest output is the raw responses and a sentence saying what they
are not.
