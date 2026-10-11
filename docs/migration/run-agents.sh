#!/usr/bin/env bash
# Launch the Phase 1 migration agents in parallel, each in its own git worktree.
# Run from the repo root AFTER A0 has merged into migration/expo.
#
#   bash docs/migration/run-agents.sh            # all Phase 1 agents
#   bash docs/migration/run-agents.sh a1 a3      # only some
#
# Requires: git, npm, Claude Code CLI (`claude`). tmux optional (one window per agent).
set -euo pipefail

BASE=migration/expo
ROOT=$(git rev-parse --show-toplevel)
PARENT=$(dirname "$ROOT")

# id | branch suffix | brief file | metro port
AGENTS=(
  "a1|data|01-data-firebase.md|8091"
  "a2|auth|02-auth-native-config.md|8092"
  "a3|media|03-media-device.md|8093"
  "a4|playback|04-playback-background.md|8094"
  "a5|ui|05-ui-navigation.md|8095"
  "a6|admin|06-admin-web.md|8096"
  "a7|quality|07-quality.md|8097"
)

want() { [ $# -eq 0 ] && return 0; for w in "${SELECTED[@]}"; do [ "$w" = "$1" ] && return 0; done; return 1; }
SELECTED=("$@")

git -C "$ROOT" fetch origin
git -C "$ROOT" rev-parse --verify "$BASE" >/dev/null || { echo "Branch $BASE missing - run A0 first."; exit 1; }

SESSION=tp-migration
HAS_TMUX=0; command -v tmux >/dev/null && HAS_TMUX=1
[ $HAS_TMUX = 1 ] && ! tmux has-session -t $SESSION 2>/dev/null && tmux new-session -d -s $SESSION -n control -c "$ROOT"

for row in "${AGENTS[@]}"; do
  IFS='|' read -r id name brief port <<<"$row"
  [ ${#SELECTED[@]} -gt 0 ] && ! want "$id" && continue
  dir="$PARENT/tp-$id-$name"
  branch="migration/$id-$name"

  if [ ! -d "$dir" ]; then
    git -C "$ROOT" worktree add "$dir" -b "$branch" "$BASE" 2>/dev/null \
      || git -C "$ROOT" worktree add "$dir" "$branch"
  fi
  # .env is gitignored, so copy it into each worktree
  [ -f "$ROOT/.env" ] && cp -n "$ROOT/.env" "$dir/.env" || true
  (cd "$dir" && npm install --silent)

  ID=$(echo "$id" | tr a-z A-Z)
  PROMPT="You are agent $ID of the Expo migration. Read docs/migration/README.md, docs/migration/DECISIONS.md and docs/migration/agents/$brief, then do your brief. You are in worktree $dir on branch $branch. Only edit files you own. Use Metro port $port (npx expo start --port $port). Commit as you go, and finish by writing docs/migration/handoff/$ID.md from the template."

  if [ $HAS_TMUX = 1 ]; then
    tmux new-window -t $SESSION -n "$id-$name" -c "$dir" "claude --permission-mode acceptEdits \"$PROMPT\"; exec \$SHELL"
  else
    echo; echo "=== $ID — open a new terminal tab and run:"
    echo "cd \"$dir\" && claude --permission-mode acceptEdits \"$PROMPT\""
  fi
done

[ $HAS_TMUX = 1 ] && echo "Agents started. Attach with: tmux attach -t $SESSION  (Ctrl-b n / p to switch windows)"
