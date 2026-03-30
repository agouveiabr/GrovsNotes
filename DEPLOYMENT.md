# GrovsNotes Deployment Guide

## Prerequisites

- Node.js >= 22
- pnpm >= 10
- A Convex account (free tier available at [convex.dev](https://convex.dev))
- A Gemini API key (free tier available at [ai.google.dev](https://ai.google.dev))

## Step 1: Install Convex CLI

```bash
npm install -g convex
```

Verify installation:
```bash
convex --version
```

## Step 2: Start Development & Authenticate

```bash
npx convex dev
```

This will:
- Show a device authentication link (visit in your browser)
- Let you create/sign in to your Convex account
- Ask which project to configure
- Generate auth credentials locally in `~/.convex/config.json`
- Create `.env.local` with `CONVEX_DEPLOYMENT` and `CONVEX_URL`

## Step 3: Deploy to Convex Cloud

From `npx convex dev`, you already have a development deployment running. To deploy to production:

```bash
npx convex deploy
```

This will:
- Deploy your Convex functions to Convex Cloud
- Generate TypeScript types in `convex/_generated/`
- Display your deployment URL (looks like `https://xyz-abc.convex.cloud`)
- Ask for confirmation before deploying

**Note:** Save the deployment URL from the output

## Step 4: Configure Environment Variables

### Local Development (`.env.local` auto-created by `convex dev`):
The `.env.local` file is automatically created with:
```
CONVEX_DEPLOYMENT=...
CONVEX_URL=https://your-dev-deployment.convex.cloud
```

### Frontend Convex URL (`apps/web/.env.local`):
Update with your development or production URL:
```
VITE_CONVEX_URL=https://your-deployment-url.convex.cloud
```

### Convex Cloud Environment Variables:
In [Convex Dashboard](https://dashboard.convex.dev):
1. Select your project
2. Go to **Settings** → **Environment Variables**
3. Add:
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `API_KEY` - Secret key for git hook authentication (generate a random string)

## Step 5: Install & Test Locally

Install frontend dependencies (if not already done):
```bash
pnpm install
```

Start the development environment:
```bash
# Keep this running in a terminal
npx convex dev
```

In another terminal, start the frontend:
```bash
pnpm dev
```

Visit `http://localhost:5173` and test:
- ✓ Create a new item in Inbox
- ✓ Create a project
- ✓ Search for items
- ✓ Refine an item with AI
- ✓ Real-time sync (open app in two browser tabs)
- ✓ Offline mode (DevTools → Network → Offline)

## Step 6: Deploy Frontend

### Option A: Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Vercel will:
- Connect your GitHub repo
- Set up `VITE_CONVEX_URL` environment variable
- Deploy automatically on push

**⚠️ IMPORTANT AVERT:** Vercel only deploys your React frontend. It **does not** automatically deploy your Convex backend functions or schema changes. Whenever you modify files in the `convex/` folder, you MUST run `npx convex deploy` locally to push those changes to your production Convex environment! Alternatively, you can [configure the Vercel-Convex integration](https://docs.convex.dev/hosting/vercel) to do it automatically.

### Option B: Other Hosting

Deploy the built frontend from `apps/web/dist/` to your preferred host:

```bash
pnpm build
```

Make sure to set the `VITE_CONVEX_URL` environment variable on your hosting platform.

## Step 7: Configure Git Hook Integration

Create `.git/hooks/post-commit`:

```bash
#!/bin/bash
set -e

API_KEY="your-api-key-here"
CONVEX_URL="https://your-deployment-url.convex.cloud"
REPO_NAME="grovsnotes"

curl -X POST "$CONVEX_URL/dev-logs" \
  -H "X-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "repo": "'$REPO_NAME'",
    "branch": "'$(git rev-parse --abbrev-ref HEAD)'",
    "commitHash": "'$(git rev-parse HEAD)'",
    "message": "'$(git log -1 --pretty=%B)'"
  }' 2>/dev/null || true
```

Make it executable:
```bash
chmod +x .git/hooks/post-commit
```

## Step 8: Verify Everything Works

1. Visit your deployed frontend
2. Create an item to test:
   - Item creation
   - Real-time sync
   - Markdown rendering
   - AI refinement
3. Check git hooks (make a commit and verify the timeline updates)
4. Test search and filters

## Troubleshooting

### "npx convex dev" fails with InvalidConfig error
```
InvalidConfig: lib/search-parser.js is not a valid path to a Convex module
```
**Solution:**
- This may occur with cached builds. Run: `rm -rf convex/_generated node_modules/.convex`
- Ensure `convex.json` has `"functions": "convex/"` (string, not object)
- File names in convex/ must use only alphanumeric, underscores, periods (no hyphens)

### "Cannot connect to Convex" in browser
- Ensure you're visiting the correct URL in `.env.local`
- Check that `CONVEX_DEPLOYMENT` is set in `.env.local`
- Verify Convex dev server is still running: `npx convex dev`

### "VITE_CONVEX_URL is not defined"
- Frontend needs `.env.local` or `.env` with `VITE_CONVEX_URL`
- For dev: use the URL from `npx convex dev` output
- For prod: use your deployed Convex Cloud URL

### "AI refinement returns errors"
- Check `GEMINI_API_KEY` is set in Convex Cloud environment
- Verify the key is valid at [ai.google.dev](https://ai.google.dev)
- View Convex logs: `npx convex logs`

### "Git hook not creating dev logs"
- Test the hook manually:
  ```bash
  .git/hooks/post-commit
  ```
- Verify `API_KEY` matches in script and Convex environment
- Check your Convex dashboard logs for POST errors

### "Port 3210 already in use"
The dev server uses port 3210. To use a different port:
```bash
npx convex dev --port 3211
```

## Rollback Plan

To revert to the old Fastify backend:

1. Keep the old `apps/api/` directory
2. Revert `apps/web/src/App.tsx` to use `QueryClientProvider`
3. Revert component imports to old hook paths
4. Keep Convex files as reference

## Costs

**Convex Cloud Free Tier includes:**
- 10GB storage
- 1M reads/month
- 100K writes/month
- 100K actions/month

For a single-user app like GrovsNotes, this is plenty. You'll only pay if you exceed limits.

## Support

- Convex Docs: https://docs.convex.dev
- Gemini API Docs: https://ai.google.dev
- GitHub Issues: Your project repository
