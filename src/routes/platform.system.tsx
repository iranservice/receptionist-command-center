import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/platform/system")({
  component: () => (
    <>
      <PageHeader title="System & Integrations" description="Platform-wide AI providers, channels, and infrastructure." />
      <Placeholder
        scope="Level A"
        title="Platform-level integrations"
        notes={[
          "AI provider keys, telephony providers, base messaging channels managed by the platform.",
          "Tenant-specific integrations live inside each tenant workspace — never mixed here.",
        ]}
      />
    </>
  ),
});
