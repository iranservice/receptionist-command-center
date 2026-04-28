import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/shell/AppShell";
import { demoTenants } from "@/lib/nav-config";

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
  const t = demoTenants.find((x) => x.slug === tenant);
  return (
    <AppShell variant="tenant" defaultRole="business_admin" breadcrumb={t?.name ?? tenant}>
      <Outlet />
    </AppShell>
  );
}
