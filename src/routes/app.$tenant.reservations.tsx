import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/state/UIState";
import { CalendarClock } from "lucide-react";

export const Route = createFileRoute("/app/$tenant/reservations")({
  component: () => (
    <>
      <PageHeader title="Reservations" description="Bookings and time-slot management." />
      {/* TODO(api): tenant-scoped reservation list (today / upcoming / by resource). */}
      <EmptyState
        icon={CalendarClock}
        title="No reservations yet"
        description="Reservations created from the inbox or external integrations will appear here. Backend owns slot rules and conflicts."
      />
    </>
  ),
});
