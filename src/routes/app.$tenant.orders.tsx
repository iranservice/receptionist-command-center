import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/app/$tenant/orders")({
  component: () => (
    <>
      <PageHeader title="Orders" description="Orders created from conversations and elsewhere." />
      <Placeholder
        scope="Level B"
        title="Orders list"
        notes={[
          "Status (draft, awaiting confirmation, confirmed, fulfilled, cancelled).",
          "Available actions come from backend `available order actions` — UI never invents them.",
        ]}
        contract="Order state and allowed actions come from backend; payments use the tenant's own gateway."
      />
    </>
  ),
});
