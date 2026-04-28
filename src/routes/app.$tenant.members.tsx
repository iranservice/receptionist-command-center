import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
} from "lucide-react";

export const Route = createFileRoute("/app/$tenant/members")({
  head: () => ({ meta: [{ title: "Members & Teams · Workspace" }] }),
  component: MembersPage,
});

type Status = "active" | "invited" | "inactive";
type MemberRole = "Business Admin" | "Operator" | "Viewer";
type Member = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  team: string;
  status: Status;
};

const seed: Member[] = [
  { id: "1", name: "Maya Holloway", email: "maya@bella.com", role: "Business Admin", team: "Front of house", status: "active" },
  { id: "2", name: "Diego Romero", email: "diego@bella.com", role: "Operator", team: "Front of house", status: "active" },
  { id: "3", name: "Aiko Tanaka", email: "aiko@bella.com", role: "Operator", team: "Kitchen", status: "active" },
  { id: "4", name: "Henrik Solberg", email: "henrik@bella.com", role: "Operator", team: "Delivery", status: "invited" },
  { id: "5", name: "Priya Shah", email: "priya@bella.com", role: "Viewer", team: "Front of house", status: "inactive" },
  { id: "6", name: "Lucas Mendez", email: "lucas@bella.com", role: "Operator", team: "Delivery", status: "active" },
];

const teams = [
  { id: "fh", name: "Front of house", desc: "Phones, chat, host stand.", count: 3 },
  { id: "kt", name: "Kitchen", desc: "Order acknowledgement and timing.", count: 1 },
  { id: "dv", name: "Delivery", desc: "Drivers and dispatch.", count: 2 },
];

const statusStyle: Record<Status, string> = {
  active: "bg-success/15 text-success",
  invited: "bg-warn/25 text-warn-foreground",
  inactive: "bg-muted text-muted-foreground",
};

const roleStyle: Record<MemberRole, string> = {
  "Business Admin": "bg-level-b/12 text-level-b",
  Operator: "bg-operator/20 text-operator-foreground",
  Viewer: "bg-muted text-muted-foreground",
};

function MembersPage() {
  const [tab, setTab] = useState<"members" | "teams" | "invites">("members");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  const filtered = useMemo(() => {
    return seed.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.team.toLowerCase().includes(q)
      );
    });
  }, [query, statusFilter]);

  const invites = seed.filter((m) => m.status === "invited");

  return (
    <>
      <PageHeader
        title="Members & Teams"
        description="Manage who can operate this workspace. Permission truth lives in the backend; the UI surfaces assigned roles."
        meta={
          <>
            <Badge
              variant="secondary"
              className="h-5 border-0 bg-level-b/12 px-1.5 text-[10px] font-medium text-level-b"
            >
              Level B · Tenant
            </Badge>
            <span className="text-xs text-muted-foreground">
              {seed.filter((m) => m.status === "active").length} active ·{" "}
              {invites.length} invited
            </span>
          </>
        }
        actions={<InviteMemberDialog />}
      />

      <div className="space-y-5 p-6">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1 rounded-md border bg-card p-1 text-sm">
          {[
            { id: "members" as const, label: "Members", icon: Users, count: seed.length },
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
                      <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
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
                          <Badge className={`border-0 font-normal ${roleStyle[m.role]}`}>
                            <Shield className="mr-1 h-3 w-3" />
                            {m.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{m.team}</TableCell>
                        <TableCell>
                          <Badge className={`border-0 font-normal capitalize ${statusStyle[m.status]}`}>
                            {m.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Change role…</DropdownMenuItem>
                              <DropdownMenuItem>Move to team…</DropdownMenuItem>
                              <DropdownMenuItem>Resend invite</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
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
                  {seed
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
                        <Badge className={`border-0 font-normal ${roleStyle[m.role]}`}>
                          {m.role}
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

function InviteMemberDialog() {
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
                  <SelectItem value="business_admin">Business Admin</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Team</Label>
              <Select defaultValue="fh">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
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
