#!/bin/sh
# PreToolUse(Bash) hook: blocks `git commit` unless /pre-commit passed for exactly the current changes.
command=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(JSON.parse(s).tool_input.command||"")}catch(e){}})')

printf '%s\n' "$command" | grep -Eq '(^|[;&|(][[:space:]]*|^[[:space:]]*)git([[:space:]]+-[cC][[:space:]]+[^[:space:]]+)*[[:space:]]+commit([[:space:]]|$)' || exit 0

root=${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}
marker="$root/.claude/.pre-commit-ok"
current=$(sh "$root/.claude/hooks/fingerprint.sh")

if [ -f "$marker" ] && [ "$(cat "$marker")" = "$current" ]; then
  exit 0
fi

echo "git commit blocked: run /pre-commit first. The changes have no passing /pre-commit run (or changed since). /pre-commit records .claude/.pre-commit-ok when it reports 'Ready to commit: yes'; never write that file any other way." >&2
exit 2
