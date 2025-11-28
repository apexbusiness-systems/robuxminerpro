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

# Fail fast instead of hanging for interactive credentials when the remote requires auth
export GIT_TERMINAL_PROMPT=0

# Avoid interactive SSH prompts (host key acceptance, password/keyboard-interactive) that would stall automation
: "${GIT_SSH_COMMAND:=ssh -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=10}"

remote_name="origin"
expected_url="${EXPECTED_GIT_REMOTE:-}"
# If EXPECTED_GIT_REMOTE is not provided, attempt to infer it from GitHub Actions env vars
if [[ -z "$expected_url" && -n "${GITHUB_REPOSITORY:-}" ]]; then
  github_server_url="${GITHUB_SERVER_URL:-https://github.com}"
  expected_url="$github_server_url/${GITHUB_REPOSITORY}.git"
  echo "Inferred expected remote from GitHub environment: $expected_url"
fi
auto_fix="${AUTO_FIX_GIT_REMOTE:-}"

if ! git remote get-url "$remote_name" >/dev/null 2>&1; then
  if [[ -n "$auto_fix" && -n "$expected_url" ]]; then
    echo "Remote '$remote_name' is not configured. Applying expected URL: $expected_url"
    git remote add "$remote_name" "$expected_url"
  else
    echo "Remote '$remote_name' is not configured. Configure it with the current GitHub URL and try again." >&2
    if [[ -z "$expected_url" ]]; then
      echo "Hint: set EXPECTED_GIT_REMOTE=<NEW_REPO_URL> AUTO_FIX_GIT_REMOTE=1 to add it automatically." >&2
    fi
    exit 2
  fi
fi

canonical_repo() {
  local url="$1"

  if [[ "$url" =~ ^git@([^:]+):(.+)$ ]]; then
    printf '%s/%s' "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]%.git}"
  elif [[ "$url" =~ ^ssh://git@([^/]+)/(.+)$ ]]; then
    printf '%s/%s' "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]%.git}"
  elif [[ "$url" =~ ^https?://([^/]+)/(.+)$ ]]; then
    printf '%s/%s' "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]%.git}"
  else
    printf '%s' "$url"
  fi
}

remote_url=$(git remote get-url "$remote_name")

echo "Detected remote '$remote_name': $remote_url"

if [[ -n "$expected_url" ]]; then
  canonical_expected=$(canonical_repo "$expected_url")
  canonical_remote=$(canonical_repo "$remote_url")

  if [[ "$canonical_remote" != "$canonical_expected" ]]; then
    if [[ -n "$auto_fix" ]]; then
      echo "Remote '$remote_name' does not match expected repository. Updating to $expected_url" >&2
      git remote set-url "$remote_name" "$expected_url"
      remote_url="$expected_url"
      canonical_remote="$canonical_expected"
    else
      cat <<EOF >&2
Remote '$remote_name' does not match the expected repository URL.
  Expected: $expected_url
  Found:    $remote_url

Update the remote to the correct repository and retry, or enable AUTO_FIX_GIT_REMOTE=1 with EXPECTED_GIT_REMOTE set:
  git remote remove $remote_name 2>/dev/null || true
  git remote add $remote_name $expected_url
EOF
      exit 4
    fi
  elif [[ "$remote_url" != "$expected_url" ]]; then
    echo "Remote '$remote_name' points to the expected repository but uses a different protocol. Proceeding without changes."
  fi
fi

echo "Checking connectivity ..."
if git ls-remote --exit-code "$remote_url" >/dev/null 2>&1; then
  echo "Remote '$remote_name' is reachable."
else
  echo "Unable to reach remote '$remote_name'. Verify network access and that the URL is correct." >&2
  exit 3
fi
