# Supabase schema & legacy data transfer — plan (2026-11-01)

Source: `exercise-progression-design.md`. Status: backend implemented 2026-11-01 (see bottom); app wiring pending.
Conventions: `id uuid` (client-generated, offline-safe), `created_at/updated_at` + `set_updated_at()`, text + `check` instead of PG enums (easy to extend), user FKs → `profiles(id)`, RLS on all tables.

## 0. Current state (investigated)
| Data | Where now | Format |
| --- | --- | --- |
| Plans | Firestore `plans` | `PlanType` {uid nanoid16, ownerUid, name, colorIdx, labels[], lastUpdated ms, workouts: WorkoutType[] embedded copies} |
| Workouts | Firestore `workouts` | `WorkoutType` {uid, ownerUid, name, colorIdx, labels[], lastUpdated, exercises: ExerciseType[]} |
| Exercise (inline, no catalog link) | inside workouts | {uid, name, imageUrl, colorIdx, isVisible, breakTimeInSec, laps, repeats, approaches: [{weight, repeats}] per lap} |
| Results | none | playback overwrites `approaches` with `currentWeight/currentRepeats` → no history exists |
| Image catalog | RTDB `/ExerciseImages` + Firebase Storage, admin uploads | [{fileName, storageKey, downloadUrl, filter: home\|gym\|street}] — global, not per user |
| usersData | Firestore | {friendsUIDs[]} — not used by features |
| Settings | local only (Zustand persist) | weightStep etc. — stays local |

Existing migration `init_core_tables` (plans.workouts jsonb, workouts.exercises jsonb, per-user `exercise_images`) contradicts the design. It is pushed to remote but tables are empty → new migration drops and recreates them (never edit a pushed migration).

## 1. Reference data (admin-owned, read by all authenticated)
- `muscle_groups` (id text pk, sort smallint) — ~10: chest, shoulders, back, biceps, triceps, forearms, core, glutes, quads, hamstrings, calves.
- `muscles` (id text pk, group_id → muscle_groups, recovery_hours smallint, sort) — ~19: upper_chest, lower_chest, front_delts, side_delts, rear_delts, lats, upper_back, lower_back, biceps, triceps, forearms, abs, obliques, glutes, quads, hamstrings, adductors, abductors, calves. Seeded in migration (not seed.sql — needed in prod). Display names via app i18n by id.
- `movement_patterns` (id text pk, reference_exercise_id uuid null → exercises) — e.g. horizontal_press, vertical_pull, squat, hinge.
- `strength_standards` (exercise_id, sex, level, metric `bw_ratio|reps|hold_sec`, value numeric; pk(exercise_id, sex, level)).
- Level values everywhere: `beginner|novice|intermediate|advanced` (text check).

## 2. Exercise catalog
`exercise_images` (replaces per-user table): id, owner_id null (null = global), storage_path, filter `home|gym|street`, file_name.
`exercises`:
| column | notes |
| --- | --- |
| id uuid, owner_id uuid null | null = global catalog; else private custom |
| name text | |
| image_id → exercise_images null | |
| metric text `weight_reps\|reps\|time` | drives e1RM / max reps / max hold |
| is_per_hand bool | dumbbell load ratio per hand |
| complexity smallint 1–5 null | global only (admin) |
| pattern_id → movement_patterns null, pattern_load_ratio numeric null | vs pattern's reference exercise |
| based_on_exercise_id → exercises null | "similar to"/"my version"/"create new" copy origin; progress never shared |
| archived_at timestamptz null | soft delete — logs keep FK |
`exercise_muscles` (exercise_id, muscle_id, weight numeric(3,2) check 0.2–1.0; pk(exercise_id, muscle_id)).
RLS: select `owner_id is null or owner_id = auth.uid()`; insert/update/delete only `owner_id = auth.uid()` (global rows never client-writable). `exercise_muscles` follows parent via `exists`.
Admin writes (global rows, images, standards, patterns): Edge Function `admin-catalog` with secret key after checking `profiles.role = 'admin'` (per integration notes: no secret key in admin browser). DeepSeek drafts muscles/complexity there; admin reviews before save.
Storage: bucket `exercise-images`; `catalog/<file>` readable by authenticated, written only by admin fn; `<user_id>/<file>` owner-only (custom images, later).

## 3. Profile & user level
`profiles` add: `role text default 'user'` (protected: column grants exclude it), `sex text null (male|female)`, `training_experience text null (never|lt_1y|1_3y|3y_plus)`, `overall_level text null` (protected, server-computed), `level_updated_at`.
`body_weights` (id, user_id, measured_at date, weight_kg numeric(5,2); unique(user_id, measured_at)) — owner CRUD.
`user_exercise_levels` (user_id, exercise_id, level, source `standards|muscles|overall|onboarding`, confidence numeric, updated_at; pk(user_id, exercise_id)) — select-only for client, written by weekly job.

