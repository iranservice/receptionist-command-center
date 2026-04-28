import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/platform/settings")({
  component: () => (
    <>
      <PageHeader title="Platform Settings" description="Global policies, branding, and platform-level configuration." />
      <Placeholder scope="Level A" title="Global config" notes={["Platform branding, default policies, feature flags, retention."]} />
    </>
  ),
});
