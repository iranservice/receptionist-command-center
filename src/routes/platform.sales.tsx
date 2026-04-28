import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/state/UIState";
import { Megaphone } from "lucide-react";

export const Route = createFileRoute("/platform/sales")({
  component: () => (
    <>
      <PageHeader
        title="Internal Sales"
        description="Pipeline, leads, and outreach for new tenant businesses."
      />
      {/* TODO(api): CRM pipeline data — leads, demos, conversions. */}
      <EmptyState
        icon={Megaphone}
        title="Pipeline is empty"
        description="Leads, demos booked and conversions to paid tenants will appear here."
      />
    </>
  ),
});
