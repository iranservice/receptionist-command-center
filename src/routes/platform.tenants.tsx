import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/platform/tenants")({
  component: () => (
    <>
      <PageHeader title="Tenants" description="All customer businesses on the platform." />
      <Placeholder
        scope="Level A"
        title="Tenant directory"
        notes={[
          "List of tenant businesses, type (restaurant / clinic / salon / …), plan, status.",
          "Future: provisioning new tenants and impersonation entry points.",
        ]}
        contract="Backend owns tenant isolation and membership truth."
      />
    </>
  ),
});
