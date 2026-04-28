import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/app/$tenant/members")({
  component: () => (
    <>
      <PageHeader title="Members & Teams" description="Tenant staff, roles, and team groupings." />
      <Placeholder
        scope="Level B"
        title="Tenant members"
        notes={["Invites, role assignments, team groupings within the tenant."]}
        contract="Authorization truth lives in the backend."
      />
    </>
  ),
});
