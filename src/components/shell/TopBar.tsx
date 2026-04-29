import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Search,
  Shield,
  Building2,
  Settings,
  HelpCircle,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useWorkspace } from "@/lib/workspace";
import { useAuth } from "@/lib/auth";
import { roleLabels } from "@/lib/nav-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar({
  variant,
  breadcrumb,
}: {
  variant: "platform" | "tenant";
  breadcrumb?: React.ReactNode;
}) {
  const { role } = useWorkspace();
  const { profile, isDemoMode, signOut } = useAuth();
  const displayName = profile?.displayName ?? "User";
  const displayEmail = profile?.email ?? "";
  const initials =
    displayName
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";
  const isPlatform = variant === "platform";

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-xl">
      {/* Level context strip */}
      <div className={`h-1 w-full ${isPlatform ? "bg-level-a" : "bg-level-b"}`} aria-hidden />

      <div
        className={`flex h-14 items-center gap-3 px-4 ${isPlatform ? "context-strip-a" : "context-strip-b"}`}
      >
        <SidebarTrigger className="h-8 w-8" />
        <Separator orientation="vertical" className="h-5" />

        {/* Context label + breadcrumb */}
        <div className="flex min-w-0 items-center gap-2">
          <Badge
            className={
              isPlatform
                ? "h-6 gap-1 border-0 bg-level-a/12 px-2 font-medium text-level-a hover:bg-level-a/15"
                : "h-6 gap-1 border-0 bg-level-b/12 px-2 font-medium text-level-b hover:bg-level-b/15"
            }
            variant="secondary"
          >
            {isPlatform ? <Shield className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
            {isPlatform ? "Platform" : "Workspace"}
          </Badge>
          {breadcrumb && (
            <>
              <span className="text-muted-foreground/60">/</span>
              <div className="truncate text-sm font-medium text-foreground/85">{breadcrumb}</div>
            </>
          )}
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-1.5">
          <button
            className="hidden h-8 items-center gap-2 rounded-md border bg-card px-2.5 text-xs text-muted-foreground shadow-xs transition-colors hover:bg-accent lg:inline-flex"
            aria-label="Search conversations and customers"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search conversations, customers…</span>
            <kbd className="ml-3 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/80">
              ⌘K
            </kbd>
          </button>
          <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 sm:inline-flex"
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 sm:inline-flex"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-5" />

          {/* User / role chip */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-8 items-center gap-2 rounded-md border bg-card px-2 shadow-xs transition-colors hover:bg-accent">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/12 text-[10px] font-semibold text-primary">
                  {initials}
                </div>
                <div className="hidden flex-col items-start leading-tight md:flex">
                  <span className="text-xs font-medium">{displayName}</span>
                  <span className="text-[10px] text-muted-foreground">{roleLabels[role]}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="text-sm">{displayName}</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  {displayEmail}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isDemoMode && (
                <>
                  <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Demo mode
                  </DropdownMenuLabel>
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    Using sample workspace data. Connect Supabase to use real accounts.
                  </div>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-muted-foreground">
                Account settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-muted-foreground" onClick={() => void signOut()}>
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
