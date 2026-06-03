# AiA Receptionist Command Center — Product Requirements

## Product Identity

| Item | Value |
| ---- | ----- |
| Product name | AiA Receptionist Command Center |
| Internal codename | L1-v1 |
| Type | B2B SaaS |
| Category | AI receptionist / customer operations platform |
| Initial vertical | Restaurant and service-business operator workflows |
| Paradigm | Chat-first, AI-augmented |

## Product Objective

Provide a multi-tenant operator workspace where service businesses (starting with restaurants) can manage customer conversations across channels, handle orders, delegate to AI or human operators, and maintain full operational visibility — all through a single command center UI backed by Supabase RPCs.

## Core Actors

| Role | Backend value | UI label | Capabilities |
| ---- | ------------- | -------- | ------------ |
| Owner | `owner` | Business Admin | Full access — settings, members, inbox, orders |
| Manager | `manager` | Business Admin | Same as owner except ownership transfer |
| Operator | `operator` | Operator | Inbox, conversation actions, order actions |
| Viewer | `viewer` | Viewer (mapped to Operator UI) | Read-only access to inbox and workspace |
| Platform Admin | `super_admin` (platform role) | Platform Admin | Cross-tenant platform administration |

## Core Modules

### 1. Auth / Session / Workspace

- Supabase Auth with email/password and magic-link sign-in
- `AuthProvider` manages session lifecycle
- `WorkspaceProvider` resolves tenant context from route params + membership
- Route guards enforce auth + membership before rendering workspace

### 2. Business Settings

- View and edit business profile (name, type, timezone, etc.)
- Backend RPCs: `get_business_profile`, `update_business_profile`
- Role-based: admin can edit; operator/viewer controls disabled

### 3. Members / RBAC

- List members, invite by email, change roles, deactivate
- Backend RPCs: `get_business_members`, `update_business_member_role`, `deactivate_business_member`, `invite_business_member`
- Teams placeholder: `get_business_teams` (returns empty — backend not fully implemented)

### 4. Inbox / Conversation Management

- Inbox list from `get_inbox_list` with status/channel/owner filtering
- Conversation detail from `get_conversation_detail` with message timeline
- Views: All open, Assigned to me, Unassigned, AI handling, Needs handoff, Waiting on customer, Pending confirmation, Closed
- Manual refresh button (no real-time/polling yet)

### 5. Operator Actions

| Action | RPC | Description |
| ------ | --- | ----------- |
| Reply | `operator_reply` | Send text reply to customer |
| Assign | `assign_conversation` | Assign conversation to operator |
| Unassign | `unassign_conversation` | Release from operator |
| Transfer | `transfer_conversation` | Transfer to another operator |
| Release to AI | `release_to_ai_with_reply` | Hand back to AI with optional immediate reply |

### 6. Order Actions

| Action | RPC | Description |
| ------ | --- | ----------- |
| Create order | `create_order` | Draft a new order from conversation context |
| Confirm order | `confirm_order` | Confirm a pending order |
| Cancel order | `cancel_order` | Cancel with reason |
| Request confirmation | `request_customer_confirmation` | Ask customer to confirm |
| Get confirmation payload | `get_order_confirmation_payload` | Fetch payload for confirmation message |

Order types supported: `dine_in`, `takeaway`, `delivery`.

### 7. Demo Mode

When Supabase environment variables are not configured:
- `isSupabaseConfigured = false`
- All `rpc()` calls return `{ data: null, error: "DEMO_MODE" }`
- All wired routes fall back to synthetic demo data
- Mutation buttons show "Demo mode — action not available" toast
- No external API calls are made

### 8. Platform Admin

- `/platform/*` routes guarded by `super_admin` role
- Sub-routes: tenants, members, plans, sales, analytics, support, system, settings
- Current state: all placeholder pages with `TODO(api)` markers

## Explicit Non-Goals (Current Stage)

The following are **out of scope** for the current L1-v1 stage:

| Item | Reason |
| ---- | ------ |
| WhatsApp production delivery | Backend adapter exists separately; frontend does not invoke delivery |
| Voice AI | Future product phase |
| POS / inventory integration | Future product phase |
| Analytics / reporting (backend-wired) | LV-5 demo charts exist but no RPC wiring |
| Customer-facing portal | Out of scope — this is the operator/admin command center |
| Billing / payments / subscriptions | Future product phase |
| Real-time / WebSocket / Supabase Realtime | P2 deferred — currently manual refresh only |
| Automated test suite | P2 deferred — no vitest/jest/playwright yet |
| CI/CD pipeline | P2 deferred — no GitHub Actions yet |

## API Boundary

All data access goes through Supabase RPCs via a single `rpc()` client wrapper.

- **No direct table access** from frontend
- **No `service_role` key** on frontend
- **No external HTTP calls** to delivery providers or AI providers
- Backend is the sole authority for auth, data, business logic, and AI orchestration

## Deferred Debt

### P2 — Should Schedule Soon

| Item | Description |
| ---- | ----------- |
| Inbox real-time/polling | Stale data until manual refresh |
| AI lifecycle RPCs | `persist_ai_reply`, `persist_ai_handoff`, `log_ai_blocked`, `collect_ai_context` unwired |
| Teams RPC | `get_business_teams` returns empty |
| Test framework | No automated tests |
| CI/CD pipeline | No GitHub Actions |

### P3 — Cosmetic / Backlog

| Item | Description |
| ---- | ----------- |
| Members "You" badge | Data available, not compared |
| Members "Your role" badge | Same data source, not displayed |
| Settings "View only" badge | `isAdmin` available, Save disabled but no label |
| Business status badge | Only `is_active: boolean` — needs backend tri-state |
| Self-action UI guard | Backend enforces — UI hint cosmetic |
| Placeholder routes (10) | `TODO(api)` markers — awaiting PRD prioritization |
| Lint warnings (12) | Pre-existing `react-refresh/only-export-components` |
| Inbox file size (1409 lines) | May need component extraction |

## Current Technical Gate

`PHASE_VIII_A_RELEASE_TO_AI_RUNTIME_SMOKE_DESIGN_REVIEW`

The latest main commit changed `release_to_ai` → `release_to_ai_with_reply`. A runtime smoke design has been prepared but execution requires CTO approval of safe test data and rollback policy.
