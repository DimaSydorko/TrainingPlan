---
description: Review all uncommitted changes (or a given range) against the architecture checklist and code style
argument-hint: "[--staged | <base-branch>]"
allowed-tools: Agent, Read, Edit, Grep, Glob, Bash(git status:*), Bash(git diff:*), Bash(git ls-files:*), Bash(rg:*)
---

Review code changes before commit.

**Scope** from `$ARGUMENTS`:

-   empty → all uncommitted changes (`git diff HEAD` + untracked files)
-   `--staged` → `git diff --cached`
-   a branch name → `git diff <branch>...HEAD`

If there are no changes in scope, say so and stop.

## Steps

1. Launch the `code-reviewer` subagent with the scope. Do not review in the main context.
2. Show its report as returned.
3. 🔴 / 🟠 findings: **report only** — do not change code for them.
4. 🟡 findings: list them as numbered fixes and ask: "Apply 🟡 fixes? (all / numbers / none)". Wait for the answer.
   Apply only the confirmed ones with Edit, then run `npx prettier --write <touched files>` and
   `npx tsc --noEmit`, and list what changed.
5. 🔵: report only.

End with the verdict line. When run from `/pre-commit`, also return whether any 🔴 exists.
