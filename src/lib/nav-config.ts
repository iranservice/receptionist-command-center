import {
  LayoutDashboard,
  Inbox,
  Users,
  ShoppingBag,
  CalendarClock,
  TicketCheck,
  ShieldCheck,
  UsersRound,
  Plug,
  Settings,
  BarChart3,
  Building2,
  Receipt,
  HeadphonesIcon,
  Megaphone,
  Server,
  Rocket,
  type LucideIcon,
} from "lucide-react";

import type { Role } from "@/lib/workspace";
export type { Role };

export type NavItem = {
  label: string;
  to: string; // template; replace $tenant on render
  icon: LucideIcon;
  group: "operate" | "manage" | "platform" | "growth";
  roles: Role[]; // UI hint only — backend is source of truth
  badge?: "primary"; // visual emphasis (Inbox)
};

/** Level B — tenant workspace nav (Business Admin + Operator) */
export const tenantNav: NavItem[] = [
  {
    label: "Dashboard",
    to: "/app/$tenant",
    icon: LayoutDashboard,
    group: "operate",
    roles: ["business_admin", "operator"],
  },
  {
    label: "Inbox",
    to: "/app/$tenant/inbox",
    icon: Inbox,
    group: "operate",
    roles: ["business_admin", "operator"],
    badge: "primary",
  },
  {
    label: "Approvals",
    to: "/app/$tenant/approvals",
    icon: ShieldCheck,
    group: "operate",
    roles: ["business_admin", "operator"],
  },
  {
    label: "Tickets & Callbacks",
    to: "/app/$tenant/tickets",
    icon: TicketCheck,
    group: "operate",
    roles: ["business_admin", "operator"],
  },

  {
    label: "Customers",
    to: "/app/$tenant/customers",
    icon: Users,
    group: "manage",
    roles: ["business_admin", "operator"],
  },
  {
    label: "Orders",
    to: "/app/$tenant/orders",
    icon: ShoppingBag,
    group: "manage",
    roles: ["business_admin", "operator"],
  },
  {
    label: "Reservations",
    to: "/app/$tenant/reservations",
    icon: CalendarClock,
    group: "manage",
    roles: ["business_admin", "operator"],
  },

  {
    label: "Members & Teams",
    to: "/app/$tenant/members",
    icon: UsersRound,
    group: "manage",
    roles: ["business_admin"],
  },
  {
    label: "Integrations",
    to: "/app/$tenant/integrations",
    icon: Plug,
    group: "manage",
    roles: ["business_admin"],
  },
  {
    label: "Analytics",
    to: "/app/$tenant/analytics",
    icon: BarChart3,
    group: "manage",
    roles: ["business_admin"],
  },
  {
    label: "Settings",
    to: "/app/$tenant/settings",
    icon: Settings,
    group: "manage",
    roles: ["business_admin"],
  },
  {
    label: "Business Setup",
    to: "/app/$tenant/setup",
    icon: Rocket,
    group: "manage",
    roles: ["business_admin"],
  },
];

/** Level A — platform nav (Super Admin) */
export const platformNav: NavItem[] = [
  {
    label: "Platform Dashboard",
    to: "/platform",
    icon: LayoutDashboard,
    group: "platform",
    roles: ["super_admin"],
  },
  {
    label: "Tenants",
    to: "/platform/tenants",
    icon: Building2,
    group: "platform",
    roles: ["super_admin"],
  },
  {
    label: "Plans & Subscriptions",
    to: "/platform/plans",
    icon: Receipt,
    group: "platform",
    roles: ["super_admin"],
  },
  {
    label: "Platform Support",
    to: "/platform/support",
    icon: HeadphonesIcon,
    group: "platform",
    roles: ["super_admin"],
  },

  {
    label: "Internal Sales",
    to: "/platform/sales",
    icon: Megaphone,
    group: "growth",
    roles: ["super_admin"],
  },
  {
    label: "Platform Analytics",
    to: "/platform/analytics",
    icon: BarChart3,
    group: "growth",
    roles: ["super_admin"],
  },

  {
    label: "Platform Members",
    to: "/platform/members",
    icon: UsersRound,
    group: "growth",
    roles: ["super_admin"],
  },
  {
    label: "System & Integrations",
    to: "/platform/system",
    icon: Server,
    group: "growth",
    roles: ["super_admin"],
  },
  {
    label: "Platform Settings",
    to: "/platform/settings",
    icon: Settings,
    group: "growth",
    roles: ["super_admin"],
  },
];

export const groupLabels: Record<NavItem["group"], string> = {
  operate: "Operate",
  manage: "Manage",
  platform: "Platform",
  growth: "Business & System",
};

/** Demo tenants — wired by backend later */
export const demoTenants = [
  { slug: "bella-trattoria", name: "Bella Trattoria", type: "Restaurant" },
  { slug: "harbor-grill", name: "Harbor Grill", type: "Restaurant" },
  { slug: "sunrise-clinic", name: "Sunrise Clinic", type: "Clinic (preview)" },
];

export const roleLabels: Record<Role, string> = {
  super_admin: "Super Admin",
  business_admin: "Business Admin",
  operator: "Operator",
};
