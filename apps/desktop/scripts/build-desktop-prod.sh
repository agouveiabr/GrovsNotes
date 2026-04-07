#!/usr/bin/env bash
# Load production Convex URL from the web app's .env.production
if [ -f "../../web/.env.production" ]; then
  export $(grep -v '^#' ../../web/.env.production | xargs)
else
  echo "⚠️ .env.production not found at ../../web/.env.production"
  exit 1
fi

# Build the web frontend with the production env
pnpm --filter @grovsnotes/web build

# Build the desktop app (requires Tauri CLI installed)
pnpm tauri build
