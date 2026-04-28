import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/app/$tenant/settings")({
  component: () => (
    <>
      <PageHeader title="Settings" description="Workspace settings for this tenant business." />
      <Placeholder
        scope="Level B"
        title="Tenant workspace settings"
        notes={[
          "Business profile, hours, locations, business-type-specific config.",
          "AI behavior, operator handoff rules — surfaced from backend, not invented in UI.",
        ]}
      />
    </>
  ),
});
