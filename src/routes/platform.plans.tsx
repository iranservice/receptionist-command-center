import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/platform/plans")({
  component: () => (
    <>
      <PageHeader
        title="Plans & Subscriptions"
        description="Platform pricing, plans, and tenant subscriptions."
      />
      <Placeholder
        scope="Level A"
        title="Platform billing — Level A only"
        notes={[
          "Plan catalog, tenant subscription status, invoices to tenants for platform usage.",
          "This is the platform charging tenants — distinct from tenant→customer payments.",
        ]}
        contract="Tenant→customer payments live in Level B integrations on the tenant's own gateway."
      />
    </>
  ),
});
