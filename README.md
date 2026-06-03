# AiA Receptionist Command Center

> B2B AI receptionist and operator command center — a multi-tenant workspace for managing customer conversations, operator workflows, orders, and AI handoff in service businesses.

## Current Status

| Item | Value |
| ---- | ----- |
| Latest main commit | `0a0b289` |
| Phase | Phase VIII-a complete (release-to-AI reply runtime) |
| Build | ✅ Passes |
| TypeScript | ✅ 0 errors |
| Runtime smoke | ⏳ Pending CTO approval |

See [docs/PRD.md](docs/PRD.md) for product scope and [docs/ROADMAP.md](docs/ROADMAP.md) for phase timeline.

## Quick Start

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in values:

| Variable | Purpose |
| -------- | ------- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous (public) key |

> **Never use `service_role` key on the frontend.**

When both variables are empty, the app runs in **demo mode** with mock data — no backend required.

### Run Locally

```bash
npm run dev
```

### Validation Commands

```bash
npx tsc --noEmit       # TypeScript type check
npm run lint           # ESLint
npm run build          # Production build
```

## Demo Mode

When Supabase environment variables are not set, the app operates in demo mode:

- All routes render with synthetic/mock data
- No backend RPCs are called
- All mutation actions show "Demo mode — action not available" toast
- Useful for frontend development without a backend

## Architecture

```
src/
├── lib/
│   ├── auth.tsx              # AuthProvider + session management
│   ├── workspace.tsx         # WorkspaceProvider + tenant context
│   ├── supabase.ts           # Supabase client singleton
│   └── api/                  # 8 typed RPC wrapper modules
│       ├── client.ts         # Generic rpc() wrapper
│       ├── business-settings.ts
│       ├── members.ts
│       ├── workspaces.ts
│       ├── inbox.ts
│       ├── conversations.ts
│       ├── conversation-actions.ts
│       └── order-actions.ts
├── routes/                   # TanStack Router file-based routes
│   ├── __root.tsx
│   ├── auth.tsx              # Sign-in (email/password + magic-link)
│   ├── app.$tenant.tsx       # Tenant layout + auth guard
│   ├── app.$tenant.inbox.tsx # Primary conversation workspace
│   ├── app.$tenant.settings.tsx
│   ├── app.$tenant.members.tsx
│   └── platform.tsx          # Platform admin guard
└── components/
    ├── inbox/                # Conversation workspace components
    ├── shell/                # App shell, sidebar, header
    └── ui/                   # shadcn/ui primitives
```

## Tech Stack

- **Framework:** TanStack Start (React + Vite)
- **UI:** shadcn/ui + Radix + Tailwind CSS
- **Auth:** Supabase Auth
- **Backend:** Supabase RPCs (Postgres functions)
- **Hosting:** Cloudflare (via `@cloudflare/vite-plugin`)
- **Icons:** Lucide React

## Git / PR Workflow

> **Do NOT push directly to `main`.** All changes must go through a review branch + draft PR workflow.

1. Create a review branch from `main`.
2. Commit changes to the review branch.
3. Push and open a draft PR on GitHub.
4. Get CTO approval before marking ready and merging.
5. Squash-merge into `main` and delete the review branch.

## Documentation

| Document | Location |
| -------- | -------- |
| Product Requirements | [docs/PRD.md](docs/PRD.md) |
| Roadmap & Phase Timeline | [docs/ROADMAP.md](docs/ROADMAP.md) |
| Checkpoints | [docs/checkpoints/](docs/checkpoints/) |
