import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/platform/members")({
  component: () => (
    <>
      <PageHeader title="Platform Members" description="Internal team accounts with platform-level access." />
      <Placeholder scope="Level A" title="Internal staff" notes={["Super admins, support agents, sales reps; their roles and access scope."]} />
    </>
  ),
});
