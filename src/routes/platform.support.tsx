import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/platform/support")({
  component: () => (
    <>
      <PageHeader title="Platform Support" description="Internal queue for tenant-reported issues." />
      <Placeholder
        scope="Level A"
        title="Support tickets from tenants"
        notes={["Tickets opened by tenant admins, escalations, SLA view."]}
      />
    </>
  ),
});
