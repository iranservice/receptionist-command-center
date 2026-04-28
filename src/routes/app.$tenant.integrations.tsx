import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shell/PageHeader";
import { SettingsSection } from "@/components/settings/SettingsLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  MessageSquare,
  Mail,
  Phone,
  Smartphone,
  CreditCard,
  Plug,
  CheckCircle2,
  AlertCircle,
  Lock,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/app/$tenant/integrations")({
  head: () => ({ meta: [{ title: "Integrations · Workspace" }] }),
  component: IntegrationsPage,
});

type Status = "connected" | "disconnected" | "action_required";

type Integration = {
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  status: Status;
  category: "channel" | "payment" | "voice";
};

const integrations: Integration[] = [
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    desc: "Inbound conversations and outbound replies.",
    icon: MessageSquare,
    status: "connected",
    category: "channel",
  },
  {
    id: "email",
    name: "Email inbox",
    desc: "Incoming and outgoing email through this workspace.",
    icon: Mail,
    status: "connected",
    category: "channel",
  },
  {
    id: "sms",
    name: "SMS",
    desc: "Tenant-owned SMS provider account.",
    icon: Smartphone,
    status: "action_required",
    category: "channel",
  },
  {
    id: "voice",
    name: "Call service",
    desc: "Voice channel — UI placeholder reserved.",
    icon: Phone,
    status: "disconnected",
    category: "voice",
  },
];

const statusBadge: Record<Status, { label: string; class: string; icon: LucideIcon }> = {
  connected: {
    label: "Connected",
    class: "bg-success/15 text-success",
    icon: CheckCircle2,
  },
  action_required: {
    label: "Action required",
    class: "bg-warn/25 text-warn-foreground",
    icon: AlertCircle,
  },
  disconnected: {
    label: "Not connected",
    class: "bg-muted text-muted-foreground",
    icon: Plug,
  },
};

function IntegrationsPage() {
  const channels = integrations.filter((i) => i.category === "channel");
  const voice = integrations.filter((i) => i.category === "voice");

  return (
    <>
      <PageHeader
        title="Integrations"
        description="Tenant-owned channels and the tenant's own payment gateway. Credentials are stored and validated by the backend."
        meta={
          <Badge
            variant="secondary"
            className="h-5 border-0 bg-level-b/12 px-1.5 text-[10px] font-medium text-level-b"
          >
            Level B · Tenant-owned
          </Badge>
        }
      />

      <div className="space-y-6 p-6">
        <SettingsSection
          scope="Level B"
          title="Channels"
          description="Where customers reach this business."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {channels.map((i) => (
              <IntegrationCard key={i.id} item={i} />
            ))}
          </div>
        </SettingsSection>

        <SettingsSection
          scope="Level B"
          title="Payment gateway"
          description="This is the tenant's own payment account — never the platform's gateway."
          action={
            <Button size="sm" variant="outline" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" /> Connect provider
            </Button>
          }
        >
          <Card className="flex items-start gap-4 border bg-card p-4 shadow-xs">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-level-b/12 text-level-b">
              <CreditCard className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">Tenant payment provider</h4>
                <Badge
                  variant="secondary"
                  className="h-5 border-0 bg-level-b/12 px-1.5 text-[10px] font-medium text-level-b"
                >
                  Tenant account
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Funds settle directly into the tenant's own account. The platform never holds, nets,
                or routes payments.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="font-normal">
                  Stripe
                </Badge>
                <Badge variant="outline" className="font-normal">
                  PayPal
                </Badge>
                <Badge variant="outline" className="font-normal">
                  Local providers
                </Badge>
              </div>
            </div>
            <Badge className="border-0 bg-muted text-muted-foreground">Not connected</Badge>
          </Card>
          <div className="mt-3 rounded-md border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">Backend contract: </span>
            The platform's own payment gateway is platform-internal (Level A) and is{" "}
            <span className="font-medium">never</span> reused for tenant transactions.
          </div>
        </SettingsSection>

        <SettingsSection
          scope="Level B"
          title="Voice (reserved)"
          description="Voice integration UI is reserved so it can be added without redesign."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {voice.map((i) => (
              <IntegrationCard key={i.id} item={i} />
            ))}
          </div>
        </SettingsSection>
      </div>
    </>
  );
}

function IntegrationCard({ item }: { item: Integration }) {
  const Icon = item.icon;
  const s = statusBadge[item.status];
  const SIcon = s.icon;
  return (
    <Card className="flex items-start gap-3 p-4 shadow-xs">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground/80">
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
            <Lock className="h-3 w-3" /> Credentials stored server-side
          </div>
          <Switch defaultChecked={item.status === "connected"} />
        </div>
      </div>
    </Card>
  );
}
