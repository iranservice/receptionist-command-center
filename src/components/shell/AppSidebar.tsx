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
import { Building2, Shield, ChevronsUpDown, Mic } from "lucide-react";
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

export function AppSidebar({ variant }: { variant: Variant }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role } = useWorkspace();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const params = useParams({ strict: false }) as { tenant?: string };
  const tenantSlug = params.tenant ?? demoTenants[0].slug;
  const currentTenant = demoTenants.find((t) => t.slug === tenantSlug) ?? demoTenants[0];

  const items = variant === "platform" ? platformNav : tenantNav;
  const visible = items.filter((i) => i.roles.includes(role));

  // Group nav items
  const groups = visible.reduce<Record<string, NavItem[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  const isActive = (to: string) => {
    const resolved = to.replace("$tenant", tenantSlug);
    if (resolved === `/app/${tenantSlug}` || resolved === "/platform") return pathname === resolved;
    return pathname === resolved || pathname.startsWith(resolved + "/");
  };

  return (
    <Sidebar collapsible="icon" className={variant === "platform" ? "level-a-sidebar" : ""}>
      <SidebarHeader className="border-b border-sidebar-border">
        {variant === "platform" ? <PlatformBrand collapsed={collapsed} /> : <TenantSwitcher collapsed={collapsed} currentSlug={currentTenant.slug} />}
      </SidebarHeader>

      <SidebarContent>
        {Object.entries(groups).map(([group, groupItems]) => (
          <SidebarGroup key={group}>
            {!collapsed && <SidebarGroupLabel>{groupLabels[group as NavItem["group"]]}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {groupItems.map((item) => {
                  const to = item.to.replace("$tenant", tenantSlug);
                  const active = isActive(item.to);
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                        className={item.badge === "primary" ? "data-[active=true]:bg-primary/10 data-[active=true]:text-primary font-medium" : ""}
                      >
                        <Link to={to}>
                          <Icon className="h-4 w-4 shrink-0" />
                          {!collapsed && (
                            <span className="flex items-center gap-2">
                              {item.label}
                              {item.badge === "primary" && (
                                <span className="ml-auto inline-flex h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                              )}
                            </span>
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

        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupContent className="px-2 pt-2">
              <div className="flex items-center gap-2 rounded-md border border-dashed border-sidebar-border bg-sidebar-accent/40 p-2 text-xs text-muted-foreground">
                <Mic className="h-3.5 w-3.5 shrink-0" />
                <span>Voice channel — reserved</span>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs">
            <span className="text-muted-foreground">Signed in as</span>
            <Badge variant="outline" className="font-normal">{roleLabels[role]}</Badge>
          </div>
        ) : (
          <div className="flex justify-center py-1.5">
            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">{role === "super_admin" ? "SA" : role === "business_admin" ? "BA" : "OP"}</Badge>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

function PlatformBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link to="/platform" className="flex items-center gap-2 px-2 py-1.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-level-a text-level-a-foreground">
        <Shield className="h-4 w-4" />
      </div>
      {!collapsed && (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">Platform</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Level A · Super Admin</span>
        </div>
      )}
    </Link>
  );
}

function TenantSwitcher({ collapsed, currentSlug }: { collapsed: boolean; currentSlug: string }) {
  const [open, setOpen] = useState(false);
  const current = demoTenants.find((t) => t.slug === currentSlug) ?? demoTenants[0];

  if (collapsed) {
    return (
      <Link to="/app/$tenant" params={{ tenant: current.slug }} className="flex justify-center px-2 py-1.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-level-b text-level-b-foreground">
          <Building2 className="h-4 w-4" />
        </div>
      </Link>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-sidebar-accent">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-level-b text-level-b-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold">{current.name}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Level B · {current.type}</span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {demoTenants.map((t) => (
          <DropdownMenuItem key={t.slug} asChild>
            <Link to="/app/$tenant" params={{ tenant: t.slug }} className="flex flex-col items-start gap-0.5">
              <span className="font-medium">{t.name}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.type}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/platform" className="text-level-a">
            <Shield className="mr-2 h-3.5 w-3.5" /> Go to Platform (Level A)
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
