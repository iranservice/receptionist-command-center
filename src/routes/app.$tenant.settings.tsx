// Phase II — Tenant-scoped business settings.
// Reads settings from the data adapter, respects workspace context,
// shows role-based affordances. Forms are demo-safe (no real persistence).

import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/shell/PageHeader";
import { SettingsSection, SettingsField, BackendNote } from "@/components/settings/SettingsLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Clock,
  MapPin,
  Bot,
  Languages,
  UtensilsCrossed,
  Save,
  Rocket,
  AlertTriangle,
  Info,
} from "lucide-react";
import { businessTypes, getBusinessType, type BusinessTypeId } from "@/lib/business-types";
import { useWorkspace } from "@/lib/workspace";
import { getBusinessSettings } from "@/data/settings-data";
import type { BusinessSettings, BusinessStatus } from "@/data/types";

export const Route = createFileRoute("/app/$tenant/settings")({
  head: () => ({ meta: [{ title: "Settings · Workspace" }] }),
  component: TenantSettings,
});

const tabs = [
  { id: "profile", label: "Business profile", icon: Building2 },
  { id: "hours", label: "Working hours", icon: Clock },
  { id: "service", label: "Service area", icon: MapPin },
  { id: "ai", label: "AI & handoff", icon: Bot },
  { id: "localization", label: "Localization", icon: Languages },
  { id: "module", label: "Type module", icon: UtensilsCrossed },
] as const;

type TabId = (typeof tabs)[number]["id"];

// ── Status badge ────────────────────────────────────────────

const statusConfig: Record<BusinessStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-success/15 text-success" },
  setup_required: { label: "Setup required", className: "bg-warn/25 text-warn-foreground" },
  paused: { label: "Paused", className: "bg-muted text-muted-foreground" },
};

