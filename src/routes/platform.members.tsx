import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/state/UIState";
import { UsersRound } from "lucide-react";

export const Route = createFileRoute("/platform/members")({
  component: () => (
    <>
      <PageHeader
        title="Platform Members"
        description="Internal team accounts with platform-level access."
      />
      {/* TODO(api): platform staff directory with role + access scope. */}
      <EmptyState
        icon={UsersRound}
        title="No platform members yet"
        description="Super admins, support agents and sales reps with their roles and access scope will appear here."
      />
    </>
  ),
});
