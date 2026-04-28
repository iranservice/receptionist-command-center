import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/platform/")({
  component: PlatformDashboard,
});

function PlatformDashboard() {
  return (
    <>
      <PageHeader
        title="Platform Dashboard"
        description="Health, growth, and operational signals across all tenant businesses."
      />
      <Placeholder
        scope="Level A"
        title="Platform-wide overview"
        notes={[
          "Tenant count, active conversations across tenants, AI handoff rate, support load.",
          "Aggregates only — no tenant PII surfaced here.",
          "Source of truth: backend platform metrics endpoints.",
        ]}
      />
    </>
  );
}