## 4. Prescription (plans & workouts)
- `workouts` (id, owner_id, name, color_idx, labels text[], in_library bool, source_workout_id null → workouts on delete set null) — `in_library=true` → shown in Workouts tab; plan workouts have false. `source_workout_id` = copied from.
- `plans` (id, owner_id, name, color_idx, labels text[]) — drop `workouts jsonb`.
- `plan_workouts` (plan_id, workout_id, position smallint; pk(plan_id, workout_id)).
- Decision: copy on add (current app behavior). Adding a library workout to a plan creates a copy with `source_workout_id`. Edits stay local, so no prompt on every edit and no blocked deletes. Progress is per exercise, so copies lose nothing. A later "apply to copies too" can find them by `source_workout_id` without a schema change (the join table also allows true sharing).
- `workout_exercises` (id, workout_id, exercise_id → exercises restrict, position, laps smallint ≥1, rest_sec int, is_visible bool, color_idx, sets jsonb) — `sets` = per-lap targets `[{reps?, weight?, duration_sec?}]`, length = laps (check `jsonb_typeof='array'`); always loaded/edited with the row, never queried → jsonb is fine here.
- What a set tracks comes from `exercises.metric`, not from `repeats = 0`: `weight_reps` → reps+weight inputs; `reps` → reps; `time` → `duration_sec` target, set counted down then logged as held time. `repeats` field disappears from the domain model.
RLS: owner on workouts/plans; children via `exists (parent.owner_id = auth.uid())`; insert into `workout_exercises` also requires the exercise to be global or own.
Saving a workout with its exercises = one RPC `save_workout(workout jsonb)` (atomic upsert + delete removed rows). Same for `save_plan`.

## 5. Logs (source of truth)
- `workout_sessions` (id client uuid, user_id, workout_id null on delete set null, plan_id null, workout_name snapshot, started_at, finished_at, effort_rating smallint null 1–5, source `played|ai|legacy_baseline`).
- `set_logs` (id, session_id cascade, user_id, exercise_id restrict, workout_exercise_id null, exercise_order, lap_no, planned_reps/weight/duration/rest_sec null, reps, weight, duration_sec, rest_sec_actual, is_skipped bool, logged_at). Index (user_id, exercise_id, logged_at).
- Write only via RPC `finish_session(session jsonb, sets jsonb)` — security invoker, idempotent on session id (`on conflict do nothing`), works with offline queue. Client: select + delete own session; no direct insert/update on `set_logs`.

## 6. Summaries (trigger-filled, client select-only)
- `exercise_session_stats` (session_id, exercise_id, user_id, performed_at, top_weight, top_reps, best_e1rm, max_reps, max_hold_sec, volume, hard_sets, total_sets, skipped_sets, intensity numeric; pk(session_id, exercise_id)). Index (user_id, exercise_id, performed_at desc).
- `personal_records` (user_id, exercise_id, kind `e1rm|weight|reps|hold|volume`, value, session_id, achieved_at; pk(user_id, exercise_id, kind)).
- Statement-level `after insert` trigger on `set_logs` (transition table) → upsert stats + PRs. e1RM = Epley, reps capped at 12. Delete session → recompute stats/PRs for affected exercises. Baseline sessions excluded from PR rewards.

## 7. Computed (SQL functions, security invoker, no tables yet)
- `get_muscle_fatigue()` → per muscle: recovery %, sets this week, last trained, trend (stats × exercise_muscles × decay by recovery_hours). Used by AI Edge Function and UI.
- `get_muscle_progress(p_period_days)` → best-of-period vs previous, ±3% stable, min 2 sessions, fatigue flag.
- `estimate_start_weight(p_exercise_id)` → e1RM via pattern ratio → muscles → standards → default; returns value + confidence + discount; rounding to weight step stays in app (setting is local).
- `recalc_levels()` weekly via `pg_cron` (portable Postgres ext) → `user_exercise_levels`, `profiles.overall_level`. Security definer, revoked from clients.

## 8. Legacy data transfer
ID mapping: `uuid_v5(NAMESPACE, '<kind>:<owner>:<path of nanoids>')` — deterministic, so re-runs are idempotent. Plan workouts use `plan uid + workout uid` (embedded copies can share nanoids). `lastUpdated` ms → `created_at = updated_at = to_timestamp(ms/1000)`.

