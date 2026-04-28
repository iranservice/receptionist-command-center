import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/app/$tenant/tickets")({
  component: () => (
    <>
      <PageHeader title="Tickets & Callbacks" description="Issues to resolve and customers to call back." />
      <Placeholder scope="Level B" title="Tickets and callback queue" notes={["Open / pending / resolved tickets, scheduled callbacks, owner."]} />
    </>
  ),
});
