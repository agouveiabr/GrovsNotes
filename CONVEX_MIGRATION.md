# Convex Migration Status

## Completed Work

### Phase 1: Schema & Setup ✅
- Created `convex/schema.ts` with all 6 tables (items, tags, itemTags, projects, devLogs)
- Created `convex/tsconfig.json` for TypeScript support
- Created `convex.json` project configuration

### Phase 2: Backend Functions ✅
- Created `convex/items.ts` - Full CRUD for items with hashtag parsing
- Created `convex/projects.ts` - Project management with item count aggregation
- Created `convex/search.ts` - Full-text search with filters (type, project, tag)
- Created `convex/devLogs.ts` - Git hook integration with API key validation
- Created `convex/ai.ts` - AI refinement using Gemini API only
- Created `convex/lib/hashtags.ts` - Hashtag parsing utility
- Created `convex/lib/search-parser.ts` - Search query parsing utility

### Phase 3: Frontend Integration (Partial) ✅
- Created Convex hook files:
  - `apps/web/src/hooks/use-items-convex.ts`
  - `apps/web/src/hooks/use-projects-convex.ts`
  - `apps/web/src/hooks/use-search-convex.ts`
  - `apps/web/src/hooks/use-dev-logs-convex.ts`
- Updated `apps/web/src/App.tsx` to use ConvexProvider instead of QueryClientProvider

## Remaining Work

### Phase 3: Frontend Integration (Complete) ✅
All components updated to use new Convex hooks:
1. ✅ `capture-input.tsx` - useCreateItem with offline queue support
2. ✅ `item-detail.tsx` - useItem, useUpdateItem, useDeleteItem, useRefineItem with AI preview
3. ✅ `inbox-list.tsx` - useItems with status filtering
4. ✅ `project-list.tsx` - useProjects, useCreateProject with toasts
5. ✅ `project-items.tsx` - useItems with projectId filter
6. ✅ `search-view.tsx` - useSearch with debouncing
7. ✅ `timeline-view.tsx` - useItems, useDevLogs with time-based grouping

2. Hook usage pattern differences:
   ```typescript
   // OLD (TanStack Query)
   const { data, isLoading } = useQuery({
     queryKey: ['items'],
     queryFn: () => api.items.list()
   });

   // NEW (Convex)
   const items = useQuery(api.items.listItems, { status: 'inbox' });
   const isLoading = items === undefined;
   ```

3. Mutation usage differences:
   ```typescript
   // OLD (TanStack Query)
   const mutation = useMutation({
     mutationFn: api.items.create,
     onSuccess: () => queryClient.invalidateQueries(['items'])
   });

   // NEW (Convex)
   const createItem = useMutation(api.items.createItem);
   await createItem({ title: "...", content: "..." });
   // Automatic cache invalidation - no manual invalidation needed!
   ```

### Phase 4: Deployment (Ready) ✅
Setup complete - ready for execution. See `DEPLOYMENT.md` for step-by-step guide.

Completed:
1. ✅ Added Convex dependencies to `apps/web/package.json`:
   - `convex@^1.15.0`
   - `convex/react@^1.15.0`

2. ✅ Created `apps/web/.env.local` with placeholder:
   ```
   VITE_CONVEX_URL=https://your-deployment-url.convex.cloud
   ```

3. ✅ Created `.env` in project root with placeholders for:
   - `GEMINI_API_KEY` - Google Gemini API key
   - `API_KEY` - Git hook authentication key

4. ✅ Created `DEPLOYMENT.md` with comprehensive deployment guide

Next steps:
1. `npx convex auth login` - Authenticate with Convex Cloud
2. `npx convex deploy --run-codegen` - Deploy to Convex Cloud
3. Update `.env.local` with actual deployment URL
4. Update Convex environment variables with API keys
5. Deploy frontend to Vercel or preferred hosting

### Phase 5: Testing & Verification (In Progress) ✅
Status: Build verified, Convex functions compile, ready for runtime testing

Completed:
- ✅ Convex functions compile successfully
- ✅ Frontend builds successfully (bundle: 767KB, gzip: 241KB)
- ✅ PWA manifest and service worker generated

Tests to run (after deployment):
1. ⏳ CRUD operations (items, projects, tags)
2. ⏳ Search with filters
3. ⏳ AI refinement with Gemini API
4. ⏳ Git hook integration (dev-logs)
5. ⏳ Real-time sync (open in two tabs)
6. ⏳ Offline mode (PWA/Service Worker)

## Environment Setup

### Required Variables

**Frontend (.env.local)**
```
VITE_CONVEX_URL=<convex-deployment-url>
```

**Convex Environment (.env in root for local dev)**
```
GEMINI_API_KEY=<your-gemini-api-key>
API_KEY=<api-key-for-git-hooks>
```

## Notes

### Key Changes from REST to Convex

1. **No polling** - Convex queries automatically subscribe to data changes
2. **No manual cache invalidation** - Convex handles cache updates automatically
3. **Type-safe API** - Generated API types from Convex functions
4. **Real-time sync** - Data automatically syncs across tabs/devices
5. **Simpler error handling** - Convex throws ConvexError instead of HTTP status codes

### Rollback Plan

If you need to revert:
1. Keep the old `apps/api/` and `packages/db/` directories for now
2. Revert App.tsx to use QueryClientProvider
3. Revert component imports to old hooks
4. Keep Convex files as reference for future

## Migration Checklist

- [x] Phase 1: Schema setup
- [x] Phase 2: Backend functions
- [x] Phase 3: Update all components to use Convex hooks
- [ ] Phase 4: Deploy to Convex Cloud
- [ ] Phase 5: E2E testing and git hook verification

## Next Steps - Full Deployment Flow

**For local testing:**
```bash
# Terminal 1: Start Convex dev environment
npx convex dev

# Terminal 2: Start frontend dev server
cd apps/web && pnpm dev
# Visit http://localhost:5173
```

**For production deployment:**
```bash
# Step 1: Authenticate if not already done
npx convex dev  # On first run, shows device auth link

# Step 2: Deploy to Convex Cloud
npx convex deploy

# Step 3: Update environment variables
# - Copy deployment URL to apps/web/.env.local (VITE_CONVEX_URL)
# - Add GEMINI_API_KEY and API_KEY to Convex Cloud dashboard

# Step 4: Build and deploy frontend
pnpm build
# Deploy dist/ to Vercel or your hosting platform
```

See `DEPLOYMENT.md` for complete step-by-step guide.