| Legacy | → Supabase |
| --- | --- |
| RTDB `/ExerciseImages` + Storage files | copy files to `exercise-images/catalog/`, rows `exercise_images(owner null)` (admin script) |
| distinct exercise names (both users) | `legacy-exercise-map.json` {normalized name → catalog exercise id \| "custom"} reviewed by hand; catalog entries created first with muscles/complexity/pattern (DeepSeek draft → admin review) |
| ExerciseType mapped to catalog | `workout_exercises.exercise_id` = catalog id |
| ExerciseType "custom" | one `exercises` row per user per normalized name (owner = user, image by `imageUrl` → `exercise_images`, muscles empty → excluded from muscle stats until filled; "similar to" picker fixes it) |
| `name`, `imageUrl` | exercise definition (if prescription name differs from catalog name → custom) |
| `breakTimeInSec, laps, isVisible, colorIdx` | `rest_sec, laps, is_visible, color_idx` |
| `repeats > 0` + `approaches[]` | `metric` weight_reps (any weight>0) else reps; `sets = approaches.map({reps, weight})`, padded/trimmed to `laps` |
| `repeats = 0` (timer-only) | `metric = time`, `sets = laps × {duration_sec: null}` (no work duration existed; user sets it later) |
| WorkoutType | `workouts(in_library=true)` + `workout_exercises(position = array index)` |
| PlanType + embedded workouts | `plans` + `workouts(in_library=false)` + `plan_workouts(position)`; `source_workout_id` set when name+exercises match a library workout |
| last `approaches` weights (only performance signal) | `workout_sessions(source='legacy_baseline', started_at = lastUpdated)` + `set_logs` → gives starting e1RM; excluded from PRs/progress UI |
| `currentWeight/currentRepeats`, `ownerUid` | dropped (transient / replaced by owner_id) |
| `usersData.friendsUIDs` | not migrated (no feature) |
| auth users (2) | users sign in to Supabase (same email/Google) → profile auto-created |

Mechanics: pure fn `legacy-to-supabase.ts` (unit-tested with fixtures) builds one payload per user; in-app one-time import after Supabase login reads the persisted Redux plans/workouts and calls RPC `import_legacy_data(payload jsonb)` (security invoker, atomic, idempotent, sets `profiles.legacy_imported_at`). Catalog/images run before, as a local admin script with secret key. Then per entity: delete Firebase + Redux code (CLAUDE.md rule).

## 9. Order of work (one migration each, pgTAP RLS test each)
1. Reference + catalog + images bucket; admin Edge Function; seed muscles/groups/patterns.
2. Profiles columns + body_weights + onboarding.
3. Prescription tables + `save_workout/save_plan` RPC; drop+recreate jsonb init tables; regen types; `app/api` + `app/services` for workouts/plans.
4. Catalog content: import images, build exercise map, admin fills muscles/complexity/patterns/standards.
5. Legacy import (fn + RPC + in-app trigger); remove Firebase/Redux for plans/workouts/images.
6. Logs + `finish_session` + stats/PR trigger; playback writes sessions instead of overwriting `approaches`.
7. Fatigue/progress/start-weight fns; `recalc_levels` cron; AI Edge Function consumes fatigue summary.

## Decisions (2026-11-01)
- Pushed empty init tables → drop/recreate in a new migration.
- `repeats = 0` today = timer only → explicit `exercises.metric` (`time`) + `duration_sec` per set.
- Legacy baseline sessions: yes.
- Plan workouts: copy on add + `source_workout_id` (Dmytro leaned to shared, unsure; schema supports both).

## Implementation status (2026-11-01)
Done — migrations `20261101190000…190500`, pgTAP `supabase/tests/{rls,workflows,legacy-import}.test.sql` (77 checks), types regenerated, `app/api/legacy-import/` (mapper + `createLegacyImport` fetcher + jest test).
RPCs: `save_workout`, `save_plan`, `delete_plan`, `finish_session`, `import_legacy_data`, `get_muscle_fatigue`, `get_exercise_progress`, `get_muscle_progress`, `estimate_start_weight`. `recalc_levels` = service only, weekly via pg_cron when available.
Deviations from plan:
- `set_logs`: direct insert allowed for own session (RLS); `finish_session` is still the app path (atomic, idempotent).
- `exercises`: catalog-only columns (complexity, pattern) protected by column grants; global rows never client-writable.
- `profiles`: client insert policy dropped (trigger creates rows); `role`/`overall_level` server-only; onboarding answer sets starting level via trigger; `legacy_imported_at` marks import.
- Fatigue/progress constants inline in SQL (capacity 10 hard sets, decay 3/recovery_hours, ±3%, ±15% weekly trend).
Not done yet: progress-rate level adjustment; `admin-catalog` Edge Function; Firebase images → bucket copy script + exercise map review; app wiring (services/hooks, playback → `finish_session`, import trigger after login, removing Firebase/Redux per entity).
