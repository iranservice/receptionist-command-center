// Phase II — Tenant-scoped members & teams management.
// Reads member data from the data adapter, respects workspace context,
// shows role-based affordances. Actions are demo-safe.

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useCallback } from "react";
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
  Info,
} from "lucide-react";
import { useWorkspace } from "@/lib/workspace";
import { useAuth } from "@/lib/auth";
import {
  getBusinessMembers,
  getCurrentUserMember,
  canManageMember,
  roleLabels,
  roleStyles,
  statusLabels,
  statusStyles,
} from "@/data/members-data";
import type { BusinessMember, BusinessRole, MemberStatus } from "@/data/types";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/app/$tenant/members")({
  head: () => ({ meta: [{ title: "Members & Teams · Workspace" }] }),
  component: MembersPage,
});

function MembersPage() {
  const { tenant } = Route.useParams();
  const { role } = useWorkspace();
  const { profile } = useAuth();
  const isAdmin = role === "business_admin" || role === "super_admin";

  // Load members from data adapter — tenant-scoped
  const allMembers = getBusinessMembers(tenant);
  const currentUserMember = getCurrentUserMember(tenant, profile?.id ?? "");
  const currentUserRole: BusinessRole = currentUserMember?.role ?? "viewer";

  const [tab, setTab] = useState<"members" | "teams" | "invites">("members");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MemberStatus | "all">("all");

  const filtered = useMemo(() => {
    return allMembers.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.team.toLowerCase().includes(q)
      );
    });
  }, [allMembers, query, statusFilter]);

  const invites = allMembers.filter((m) => m.status === "invited");
  const activeCount = allMembers.filter((m) => m.status === "active").length;

  // Derive teams from member data
  const teams = useMemo(() => {
    const map = new Map<string, { name: string; members: BusinessMember[] }>();
    for (const m of allMembers) {
      const existing = map.get(m.team);
      if (existing) {
        existing.members.push(m);
      } else {
        map.set(m.team, { name: m.team, members: [m] });
      }
    }
    return Array.from(map.values());
  }, [allMembers]);

  // Workspace display name from membership
  const workspaceName = currentUserMember
    ? tenant.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : tenant;

  return (
    <>
      <PageHeader
        title="Members & Teams"
        description={`Manage who can operate this workspace. Permission truth lives in the backend; the UI surfaces assigned roles.`}
        meta={
          <>
            <Badge
              variant="secondary"
              className="h-5 border-0 bg-level-b/12 px-1.5 text-[10px] font-medium text-level-b"
            >
              Level B · {workspaceName}
            </Badge>
            {currentUserMember && (
              <Badge
                variant="outline"
                className={`h-5 border-0 px-1.5 text-[10px] font-medium ${roleStyles[currentUserMember.role]}`}
              >
                <Shield className="mr-1 h-3 w-3" />
                Your role: {roleLabels[currentUserMember.role]}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {activeCount} active · {invites.length} invited
            </span>
          </>
        }
        actions={
          isAdmin ? (
            <InviteMemberDialog teams={teams.map((t) => t.name)} />
          ) : (
            <Badge variant="outline" className="gap-1.5 font-normal text-muted-foreground">
              <Info className="h-3 w-3" /> View only
            </Badge>
          )
        }
      />

      <div className="space-y-5 p-6">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1 rounded-md border bg-card p-1 text-sm">
          {[
            { id: "members" as const, label: "Members", icon: Users, count: allMembers.length },
            { id: "teams" as const, label: "Teams", icon: UsersRound, count: teams.length },
            { id: "invites" as const, label: "Invitations", icon: Mail, count: invites.length },
          ].map(({ id, label, icon: Icon, count }) => {
            const active = id === tab;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={[
                  "flex items-center gap-1.5 rounded px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-level-b/10 font-medium text-level-b"
                    : "text-foreground/75 hover:bg-muted",
                ].join(" ")}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>

        {tab === "members" && (
          <>
            {/* Filters */}
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
                onValueChange={(v) => setStatusFilter(v as MemberStatus | "all")}
              >
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
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
                    <TableHead>Last active</TableHead>
                    {isAdmin && <TableHead className="w-10" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={isAdmin ? 6 : 5}
                        className="py-12 text-center text-sm text-muted-foreground"
                      >
                        No members match these filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((m) => (
                      <MemberRow
                        key={m.id}
                        member={m}
                        isCurrentUser={m.userId === profile?.id}
                        actorRole={currentUserRole}
                        isAdmin={isAdmin}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>

            <p className="text-[11px] text-muted-foreground">
              Backend contract: role and team assignments shown here are display-only. Authorization
              is enforced server-side regardless of what the UI permits.
            </p>
          </>
        )}

        {tab === "teams" && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((t) => (
              <Card key={t.name} className="p-4 shadow-xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-level-b/12 text-level-b">
                      <UsersRound className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">{t.name}</h3>
                      <p className="text-[11px] text-muted-foreground">
                        {t.members.filter((m) => m.status === "active").length} active
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-normal">
                    {t.members.length} member{t.members.length === 1 ? "" : "s"}
                  </Badge>
                </div>
                <div className="mt-3 flex -space-x-1.5">
                  {t.members.slice(0, 5).map((m) => (
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
                {isAdmin && (
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                      Manage
                    </Button>
                  </div>
                )}
              </Card>
            ))}
            {isAdmin && (
              <Card className="flex flex-col items-center justify-center gap-2 border-dashed p-6 text-center text-sm text-muted-foreground shadow-xs">
                <UsersRound className="h-5 w-5" />
                Create another team
                <Button size="sm" variant="outline" className="mt-1">
                  New team
                </Button>
              </Card>
            )}
          </div>
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
                    <TableHead>Invited</TableHead>
                    {isAdmin && <TableHead className="w-32" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm">{m.email}</TableCell>
                      <TableCell>
                        <Badge className={`border-0 font-normal ${roleStyles[m.role]}`}>
                          {roleLabels[m.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{m.team}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatTimeAgo(m.invitedAt)}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost">
                            Resend
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive">
                            Revoke
                          </Button>
                        </TableCell>
                      )}
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

// ── Member row component ────────────────────────────────────

function MemberRow({
  member,
  isCurrentUser,
  actorRole,
  isAdmin,
}: {
  member: BusinessMember;
  isCurrentUser: boolean;
  actorRole: BusinessRole;
  isAdmin: boolean;
}) {
  const initials = member.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");

  const showActions = isAdmin && canManageMember(actorRole, member.role) && !isCurrentUser;

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-level-b/15 text-[10px] font-semibold text-level-b">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1.5 truncate text-sm font-medium">
              {member.name}
              {isCurrentUser && (
                <Badge variant="outline" className="h-4 px-1 text-[9px] font-normal">
                  You
                </Badge>
              )}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">{member.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={`border-0 font-normal ${roleStyles[member.role]}`}>
          <Shield className="mr-1 h-3 w-3" />
          {roleLabels[member.role]}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">{member.team}</TableCell>
      <TableCell>
        <Badge className={`border-0 font-normal capitalize ${statusStyles[member.status]}`}>
          {statusLabels[member.status]}
        </Badge>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {member.lastActiveAt ? formatTimeAgo(member.lastActiveAt) : "—"}
      </TableCell>
      {isAdmin && (
        <TableCell>
          {showActions ? (
            <MemberActions member={member} />
          ) : (
            <span className="text-[10px] text-muted-foreground">{isCurrentUser ? "" : "—"}</span>
          )}
        </TableCell>
      )}
    </TableRow>
  );
}

// ── Member actions dropdown ─────────────────────────────────

function MemberActions({ member }: { member: BusinessMember }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Change role…</DropdownMenuItem>
        <DropdownMenuItem>Move to team…</DropdownMenuItem>
        {member.status === "invited" && <DropdownMenuItem>Resend invite</DropdownMenuItem>}
        <DropdownMenuSeparator />
        {member.status === "suspended" ? (
          <DropdownMenuItem>Reactivate</DropdownMenuItem>
        ) : (
          <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>
        )}
        <DropdownMenuItem className="text-destructive">Remove from workspace</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Invite dialog ───────────────────────────────────────────

function InviteMemberDialog({ teams }: { teams: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <UserPlus className="h-3.5 w-3.5" /> Invite member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>
            They'll receive an email to join this workspace. Backend issues and validates the
            invitation token.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input type="email" placeholder="name@example.com" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select defaultValue="operator">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Team</Label>
              <Select defaultValue={teams[0] ?? "General"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          <Button onClick={() => setOpen(false)} className="gap-1.5">
            <Mail className="h-3.5 w-3.5" /> Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Helpers ─────────────────────────────────────────────────

function formatTimeAgo(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}
