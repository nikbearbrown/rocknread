# Roadmap

Work is numbered so two or three people can claim items without colliding. Each item says what
"done" means. Sizes assume someone reasonably comfortable with React.

**Before writing code:** read `docs/DECISIONS.md`. Several obvious-looking improvements are ruled
out there, with reasons.

---

## First — these block everything else

**1. Test on a real iPad and a real Android tablet.** *(half a day, no code required to start)*
The audio unlock path is the highest-risk part of this app and it has only been verified in desktop
Chromium. Run the whole assessment on an iPad in Safari, including: opening cold, backgrounding the
tab mid-metronome and returning, and the hardware silent switch. Write down what actually happens.
Done when there is a short report in `docs/device-testing.md` naming devices, OS versions, and every
place the sound failed.

**2. Watch someone else use it.** *(a morning)*
Not a developer. Ideally a preschool teacher, otherwise a parent. Say nothing, take notes, count
the number of times they hesitate. Done when there is a list of observed problems in
`docs/usability-notes.md` — observations, not proposed fixes.

**3. Get the wording confirmed by Rock 'n' Read.** *(email plus an hour)*
`docs/FIDELITY.md` lists every place the app's text departs from the printed form. Ann and Bill need
to sign off on that list. Done when `docs/FIDELITY.md` says who approved it and when.

---

## Next — clear improvements, no decisions required

**4. Accessibility pass.** *(1–2 days)*
Keyboard-only run-through of the whole assessment, screen reader on the response buttons, focus
management when the screen changes (focus is currently not moved — a screen reader user will not
notice the task changed). Contrast check on the No/Partly/Yes colours. Done when the assessment is
completable with a keyboard alone and with VoiceOver alone.

**5. Move focus on screen change.** *(2 hours; part of item 4 but worth doing first)*
When advancing a task, move focus to the new task heading.

**6. Count-in before Task 1.** *(half a day)*
The engine already supports a fixed-length click (`totalBeats`) — it is used by nothing. A four-beat
count-in before the metronome starts gives the adult time to begin patting so the child sees the
demonstration from beat one. Done when Task 1 offers a count-in and `useMetronome` covers it.

**7. Adjustable tone duration.** *(2 hours)*
The pitch plays for a fixed 3 seconds. Some children need longer. Add a duration control next to the
pitch player. Do not add it to the settings screen — it is not a fidelity-affecting parameter.

**8. Aggregate CSV across a session.** *(half a day)*
`toCsv` already accepts an array. Add "assess another child" that keeps a list in memory for the tab
and lets the administrator download one CSV for all of them. Note the privacy consequence in the UI:
that list is bigger than one child.

**9. An offline install.** *(1 day)*
Add a service worker and a web manifest so the app works with no connection at all and can be added
to a tablet home screen. A Head Start classroom cannot be assumed to have reliable wifi. Done when
it runs airplane-mode after one visit.

---

## Needs a decision before anyone starts

**10. Persistence and per-child history.** *(weeks, not days — and mostly not engineering)*
Read ADR-003. This needs the partnership to answer: is anything stored beyond the tab? If yes, a
privacy review of child data comes before any schema. **Do not start this because it seems easy.**

**11. Scoring.** *(blocked)*
Read ADR-006. Blocked on Rock 'n' Read supplying a validated scoring matrix. Until then the app
shows raw responses.

**12. Pitch-detection hint for Tasks 4 and 5.** *(2–3 weeks, and an evaluation)*
Read ADR-001 in full first. If pursued: collect recorded child-voice samples, evaluate a detector
against human judgments on *those* samples, and only then consider showing a cents readout beside
the response buttons as an explicitly ignorable hint. The evaluation is the work; the code is the
easy part.

---

## Explicitly not on this roadmap

Song generation, video, dashboards, and Claude integration were all discussed in the July
partnership meeting. None of them belong in this app. This app is the assessment instrument; it
should stay small enough that a teacher trusts it and a volunteer can read all of it in an
afternoon. Build those elsewhere.

One consequence worth stating plainly: **this tool needs no Claude licence, no accounts, and no
budget to run.** The July meeting identified the cost of enterprise licences as a real adoption
blocker for schools. Keeping that property is worth more than any feature on this list.
