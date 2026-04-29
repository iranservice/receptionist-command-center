// Phase II-B — Tenant Settings wired to backend RPCs.
// Loads business profile from get_business_profile().
// Saves via update_business_profile().
// Falls back to demo data when Supabase is not configured.

import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
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
  Loader2,
} from "lucide-react";
import { demoTenants } from "@/lib/nav-config";
import { businessTypes, getBusinessType, type BusinessTypeId } from "@/lib/business-types";
import { useAuth } from "@/lib/auth";
import { useWorkspace } from "@/lib/workspace";
import {
  fetchBusinessProfile,
  updateBusinessProfile,
  type BusinessProfileRow,
} from "@/lib/api/business-settings";
import { classifyError } from "@/lib/api/client";
import { LoadingState, ErrorState, DeniedState } from "@/components/state/UIState";
import { toast } from "sonner";

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

function TenantSettings() {
  const { tenant } = useParams({ from: "/app/$tenant/settings" });
  const { isDemoMode } = useAuth();
  const { businessId, role } = useWorkspace();
  const t = demoTenants.find((x) => x.slug === tenant) ?? demoTenants[0];

  const [active, setActive] = useState<TabId>("profile");
  const [businessType, setBusinessType] = useState<BusinessTypeId>("restaurant");

  // ── Backend data state ──────────────────────────────────
  const [profile, setProfile] = useState<BusinessProfileRow | null>(null);
  const [loading, setLoading] = useState(!isDemoMode);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Form state (initialized from profile) ──────────────
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTimezone, setFormTimezone] = useState("auto");
  const [formLanguage, setFormLanguage] = useState("en");
  const [formAddress, setFormAddress] = useState("");

  // ── Load profile ───────────────────────────────────────
  const loadProfile = useCallback(async () => {
    if (isDemoMode || !businessId) return;
    setLoading(true);
    setError(null);

    const result = await fetchBusinessProfile(businessId);
    if (result.error) {
      const cat = classifyError(result.error);
      if (cat === "access_denied") {
        setError("ACCESS_DENIED");
      } else {
        setError(result.error);
      }
      setLoading(false);
      return;
    }

    const rows = result.data;
    if (rows && rows.length > 0) {
      const p = rows[0];
      setProfile(p);
      // Initialize form state from loaded profile
      setFormName(p.name ?? "");
      setFormPhone(p.phone ?? "");
      setFormEmail(p.email ?? "");
      setFormTimezone(p.timezone ?? "auto");
      setFormLanguage(p.default_language ?? "en");
      setFormAddress((p.business_config?.address as string) ?? "");
      if (p.business_type) {
        const knownType = businessTypes.find((bt) => bt.id === p.business_type);
        if (knownType) setBusinessType(knownType.id);
      }
    }
    setLoading(false);
  }, [isDemoMode, businessId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ── Save handler ───────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (isDemoMode) {
      toast.success("Demo mode — changes are not persisted.");
      return;
    }
    if (!businessId) return;

    setSaving(true);
    const result = await updateBusinessProfile({
      p_business_id: businessId,
      p_name: formName || undefined,
      p_phone: formPhone || undefined,
      p_email: formEmail || undefined,
      p_timezone: formTimezone !== "auto" ? formTimezone : undefined,
      p_default_language: formLanguage || undefined,
      p_business_config: formAddress ? { address: formAddress } : undefined,
    });

    setSaving(false);

    if (result.error) {
      const cat = classifyError(result.error);
      if (cat === "access_denied") {
        toast.error("Permission denied. Only owners and managers can update settings.");
      } else {
        toast.error(`Failed to save: ${result.error}`);
      }
      return;
    }

    toast.success("Settings saved successfully.");
    // Reload profile to get fresh data
    loadProfile();
  }, [
    isDemoMode,
    businessId,
    formName,
    formPhone,
    formEmail,
    formTimezone,
    formLanguage,
    formAddress,
    loadProfile,
  ]);

  // ── Access denied ──────────────────────────────────────
  if (error === "ACCESS_DENIED") {
    return (
      <>
        <PageHeader title="Settings" description="Workspace settings" />
        <div className="p-6">
          <DeniedState
            title="Access denied"
            description="You don't have permission to view business settings. Contact a workspace admin."
          />
        </div>
      </>
    );
  }

  // ── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <PageHeader title="Settings" description="Loading workspace settings…" />
        <div className="p-6">
          <LoadingState
            title="Loading settings…"
            description="Fetching business profile from backend."
          />
        </div>
      </>
    );
  }

  // ── Error ──────────────────────────────────────────────
  if (error) {
    return (
      <>
        <PageHeader title="Settings" description="Workspace settings" />
        <div className="p-6">
          <ErrorState title="Failed to load settings" description={error} onRetry={loadProfile} />
        </div>
      </>
    );
  }

  // ── Derive display values ─────────────────────────────
  const displayName = profile?.name ?? t.name;
  const bt = getBusinessType(businessType);
  const isAdmin = role === "business_admin" || role === "super_admin";

  return (
    <>
      <PageHeader
        title="Settings"
        description={
          isDemoMode
            ? "Demo mode — Settings shown with sample data. Connect Supabase to persist."
            : "Workspace settings for this tenant business. Backend is the source of truth."
        }
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
            {isDemoMode && (
              <Badge variant="outline" className="border-warn/40 text-warn-foreground">
                Demo
              </Badge>
            )}
          </>
        }
        actions={
          <>
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link to="/app/$tenant/setup" params={{ tenant }}>
                <Rocket className="h-3.5 w-3.5" /> Re-run setup
              </Link>
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={handleSave}
              disabled={saving || !isAdmin}
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saving ? "Saving…" : "Save changes"}
            </Button>
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
          {active === "profile" && (
            <ProfileTab
              name={formName}
              phone={formPhone}
              email={formEmail}
              address={formAddress}
              onNameChange={setFormName}
              onPhoneChange={setFormPhone}
              onEmailChange={setFormEmail}
              onAddressChange={setFormAddress}
              readOnly={!isAdmin}
            />
          )}
          {active === "hours" && <HoursTab />}
          {active === "service" && <ServiceTab />}
          {active === "ai" && <AITab />}
          {active === "localization" && (
            <LocalizationTab
              language={formLanguage}
              timezone={formTimezone}
              onLanguageChange={setFormLanguage}
              onTimezoneChange={setFormTimezone}
              readOnly={!isAdmin}
            />
          )}
          {active === "module" && <ModuleTab value={businessType} onChange={setBusinessType} />}
        </div>
      </div>
    </>
  );
}

