// Phase II-B — Members & Teams page wired to backend RPCs.
// Loads members from get_business_members().
// Actions: update_business_member_role, deactivate_business_member, invite_business_member.
// Teams: get_business_teams (placeholder — returns empty).
// Falls back to demo data when Supabase is not configured.

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Search,
  UserPlus,
  Users,
  UsersRound,
  Mail,
  Shield,
  Filter,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useWorkspace } from "@/lib/workspace";
import {
  fetchBusinessMembers,
  fetchBusinessTeams,
  updateMemberRole,
  deactivateMember,
  inviteMember,
  type BusinessMemberRow,
  type BusinessTeamRow,
  type BackendRole,
} from "@/lib/api/members";
import { classifyError } from "@/lib/api/client";
import { LoadingState, ErrorState, DeniedState, EmptyState } from "@/components/state/UIState";
import { toast } from "sonner";

export const Route = createFileRoute("/app/$tenant/members")({
  head: () => ({ meta: [{ title: "Members & Teams · Workspace" }] }),
  component: MembersPage,
});

// ── Demo seed data ──────────────────────────────────────────
type Status = "active" | "invited" | "inactive";
type MemberRole = "Business Admin" | "Operator" | "Viewer";
type DemoMember = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  team: string;
  status: Status;
};

const demoSeed: DemoMember[] = [
  {
    id: "1",
    name: "Maya Holloway",
    email: "maya@bella.com",
    role: "Business Admin",
    team: "Front of house",
    status: "active",
  },
  {
    id: "2",
    name: "Diego Romero",
    email: "diego@bella.com",
    role: "Operator",
    team: "Front of house",
    status: "active",
  },
  {
    id: "3",
    name: "Aiko Tanaka",
    email: "aiko@bella.com",
    role: "Operator",
    team: "Kitchen",
    status: "active",
  },
  {
    id: "4",
    name: "Henrik Solberg",
    email: "henrik@bella.com",
    role: "Operator",
    team: "Delivery",
    status: "invited",
  },
  {
    id: "5",
    name: "Priya Shah",
    email: "priya@bella.com",
    role: "Viewer",
    team: "Front of house",
    status: "inactive",
  },
  {
    id: "6",
    name: "Lucas Mendez",
    email: "lucas@bella.com",
    role: "Operator",
    team: "Delivery",
    status: "active",
  },
];

const demoTeams = [
  { id: "fh", name: "Front of house", desc: "Phones, chat, host stand.", count: 3 },
  { id: "kt", name: "Kitchen", desc: "Order acknowledgement and timing.", count: 1 },
  { id: "dv", name: "Delivery", desc: "Drivers and dispatch.", count: 2 },
];

// ── Style maps ──────────────────────────────────────────────
const statusStyle: Record<string, string> = {
  active: "bg-success/15 text-success",
  invited: "bg-warn/25 text-warn-foreground",
  inactive: "bg-muted text-muted-foreground",
};

function roleDisplayName(role: BackendRole | MemberRole): string {
  switch (role) {
    case "owner":
    case "manager":
      return "Business Admin";
    case "operator":
      return "Operator";
    case "viewer":
      return "Viewer";
    default:
      return String(role);
  }
}

const roleStyleMap: Record<string, string> = {
  "Business Admin": "bg-level-b/12 text-level-b",
  Operator: "bg-operator/20 text-operator-foreground",
  Viewer: "bg-muted text-muted-foreground",
};

function backendRoleToInviteRole(displayRole: string): BackendRole {
  switch (displayRole) {
    case "manager":
      return "manager";
    case "operator":
      return "operator";
    case "viewer":
      return "viewer";
    default:
      return "operator";
  }
}

// ── Main page ───────────────────────────────────────────────

