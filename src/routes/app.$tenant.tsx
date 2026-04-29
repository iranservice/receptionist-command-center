// Phase I — Tenant layout with auth + membership guard.
// Resolves $tenant slug to a workspace. Shows appropriate UI state
// (loading / denied / not-found) based on auth + membership status.
// Does NOT connect any feature data — only auth/tenant context.

import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { useAuth, useMembershipBySlug } from "@/lib/auth";
import { LoadingState, DeniedState, ErrorState } from "@/components/state/UIState";

export const Route = createFileRoute("/app/$tenant")({
  head: () => ({
    meta: [
      { title: "Workspace · AI Receptionist" },
      { name: "description", content: "Tenant workspace for the AI receptionist platform." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TenantLayout,
});

function TenantLayout() {
  const { tenant } = useParams({ from: "/app/$tenant" });
  const { phase, error, isDemoMode, memberships, profile } = useAuth();
  const membership = useMembershipBySlug(tenant);

  // ── Auth loading ────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState title="Loading workspace…" description="Checking access and permissions." />
      </div>
    );
  }

  // ── Auth error ──────────────────────────────────────────
  if (phase === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <ErrorState
          title="Authentication error"
          description={error ?? "Could not verify your session. Please try again."}
        />
      </div>
    );
  }

  // ── Not authenticated (real mode only) ──────────────────
  if (phase === "unauthenticated" && !isDemoMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <DeniedState
          title="Sign in required"
          description="You need to sign in to access this workspace. Authentication is managed by the backend."
        />
      </div>
    );
  }

  // ── Tenant not found in user's memberships ──────────────
  // Platform admins can still access any tenant workspace.
  const isPlatformAdmin =
    profile?.platformRole === "super_admin" || profile?.platformRole === "platform_admin";

  if (!membership && !isPlatformAdmin) {
    // Check if the slug exists in any memberships at all
    const hasMemberships = memberships.length > 0;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <DeniedState
          title={hasMemberships ? "Workspace not available" : "No workspaces found"}
          description={
            hasMemberships
              ? `You don't have access to the workspace "${tenant}". Contact a workspace admin if you think this is wrong.`
              : "You are not a member of any business workspace. Ask an admin to invite you."
          }
        />
      </div>
    );
  }

  // ── Resolved — render workspace ─────────────────────────
  const breadcrumb = membership?.businessName ?? tenant;

  return (
    <AppShell
      variant="tenant"
      defaultRole="business_admin"
      tenantSlug={tenant}
      breadcrumb={breadcrumb}
    >
      <Outlet />
    </AppShell>
  );
}
