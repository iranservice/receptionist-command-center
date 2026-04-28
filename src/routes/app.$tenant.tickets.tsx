import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/state/UIState";
import { TicketCheck } from "lucide-react";

export const Route = createFileRoute("/app/$tenant/tickets")({
  component: () => (
    <>
      <PageHeader
        title="Tickets & Callbacks"
        description="Issues to resolve and customers to call back."
      />
      {/* TODO(api): backend-driven ticket queue with owner + SLA. */}
      <EmptyState
        icon={TicketCheck}
        title="No open tickets"
        description="Open / pending / resolved tickets and scheduled callbacks will appear here once the backend is connected."
      />
    </>
  ),
});
