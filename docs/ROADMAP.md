# AiA Receptionist Command Center — Roadmap

## Phase Timeline

| # | Phase | Commit(s) | Description | Status |
| - | ----- | --------- | ----------- | ------ |
| 1 | LV-1 | `6af7570` | Clean UI baseline scaffold | ✅ Complete |
| 2 | LV-2 | Series | Business setup wizard UI | ✅ Complete |
| 3 | LV-3 | Series | Inbox conversation workspace shell | ✅ Complete |
| 4 | LV-4 | Series | Order panel inside conversation | ✅ Complete |
| 5 | LV-5 | `258f0af`→`1d21076` | Demo approvals + analytics basics | ✅ Complete |
| 6 | LV-6 | `7c0515f` | Responsive UI baseline finalization | ✅ Complete |
| 7 | Phase I | `769e8e6` | Auth + tenant context integration | ✅ Complete |
| 8 | Phase I harden | `7eab86c` | .gitignore + TopBar cleanup | ✅ Complete |
| 9 | Phase II-b | `193a796` | Settings + members RPC wiring | ✅ Complete |
| 10 | Phase III-b | `4f97128` | Inbox list + conversation detail RPC | ✅ Complete |
| 11 | Phase IV-b | `8478d7b` | Operator mutation actions RPC | ✅ Complete |
| 12 | Phase V-a1/a2 | `24f42d6`, `b265cb4` | Order mapper alignment fixes | ✅ Complete |
| 13 | Phase V-b | `c1ce974` | Order action RPCs | ✅ Complete |
| 14 | Phase VI-a | `67dd094` | Create order drafting from conversation | ✅ Complete |
| 15 | Phase VII-a | `52eaf27` | Auth entry + session bootstrap | ✅ Complete |
| 16 | Phase VIII-a | `6aaa27f` | Release-to-AI reply runtime | ✅ Complete |
| 17 | Checkpoint | `0a0b289` (PR #2) | Roadmap reconciliation checkpoint | ✅ Merged |

## Important History

- **Old Phase II PR #1** was closed as superseded (not merged). Phase II-b replaced the mock-adapter approach with backend RPC wiring. Do not resurrect old Phase II code.
- **All phases through VIII-a were direct-pushed to main.** Starting from the reconciliation checkpoint (PR #2), the PR workflow is mandatory.

## Current Gate

### `PHASE_VIII_A_RELEASE_TO_AI_RUNTIME_SMOKE_DESIGN_REVIEW`

Phase VIII-a changed `release_to_ai` → `release_to_ai_with_reply`. A runtime smoke design exists but execution requires:

1. CTO provisions backend access (local `.env` or live app)
2. CTO identifies safe/disposable test conversation
3. CTO approves rollback policy (disposable data or SQL restore)
4. CTO issues explicit "execute smoke" approval

## Next Gates (After Smoke)

Priority is determined by CTO after PRD review. Candidates:

| Priority | Gate | Description |
| -------- | ---- | ----------- |
| P2 | Real-time / polling | Add inbox real-time updates or polling loop |
| P2 | Test framework | Add vitest for API/mapper unit tests |
| P2 | CI/CD | Add GitHub Actions for tsc + lint + build |
| P2 | AI lifecycle RPCs | Wire `persist_ai_reply`, `persist_ai_handoff`, etc. |
| P3 | Placeholder routes | Wire customers, orders, reservations, etc. per PRD priority |
| P3 | UX polish batch | "You" badges, "View only" label, status badges |

## Blocked Work

The following may NOT start without a CTO-approved gate:

- New feature phases
- Placeholder route wiring
- UX polish batches
- Schema/migration changes
- Runtime smoke execution
- Direct main pushes

## Rules

1. **No implementation without CTO gate.** Every feature phase requires explicit CTO approval.
2. **No direct push to main.** Use review branch + draft PR workflow.
3. **No secrets in frontend.** All provider logic and secrets live in backend RPCs.
4. **Checkpoints are mandatory.** Every gate transition must produce a checkpoint document.
5. **Validation before merge.** Every PR must include `tsc`, `lint`, `build`, and secret scan results.
