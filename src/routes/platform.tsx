import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";

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
  return (
    <AppShell variant="platform" defaultRole="super_admin" breadcrumb="Platform">
      <Outlet />
    </AppShell>
  );
}
