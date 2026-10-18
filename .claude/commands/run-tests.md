---
description: Run type check, lint and tests for uncommitted changes and fix broken tests
argument-hint: "[--full]"
allowed-tools: Read, Edit, Grep, Glob, Bash(git status:*), Bash(git diff:*), Bash(git ls-files:*), Bash(npx jest:*), Bash(npx tsc:*), Bash(npm test:*), Bash(npm run lint:*), Bash(npx eslint:*), Bash(npx prettier:*)
---

Verify the working tree is ready to commit.

## Steps

1. Changed files: `git diff HEAD --name-only --diff-filter=ACMR` + `git ls-files --others --exclude-standard`,
   filtered to `*.ts`, `*.tsx`, `*.js` outside `admin/`, `android/`, `ios/`.
2. **Fast pass:** `npx jest --findRelatedTests --passWithNoTests <changed files>` (skip if `--full`).
3. **Full gate**, in order, continue after a failure to collect everything:
    - `npx tsc --noEmit`
    - `npm run lint` — must have 0 errors. Then `npx eslint <changed files>`: warnings on lines changed in this
      diff count as failures (legacy warnings elsewhere in those files are reported, not blocking)
    - `npx prettier --check <changed files>`
    - `npm test`
4. **On failure**, decide per failure whether the test or the code is wrong (read both and the diff):
    - test is outdated/wrong → fix the test, re-run that file; max 2 attempts per test
    - code is wrong → do **not** fix it; report `file:line` and the failing assertion
    - formatting → `npx prettier --write <file>`
    - never `.skip`, `.only`, delete a test, or loosen an assertion to make it pass

## Report

```
| Check      | Result | Notes |
| tsc        | ✅/❌  |       |
| lint       | ✅/❌  | errors, new warnings |
| prettier   | ✅/❌  |       |
| jest       | ✅/❌  | passed/total, fixed tests |
Ready to commit: yes/no
```
