import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/state/UIState";
import { Users, Inbox } from "lucide-react";

export const Route = createFileRoute("/app/$tenant/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const { tenant } = useParams({ from: "/app/$tenant/customers" });
  return (
    <>
      <PageHeader title="Customers" description="Customer directory and history." />
      {/* TODO(api): replace with backend-paginated customer list (loader + query). */}
      <EmptyState
        icon={Users}
        title="No customers yet"
        description="Customer profiles, conversation history, orders, reservations and tags will appear here. The backend will own this data."
        actions={[
          {
            label: "Open Inbox",
            icon: Inbox,
            variant: "default",
            href: `/app/${tenant}/inbox`,
          },
        ]}
      />
    </>
  );
}
