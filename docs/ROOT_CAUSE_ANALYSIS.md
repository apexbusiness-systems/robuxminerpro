# Git remote connection issue — Root Cause Analysis

## Summary
Build automations and IDE integrations could not push or save changes because the repository's Git remote still referenced (or was expected to reference) an outdated URL. The local repository currently has no `origin` configured, so any workflow that relies on syncing with GitHub fails immediately.

## Evidence
- `git remote -v` returns no configured remotes, confirming there is no active `origin` to push to or fetch from.
- `.git/config` contains only the core section and lacks any `[remote "origin"]` entry, showing the previous URL was removed or never updated after a rename/migration.

## Root Cause
The project was renamed or moved, but the Git remote URL was not updated accordingly. As a result, tooling that assumes a valid `origin` (CI pipelines, editors, or Lovable autosave) cannot connect to GitHub.

## Resolution
- Configure the remote to the current GitHub repository:
  ```sh
  git remote remove origin 2>/dev/null || true
  git remote add origin <NEW_REPO_URL>
  git remote -v
  ```
- After updating the remote, re-run your saves/pushes to confirm successful connectivity.
- Add an automated connectivity check so contributors can validate the remote points to a reachable repository. Optionally, set
  `EXPECTED_GIT_REMOTE` to the current GitHub URL so the script can detect stale remotes automatically:
  ```sh
  EXPECTED_GIT_REMOTE=<NEW_REPO_URL> npm run check:git-remote
  ```
  The check sets `GIT_TERMINAL_PROMPT=0` to avoid hanging on credential prompts when the remote requires authentication and uses a non-interactive `GIT_SSH_COMMAND` (batch mode, strict host key checking, short timeout) so SSH remotes fail fast instead of stalling on prompts. When `AUTO_FIX_GIT_REMOTE=1` is provided alongside `EXPECTED_GIT_REMOTE`, the script will add or update `origin` before validating connectivity so automation cannot be blocked by a missing or stale remote.

## Preventive Measures
- When renaming or transferring the repository, immediately update the local and CI git remotes.
- Add a quick remote check (`git remote -v` or `npm run check:git-remote`) to onboarding docs so future contributors validate connectivity before working.
