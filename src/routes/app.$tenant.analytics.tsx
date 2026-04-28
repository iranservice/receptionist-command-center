import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/app/$tenant/analytics")({
  component: () => (
    <>
      <PageHeader title="Analytics" description="Operational analytics for this tenant." />
      <Placeholder scope="Level B" title="Tenant analytics" notes={["Conversation outcomes, AI vs operator share, response times, order conversion."]} />
    </>
  ),
});
