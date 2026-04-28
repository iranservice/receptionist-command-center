import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PageHeader,
  StatCard,
  SectionHeader,
  PlaceholderArea,
} from "@/components/shell/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Receipt,
  HeadphonesIcon,
  Megaphone,
  Server,
  ArrowRight,
  Activity,
} from "lucide-react";

export const Route = createFileRoute("/platform/")({
  component: PlatformDashboard,
});

function PlatformDashboard() {
  return (
    <>
      <PageHeader
        title="Platform overview"
        description="Cross-tenant health and growth signals. Aggregates only — no tenant PII surfaced here."
        meta={
          <>
            <Badge variant="outline" className="gap-1 font-normal">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> All systems normal
            </Badge>
            <Badge variant="outline" className="font-normal">
              Region: EU-West
            </Badge>
          </>
        }
        actions={
          <Button
            asChild
            size="sm"
            variant="default"
            className="gap-1.5 bg-level-a text-level-a-foreground hover:bg-level-a/90"
          >
            <Link to="/platform/tenants">
              <Building2 className="h-4 w-4" /> Manage tenants
            </Link>
          </Button>
        }
      />

      <div className="space-y-8 p-6">
        <section>
          <SectionHeader title="This week" description="Aggregated platform metrics." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Active tenants"
              value="38"
              delta="+2"
              trend="up"
              icon={Building2}
              hint="vs. last week"
            />
            <StatCard
              label="Conversations"
              value="14.2k"
              delta="+11%"
              trend="up"
              icon={Activity}
              tone="ai"
            />
            <StatCard
              label="MRR"
              value="€18.4k"
              delta="+4.6%"
              trend="up"
              icon={Receipt}
              tone="success"
            />
            <StatCard
              label="Open support"
              value="6"
              delta="-3"
              trend="down"
              icon={HeadphonesIcon}
              tone="warn"
            />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-sm font-semibold">Tenant activity</h3>
                <p className="text-xs text-muted-foreground">Top 6 by 7-day conversation volume</p>
              </div>
              <Badge variant="outline" className="font-normal">
                Aggregated
              </Badge>
            </div>
            <ul className="mt-4 divide-y">
              {[
                { name: "Bella Trattoria", type: "Restaurant", vol: "1.8k", trend: "+12%" },
                { name: "Harbor Grill", type: "Restaurant", vol: "1.4k", trend: "+8%" },
                { name: "Olive & Vine", type: "Restaurant", vol: "1.1k", trend: "+3%" },
                { name: "Sunrise Clinic", type: "Clinic (preview)", vol: "640", trend: "+22%" },
                { name: "Northside Salon", type: "Salon (preview)", vol: "420", trend: "+5%" },
                { name: "Corner Market", type: "Supermarket (preview)", vol: "310", trend: "-2%" },
              ].map((row) => (
                <li key={row.name} className="flex items-center gap-3 py-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-level-a/10 text-[11px] font-semibold text-level-a">
                    {row.name
                      .split(" ")
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{row.name}</div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {row.type}
                    </div>
                  </div>
                  <div className="text-sm font-medium tabular-nums">{row.vol}</div>
                  <Badge
                    variant="outline"
                    className={`font-normal ${row.trend.startsWith("-") ? "text-destructive" : "text-success"}`}
                  >
                    {row.trend}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 shadow-xs">
            <h3 className="font-display text-sm font-semibold">Operations queue</h3>
            <p className="text-xs text-muted-foreground">Things needing platform attention</p>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                { label: "Tenant onboarding", count: 3, to: "/platform/tenants" as const },
                { label: "Open support", count: 6, to: "/platform/support" as const },
                { label: "Billing review", count: 1, to: "/platform/plans" as const },
                { label: "Sales replies", count: 4, to: "/platform/sales" as const },
              ].map((row) => (
                <li key={row.label}>
                  <Link
                    to={row.to}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 -mx-2 hover:bg-accent"
                  >
                    <span>{row.label}</span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-foreground">
                        {row.count}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section>
          <SectionHeader
            title="Platform areas"
            description="Each area will fill in across upcoming phases."
          />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <PlaceholderArea
              icon={Receipt}
              scope="Level A"
              title="Plans & subscriptions"
              notes={["Plan catalog and tenant subscription status."]}
              contract="Distinct from tenant→customer payments — those use the tenant's own gateway."
            />
            <PlaceholderArea
              icon={Megaphone}
              scope="Level A"
              title="Internal sales"
              notes={["Pipeline, leads, demos, conversions."]}
            />
            <PlaceholderArea
              icon={HeadphonesIcon}
              scope="Level A"
              title="Platform support"
              notes={["Tickets opened by tenant admins."]}
            />
            <PlaceholderArea
              icon={Server}
              scope="Level A"
              title="System & integrations"
              notes={["AI providers, telephony, base channels — platform-managed."]}
            />
            <PlaceholderArea
              icon={Building2}
              scope="Level A"
              title="Tenants"
              notes={["Directory, type, plan, status; future provisioning."]}
            />
          </div>
        </section>
      </div>
    </>
  );
}
