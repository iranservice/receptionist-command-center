import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Search, Shield, Building2 } from "lucide-react";
import { useWorkspace } from "@/lib/workspace";
import { roleLabels, type Role } from "@/lib/nav-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar({ variant, breadcrumb }: { variant: "platform" | "tenant"; breadcrumb?: React.ReactNode }) {
  const { role, setRole } = useWorkspace();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />

      <div className="flex items-center gap-2 text-sm">
        {variant === "platform" ? (
          <Badge className="gap-1 bg-level-a text-level-a-foreground hover:bg-level-a">
            <Shield className="h-3 w-3" /> Level A · Platform
          </Badge>
        ) : (
          <Badge className="gap-1 bg-level-b text-level-b-foreground hover:bg-level-b">
            <Building2 className="h-3 w-3" /> Level B · Tenant
          </Badge>
        )}
        {breadcrumb && (
          <>
            <span className="text-muted-foreground">/</span>
            <div className="text-sm text-muted-foreground">{breadcrumb}</div>
          </>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm" className="hidden gap-2 text-muted-foreground md:inline-flex">
          <Search className="h-4 w-4" /> Search
          <kbd className="ml-2 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <span className="hidden sm:inline text-xs text-muted-foreground">Demo role</span>
              <Badge variant="secondary" className="font-normal">{roleLabels[role]}</Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Switch demo role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(["super_admin", "business_admin", "operator"] as Role[]).map((r) => (
              <DropdownMenuItem key={r} onClick={() => setRole(r)}>
                {roleLabels[r]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] font-normal text-muted-foreground">
              UI hint only — backend is source of truth for permissions.
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
