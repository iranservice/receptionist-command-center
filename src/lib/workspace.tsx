// Phase I — Workspace context (backend-ready).
// Provides the resolved tenant context + role for the current route.
// In demo mode, derives role from AuthProvider demo memberships.
// In real mode, derives role from the authenticated user's membership.

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAuth, useMembershipBySlug, type BusinessMembership } from "./auth";

// ── Frontend role type (UI display) ─────────────────────────
// Maps backend membership_role → frontend display role.
// Backend is source of truth; this is a presentation adapter.
export type Role = "super_admin" | "business_admin" | "operator";

export function mapMembershipRole(backendRole: BusinessMembership["role"]): Role {
  switch (backendRole) {
    case "owner":
    case "manager":
      return "business_admin";
    case "operator":
      return "operator";
    case "viewer":
      return "operator"; // viewers see operator-level UI
    default:
      return "operator";
  }
}

// ── Context shape ───────────────────────────────────────────

type WorkspaceCtx = {
  role: Role;
  /** Resolved membership for the current tenant (null on platform routes). */
  membership: BusinessMembership | null;
  /** Business ID for the current tenant (null on platform routes). */
  businessId: string | null;
  /** True if user has platform-level admin access. */
  isPlatformAdmin: boolean;
};

const Ctx = createContext<WorkspaceCtx | null>(null);

// ── Provider for tenant routes ──────────────────────────────

export function TenantWorkspaceProvider({
  tenantSlug,
  children,
}: {
  tenantSlug: string;
  children: ReactNode;
}) {
  const { profile } = useAuth();
  const membership = useMembershipBySlug(tenantSlug);

  const value = useMemo<WorkspaceCtx>(() => {
    const role = membership ? mapMembershipRole(membership.role) : "operator";

    return {
      role,
      membership: membership ?? null,
      businessId: membership?.businessId ?? null,
      isPlatformAdmin:
        profile?.platformRole === "super_admin" || profile?.platformRole === "platform_admin",
    };
  }, [membership, profile]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// ── Provider for platform routes ────────────────────────────

export function PlatformWorkspaceProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();

  const value = useMemo<WorkspaceCtx>(
    () => ({
      role: "super_admin" as Role,
      membership: null,
      businessId: null,
      isPlatformAdmin:
        profile?.platformRole === "super_admin" || profile?.platformRole === "platform_admin",
    }),
    [profile],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// ── Legacy compatibility provider ───────────────────────────
// Used by AppShell during transition; preserves old API.

export function WorkspaceProvider({
  defaultRole = "business_admin",
  tenantSlug,
  children,
}: {
  defaultRole?: Role;
  tenantSlug?: string;
  children: ReactNode;
}) {
  const { profile } = useAuth();
  const membership = useMembershipBySlug(tenantSlug);

  const value = useMemo<WorkspaceCtx>(() => {
    if (membership) {
      return {
        role: mapMembershipRole(membership.role),
        membership,
        businessId: membership.businessId,
        isPlatformAdmin:
          profile?.platformRole === "super_admin" || profile?.platformRole === "platform_admin",
      };
    }

    // Fallback to defaultRole (demo mode / platform routes)
    return {
      role: defaultRole,
      membership: null,
      businessId: null,
      isPlatformAdmin:
        profile?.platformRole === "super_admin" || profile?.platformRole === "platform_admin",
    };
  }, [defaultRole, membership, profile]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// ── Hook ────────────────────────────────────────────────────

export function useWorkspace(): WorkspaceCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return ctx;
}
