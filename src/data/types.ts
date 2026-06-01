// Phase II — Shared data types for business settings and members.
// These types define the frontend data contract. Backend is source of truth;
// the frontend adapter will swap from mock → Supabase queries later.

import type { BusinessTypeId } from "@/lib/business-types";

// ── Business Settings ───────────────────────────────────────

export type BusinessStatus = "active" | "setup_required" | "paused";

export type BusinessSettings = {
  businessId: string;
  slug: string;
  name: string;
  publicDisplayName: string;
  businessType: BusinessTypeId;
  status: BusinessStatus;
  timezone: string;
  language: string;
  /** Human-readable summary, e.g. "Mon–Sat 9:00–22:00, Sun closed" */
  operatingHoursSummary: string;
  /** Whether AI auto-replies are enabled for this business */
  aiPolicyEnabled: boolean;
  /** Whether outbound orders require operator confirmation */
  customerConfirmationRequired: boolean;
  /** Whether high-value / low-confidence items go to approval queue */
  escalationPolicyEnabled: boolean;
  /** Default behavior when no operator is online */
  defaultOperatorBehavior: "ai_only" | "queue" | "voicemail";
  address: string;
  phone: string;
  email: string;
};

export type SettingsUpdateInput = Partial<
  Pick<
    BusinessSettings,
    | "name"
    | "publicDisplayName"
    | "timezone"
    | "language"
    | "aiPolicyEnabled"
    | "customerConfirmationRequired"
    | "escalationPolicyEnabled"
    | "defaultOperatorBehavior"
    | "address"
    | "phone"
    | "email"
  >
>;

// ── Members ─────────────────────────────────────────────────

export type BusinessRole = "owner" | "admin" | "operator" | "viewer";

export type MemberStatus = "active" | "invited" | "suspended";

export type BusinessMember = {
  id: string;
  userId: string | null; // null for invited members who haven't joined yet
  name: string;
  email: string;
  role: BusinessRole;
  status: MemberStatus;
  team: string;
  lastActiveAt: string | null; // ISO 8601
  invitedAt: string; // ISO 8601
  avatarUrl: string | null;
};

export type MemberAction =
  | { type: "invite"; email: string; role: BusinessRole; team: string }
  | { type: "change_role"; memberId: string; newRole: BusinessRole }
  | { type: "suspend"; memberId: string }
  | { type: "reactivate"; memberId: string }
  | { type: "remove"; memberId: string };
