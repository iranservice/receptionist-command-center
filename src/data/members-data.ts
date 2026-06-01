// Phase II — Business members data adapter.
// Demo/mock implementation with per-tenant isolation.
// TODO(backend): Replace with Supabase query when tables are ready.

import type { BusinessMember, BusinessRole, MemberAction, MemberStatus } from "./types";

// ── Styling helpers (shared with route page) ────────────────

export const roleLabels: Record<BusinessRole, string> = {
  owner: "Owner",
  admin: "Admin",
  operator: "Operator",
  viewer: "Viewer",
};

export const roleStyles: Record<BusinessRole, string> = {
  owner: "bg-level-a/12 text-level-a",
  admin: "bg-level-b/12 text-level-b",
  operator: "bg-operator/20 text-operator-foreground",
  viewer: "bg-muted text-muted-foreground",
};

export const statusLabels: Record<MemberStatus, string> = {
  active: "Active",
  invited: "Invited",
  suspended: "Suspended",
};

export const statusStyles: Record<MemberStatus, string> = {
  active: "bg-success/15 text-success",
  invited: "bg-warn/25 text-warn-foreground",
  suspended: "bg-destructive/15 text-destructive",
};

// ── Can current role perform action on target role? ─────────

const roleLevel: Record<BusinessRole, number> = {
  owner: 4,
  admin: 3,
  operator: 2,
  viewer: 1,
};

/**
 * UI-hint only — backend enforces real permissions.
 * Returns true if `actorRole` can manage `targetRole`.
 */
export function canManageMember(actorRole: BusinessRole, targetRole: BusinessRole): boolean {
  if (actorRole === "operator" || actorRole === "viewer") return false;
  return roleLevel[actorRole] > roleLevel[targetRole];
}

// ── Demo data — per-tenant member sets ──────────────────────

const demoMembers: Record<string, BusinessMember[]> = {
  "bella-trattoria": [
    {
      id: "m-bt-1",
      userId: "demo-user-000",
      name: "Alex Morgan",
      email: "alex@aura.ops",
      role: "owner",
      status: "active",
      team: "Management",
      lastActiveAt: "2026-06-01T10:30:00Z",
      invitedAt: "2026-01-15T09:00:00Z",
      avatarUrl: null,
    },
    {
      id: "m-bt-2",
      userId: "u-2",
      name: "Maya Holloway",
      email: "maya@bella.com",
      role: "admin",
      status: "active",
      team: "Front of house",
      lastActiveAt: "2026-06-01T09:45:00Z",
      invitedAt: "2026-02-01T12:00:00Z",
      avatarUrl: null,
    },
    {
      id: "m-bt-3",
      userId: "u-3",
      name: "Diego Romero",
      email: "diego@bella.com",
      role: "operator",
      status: "active",
      team: "Front of house",
      lastActiveAt: "2026-05-31T22:10:00Z",
      invitedAt: "2026-02-15T08:00:00Z",
      avatarUrl: null,
    },
    {
      id: "m-bt-4",
      userId: "u-4",
      name: "Aiko Tanaka",
      email: "aiko@bella.com",
      role: "operator",
      status: "active",
      team: "Kitchen",
      lastActiveAt: "2026-06-01T08:00:00Z",
      invitedAt: "2026-03-01T10:00:00Z",
      avatarUrl: null,
    },
    {
      id: "m-bt-5",
      userId: null,
      name: "Henrik Solberg",
      email: "henrik@bella.com",
      role: "operator",
      status: "invited",
      team: "Delivery",
      lastActiveAt: null,
      invitedAt: "2026-05-28T14:00:00Z",
      avatarUrl: null,
    },
    {
      id: "m-bt-6",
      userId: "u-6",
      name: "Priya Shah",
      email: "priya@bella.com",
      role: "viewer",
      status: "suspended",
      team: "Front of house",
      lastActiveAt: "2026-04-10T16:00:00Z",
      invitedAt: "2026-02-20T11:00:00Z",
      avatarUrl: null,
    },
    {
      id: "m-bt-7",
      userId: "u-7",
      name: "Lucas Mendez",
      email: "lucas@bella.com",
      role: "operator",
      status: "active",
      team: "Delivery",
      lastActiveAt: "2026-05-31T20:30:00Z",
      invitedAt: "2026-03-10T09:00:00Z",
      avatarUrl: null,
    },
  ],
  "harbor-grill": [
    {
      id: "m-hg-1",
      userId: "demo-user-000",
      name: "Alex Morgan",
      email: "alex@aura.ops",
      role: "admin",
      status: "active",
      team: "Management",
      lastActiveAt: "2026-06-01T10:30:00Z",
      invitedAt: "2026-01-20T09:00:00Z",
      avatarUrl: null,
    },
    {
      id: "m-hg-2",
      userId: "u-10",
      name: "Jordan Kim",
      email: "jordan@harborgrill.com",
      role: "owner",
      status: "active",
      team: "Management",
      lastActiveAt: "2026-06-01T07:15:00Z",
      invitedAt: "2026-01-10T08:00:00Z",
      avatarUrl: null,
    },
    {
      id: "m-hg-3",
      userId: "u-11",
      name: "Sam Nguyen",
      email: "sam@harborgrill.com",
      role: "operator",
      status: "active",
      team: "Bar",
      lastActiveAt: "2026-05-31T23:00:00Z",
      invitedAt: "2026-02-05T10:00:00Z",
      avatarUrl: null,
    },
    {
      id: "m-hg-4",
      userId: null,
      name: "Riley Chen",
      email: "riley@harborgrill.com",
      role: "operator",
      status: "invited",
      team: "Kitchen",
      lastActiveAt: null,
      invitedAt: "2026-05-30T16:00:00Z",
      avatarUrl: null,
    },
  ],
  "sunrise-clinic": [
    {
      id: "m-sc-1",
      userId: "demo-user-000",
      name: "Alex Morgan",
      email: "alex@aura.ops",
      role: "viewer",
      status: "active",
      team: "Observers",
      lastActiveAt: "2026-06-01T10:30:00Z",
      invitedAt: "2026-04-01T09:00:00Z",
      avatarUrl: null,
    },
    {
      id: "m-sc-2",
      userId: "u-20",
      name: "Dr. Lena Fischer",
      email: "lena@sunriseclinic.co.uk",
      role: "owner",
      status: "active",
      team: "Administration",
      lastActiveAt: "2026-05-31T17:00:00Z",
      invitedAt: "2026-01-05T08:00:00Z",
      avatarUrl: null,
    },
    {
      id: "m-sc-3",
      userId: "u-21",
      name: "Nurse Ade Okoro",
      email: "ade@sunriseclinic.co.uk",
      role: "operator",
      status: "active",
      team: "Reception",
      lastActiveAt: "2026-06-01T08:30:00Z",
      invitedAt: "2026-02-01T09:00:00Z",
      avatarUrl: null,
    },
  ],
};

