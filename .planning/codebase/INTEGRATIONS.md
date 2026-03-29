# External Integrations

**Analysis Date:** 2025-03-05

## APIs & External Services

**AI:**
- Google Gemini API - Used for refining and formatting notes/tasks.
  - SDK/Client: Direct `fetch` call in `convex/ai.ts`.
  - Auth: `GEMINI_API_KEY` (Convex environment variable).

**Note Taking / Brain:**
- Obsidian - Integration with a custom Obsidian API.
  - Service: `https://obsidian-brain-api.vercel.app/api/notes`.
  - SDK/Client: Direct `fetch` call in `convex/obsidian.ts`.
  - Auth: `OBSIDIAN_BRAIN_API_KEY` (Convex environment variable).

**Dev Logs Tracking:**
- Git Webhooks - Receives repo commits/logs.
  - Endpoint: `/dev-logs` in `convex/http.ts`.
  - Auth: `API_KEY` (Validated via `x-api-key` header).

## Data Storage

**Databases:**
- Convex (Real-time backend-as-a-service).
  - Connection: `VITE_CONVEX_URL` (Client environment variable).
  - Client: `ConvexReactClient` from `convex/react`.
  - Schema: `convex/schema.ts`.

**File Storage:**
- Convex - Used for storing any persistent data/files through Convex's built-in storage.

**Caching:**
- Convex built-in caching for queries.

## Authentication & Identity

**Auth Provider:**
- Custom / Not fully implemented - The current `http.ts` uses an `API_KEY` for webhook authentication. No user authentication was detected in the frontend apps yet.

## Monitoring & Observability

**Error Tracking:**
- None detected - No Sentry or similar service.

**Logs:**
- `convex/devLogs.ts` - Custom implementation for tracking project logs within the app.
- Standard `console.log` in Convex actions/mutations.

## CI/CD & Deployment

**Hosting:**
- Vercel - Configured for web app hosting in `vercel.json`.
- Convex - Cloud functions and database hosting.

**CI Pipeline:**
- Not detected - No Github Actions or other CI files were found in the project root.

## Environment Configuration

**Required env vars:**
- `VITE_CONVEX_URL` (Web app)
- `GEMINI_API_KEY` (Convex)
- `OBSIDIAN_BRAIN_API_KEY` (Convex)
- `API_KEY` (Convex)

**Secrets location:**
- `.env` files (local) and Convex Dashboard (cloud).

## Webhooks & Callbacks

**Incoming:**
- `POST /dev-logs` - Receives git commit logs (handled in `convex/http.ts`).

**Outgoing:**
- `POST https://obsidian-brain-api.vercel.app/api/notes` - Sends note/task data to Obsidian (handled in `convex/obsidian.ts`).
- `POST https://generativelanguage.googleapis.com/v1beta/models/...` - Sends content to Gemini for refinement (handled in `convex/ai.ts`).

---

*Integration audit: 2025-03-05*
