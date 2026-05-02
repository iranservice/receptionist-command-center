// Phase I — Platform layout with auth + platform role guard.
// Only allows platform-level users (super_admin, platform_admin).
// In demo mode, always grants access (demo profile has super_admin).
// Backend is source of truth for platform_role via user_profiles table.

import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { useAuth } from "@/lib/auth";
import { LoadingState, DeniedState, ErrorState } from "@/components/state/UIState";

export const Route = createFileRoute("/platform")({
  head: () => ({
    meta: [
      { title: "Platform · AI Receptionist" },
      {
        name: "description",
        content: "Platform-level operations for the AI receptionist platform.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PlatformLayout,
});

function PlatformLayout() {
  const { phase, error, isDemoMode, profile } = useAuth();

  // ── Auth loading ────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState title="Loading platform…" description="Verifying platform access." />
      </div>
    );
  }

  // ── Auth error ──────────────────────────────────────────
  if (phase === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <ErrorState
          title="Authentication error"
          description={error ?? "Could not verify your session."}
        />
      </div>
    );
  }

  // ── Not authenticated (real mode only) ──────────────────
  if (phase === "unauthenticated" && !isDemoMode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <DeniedState
          title="Sign in required"
          description="You need to sign in to access platform operations."
        />
        <Link
          to="/auth"
          search={{ redirect: "/platform" }}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Sign in
        </Link>
      </div>
    );
  }

  // ── Platform role check ─────────────────────────────────
  // Backend contract: user_profiles.platform_role IN ('super_admin', 'platform_admin')
  // TODO(api): When backend RPC `get_my_platform_access()` is available,
  // use it instead of reading profile.platformRole directly.
  const isPlatformAdmin =
    profile?.platformRole === "super_admin" || profile?.platformRole === "platform_admin";

  if (!isPlatformAdmin && !isDemoMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <DeniedState
          title="Platform access required"
          description="This area is restricted to platform administrators. Contact a super admin if you need access."
        />
      </div>
    );
  }

  // ── Resolved — render platform shell ────────────────────
  return (
    <AppShell variant="platform" defaultRole="super_admin" breadcrumb="Platform">
      <Outlet />
    </AppShell>
  );
}
