#!/usr/bin/env bash
set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  echo "git is not available on this system" >&2
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "This script must be run inside a git repository" >&2
  exit 1
fi

remote_name="origin"

if ! git remote get-url "$remote_name" >/dev/null 2>&1; then
  echo "Remote '$remote_name' is not configured. Configure it with the current GitHub URL and try again." >&2
  exit 2
fi

remote_url=$(git remote get-url "$remote_name")

echo "Detected remote '$remote_name': $remote_url"

echo "Checking connectivity ..."
if git ls-remote --exit-code "$remote_url" >/dev/null 2>&1; then
  echo "Remote '$remote_name' is reachable."
else
  echo "Unable to reach remote '$remote_name'. Verify network access and that the URL is correct." >&2
  exit 3
fi
