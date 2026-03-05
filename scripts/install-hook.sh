#!/bin/sh
# scripts/install-hook.sh
# Install GrovsNotes post-commit hook in a repo

TARGET="${1:-.}"
HOOK_DIR="$TARGET/.git/hooks"

if [ ! -d "$HOOK_DIR" ]; then
  echo "Error: $TARGET is not a git repository"
  exit 1
fi

cp "$(dirname "$0")/post-commit" "$HOOK_DIR/post-commit"
chmod +x "$HOOK_DIR/post-commit"
echo "GrovsNotes post-commit hook installed in $TARGET"