function MembersPage() {
  const { isDemoMode } = useAuth();
  const { businessId, role } = useWorkspace();
  const isAdmin = role === "business_admin" || role === "super_admin";

  const [tab, setTab] = useState<"members" | "teams" | "invites">("members");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  // ── Backend state ─────────────────────────────────────
  const [members, setMembers] = useState<BusinessMemberRow[]>([]);
  const [teams, setTeams] = useState<BusinessTeamRow[]>([]);
  const [loading, setLoading] = useState(!isDemoMode);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (isDemoMode || !businessId) return;
    setLoading(true);
    setError(null);

    const [membersResult, teamsResult] = await Promise.all([
      fetchBusinessMembers(businessId),
      fetchBusinessTeams(businessId),
    ]);

    if (membersResult.error) {
      const cat = classifyError(membersResult.error);
      setError(cat === "access_denied" ? "ACCESS_DENIED" : membersResult.error);
      setLoading(false);
      return;
    }

    setMembers(membersResult.data ?? []);
    setTeams(teamsResult.data ?? []);
    setLoading(false);
  }, [isDemoMode, businessId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Role update handler ───────────────────────────────
  const handleRoleChange = useCallback(
    async (membershipId: string, newRole: BackendRole) => {
      if (isDemoMode) {
        toast.success("Demo mode — role change not persisted.");
        return;
      }
      const result = await updateMemberRole(membershipId, newRole);
      if (result.error) {
        const cat = classifyError(result.error);
        toast.error(
          cat === "access_denied"
            ? "Permission denied. You cannot change this member's role."
            : `Failed: ${result.error}`,
        );
        return;
      }
      toast.success(`Role updated to ${roleDisplayName(newRole)}.`);
      loadData();
    },
    [isDemoMode, loadData],
  );

  // ── Deactivate handler ────────────────────────────────
  const handleDeactivate = useCallback(
    async (membershipId: string) => {
      if (isDemoMode) {
        toast.success("Demo mode — deactivation not persisted.");
        return;
      }
      const result = await deactivateMember(membershipId);
      if (result.error) {
        const cat = classifyError(result.error);
        if (cat === "lockout") {
          toast.error("Cannot deactivate the last owner of this business.");
        } else if (cat === "access_denied") {
          toast.error("Permission denied.");
        } else {
          toast.error(`Failed: ${result.error}`);
        }
        return;
      }
      toast.success("Member deactivated.");
      loadData();
    },
    [isDemoMode, loadData],
  );

  // ── Unify demo + real data for rendering ──────────────
  const useDemo = isDemoMode || (!businessId && members.length === 0);

  type DisplayMember = {
    id: string;
    name: string;
    email: string;
    displayRole: string;
    team: string;
    status: string;
    membershipId: string;
    backendRole: BackendRole;
  };

  const displayMembers: DisplayMember[] = useDemo
    ? demoSeed.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        displayRole: m.role,
        team: m.team,
        status: m.status,
        membershipId: m.id,
        backendRole: "operator" as BackendRole,
      }))
    : members.map((m) => ({
        id: m.membership_id,
        name: m.display_name ?? m.email ?? "Unknown",
        email: m.email ?? "",
        displayRole: roleDisplayName(m.role),
        team: "—",
        status: m.status,
        membershipId: m.membership_id,
        backendRole: m.role,
      }));

  const filtered = useMemo(() => {
    return displayMembers.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.team.toLowerCase().includes(q)
      );
    });
  }, [displayMembers, query, statusFilter]);

  const invites = displayMembers.filter((m) => m.status === "invited");
  const activeCount = displayMembers.filter((m) => m.status === "active").length;

  // ── Access denied ─────────────────────────────────────
  if (error === "ACCESS_DENIED") {
    return (
      <>
        <PageHeader title="Members & Teams" description="Manage workspace members." />
        <div className="p-6">
          <DeniedState
            title="Access denied"
            description="You don't have permission to view members. Contact a workspace admin."
          />
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Members & Teams" description="Loading…" />
        <div className="p-6">
          <LoadingState title="Loading members…" description="Fetching team from backend." />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Members & Teams" description="Error loading members." />
        <div className="p-6">
          <ErrorState title="Failed to load members" description={error} onRetry={loadData} />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Members & Teams"
        description={
          isDemoMode
            ? "Demo mode — showing sample members. Connect Supabase for real data."
            : "Manage who can operate this workspace. Permission truth lives in the backend."
        }
        meta={
          <>
            <Badge
              variant="secondary"
              className="h-5 border-0 bg-level-b/12 px-1.5 text-[10px] font-medium text-level-b"
            >
              Level B · Tenant
            </Badge>
            <span className="text-xs text-muted-foreground">
              {activeCount} active · {invites.length} invited
            </span>
            {isDemoMode && (
              <Badge variant="outline" className="border-warn/40 text-warn-foreground">
                Demo
              </Badge>
            )}
          </>
        }
        actions={
          <InviteMemberDialog
            businessId={businessId}
            isDemoMode={isDemoMode}
            isAdmin={isAdmin}
            onInvited={loadData}
          />
        }
      />

      <div className="space-y-5 p-6">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1 rounded-md border bg-card p-1 text-sm">
          {[
            { id: "members" as const, label: "Members", icon: Users, count: displayMembers.length },
            {
              id: "teams" as const,
              label: "Teams",
              icon: UsersRound,
              count: useDemo ? demoTeams.length : teams.length,
            },
            { id: "invites" as const, label: "Invitations", icon: Mail, count: invites.length },
          ].map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={[
                "flex items-center gap-1.5 rounded px-3 py-1.5 text-sm transition-colors",
                id === tab
                  ? "bg-level-b/10 font-medium text-level-b"
                  : "text-foreground/75 hover:bg-muted",
              ].join(" ")}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                {count}
              </Badge>
            </button>
          ))}
        </div>

        {tab === "members" && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search by name, email, or team"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as Status | "all")}
              >
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="overflow-hidden p-0 shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-12 text-center text-sm text-muted-foreground"
                      >
                        No members match these filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-level-b/15 text-[10px] font-semibold text-level-b">
                                {m.name
                                  .split(" ")
                                  .map((s) => s[0])
                                  .slice(0, 2)
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 leading-tight">
                              <div className="truncate text-sm font-medium">{m.name}</div>
                              <div className="truncate text-[11px] text-muted-foreground">
                                {m.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`border-0 font-normal ${roleStyleMap[m.displayRole] ?? "bg-muted text-muted-foreground"}`}
                          >
                            <Shield className="mr-1 h-3 w-3" />
                            {m.displayRole}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{m.team}</TableCell>
                        <TableCell>
                          <Badge
                            className={`border-0 font-normal capitalize ${statusStyle[m.status] ?? ""}`}
                          >
                            {m.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isAdmin && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleRoleChange(m.membershipId, "manager")}
                                >
                                  Set as Manager
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRoleChange(m.membershipId, "operator")}
                                >
                                  Set as Operator
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRoleChange(m.membershipId, "viewer")}
                                >
                                  Set as Viewer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeactivate(m.membershipId)}
                                >
                                  Deactivate
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
            <p className="text-[11px] text-muted-foreground">
              Backend contract: role and team assignments shown here are display-only. Authorization
              is enforced server-side.
            </p>
          </>
        )}

        {tab === "teams" && (
          <TeamsTab
            teams={useDemo ? demoTeams : teams}
            useDemo={useDemo}
            displayMembers={useDemo ? demoSeed : []}
          />
        )}

        {tab === "invites" && (
          <Card className="overflow-hidden p-0 shadow-xs">
            {invites.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                <Mail className="mx-auto mb-2 h-5 w-5" />
                No pending invitations.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Invited as</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="w-32" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm">{m.email}</TableCell>
                      <TableCell>
                        <Badge
                          className={`border-0 font-normal ${roleStyleMap[m.displayRole] ?? ""}`}
                        >
                          {m.displayRole}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{m.team}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost">
                          Resend
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive">
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        )}
      </div>
    </>
  );
}