function ProfileTab({
  name,
  phone,
  email,
  address,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  onAddressChange,
  readOnly,
}: {
  name: string;
  phone: string;
  email: string;
  address: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onAddressChange: (v: string) => void;
  readOnly: boolean;
}) {
  return (
    <SettingsSection
      scope="Level B"
      title="Business profile"
      description="Identity and contact for this tenant business."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <SettingsField label="Business name">
          <Input value={name} onChange={(e) => onNameChange(e.target.value)} disabled={readOnly} />
        </SettingsField>
        <SettingsField label="Public phone">
          <Input
            placeholder="+1 555 010 1234"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            disabled={readOnly}
          />
        </SettingsField>
        <SettingsField label="Public email">
          <Input
            type="email"
            placeholder="hello@business.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={readOnly}
          />
        </SettingsField>
        <SettingsField label="Logo">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed bg-muted/40 text-muted-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <Button type="button" size="sm" variant="outline" disabled={readOnly}>
              Upload
            </Button>
          </div>
        </SettingsField>
        <div className="sm:col-span-2">
          <SettingsField label="Address">
            <Textarea
              rows={2}
              placeholder="Street, city, postal code, country"
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              disabled={readOnly}
            />
          </SettingsField>
        </div>
      </div>
      <BackendNote>Profile persistence and validation occur server-side.</BackendNote>
    </SettingsSection>
  );
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function HoursTab() {
  return (
    <SettingsSection
      scope="Level B"
      title="Working hours"
      description="Off-hours can route to the AI receptionist automatically."
    >
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
            <Input type="time" defaultValue="09:00" disabled={d === "Sun"} />
            <Input type="time" defaultValue="22:00" disabled={d === "Sun"} />
            <label className="flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
              <Checkbox defaultChecked={d === "Sun"} /> Closed
            </label>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}

function ServiceTab() {
  return (
    <SettingsSection
      scope="Level B"
      title="Service / delivery area"
      description="Where this business operates. Geometry is owned by the backend."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <SettingsField label="Mode">
          <Select defaultValue="hybrid">
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
          <Input type="number" defaultValue={5} min={0} />
        </SettingsField>
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-md border border-dashed bg-muted/30 px-4 py-6 text-xs text-muted-foreground">
        <MapPin className="h-4 w-4 shrink-0" />
        Map editor placeholder — backend owns canonical service area geometry.
      </div>
    </SettingsSection>
  );
}

function AITab() {
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
          defaultOn
        />
        <ToggleRow
          title="Auto-handoff to operator on low confidence"
          desc="Threshold and triggers configured server-side."
          defaultOn
        />
        <ToggleRow
          title="Require operator approval for outbound orders"
          desc="Approval-vs-confirmation truth lives in the backend."
        />
      </div>
      <BackendNote>
        AI orchestration, thresholds, and policy enforcement are owned by the backend.
      </BackendNote>
    </SettingsSection>
  );
}

function LocalizationTab({
  language,
  timezone,
  onLanguageChange,
  onTimezoneChange,
  readOnly,
}: {
  language: string;
  timezone: string;
  onLanguageChange: (v: string) => void;
  onTimezoneChange: (v: string) => void;
  readOnly: boolean;
}) {
  return (
    <SettingsSection
      scope="Level B"
      title="Localization"
      description="Display language and regional defaults."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <SettingsField label="Default language">
          <Select value={language} onValueChange={onLanguageChange} disabled={readOnly}>
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
          <Select value={timezone} onValueChange={onTimezoneChange} disabled={readOnly}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-detect</SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="Europe/Istanbul">Europe / Istanbul</SelectItem>
              <SelectItem value="America/New_York">America / New York</SelectItem>
              <SelectItem value="Asia/Tehran">Asia / Tehran</SelectItem>
              <SelectItem value="Asia/Dubai">Asia / Dubai</SelectItem>
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
}: {
  value: BusinessTypeId;
  onChange: (v: BusinessTypeId) => void;
}) {
  const bt = getBusinessType(value);
  return (
    <SettingsSection
      scope="Level B"
      title="Business type & module"
      description="Restaurant fields are an extension of a generic business model."
      action={
        <Select value={value} onValueChange={(v) => onChange(v as BusinessTypeId)}>
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
              <Select defaultValue="manual">
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
              <Select defaultValue="enabled">
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
            <Textarea rows={3} placeholder="Notes for AI context — backend owns the source." />
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
}: {
  title: string;
  desc: string;
  defaultOn?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border bg-card px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch defaultChecked={defaultOn} />
    </div>
  );
}
