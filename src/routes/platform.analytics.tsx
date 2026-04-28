import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/platform/analytics")({
  component: () => (
    <>
      <PageHeader title="Platform Analytics" description="Cross-tenant aggregates and platform health." />
      <Placeholder scope="Level A" title="Aggregate analytics" notes={["Conversation volume, AI vs operator share, channel mix, retention."]} />
    </>
  ),
});
