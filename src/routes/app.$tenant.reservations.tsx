import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Placeholder } from "@/components/shell/PageHeader";

export const Route = createFileRoute("/app/$tenant/reservations")({
  component: () => (
    <>
      <PageHeader title="Reservations" description="Bookings and time-slot management." />
      <Placeholder scope="Level B" title="Reservation views" notes={["Today / upcoming / by table or resource. Lighter than orders for now."]} />
    </>
  ),
});
