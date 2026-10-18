---
description: Pre-commit pipeline — review changes, write missing tests, run all checks
argument-hint: "[--staged | <base-branch>]"
allowed-tools: Agent, Read, Write, Edit, Grep, Glob, Bash(git status:*), Bash(git diff:*), Bash(git ls-files:*), Bash(rg:*), Bash(npx jest:*), Bash(npx tsc:*), Bash(npm test:*), Bash(npm run lint:*), Bash(npx eslint:*), Bash(npx prettier:*), Bash(sh .claude/hooks/fingerprint.sh:*), Write(.claude/.pre-commit-ok)
---

Run the pre-commit pipeline on `$ARGUMENTS` (default: all uncommitted changes). Do not commit.

1. **Review** — follow `.claude/commands/review-changes.md` with the same scope.
    - Any 🔴 → show the report and **stop**. Ask the user to fix them (or to say "continue anyway").
    - 🟠 → show them and continue.
    - 🟡 → ask for confirmation and apply confirmed fixes before step 2.
2. **Write tests** — follow `.claude/commands/write-tests.md` with the same scope.
3. **Run tests** — follow `.claude/commands/run-tests.md`.
4. **Record the pass** — only if there are no 🔴 left (or the user said "continue anyway") and every check is ✅,
   run `sh .claude/hooks/fingerprint.sh > .claude/.pre-commit-ok` as the very last step (after all fixes). The
   `PreToolUse` hook allows `git commit` only while the working tree matches this fingerprint; any later edit
   requires a new `/pre-commit`. Otherwise delete nothing and write nothing — just report what blocks the commit.

## Final summary (short)

```
Review:  <verdict> — 🔴 n, 🟠 n, 🟡 fixed n/n
Tests:   <n> files, <n> cases added; suspected bugs: <n>
Checks:  tsc ✅/❌ · lint ✅/❌ · prettier ✅/❌ · jest ✅/❌
Ready to commit: yes/no (+ what blocks it)
```

When the user asked for a commit, continue with `git commit` after a pass.

The husky hook (`.husky/pre-commit`) re-runs the mechanical checks on `git commit`; this command is the thinking
part.
