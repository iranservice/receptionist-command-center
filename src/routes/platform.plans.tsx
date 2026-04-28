import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/state/UIState";
import { Receipt } from "lucide-react";

export const Route = createFileRoute("/platform/plans")({
  component: () => (
    <>
      <PageHeader
        title="Plans & Subscriptions"
        description="Platform pricing, plans, and tenant subscriptions. This is the platform charging tenants — distinct from tenant→customer payments which live in Level B integrations on the tenant's own gateway."
      />
      {/* TODO(api): plan catalog + tenant subscription status from backend. */}
      <EmptyState
        icon={Receipt}
        title="No plans configured"
        description="Plan catalog, tenant subscription status and platform invoices to tenants will live here. Tenant→customer payments are NOT in scope for this screen."
      />
    </>
  ),
});
