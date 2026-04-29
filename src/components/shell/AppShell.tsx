// Phase I — AppShell (updated).
// Accepts optional tenantSlug so WorkspaceProvider can resolve membership.
// Preserves LV-1 layout exactly — only wiring change.

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { WorkspaceProvider } from "@/lib/workspace";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import type { ReactNode } from "react";
import type { Role } from "@/lib/workspace";

export function AppShell({
  variant,
  defaultRole,
  tenantSlug,
  breadcrumb,
  children,
}: {
  variant: "platform" | "tenant";
  defaultRole: Role;
  tenantSlug?: string;
  breadcrumb?: ReactNode;
  children: ReactNode;
}) {
  return (
    <WorkspaceProvider defaultRole={defaultRole} tenantSlug={tenantSlug}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar variant={variant} />
          <SidebarInset className="flex min-w-0 flex-1 flex-col">
            <TopBar variant={variant} breadcrumb={breadcrumb} />
            <main className="flex-1">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </WorkspaceProvider>
  );
}
