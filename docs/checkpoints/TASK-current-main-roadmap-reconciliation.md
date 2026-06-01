# Current Main Roadmap Reconciliation Checkpoint

## Status

CURRENT_MAIN_READY_FOR_NEXT_ROADMAP_GATE

## Current Main

- Commit: 6aaa27f
- Branch: main
- Repo: iranservice/receptionist-command-center

## Important History

- Old Phase II PR #1 was closed as superseded and not merged.
- Do not resurrect old mock-adapter Phase II code.
- Current main already contains Phase II-b backend RPC/API wiring.
- Current main includes Phase VIII-a release-to-AI runtime wiring.

## Phase Timeline (Reconstructed from Commit History)

| Era | Phases | Commits | Status |
| --- | ------ | ------- | ------ |
| UI Baseline | LV-1 → LV-6 | 6af7570 → 7c0515f | ✅ Complete |
| Auth Foundation | Phase I + hardening | 769e8e6, 7eab86c | ✅ Complete |
| Settings + Members RPC | Phase II-b | 193a796 | ✅ Complete |
| Inbox + Conversations RPC | Phase III-b | 4f97128 | ✅ Complete |
| Operator Mutation RPCs | Phase IV-b | 8478d7b | ✅ Complete |
| Order Mapper + Actions | Phase V-a1/a2, V-b | 24f42d6, b265cb4, c1ce974 | ✅ Complete |
| Order Drafting UI | Phase VI-a | 67dd094 | ✅ Complete |
| Auth Entry + Session Bootstrap | Phase VII-a | 52eaf27 | ✅ Complete |
| Release-to-AI Reply Runtime | Phase VIII-a | 6aaa27f | ✅ Complete |

## Current Capability Summary

- LV-1 through LV-6 baseline complete.
- Phase I auth/tenant context complete.
- Phase II-b through Phase VIII-a backend wiring complete.
- 8 API modules wired to Supabase RPCs:
  - `client.ts` — generic `rpc()` wrapper + `classifyError()`
  - `business-settings.ts` — `get_business_profile`, `update_business_profile`
  - `members.ts` — `get_business_members`, `update_business_member_role`, `deactivate_business_member`, `invite_business_member`, `get_business_teams`
  - `workspaces.ts` — `get_my_workspaces`, `get_my_platform_access`
  - `inbox.ts` — `get_inbox_list`
  - `conversations.ts` — `get_conversation_detail`
  - `conversation-actions.ts` — `operator_reply`, `assign_conversation`, `unassign_conversation`, `transfer_conversation`, `release_to_ai_with_reply`
  - `order-actions.ts` — `create_order`, `confirm_order`, `cancel_order`, `request_customer_confirmation`, `get_order_confirmation_payload`
- 7 backend-wired route pages: settings, members, inbox, auth entry, tenant layout, platform layout, root.
- Full operator workflow exists: reply, assign, transfer, unassign, release-to-AI, create/confirm/cancel orders.
- Demo mode remains available when backend is not configured.
- 10 placeholder route pages with `TODO(api)` markers: customers, orders, reservations, tickets, integrations, platform sub-routes.

## Deferred Debt

### P2 — Should Schedule Soon

- Inbox real-time/polling — no WebSocket or polling loop; inbox shows stale data until manual refresh.
- AI lifecycle RPC follow-up — `persist_ai_reply`, `persist_ai_handoff`, `log_ai_blocked`, `collect_ai_context` unwired.
- Teams RPC — `get_business_teams` returns empty from backend; teams tab falls back to demo data.

### P3 — Cosmetic / Backlog

- Members "You" badge — `profile.id` + `user_id` both available but not compared.
- Members "Your role" header badge — same data source, not displayed.
- Settings "View only" badge for non-admin — `isAdmin` available, controls disabled but no label.
- Business status badge — only `is_active: boolean` from backend; tri-state model (`active`/`setup_required`/`paused`) requires backend schema change.
- Self-action UI hint — backend enforces; UI cosmetic guard not implemented.
- 10 placeholder routes with `TODO(api)` markers.
- 12 pre-existing lint warnings (`react-refresh/only-export-components`).
- No in-repo README, CHANGELOG, or PRD docs.

## Validation (at checkpoint time)

| Check | Result |
| ----- | ------ |
| TypeScript | ✅ 0 errors |
| Lint | ✅ 0 errors, 12 pre-existing warnings |
| Build | ✅ clean |
| Secret scan | ✅ clean (comments only) |

## CTO Decision

No P0/P1 blockers.
Proceed to next controlled verification gate.

## Next Gate

PHASE_VIII_A_RELEASE_TO_AI_RUNTIME_VERIFICATION

**Reason:**
The latest main commit (`6aaa27f`) changes the release-to-AI runtime contract from the previous `release_to_ai` RPC to `release_to_ai_with_reply`. This is a critical operator workflow — when an operator releases a conversation to AI, the backend now generates an immediate AI reply stub. This contract change should be verified before starting any new feature phase.

**Scope of verification:**
- Confirm `release_to_ai_with_reply` RPC signature matches backend definition.
- Confirm `ReleaseToAIResult` type handles the `ai_reply` optional payload correctly.
- Confirm the inbox route correctly renders the AI reply from the response.
- Confirm error cases (`AI_NOT_ALLOWED`, `CONVERSATION_CLOSED`) are handled.
- Confirm demo mode behavior is safe (falls back gracefully without backend).

## Blocked Until Verification

- New feature phase.
- Placeholder route wiring.
- UX polish PRs.
- Any schema changes.
