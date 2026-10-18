---
description: Git helper — `/git commit [-m "msg"]` runs /pre-commit first, then commits; other subcommands run as-is
argument-hint: "commit [-m \"message\"] | <any git subcommand>"
allowed-tools: Agent, Read, Write, Edit, Grep, Glob, Bash(git:*), Bash(rg:*), Bash(npx jest:*), Bash(npx tsc:*), Bash(npm test:*), Bash(npm run lint:*), Bash(npx eslint:*), Bash(npx prettier:*), Bash(sh .claude/hooks/fingerprint.sh:*), Write(.claude/.pre-commit-ok)
---

Arguments: `$ARGUMENTS`

## If the first word is not `commit`

Run `git $ARGUMENTS` and show the output. Ask before anything destructive (`reset --hard`, `push --force`,
`clean`, `branch -D`, `checkout -- .`). Stop here.

## `/git commit`

1. **Check state.** `git status --short` and `git branch --show-current`. Nothing to commit → say so and stop.
   On `main` → ask whether to commit there or create a branch first (suggest a name); wait for the answer.
2. **Pre-commit.** Follow `.claude/commands/pre-commit.md` on all uncommitted changes (review → write tests → run
   tests → record the pass). If it ends with "Ready to commit: no", stop and show what blocks the commit.
3. **Stage.** If something is already staged, commit only that and list what stays unstaged. If nothing is staged,
   show the file list and stage everything with `git add -A` (including test files written in step 2).
4. **Message.** Use the `-m` text from the arguments if given. Otherwise write one in the repo style
   (`git log --oneline -10`): `type(scope): summary` (feat, fix, refactor, test, chore, docs), imperative, ≤ 72
   chars, plus a short body when the change needs a why. Show it before committing.
5. **Commit** with `git commit -m "<subject>" [-m "<body>"]`. The husky hook runs the staged-file checks; if it
   fails, fix the formatting/test issue, re-run `.claude/commands/run-tests.md`, re-record the pass
   (`sh .claude/hooks/fingerprint.sh > .claude/.pre-commit-ok`), re-stage, and retry once. Never use `--no-verify`.
6. **Report** `git log --oneline -1` and what was left uncommitted. Do not push unless asked.
