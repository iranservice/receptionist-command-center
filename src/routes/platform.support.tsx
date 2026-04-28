import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/state/UIState";
import { HeadphonesIcon } from "lucide-react";

export const Route = createFileRoute("/platform/support")({
  component: () => (
    <>
      <PageHeader
        title="Platform Support"
        description="Internal queue for tenant-reported issues."
      />
      {/* TODO(api): backend-driven internal support queue with SLA. */}
      <EmptyState
        icon={HeadphonesIcon}
        title="No open support tickets"
        description="Tickets opened by tenant admins, escalations and SLA views will appear here."
      />
    </>
  ),
});
