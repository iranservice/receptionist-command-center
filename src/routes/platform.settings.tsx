import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/shell/PageHeader";
import { SettingsSection, SettingsField, BackendNote } from "@/components/settings/SettingsLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, ImagePlus, Save, Sparkles } from "lucide-react";

export const Route = createFileRoute("/platform/settings")({
  head: () => ({ meta: [{ title: "Platform Settings · Aura" }] }),
  component: PlatformSettings,
});

const tabs = [
  { id: "global", label: "Global config" },
  { id: "branding", label: "Branding" },
  { id: "policies", label: "Default policies" },
  { id: "flags", label: "Feature flags" },
] as const;
type TabId = (typeof tabs)[number]["id"];

function PlatformSettings() {
  const [active, setActive] = useState<TabId>("global");

  return (
    <>
      <PageHeader
        title="Platform Settings"
        description="Global policies, branding, and platform-level configuration. These are platform-internal — they never apply to tenant business operations."
        meta={
          <Badge
            variant="secondary"
            className="h-5 border-0 bg-level-a/12 px-1.5 text-[10px] font-medium text-level-a"
          >
            Level A · Platform
          </Badge>
        }
        actions={
          <Button size="sm" className="gap-1.5">
            <Save className="h-3.5 w-3.5" /> Save changes
          </Button>
        }
      />

      <div className="grid gap-6 p-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <Card className="overflow-hidden p-1 shadow-xs">
            <nav className="flex flex-col">
              {tabs.map((tab) => {
                const isActive = tab.id === active;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActive(tab.id)}
                    className={[
                      "rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "bg-level-a/10 font-medium text-level-a"
                        : "text-foreground/85 hover:bg-muted",
                    ].join(" ")}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </aside>

        <div className="min-w-0 space-y-5">
          {active === "global" && (
            <SettingsSection
              scope="Level A"
              title="Global configuration"
              description="Defaults applied across all tenants unless overridden by backend policy."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <SettingsField label="Platform name">
                  <Input defaultValue="Aura Platform" />
                </SettingsField>
                <SettingsField label="Support email">
                  <Input type="email" defaultValue="support@aura.example" />
                </SettingsField>
                <SettingsField label="Default tenant region">
                  <Select defaultValue="eu">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eu">Europe</SelectItem>
                      <SelectItem value="us">North America</SelectItem>
                      <SelectItem value="me">Middle East</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsField>
                <SettingsField label="Data retention (days)">
                  <Input type="number" defaultValue={90} />
                </SettingsField>
              </div>
            </SettingsSection>
          )}

          {active === "branding" && (
            <SettingsSection
              scope="Level A"
              title="Platform branding"
              description="Branding for platform surfaces — not tenant-facing customer touchpoints."
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-level-a text-level-a-foreground">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <Button type="button" size="sm" variant="outline" className="gap-1.5">
                    <ImagePlus className="h-3.5 w-3.5" /> Replace logo
                  </Button>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Used in Super Admin panels and platform emails.
                  </p>
                </div>
              </div>
            </SettingsSection>
          )}

          {active === "policies" && (
            <SettingsSection
              scope="Level A"
              title="Default policies"
              description="Defaults the backend may apply when a tenant doesn't override them."
            >
              <div className="space-y-3">
                <PolicyRow
                  title="Tenant isolation enforcement"
                  desc="Hard-locked. Backend always isolates tenant data."
                  fixed
                />
                <PolicyRow
                  title="Operator approval required for outbound orders by default"
                  desc="Tenants can opt out unless overridden by platform policy."
                  defaultOn
                />
                <PolicyRow
                  title="Allow tenants to manage their own integration credentials"
                  desc="Subject to platform plan and security review."
                  defaultOn
                />
              </div>
              <BackendNote>
                The frontend lists defaults; the server is the only authority on enforcement.
              </BackendNote>
            </SettingsSection>
          )}

          {active === "flags" && (
            <SettingsSection
              scope="Level A"
              title="Feature flags"
              description="Roll out platform features by environment or cohort."
            >
              <div className="space-y-3">
                {[
                  ["Voice channel (preview)", false],
                  ["Cross-workspace search", false],
                  ["AI fine-tuning console", false],
                ].map(([label, on]) => (
                  <PolicyRow key={label as string} title={label as string} defaultOn={on as boolean} />
                ))}
              </div>
            </SettingsSection>
          )}
        </div>
      </div>
    </>
  );
}

function PolicyRow({
  title,
  desc,
  defaultOn = false,
  fixed = false,
}: {
  title: string;
  desc?: string;
  defaultOn?: boolean;
  fixed?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border bg-card px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-level-a" />
          <p className="text-sm font-medium">{title}</p>
          {fixed && (
            <Badge variant="outline" className="h-4 px-1.5 text-[10px] font-normal">
              Enforced
            </Badge>
          )}
        </div>
        {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
      </div>
      <Switch defaultChecked={defaultOn} disabled={fixed} />
    </div>
  );
}
