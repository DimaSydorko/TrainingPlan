# A8: Integrator and release

## Mission
Merge the Phase 1 branches into `migration/expo` in a safe order, keep the branch green, run the final QA with A7, and prepare the release and the final merge into `dev`/`main`.

## Owns
`docs/migration/STATUS.md`, `docs/migration/DECISIONS.md`, merges on `migration/expo`, and the final formatting commit.

## Phase 2: merging
Merge order, from widest UI changes to deepest behaviour changes:

1. **A7** (config and test infrastructure only; no `app/` changes)
2. **A5** (UI and navigation: touches the most files)
3. **A3** (media services)
4. **A1** (data layer)
5. **A2** (auth and EAS; Google login end to end now works with A1)
6. **A4** (playback: depends on A3, and is the most behaviour-sensitive)

For each branch:
- Read its handoff first. Check every "Touched outside ownership" entry.
- `git merge --no-ff migration/<branch>`. On a lock file conflict, take `migration/expo`'s lock file, then run `npm install` and commit.
- After each merge: `npm ci`, `npx tsc --noEmit`, `npm test`, `npx expo-doctor`, `npx expo prebuild --clean`, and a dev-build smoke test (log in, open every tab, start a workout).
- If something breaks and the fix is small, fix it in a separate commit. Otherwise send it back to the owning agent with a clear reproduction.
- Update `STATUS.md`.

After all six are merged:
- Remove every `TODO(Ax)` and `[stub]` (`grep -rn "TODO(A\|\[stub\]" app` should return nothing).
- Make one repo-wide `npx expo lint --fix` + Prettier commit, titled "chore: format".
- Ask A7 to fix any remaining lint errors or add `testID`s.

## Phase 3: QA and release
1. Run `TESTING.md` in full on a real Android device (ideally Android 14+ **and** an older one) and on an iOS device or simulator, plus the Maestro flows.
2. **Upgrade test**: install the last production build of the old app, log in, change settings, then install the new preview build over it. The user stays logged in (or gets one clean re-login, documented), and settings and data are kept.
3. EAS: `preview` builds for both platforms go to testers (Dmytro and his brother). Collect feedback in `STATUS.md`.
4. `production` build. Store metadata: if the bundle ID changed (D1), it's a new listing; otherwise bump the version.
5. Update `ReadMe.md` with the new stack, setup (`.env`), and the run, build, and test commands.
6. Merge `migration/expo` → `dev` with a PR summarizing all handoffs, then `dev` → `main` per Dmytro's process. Clean up the worktrees with `git worktree remove`.

## Acceptance criteria
- Every item in README §8 is ticked.
