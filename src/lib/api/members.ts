// Phase II-B — Members API.
// Wraps member management RPCs:
//   get_business_members, update_business_member_role,
//   deactivate_business_member, invite_business_member,
//   get_business_teams.

import { rpc } from "./client";

// ── Frontend types (aligned with backend contracts) ─────────

export type BackendRole = "owner" | "manager" | "operator" | "viewer";

/** Mirrors backend BusinessMemberRow from get_business_members() */
export interface BusinessMemberRow {
  membership_id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: BackendRole;
  is_active: boolean;
  joined_at: string;
  created_at: string;
  last_seen_at: string | null;
  status: "active" | "inactive";
}

/** Mirrors backend BusinessTeamRow from get_business_teams() */
export interface BusinessTeamRow {
  team_id: string;
  team_name: string;
  member_count: number;
}

/** Result of invite_business_member() */
export interface InviteResult {
  business_id: string;
  email: string;
  role: BackendRole;
  invited_by: string;
  membership_id: string | null;
  status: "joined" | "pending_signup";
}

/** Result of update_business_member_role() */
export interface RoleUpdateResult {
  membership_id: string;
  new_role: BackendRole;
}

/** Result of deactivate_business_member() */
export interface DeactivateResult {
  membership_id: string;
  deactivated: boolean;
}

// ── API functions ───────────────────────────────────────────

/** Fetch all members for a business. */
export async function fetchBusinessMembers(businessId: string) {
  return rpc<BusinessMemberRow[]>("get_business_members", {
    p_business_id: businessId,
  });
}

/** Update a member's role. */
export async function updateMemberRole(membershipId: string, newRole: BackendRole) {
  return rpc<RoleUpdateResult>("update_business_member_role", {
    p_membership_id: membershipId,
    p_new_role: newRole,
  });
}

/** Deactivate (soft-delete) a member. */
export async function deactivateMember(membershipId: string) {
  return rpc<DeactivateResult>("deactivate_business_member", {
    p_membership_id: membershipId,
  });
}

/** Invite a new member by email. */
export async function inviteMember(
  businessId: string,
  email: string,
  role: BackendRole = "operator",
) {
  return rpc<InviteResult>("invite_business_member", {
    p_business_id: businessId,
    p_email: email,
    p_role: role,
  });
}

/** Fetch teams for a business (placeholder — returns empty). */
export async function fetchBusinessTeams(businessId: string) {
  return rpc<BusinessTeamRow[]>("get_business_teams", {
    p_business_id: businessId,
  });
}
