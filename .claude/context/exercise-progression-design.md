# Exercises, plans & progression — design decisions (brainstorm, 2026-11-01)

Status: concept agreed, no schema yet (schema to be drafted on request).

## Exercises
- One exercise catalog: global exercises (admin-created, with image) + personal custom exercises (private to the owner).
- Each exercise has muscle weights 0–1 per muscle: 1.0 main target, 0.5–0.7 strong helper, 0.2–0.3 stabilizer, <0.2 omitted. Weights don't need to sum to 1.
- Catalog weights: admin-owned; DeepSeek may draft, admin reviews.
- Custom exercises: "similar to <catalog exercise>" copies weights, or pick main muscles (1.0) + optional helpers (0.5); sliders as advanced option.
- Muscle list: detailed (~18–20: upper/lower chest, front/side/rear delts, lats vs upper back, lower back, obliques, adductors…), each mapped to a simple parent group (~10) for display.
- Variants (barbell vs dumbbell bench) are separate exercises; progress is never compared across exercises (load ratios are used only to predict a starting weight, see below).
- Each catalog exercise also has: technical complexity 1–5 (admin-set, DeepSeek may draft) and a movement pattern with a load ratio vs the pattern's reference exercise (e.g. dumbbell bench ≈ 0.4× barbell bench per hand).

## Three layers
1. Definition — the exercise itself.
2. Prescription — exercise inside a workout (sets, reps, rest, laps).
3. Log — what was actually done: every set of every lap logged separately.

## Editing rules
- Sets/reps/rest/laps edits are always local to that workout.
- Definition edits (name, image, muscles): own custom exercise → ask "update everywhere / create new"; catalog exercise → not editable, offer "create my version". Same rule for workouts inside plans.
- A copy starts a new progress history — UI must warn.
- Publishing workouts that contain custom exercises: forbidden for now.

## Data volume
- Raw set logs = source of truth, batch-inserted on session finish (offline-friendly).
- Per-session summary per user × exercise (top set, e1RM, volume, hard sets), filled by trigger; screens/charts read summaries only.
- Personal records table maintained by the same trigger.

## Fatigue (AI only for now)
- Estimated per muscle: sets × intensity × muscle weight, decaying over time (smaller muscles recover faster).
- Intensity inferred automatically: % of user's e1RM, plan vs actual (skipped sets / missed reps), actual vs planned rest from timer. Default "moderately hard".
- Optional one-tap effort rating at session end (skippable).
- Computed server-side; DeepSeek receives a compact per-muscle summary (recovery %, sets this week, last trained, trend) for unplanned workout generation.

## Progression (shown to user)
- Per-muscle trend that can go up or down (no XP).
- Per exercise: best result in recent period vs previous period (e1RM / max reps / max hold), % change, combined per muscle by weights.
- "Not trained for X weeks" is not shown as decline; ±2–3% = stable; best-of-period, not last session; minimum ~2 sessions per period.
- Declines during high fatigue flagged as "probably fatigue".
- All-time PRs kept as a separate always-growing reward.

## User level
- Period length by level: beginner 2 weeks, intermediate 3–4, advanced 4–6; fall back to longer when data is sparse.
- Level stored per exercise + one overall level (for AI and UI).
- Profile data: sex (used for strength standards), body weight as history (not a single value).
- Onboarding (each one tap, skippable): sex, body weight, "How long have you been training?" (never / <1y / 1–3y / 3+y) → starting overall level.
- Refined silently, no extra questions. Per-exercise level resolved in priority order:
  1. Strength standards for that exercise (main barbell lifts + bodyweight standards like push-ups/pull-ups reps).
  2. Level of the same muscles from other exercises (via muscle weights).
  3. Overall level.
  4. Onboarding answer.
- Observed progress rate adjusts over time (fast gains → still beginner; slow → move up).
- Level can go down as well as up; recalculated periodically (e.g. weekly), not on every set.

## Starting weight for a never-done exercise
- Estimate e1RM, resolved in order (each step = lower confidence):
  1. Same movement pattern exercise the user has done → convert via load ratio.
  2. Same muscles from other exercises → via muscle weights + user level.
  3. Strength standards for the user's level, sex and body weight.
  4. Conservative beginner default.
- Safety discount applied to the estimate, larger when: confidence is low (lower source above), technical complexity is high, user level is low. Roughly −10% (well-known pattern, simple exercise) up to −30% or more (no related data, complex exercise).
- Round down to available plate/dumbbell steps (user's weight step setting).
- First session = calibration: shown as "suggested, adjust if needed"; real logged reps replace the estimate from the next session on.
- Complexity is also an AI constraint: low-level users don't get high-complexity exercises; AI prefers easier steps of the same pattern.
