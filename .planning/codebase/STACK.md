# Technology Stack

**Analysis Date:** 2025-03-05

## Languages

**Primary:**
- TypeScript 5.9 - Used for all logic in `apps/web/`, `convex/`, and `packages/shared/`.

**Secondary:**
- Rust 2021 edition - Used for the desktop app backend in `apps/desktop/src-tauri/`.
- CSS (Tailwind 4) - Used for styling in `apps/web/`.

## Runtime

**Environment:**
- Node.js >= 22 - Primary development and build environment.
- Rust (Cargo) - Used for the Tauri desktop application.

**Package Manager:**
- pnpm >= 10 - Workspace manager for monorepo structure.
- Lockfile: `pnpm-lock.yaml` present.

## Frameworks

**Core:**
- React 19 - Frontend UI library for `apps/web/` and `apps/desktop/`.
- Vite 7 - Build tool and dev server for web and desktop apps.
- Convex 1.15.0 - Backend-as-a-service providing real-time database, cloud functions, and file storage.
- Tauri 2 - Framework for building cross-platform desktop applications.
- React Router 7 - Navigation and routing for the web app.

**Testing:**
- Not detected - Workspace contains a "test" script but no specific testing framework or files were found.

**Build/Dev:**
- ESLint 9 - Linting for JS/TS files.
- TypeScript 5.9 - Static type checking.
- PostCSS / Tailwind CSS 4 - CSS processing and styling.

## Key Dependencies

**Critical:**
- `convex` 1.15.0 - Core database and backend infrastructure.
- `react` 19.2.0 - Core UI framework.
- `@tauri-apps/api` 2 - Integration between React frontend and Rust backend in the desktop app.

**Infrastructure:**
- `radix-ui` / `shadcn` - UI component primitives and styling.
- `framer-motion` - Animations.
- `@dnd-kit` - Drag and drop functionality for the Kanban board in `apps/web/src/components/board/`.
- `lucide-react` - Icon set.
- `react-markdown` / `remark-gfm` - Markdown rendering in notes.

## Configuration

**Environment:**
- Environment variables are managed via `.env` files (not committed) and Convex Dashboard.
- Key configs: `VITE_CONVEX_URL`, `GEMINI_API_KEY`, `OBSIDIAN_BRAIN_API_KEY`.

**Build:**
- `vite.config.ts`: Vite configuration for `apps/web/` and `apps/desktop/`.
- `tsconfig.json`: TypeScript configuration for each workspace member.
- `tauri.conf.json`: Configuration for the Tauri desktop app in `apps/desktop/src-tauri/`.
- `convex.json`: Configuration for Convex functions and schema.

## Platform Requirements

**Development:**
- Node.js >= 22.
- Rust toolchain (for desktop app development).
- pnpm.

**Production:**
- Deployment target: Vercel (for web app), Cross-platform installers (for desktop app).

---

*Stack analysis: 2025-03-05*
