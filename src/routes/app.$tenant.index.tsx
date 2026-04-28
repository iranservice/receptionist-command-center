import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/app/$tenant/")({
  component: TenantDashboard,
});

function TenantDashboard() {
  return (
    <>
      <PageHeader
        title="Workspace Dashboard"
        description="Today's operational pulse — inbox load, AI vs operator share, pending approvals."
      />
      <Placeholder
        scope="Level B"
        title="Tenant dashboard"
        notes={[
          "Open conversations, unassigned items, AI-active vs operator-active counts.",
          "Pending approvals, today's orders, today's reservations.",
          "Restaurant-shaped today; future business types will swap the operational widgets.",
        ]}
        contract="All numbers come from backend tenant-scoped endpoints."
      />
    </>
  );
}
