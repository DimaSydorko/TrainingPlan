---
description: Write unit tests for uncommitted changes that are not covered yet
argument-hint: "[--staged | <base-branch> | <file...>]"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(git status:*), Bash(git diff:*), Bash(git ls-files:*), Bash(rg:*), Bash(npx jest:*), Bash(npx prettier:*)
---

Write tests for the changed code. Follow `.claude/commands/unit-tests.md` (templates, locations, mocks) — read it
first.

**Scope** from `$ARGUMENTS`: empty → all uncommitted changes (`git diff HEAD` + untracked files); `--staged`; a
branch (`<branch>...HEAD`); or explicit files.

## Steps

1. **Collect** changed source files under `app/` (skip `__tests__/`, `*.d.ts`, `Assets/`, `database.types.ts`).
2. **Classify** each file:
    - **needs tests** — new/changed functions, branches, components, hooks, fetchers, mappers, stores
    - **no tests** — only types, `*.styles.ts`, `*.constants.ts` values, imports, renames, comments
    - **bug fix** (diff or commit intent says fix) — needs a regression test; if the bug isn't clear from the diff,
      ask the user for one sentence describing it
3. **Locate** the test file for each (table in `unit-tests.md`). If it exists, read it and add only the missing
   cases; never duplicate existing ones.
4. **Find uncovered paths** in the diff: each new branch/early return/error path/variant gets a case. Run
   `npx jest <test file> --coverage --collectCoverageFrom=<source file>` when unsure.
5. **Write** tests with the matching template (pure fn, component, fetcher, React Query hook, Zustand store).
   Reuse `__tests__/setup` mocks and existing fixtures. RNTL is async (`await render`, `await user.press`).
6. **Run** each new/edited test file: `npx jest <files>`. Fix the **test** if it is wrong.
7. **Never edit source code to make a test pass.** If a correct test fails, keep it, mark the failure as a
   suspected bug, and report it.
8. `npx prettier --write` the test files.

## Report

```
| Source file | Test file | Cases added | Status |
Skipped (no tests needed): <files + reason>
Suspected bugs: <test → why>
```
