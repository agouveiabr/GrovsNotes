#!/usr/bin/env bash
# Load production Convex URL from the web app's .env.production (cwd = project root)
if [ -f "apps/web/.env.production" ]; then
  export $(grep -v '^#' apps/web/.env.production | xargs)
else
  echo "⚠️ .env.production not found at apps/web/.env.production"
  exit 1
fi

# Ensure workspace dependencies are installed
pnpm install

# Ensure Tauri CLI is available (install globally if not present)
if ! command -v tauri >/dev/null 2>&1; then
  echo "⚙️ Installing Tauri CLI globally..."
  pnpm add -g @tauri-apps/cli
fi

# Build the web frontend with the production env
pnpm --filter @grovsnotes/web build

# Build the desktop app (runs tauri from the desktop workspace's devDependencies)
pnpm --filter @grovsnotes/desktop tauri build
