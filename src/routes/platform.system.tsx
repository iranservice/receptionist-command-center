import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shell/PageHeader";
import { SettingsSection } from "@/components/settings/SettingsLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  CreditCard,
  MessageSquare,
  Mail,
  Smartphone,
  Workflow,
  CheckCircle2,
  AlertCircle,
  Plug,
  Lock,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/platform/system")({
  head: () => ({ meta: [{ title: "System & Integrations · Platform" }] }),
  component: PlatformSystem,
});

type Status = "connected" | "disconnected" | "action_required";

const statusBadge: Record<Status, { label: string; class: string; icon: LucideIcon }> = {
  connected: { label: "Connected", class: "bg-success/15 text-success", icon: CheckCircle2 },
  action_required: {
    label: "Action required",
    class: "bg-warn/25 text-warn-foreground",
    icon: AlertCircle,
  },
  disconnected: { label: "Not connected", class: "bg-muted text-muted-foreground", icon: Plug },
};

const integrations: {
  name: string;
  desc: string;
  icon: LucideIcon;
  status: Status;
  group: "billing" | "ops" | "automation";
}[] = [
  {
    name: "Platform payment gateway",
    desc: "Used ONLY for platform billing of tenants — never for tenant transactions.",
    icon: CreditCard,
    status: "connected",
    group: "billing",
  },
  {
    name: "Email service",
    desc: "Transactional and platform notifications.",
    icon: Mail,
    status: "connected",
    group: "ops",
  },
  {
    name: "SMS panel",
    desc: "Platform-side SMS for support and alerts.",
    icon: Smartphone,
    status: "connected",
    group: "ops",
  },
  {
    name: "WhatsApp (platform)",
    desc: "Platform-managed WhatsApp tooling for support and onboarding.",
    icon: MessageSquare,
    status: "action_required",
    group: "ops",
  },
  {
    name: "n8n / automation",
    desc: "Internal workflows and pipelines.",
    icon: Workflow,
    status: "disconnected",
    group: "automation",
  },
];

function PlatformSystem() {
  return (
    <>
      <PageHeader
        title="System & Integrations"
        description="Platform-internal infrastructure. These integrations belong to the platform business and never appear in any tenant workspace."
        meta={
          <Badge
            variant="secondary"
            className="h-5 border-0 bg-level-a/12 px-1.5 text-[10px] font-medium text-level-a"
          >
            Level A · Platform
          </Badge>
        }
      />

      <div className="space-y-6 p-6">
        <SettingsSection
          scope="Level A"
          title="Billing infrastructure"
          description="Used to charge tenants for platform plans."
        >
          {integrations
            .filter((i) => i.group === "billing")
            .map((i) => (
              <IntegrationRow key={i.name} item={i} />
            ))}
          <div className="mt-3 rounded-md border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">Backend contract: </span>
            Tenant-side payment flows must use the tenant's own gateway. The platform gateway is{" "}
            <span className="font-medium">never</span> exposed to tenants for collecting their
            customers' payments.
          </div>
        </SettingsSection>

        <SettingsSection
          scope="Level A"
          title="Platform messaging"
          description="Channels the platform itself uses to reach tenants and internal staff."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {integrations
              .filter((i) => i.group === "ops")
              .map((i) => (
                <IntegrationCard key={i.name} item={i} />
              ))}
          </div>
        </SettingsSection>

        <SettingsSection
          scope="Level A"
          title="Automation"
          description="Internal workflows for the platform team."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {integrations
              .filter((i) => i.group === "automation")
              .map((i) => (
                <IntegrationCard key={i.name} item={i} />
              ))}
          </div>
        </SettingsSection>
      </div>
    </>
  );
}

function IntegrationCard({ item }: { item: (typeof integrations)[number] }) {
  const Icon = item.icon;
  const s = statusBadge[item.status];
  const SIcon = s.icon;
  return (
    <Card className="flex items-start gap-3 p-4 shadow-xs">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-level-a/10 text-level-a">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-sm font-semibold">{item.name}</h4>
          <Badge className={`border-0 font-normal ${s.class}`}>
            <SIcon className="mr-1 h-3 w-3" /> {s.label}
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="h-3 w-3" /> Server-side credentials
          </div>
          <Switch defaultChecked={item.status === "connected"} />
        </div>
      </div>
    </Card>
  );
}

function IntegrationRow({ item }: { item: (typeof integrations)[number] }) {
  const Icon = item.icon;
  const s = statusBadge[item.status];
  const SIcon = s.icon;
  return (
    <Card className="flex items-center gap-4 p-4 shadow-xs">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-level-a/12 text-level-a">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold">{item.name}</h4>
          <Badge
            variant="secondary"
            className="h-5 border-0 bg-level-a/12 px-1.5 text-[10px] font-medium text-level-a"
          >
            Platform-only
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
      </div>
      <Badge className={`border-0 font-normal ${s.class}`}>
        <SIcon className="mr-1 h-3 w-3" /> {s.label}
      </Badge>
    </Card>
  );
}
