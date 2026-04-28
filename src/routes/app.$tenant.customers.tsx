import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/app/$tenant/customers")({
  component: () => (
    <>
      <PageHeader title="Customers" description="Customer directory and history." />
      <Placeholder scope="Level B" title="Customer directory" notes={["Profile, conversation history, orders, reservations, tags."]} />
    </>
  ),
});
