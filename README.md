# PlayBoard

A production-quality Kanban task board with drag-and-drop, team collaboration, and real-time filtering — built with React, TypeScript, and Supabase.

![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8)
![Supabase](https://img.shields.io/badge/Supabase-RLS-3ECF8E)

## Live Demo

> **[playboard.vercel.app](https://playboard.vercel.app)** _(update after deploy)_

## Screenshots

_Add screenshots here after deployment._

---

## Tech Stack

| Layer        | Technology                                              |
| ------------ | ------------------------------------------------------- |
| Framework    | React 19 + TypeScript (strict mode)                     |
| Build        | Vite 8                                                  |
| Styling      | Tailwind CSS v4 with custom dark theme                  |
| Drag & Drop  | @dnd-kit/core + @dnd-kit/sortable                       |
| Client State | Zustand                                                 |
| Server State | TanStack Query (optimistic updates, cache invalidation) |
| Backend      | Supabase (PostgreSQL + Auth + Row Level Security)       |
| Icons        | Lucide React                                            |
| Testing      | Vitest + Testing Library + Playwright                   |
| CI/CD        | GitHub Actions (6 workflows)                            |
| Hosting      | Vercel                                                  |

## Features

### Board

- **4-column Kanban layout** — To Do, In Progress, In Review, Done
- **Drag-and-drop** with smooth animations and optimistic updates
- **Inline task creation** at the bottom of each column
- **Priority indicators** — color-coded left border (blue/amber for low/high)
- **Due date badges** — green (future), yellow (within 2 days), red (overdue)

### Task Detail Panel

- Slide-in panel with full task editing
- Inline title editing (click to edit)
- Status, priority, and due date selectors
- Multi-assignee support with avatar display
- Multi-label tagging with custom colors
- Markdown-friendly description field
- Threaded comments with timestamps
- Auto-generated activity timeline

### Collaboration

- **Team members** — Add members with name and color, assign to tasks
- **Labels** — Create custom colored labels, assign to tasks, filter by label
- **Search** — Real-time title search across all columns
- **Filters** — Priority, assignee, and label filters with dismissible chips
- **Board stats** — Task count, completion rate, overdue count with progress bar

### Security

- **Anonymous guest auth** — Supabase anonymous sign-in, no credentials required
- **Row Level Security** — Every table has RLS policies scoping data to `auth.uid()`
- **No exposed secrets** — Only the public anon key is used client-side
- **Database indexes** — Optimized queries on user_id, status, due_date, task_id

### Quality

- Zero `any` types — full strict TypeScript with generated Supabase types
- `React.memo`, `useMemo`, `useCallback` applied throughout
- Lazy-loaded heavy components (TaskModal, TeamPanel)
- Skeleton loading states, empty states, toast error notifications
- WCAG accessibility: `aria-labels`, `role` attributes, keyboard navigation
- 33 unit tests passing, E2E tests with Playwright
- ESLint (0 warnings) + Prettier enforced

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/playboard.git
cd playboard
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase project credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database Setup

Run the full schema in your Supabase SQL Editor:

```bash
# Or via CLI if linked:
npx supabase db query --linked -f supabase/schema.sql
```

The schema creates 7 tables with RLS policies, indexes, and an `updated_at` trigger. See [`supabase/schema.sql`](./supabase/schema.sql) for the complete SQL.

### 4. Enable Anonymous Auth

In your Supabase dashboard:
**Authentication → Settings → User Signups → Allow anonymous sign-ins → ON**

### 5. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Available Scripts

| Script                  | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Start dev server                     |
| `npm run build`         | TypeScript check + production build  |
| `npm run typecheck`     | Run TypeScript compiler check        |
| `npm run lint`          | ESLint with zero-warning enforcement |
| `npm run format`        | Format all files with Prettier       |
| `npm run format:check`  | Check formatting without writing     |
| `npm run test`          | Run unit tests                       |
| `npm run test:watch`    | Run tests in watch mode              |
| `npm run test:coverage` | Run tests with coverage report       |
| `npm run test:ui`       | Open Vitest UI                       |
| `npm run e2e`           | Run Playwright E2E tests             |

---

## Database Schema

```
tasks              ← Core task data (title, status, priority, due_date, position)
team_members       ← Team roster (name, color, avatar_url)
labels             ← Custom labels (name, color)
task_assignees     ← Junction: tasks ↔ team_members
task_labels        ← Junction: tasks ↔ labels
comments           ← Task comments (body, timestamps)
activity_log       ← Auto-generated activity timeline (action, metadata)
```

All tables have:

- UUID primary keys
- `user_id` foreign key to `auth.users`
- RLS policies restricting access to the owning user
- Appropriate indexes for query performance

---

## CI/CD Pipelines

| Workflow         | Trigger               | Purpose                                        |
| ---------------- | --------------------- | ---------------------------------------------- |
| `ci.yml`         | Push/PR to main       | TypeScript → ESLint → Prettier → Tests → Build |
| `e2e.yml`        | Push to main          | Playwright E2E tests                           |
| `security.yml`   | Push to main + weekly | npm audit + TruffleHog secret scanning         |
| `codeql.yml`     | Push/PR + weekly      | GitHub CodeQL static analysis                  |
| `lighthouse.yml` | After Vercel deploy   | Performance, accessibility, SEO audit          |
| `stale.yml`      | Daily                 | Auto-label stale issues/PRs                    |

---

## Architecture Decisions

| Decision                              | Rationale                                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **@dnd-kit** over react-beautiful-dnd | Actively maintained, first-class TypeScript, smaller bundle, flexible collision detection           |
| **Zustand** for UI state              | Minimal boilerplate, no providers needed, excellent TS inference, surgical re-renders via selectors |
| **TanStack Query** for server state   | Automatic cache invalidation, optimistic updates with rollback, stale-while-revalidate              |
| **Anonymous auth**                    | Zero-friction UX — user gets a board instantly, RLS handles data isolation                          |
| **Tailwind v4**                       | CSS-first configuration, faster builds, native nesting, smaller output                              |
| **Lazy loading** for modals           | TaskModal and TeamPanel are code-split — keeps initial bundle under 100KB gzipped                   |

## Tradeoffs & Future Improvements

- **No real-time sync** — Would add Supabase Realtime subscriptions for multi-user collaboration
- **No offline mode** — Could add service worker + IndexedDB for PWA support
- **Individual position updates** — Drag reorder sends one mutation per card; a batch RPC would be more efficient
- **No undo/redo** — Would implement with a command pattern for a production release
- **Per-user labels/team** — A production app would share these across a workspace with role-based access

---

## License

MIT
