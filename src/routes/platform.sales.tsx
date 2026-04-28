import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/platform/sales")({
  component: () => (
    <>
      <PageHeader
        title="Internal Sales"
        description="Pipeline, leads, and outreach for new tenant businesses."
      />
      <Placeholder
        scope="Level A"
        title="Sales pipeline"
        notes={["Leads, demos booked, conversions to paid tenants."]}
      />
    </>
  ),
});
