#!/bin/bash
# Installs gstack (https://github.com/garrytan/gstack) into Claude Code cloud sessions.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

GSTACK_DIR="$HOME/.claude/skills/gstack"
# gstack's own Chromium download is blocked in cloud sessions; use the pre-installed one
CHROMIUM=/opt/pw-browsers/chromium

# Run the install only if this script has changed since the install last succeeded
hashes="$GSTACK_DIR/.session-start.sha256"
if ! sha256sum --check --status "$hashes" 2>/dev/null; then
  rm -f "$hashes"

  if [ ! -d "$GSTACK_DIR/.git" ]; then
    rm -rf "$GSTACK_DIR"
    git clone --quiet --single-branch --depth 1 https://github.com/garrytan/gstack.git "$GSTACK_DIR"
  fi
  (cd "$GSTACK_DIR" && GSTACK_CHROMIUM_PATH="$CHROMIUM" ./setup --no-browser --no-plan-tune-hooks </dev/null >&2)

  sha256sum "$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh" > "$hashes" || rm -f "$hashes"
fi

if [ -n "${CLAUDE_ENV_FILE:-}" ] && [ -x "$CHROMIUM" ]; then
  echo "export GSTACK_CHROMIUM_PATH=$CHROMIUM" >> "$CLAUDE_ENV_FILE"
fi

if ! grep -q '^## gstack' "$HOME/.claude/CLAUDE.md" 2>/dev/null; then
  cat >> "$HOME/.claude/CLAUDE.md" <<'MD'

## gstack

Use the /browse skill from gstack for all web browsing. Never use mcp__claude-in-chrome__* tools.
MD
fi
