import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/state/UIState";
import { ShoppingBag, Inbox } from "lucide-react";

export const Route = createFileRoute("/app/$tenant/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const { tenant } = useParams({ from: "/app/$tenant/orders" });
  return (
    <>
      <PageHeader
        title="Orders"
        description="Orders are created and confirmed inside the inbox conversation. This list will summarize them — backend owns state and allowed actions."
      />
      {/* TODO(api): backend-driven order list with availableActions per row. */}
      <EmptyState
        icon={ShoppingBag}
        title="No orders to show"
        description="Open a conversation in the Inbox to view its linked order panel. Status, allowed actions and payments are owned by the backend and the tenant's own gateway."
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
