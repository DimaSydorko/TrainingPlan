#!/bin/sh
# Prints one hash for the current uncommitted state (tracked changes vs HEAD + untracked files).
# Independent of staging, so `git add` between /pre-commit and `git commit` keeps it valid.
cd "$(git rev-parse --show-toplevel)" || exit 1
{
  git diff HEAD --name-only
  git ls-files --others --exclude-standard
} | sort -u | while IFS= read -r file; do
  if [ -f "$file" ]; then
    printf '%s %s\n' "$file" "$(git hash-object -- "$file")"
  else
    printf '%s deleted\n' "$file"
  fi
done | git hash-object --stdin
