import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/state/UIState";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/platform/tenants")({
  component: () => (
    <>
      <PageHeader title="Tenants" description="All customer businesses on the platform." />
      {/* TODO(api): platform-scoped tenant directory. Backend owns isolation + membership. */}
      <EmptyState
        icon={Building2}
        title="No tenants loaded"
        description="Tenant businesses (restaurants, clinics, salons, …) with plan and status will appear here. Provisioning and impersonation entry points come in a later phase."
      />
    </>
  ),
});