function TenantSettings() {
  const { tenant } = useParams({ from: "/app/$tenant/settings" });
  const { role } = useWorkspace();
  const isAdmin = role === "business_admin" || role === "super_admin";

  // Load settings from data adapter — tenant-scoped
  const settings = getBusinessSettings(tenant);
  const displayName = settings?.name ?? tenant;
  const [active, setActive] = useState<TabId>("profile");
  const [businessType, setBusinessType] = useState<BusinessTypeId>(
    settings?.businessType ?? "restaurant",
  );
  const bt = getBusinessType(businessType);
  const status = settings?.status ?? "active";
  const statusInfo = statusConfig[status];

  return (
    <>
      <PageHeader
        title="Settings"
        description={`Business settings for ${displayName}. Frontend collects intent — backend is the source of truth.`}
        meta={
          <>
            <Badge
              variant="secondary"
              className="h-5 border-0 bg-level-b/12 px-1.5 text-[10px] font-medium text-level-b"
            >
              Level B · {displayName}
            </Badge>
            <Badge variant="outline" className="font-normal">
              {bt.label}
            </Badge>
            <Badge className={`border-0 font-normal ${statusInfo.className}`}>
              {statusInfo.label}
            </Badge>
          </>
        }
        actions={
          <>
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link to="/app/$tenant/setup" params={{ tenant }}>
                <Rocket className="h-3.5 w-3.5" /> Re-run setup
              </Link>
            </Button>
            {isAdmin ? (
              <Button size="sm" className="gap-1.5">
                <Save className="h-3.5 w-3.5" /> Save changes
              </Button>
            ) : (
              <Badge variant="outline" className="gap-1.5 font-normal text-muted-foreground">
                <Info className="h-3 w-3" /> View only
              </Badge>
            )}
          </>
        }
      />

      <div className="grid gap-6 p-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <Card className="overflow-hidden p-1 shadow-xs">
            <nav className="flex flex-col">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === active;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActive(tab.id)}
                    className={[
                      "flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "bg-level-b/10 font-medium text-level-b"
                        : "text-foreground/85 hover:bg-muted",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </aside>

        <div className="min-w-0 space-y-5">
          {active === "profile" && <ProfileTab settings={settings} isAdmin={isAdmin} />}
          {active === "hours" && <HoursTab settings={settings} isAdmin={isAdmin} />}
          {active === "service" && <ServiceTab isAdmin={isAdmin} />}
          {active === "ai" && <AITab settings={settings} isAdmin={isAdmin} />}
          {active === "localization" && <LocalizationTab settings={settings} isAdmin={isAdmin} />}
          {active === "module" && (
            <ModuleTab value={businessType} onChange={setBusinessType} isAdmin={isAdmin} />
          )}
        </div>
      </div>
    </>
  );
}

function ProfileTab({
  settings,
  isAdmin,
}: {
  settings: BusinessSettings | null;
  isAdmin: boolean;
}) {
  return (
    <SettingsSection
      scope="Level B"
      title="Business profile"
      description="Identity and contact for this tenant business."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <SettingsField label="Business name">
          <Input defaultValue={settings?.name ?? ""} disabled={!isAdmin} />
        </SettingsField>
        <SettingsField label="Public display name">
          <Input defaultValue={settings?.publicDisplayName ?? ""} disabled={!isAdmin} />
        </SettingsField>
        <SettingsField label="Public phone">
          <Input
            placeholder="+1 555 010 1234"
            defaultValue={settings?.phone ?? ""}
            disabled={!isAdmin}
          />
        </SettingsField>
        <SettingsField label="Public email">
          <Input
            type="email"
            placeholder="hello@business.com"
            defaultValue={settings?.email ?? ""}
            disabled={!isAdmin}
          />
        </SettingsField>
        <SettingsField label="Logo">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed bg-muted/40 text-muted-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <Button type="button" size="sm" variant="outline" disabled={!isAdmin}>
              Upload
            </Button>
          </div>
        </SettingsField>
        <div className="sm:col-span-2">
          <SettingsField label="Address">
            <Textarea
              rows={2}
              placeholder="Street, city, postal code, country"
              defaultValue={settings?.address ?? ""}
              disabled={!isAdmin}
            />
          </SettingsField>
        </div>
      </div>
      <BackendNote>Profile persistence and validation occur server-side.</BackendNote>
    </SettingsSection>
  );
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function HoursTab({ settings, isAdmin }: { settings: BusinessSettings | null; isAdmin: boolean }) {
  return (
    <SettingsSection
      scope="Level B"
      title="Working hours"
      description="Off-hours can route to the AI receptionist automatically."
    >
      {settings?.operatingHoursSummary && (
        <div className="mb-4 flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>
            Current schedule:{" "}
            <strong className="text-foreground">{settings.operatingHoursSummary}</strong>
          </span>
        </div>
      )}
      <div className="overflow-hidden rounded-md border">
        {days.map((d, i) => (
          <div
            key={d}
            className={[
              "grid grid-cols-[80px_minmax(0,1fr)_minmax(0,1fr)_90px] items-center gap-3 px-4 py-2.5 text-sm",
              i > 0 && "border-t",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="font-medium">{d}</span>
            <Input type="time" defaultValue="09:00" disabled={d === "Sun" || !isAdmin} />
            <Input type="time" defaultValue="22:00" disabled={d === "Sun" || !isAdmin} />
            <label className="flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
              <Checkbox defaultChecked={d === "Sun"} disabled={!isAdmin} /> Closed
            </label>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}

function ServiceTab({ isAdmin }: { isAdmin: boolean }) {
  return (
    <SettingsSection
      scope="Level B"
      title="Service / delivery area"
      description="Where this business operates. Geometry is owned by the backend."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <SettingsField label="Mode">
          <Select defaultValue="hybrid" disabled={!isAdmin}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="onsite">On-site only</SelectItem>
              <SelectItem value="delivery">Delivery only</SelectItem>
              <SelectItem value="hybrid">Both</SelectItem>
            </SelectContent>
          </Select>
        </SettingsField>
        <SettingsField label="Radius (km)">
          <Input type="number" defaultValue={5} min={0} disabled={!isAdmin} />
        </SettingsField>
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-md border border-dashed bg-muted/30 px-4 py-6 text-xs text-muted-foreground">
        <MapPin className="h-4 w-4 shrink-0" />
        Map editor placeholder — backend owns canonical service area geometry.
      </div>
    </SettingsSection>
  );
}

function AITab({ settings, isAdmin }: { settings: BusinessSettings | null; isAdmin: boolean }) {
  return (
    <SettingsSection
      scope="Level B"
      title="AI & operator handoff"
      description="UI surfaces backend-defined AI behavior. Rules are not authored in the frontend."
    >
      <div className="space-y-4">
        <ToggleRow
          title="AI replies enabled"
          desc="Master toggle — backend enforces channel-level overrides."
          defaultOn={settings?.aiPolicyEnabled ?? true}
          disabled={!isAdmin}
        />
        <ToggleRow
          title="Auto-handoff to operator on low confidence"
          desc="Threshold and triggers configured server-side."
          defaultOn={settings?.escalationPolicyEnabled ?? true}
          disabled={!isAdmin}
        />
        <ToggleRow
          title="Require operator approval for outbound orders"
          desc="Approval-vs-confirmation truth lives in the backend."
          defaultOn={settings?.customerConfirmationRequired ?? false}
          disabled={!isAdmin}
        />
      </div>
      <BackendNote>
        AI orchestration, thresholds, and policy enforcement are owned by the backend.
      </BackendNote>
    </SettingsSection>
  );
}

function LocalizationTab({
  settings,
  isAdmin,
}: {
  settings: BusinessSettings | null;
  isAdmin: boolean;
}) {
  return (
    <SettingsSection
      scope="Level B"
      title="Localization"
      description="Display language and regional defaults."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <SettingsField label="Default language">
          <Select defaultValue={settings?.language ?? "en"} disabled={!isAdmin}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="tr">Turkish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
        </SettingsField>
        <SettingsField label="Time zone">
          <Select defaultValue={settings?.timezone ?? "auto"} disabled={!isAdmin}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-detect</SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="Europe/Istanbul">Europe / Istanbul</SelectItem>
              <SelectItem value="Europe/London">Europe / London</SelectItem>
              <SelectItem value="America/New_York">America / New York</SelectItem>
            </SelectContent>
          </Select>
        </SettingsField>
      </div>
    </SettingsSection>
  );
}

function ModuleTab({
  value,
  onChange,
  isAdmin,
}: {
  value: BusinessTypeId;
  onChange: (v: BusinessTypeId) => void;
  isAdmin: boolean;
}) {
  const bt = getBusinessType(value);
  return (
    <SettingsSection
      scope="Level B"
      title="Business type & module"
      description="Restaurant fields are an extension of a generic business model."
      action={
        <Select
          value={value}
          onValueChange={(v) => onChange(v as BusinessTypeId)}
          disabled={!isAdmin}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map((b) => (
              <SelectItem key={b.id} value={b.id} disabled={b.status === "preview"}>
                {b.label}
                {b.status === "preview" ? " · preview" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      {value === "restaurant" ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-md border bg-level-b/5 px-3 py-2 text-xs">
            <UtensilsCrossed className="h-4 w-4 text-level-b" />
            <span className="font-medium text-level-b">Restaurant module</span>
            <span className="text-muted-foreground">— optional extension fields.</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <SettingsField label="Menu source">
              <Select defaultValue="manual" disabled={!isAdmin}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual entry</SelectItem>
                  <SelectItem value="sheet">Spreadsheet</SelectItem>
                  <SelectItem value="pos">POS sync (later)</SelectItem>
                </SelectContent>
              </Select>
            </SettingsField>
            <SettingsField label="Reservations">
              <Select defaultValue="enabled" disabled={!isAdmin}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </SettingsField>
          </div>
          <SettingsField label="Menu / setup notes">
            <Textarea
              rows={3}
              placeholder="Notes for AI context — backend owns the source."
              disabled={!isAdmin}
            />
          </SettingsField>
        </div>
      ) : (
        <div className="rounded-md border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
          <AlertTriangle className="mx-auto mb-2 h-4 w-4" />
          Module fields for {bt.label} will appear here in a later phase. Core setup remains the
          same — only the type-specific section changes.
        </div>
      )}
    </SettingsSection>
  );
}

function ToggleRow({
  title,
  desc,
  defaultOn = false,
  disabled = false,
}: {
  title: string;
  desc: string;
  defaultOn?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border bg-card px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch defaultChecked={defaultOn} disabled={disabled} />
    </div>
  );
}
