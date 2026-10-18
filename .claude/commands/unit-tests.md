---
description: Write unit tests for uncommitted changes (or given files) and make sure they pass
argument-hint: "[--staged | <base-branch> | <file...>]"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(git status:*), Bash(git diff:*), Bash(git ls-files:*), Bash(rg:*), Bash(npx jest:*), Bash(npx prettier:*)
---

Scope (`$ARGUMENTS`): empty → uncommitted changes (`git diff HEAD` + untracked); `--staged`; `<branch>` (`<branch>...HEAD`); or files.

1. Collect changed files in `app/` (skip `__tests__/`, `*.d.ts`, `assets/`, `database.types.ts`).
2. Classify: logic changed → test; only types/styles/constants/imports/renames → skip; bug fix → regression test (ask for one sentence if the bug is unclear).
3. Test file = sibling `__tests__/<name>.test.ts(x)` (root `__tests__/` for app-level). If it exists, add only missing cases.
4. Cover every new branch, early return, error path and variant in the diff (`npx jest <test> --coverage --collectCoverageFrom=<src>` if unsure).
5. Write in the style of the nearest existing test (e.g. `app/screens/playing-screen/__tests__/playback-schedule.test.ts`, `__tests__/app.test.tsx`). For `app/api`, `app/services`, `app/stores` read `.claude/skills/firebase-to-supabase-react-query/references/test-templates.md`.
6. Run `npx jest <test files>`; fix wrong tests. **Never edit source to make a test pass** — report a suspected bug.
7. `npx prettier --write` the test files.

Minimum per unit: util → each code path · component → render + interaction · fetcher → mapping + error · hook → success + `enabled` gating (+ optimistic update and rollback) · store → each action + `reset()` (+ `migrate`) · bug fix → regression.

Rules:
- RNTL 14 is async: `await render`, `await renderHook`, `const user = userEvent.setup(); await user.press(...)`.
- `renderWithStore` (`__tests__/utils/render.tsx`) for Redux-connected components; plain `render` otherwise.
- Native modules are mocked in `__tests__/setup/` — extend there. Mock the layer below: component → hook, hook → fetcher, fetcher → Supabase client.
- Queries: `getByRole` > `getByLabelText`/`getByPlaceholderText` > `getByText` > `getByTestId` (Maestro ids).
- Fake timers for timer logic; `AsyncStorage.clear()` / store `reset()` in `beforeEach` when needed.
- Behavior over implementation; no snapshots, `.skip`, `.only` or commented-out tests; shared data in a `__tests__/fixtures` helper.

Report:
```
| Source file | Test file | Cases added | Status |
Skipped: <files + reason>
Suspected bugs: <test → why>
```
