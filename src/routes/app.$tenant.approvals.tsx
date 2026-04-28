import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/app/$tenant/approvals")({
  component: () => (
    <>
      <PageHeader title="Approvals" description="Items waiting on operator or admin sign-off before AI proceeds." />
      <Placeholder
        scope="Level B"
        title="Approval queue"
        notes={[
          "Order confirmations requiring approval, refunds, customer-confirmation requests.",
          "Approval-required vs confirmation-required are visually distinct in the queue.",
        ]}
        contract="Backend defines what requires approval; UI surfaces and acts on it."
      />
    </>
  ),
});