// ── Adapter functions ───────────────────────────────────────

/**
 * Get members for a business tenant.
 * Returns empty array for unknown tenants (safe fallback).
 *
 * TODO(backend): Replace with
 *   `supabase.from('business_memberships')
 *     .select('*, user_profiles(*)')
 *     .eq('business_id', businessId)`
 */
export function getBusinessMembers(slug: string): BusinessMember[] {
  return demoMembers[slug] ?? [];
}

/**
 * Find the current user's membership in a business.
 * Used to show "You" badge and determine actor role for action affordances.
 *
 * TODO(backend): Derive from authenticated session context.
 */
export function getCurrentUserMember(slug: string, currentUserId: string): BusinessMember | null {
  const members = getBusinessMembers(slug);
  return members.find((m) => m.userId === currentUserId) ?? null;
}

/**
 * Execute a member action (demo — in-memory only).
 *
 * TODO(backend): Replace with Supabase RPC or mutation.
 */
export function executeMemberAction(
  slug: string,
  action: MemberAction,
): { success: boolean; error?: string } {
  const members = demoMembers[slug];
  if (!members) return { success: false, error: "Business not found" };

  switch (action.type) {
    case "change_role": {
      const member = members.find((m) => m.id === action.memberId);
      if (!member) return { success: false, error: "Member not found" };
      member.role = action.newRole;
      return { success: true };
    }
    case "suspend": {
      const member = members.find((m) => m.id === action.memberId);
      if (!member) return { success: false, error: "Member not found" };
      member.status = "suspended";
      return { success: true };
    }
    case "reactivate": {
      const member = members.find((m) => m.id === action.memberId);
      if (!member) return { success: false, error: "Member not found" };
      member.status = "active";
      return { success: true };
    }
    case "remove": {
      const idx = members.findIndex((m) => m.id === action.memberId);
      if (idx === -1) return { success: false, error: "Member not found" };
      members.splice(idx, 1);
      return { success: true };
    }
    case "invite": {
      const newMember: BusinessMember = {
        id: `m-new-${Date.now()}`,
        userId: null,
        name: action.email.split("@")[0],
        email: action.email,
        role: action.role,
        status: "invited",
        team: action.team,
        lastActiveAt: null,
        invitedAt: new Date().toISOString(),
        avatarUrl: null,
      };
      members.push(newMember);
      return { success: true };
    }
    default:
      return { success: false, error: "Unknown action" };
  }
}