// ── Teams tab ───────────────────────────────────────────────

function TeamsTab({
  teams,
  useDemo,
  displayMembers,
}: {
  teams: (BusinessTeamRow | (typeof demoTeams)[0])[];
  useDemo: boolean;
  displayMembers: DemoMember[];
}) {
  if (!useDemo && teams.length === 0) {
    return (
      <EmptyState
        icon={UsersRound}
        title="No teams yet"
        description="Teams feature is coming soon. The backend placeholder is ready."
      />
    );
  }

  if (useDemo) {
    return (
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {demoTeams.map((t) => (
          <Card key={t.id} className="p-4 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-level-b/12 text-level-b">
                  <UsersRound className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{t.name}</h3>
                  <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                </div>
              </div>
              <Badge variant="outline" className="font-normal">
                {t.count} member{t.count === 1 ? "" : "s"}
              </Badge>
            </div>
            <div className="mt-3 flex -space-x-1.5">
              {displayMembers
                .filter((m) => m.team === t.name)
                .slice(0, 5)
                .map((m) => (
                  <Avatar key={m.id} className="h-6 w-6 ring-2 ring-card">
                    <AvatarFallback className="bg-muted text-[9px] font-medium">
                      {m.name
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                ))}
            </div>
            <div className="mt-3 flex justify-end">
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                Manage
              </Button>
            </div>
          </Card>
        ))}
        <Card className="flex flex-col items-center justify-center gap-2 border-dashed p-6 text-center text-sm text-muted-foreground shadow-xs">
          <UsersRound className="h-5 w-5" />
          Create another team
          <Button size="sm" variant="outline" className="mt-1">
            New team
          </Button>
        </Card>
      </div>
    );
  }

  // Real teams from backend (when implemented)
  return (
    <EmptyState
      icon={UsersRound}
      title="No teams yet"
      description="Teams feature is coming soon."
    />
  );
}

// ── Invite dialog ───────────────────────────────────────────

function InviteMemberDialog({
  businessId,
  isDemoMode,
  isAdmin,
  onInvited,
}: {
  businessId: string | null;
  isDemoMode: boolean;
  isAdmin: boolean;
  onInvited: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("operator");
  const [sending, setSending] = useState(false);

  const handleInvite = useCallback(async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address.");
      return;
    }

    if (isDemoMode) {
      toast.success("Demo mode — invite not sent.");
      setOpen(false);
      setEmail("");
      return;
    }

    if (!businessId) {
      toast.error("No business context.");
      return;
    }

    setSending(true);
    const result = await inviteMember(
      businessId,
      email.trim(),
      backendRoleToInviteRole(inviteRole),
    );
    setSending(false);

    if (result.error) {
      const cat = classifyError(result.error);
      if (cat === "access_denied") toast.error("Permission denied.");
      else if (cat === "conflict") toast.error("This user already has a membership.");
      else toast.error(`Failed: ${result.error}`);
      return;
    }

    toast.success(`Invitation sent to ${email.trim()}.`);
    setOpen(false);
    setEmail("");
    onInvited();
  }, [email, inviteRole, isDemoMode, businessId, onInvited]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5" disabled={!isAdmin}>
          <UserPlus className="h-3.5 w-3.5" /> Invite member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>
            {isDemoMode
              ? "Demo mode — invitation will not be sent."
              : "They'll receive an invitation to join this workspace. Backend issues and validates the invitation."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Role</Label>
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="rounded-md border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">Backend contract: </span>
            Role does not grant any access on its own — the server enforces the actual policy.
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={sending} className="gap-1.5">
            {sending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Mail className="h-3.5 w-3.5" />
            )}
            {sending ? "Sending…" : "Send invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
