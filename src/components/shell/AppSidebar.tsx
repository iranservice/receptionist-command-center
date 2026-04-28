import { Link, useRouterState, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { tenantNav, platformNav, groupLabels, demoTenants, roleLabels, type NavItem } from "@/lib/nav-config";
import { useWorkspace } from "@/lib/workspace";
import { Building2, ChevronsUpDown, Mic, Sparkles, Check, Plus, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Variant = "platform" | "tenant";

/** Demo counters — replaced by backend later */
const inboxCount = 24;
const approvalsCount = 2;

export function AppSidebar({ variant }: { variant: Variant }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role } = useWorkspace();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const params = useParams({ strict: false }) as { tenant?: string };
  const tenantSlug = params.tenant ?? demoTenants[0].slug;
  const currentTenant = demoTenants.find((t) => t.slug === tenantSlug) ?? demoTenants[0];

  const items = (variant === "platform" ? platformNav : tenantNav).filter((i) => i.roles.includes(role));

  const groups = items.reduce<Record<string, NavItem[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  const isActive = (to: string) => {
    const resolved = to.replace("$tenant", tenantSlug);
    if (resolved === `/app/${tenantSlug}` || resolved === "/platform") return pathname === resolved;
    return pathname === resolved || pathname.startsWith(resolved + "/");
  };

  const counterFor = (label: string): number | undefined => {
    if (label === "Inbox") return inboxCount;
    if (label === "Approvals") return approvalsCount;
    return undefined;
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b border-sidebar-border p-2">
        {variant === "platform" ? (
          <PlatformBrand collapsed={collapsed} />
        ) : (
          <TenantSwitcher collapsed={collapsed} currentSlug={currentTenant.slug} />
        )}
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {Object.entries(groups).map(([group, groupItems], idx) => (
          <SidebarGroup key={group} className={idx > 0 ? "border-t border-sidebar-border/60 pt-2" : ""}>
            {!collapsed && (
              <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
                {groupLabels[group as NavItem["group"]]}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {groupItems.map((item) => {
                  const to = item.to.replace("$tenant", tenantSlug);
                  const active = isActive(item.to);
                  const Icon = item.icon;
                  const count = counterFor(item.label);
                  const isPrimary = item.badge === "primary";

                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                        className={[
                          "group/nav h-9 gap-2.5 rounded-md font-medium transition-colors",
                          "hover:bg-sidebar-accent",
                          active
                            ? variant === "platform"
                              ? "bg-level-a/10 text-level-a hover:bg-level-a/15 data-[active=true]:bg-level-a/10 data-[active=true]:text-level-a"
                              : "bg-level-b/10 text-level-b hover:bg-level-b/15 data-[active=true]:bg-level-b/10 data-[active=true]:text-level-b"
                            : "text-sidebar-foreground/85",
                        ].join(" ")}
                      >
                        <Link to={to}>
                          <span
                            aria-hidden
                            className={[
                              "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full transition-opacity",
                              active ? "opacity-100" : "opacity-0",
                              variant === "platform" ? "bg-level-a" : "bg-level-b",
                            ].join(" ")}
                          />
                          <Icon className="h-4 w-4 shrink-0" />
                          {!collapsed && (
                            <>
                              <span className="truncate">{item.label}</span>
                              {count !== undefined && (
                                <Badge
                                  variant="secondary"
                                  className={[
                                    "ml-auto h-5 min-w-5 justify-center px-1.5 font-mono text-[10px] tabular-nums",
                                    isPrimary && !active ? "bg-primary/12 text-primary" : "",
                                  ].join(" ")}
                                >
                                  {count}
                                </Badge>
                              )}
                            </>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        {!collapsed ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 rounded-md border border-dashed border-sidebar-border bg-sidebar-accent/50 px-2.5 py-1.5 text-[11px] text-muted-foreground">
              <Mic className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Voice channel · reserved</span>
            </div>
            <div className="flex items-center justify-between gap-2 px-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-success" />
                <span>Backend secured</span>
              </div>
              <Badge variant="outline" className="h-5 px-1.5 font-normal text-[10px]">
                {roleLabels[role]}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <Mic className="h-3.5 w-3.5 text-muted-foreground" />
            <Badge variant="outline" className="px-1.5 py-0 text-[9px]">
              {role === "super_admin" ? "SA" : role === "business_admin" ? "BA" : "OP"}
            </Badge>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

function PlatformBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      to="/platform"
      className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-sidebar-accent"
    >
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-level-a text-level-a-foreground shadow-sm">
        <Sparkles className="h-4 w-4" />
        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-sidebar" />
      </div>
      {!collapsed && (
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold">Aura Platform</span>
          <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Level A · Operations
          </span>
        </div>
      )}
    </Link>
  );
}

function TenantSwitcher({ collapsed, currentSlug }: { collapsed: boolean; currentSlug: string }) {
  const [open, setOpen] = useState(false);
  const current = demoTenants.find((t) => t.slug === currentSlug) ?? demoTenants[0];
  const initials = current.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");

  if (collapsed) {
    return (
      <Link
        to="/app/$tenant"
        params={{ tenant: current.slug }}
        className="flex justify-center rounded-md px-1 py-1.5 hover:bg-sidebar-accent"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-level-b font-semibold text-[11px] text-level-b-foreground shadow-sm">
          {initials}
        </div>
      </Link>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-level-b text-[11px] font-semibold text-level-b-foreground shadow-sm">
            {initials}
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-sidebar" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold">{current.name}</span>
            <span className="truncate text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Level B · {current.type}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:text-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[260px]">
        <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspaces
        </DropdownMenuLabel>
        {demoTenants.map((t) => {
          const isCurrent = t.slug === current.slug;
          return (
            <DropdownMenuItem key={t.slug} asChild className="py-2">
              <Link to="/app/$tenant" params={{ tenant: t.slug }} className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-level-b/15 text-[10px] font-semibold text-level-b">
                  {t.name
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate text-sm font-medium">{t.name}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t.type}
                  </span>
                </div>
                {isCurrent && <Check className="ml-auto h-4 w-4 text-level-b" />}
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuItem className="py-2 text-muted-foreground">
          <Plus className="mr-2 h-4 w-4" /> Add business
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="py-2">
          <Link to="/platform" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-level-a/15 text-level-a">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium">Aura Platform</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Level A · Super Admin
              </span>
            </div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Building2 used elsewhere (kept import for future use)
void Building2;
