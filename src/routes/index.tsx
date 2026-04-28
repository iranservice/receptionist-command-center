import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bot,
  Building2,
  Inbox,
  Shield,
  Sparkles,
  User,
  UserCog,
  ShieldCheck,
  Mic,
  Plug,
} from "lucide-react";
import { demoTenants } from "@/lib/nav-config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aura · AI Receptionist Platform" },
      {
        name: "description",
        content:
          "Multi-tenant B2B AI receptionist platform. Operate inbox, orders, and conversations across your business — restaurants today, more tomorrow.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const tenant = demoTenants[0];

  return (
    <div className="min-h-screen bg-background ops-surface">
      {/* Top bar */}
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-level-a text-level-a-foreground shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Aura</div>
              <div className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Platform Ops
              </div>
            </div>
            <Badge
              variant="outline"
              className="ml-2 hidden h-5 px-1.5 text-[10px] font-normal sm:inline-flex"
            >
              LV-1 · App shell
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link to="/platform">Platform</Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/app/$tenant/inbox" params={{ tenant: tenant.slug }}>
                Open Inbox <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Hero */}
        <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <Badge variant="outline" className="mb-4 gap-1.5 font-normal">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Operations dashboard · multi-tenant
            </Badge>
            <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
              The operations workspace for your{" "}
              <span className="text-primary">AI receptionist</span>.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground">
              An inbox-first, role-aware platform with a clean separation between platform
              operations and tenant workspaces. Restaurant-shaped today, ready for clinics, salons,
              supermarkets, and more.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Button asChild size="lg" className="gap-2">
                <Link to="/app/$tenant/inbox" params={{ tenant: tenant.slug }}>
                  <Inbox className="h-4 w-4" /> Open the Inbox
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2 border-level-a/30 text-level-a hover:bg-level-a/10 hover:text-level-a"
              >
                <Link to="/platform">
                  <Shield className="h-4 w-4" /> Enter Platform
                </Link>
              </Button>
            </div>
            <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-success" /> Backend = source of truth
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mic className="h-3.5 w-3.5" /> Voice-ready
              </span>
            </div>
          </div>

          {/* Mock dashboard preview */}
          <DashboardPreview />
        </section>

        {/* Two workspaces */}
        <section className="mt-16">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Two workspaces, one platform
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Platform operations and tenant operations stay clearly separated — by color, by
                route, by intent.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <WorkspaceCard
              level="A"
              icon={Shield}
              title="Aura Platform"
              subtitle="Level A · Super Admin"
              desc="Tenants, plans & subscriptions, internal sales, platform support, system & integrations."
              cta={{ to: "/platform", label: "Enter Platform" }}
              chips={["Tenants", "Plans", "Sales", "Support", "System"]}
            />
            <WorkspaceCard
              level="B"
              icon={Building2}
              title="Tenant Workspace"
              subtitle="Level B · Business Admin & Operator"
              desc="Inbox, approvals, tickets, customers, orders, reservations, members, integrations, analytics."
              chips={demoTenants.map((t) => t.name)}
              cta={{ to: `/app/${tenant.slug}`, label: `Enter ${tenant.name}` }}
            />
          </div>
        </section>

        {/* Three roles */}
        <section className="mt-14">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Three role-shaped experiences
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Switch demo roles inside any workspace — the sidebar reshapes to match. Backend remains
            source of truth.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <RoleCard
              icon={Shield}
              title="Super Admin"
              level="Level A"
              tone="a"
              desc="Runs the platform. Tenants, plans, sales, support, system."
              to="/platform"
            />
            <RoleCard
              icon={UserCog}
              title="Business Admin"
              level="Level B"
              tone="b"
              desc="Owns a tenant workspace. Inbox + full settings, members, integrations, analytics."
              to={`/app/${tenant.slug}`}
            />
            <RoleCard
              icon={User}
              title="Operator"
              level="Level B"
              tone="b"
              desc="Lives in the inbox. Conversations, approvals, tickets, customers, orders."
              to={`/app/${tenant.slug}/inbox`}
              highlight
            />
          </div>
        </section>

        {/* Principles */}
        <section className="mt-14 grid gap-3 md:grid-cols-3">
          <Principle
            icon={Inbox}
            title="Inbox-first"
            desc="The most prominent nav item. AI vs Operator vs Waiting vs Approval — all visually distinct."
          />
          <Principle
            icon={ShieldCheck}
            title="Backend is truth"
            desc="UI never invents permissions, business rules, or available actions."
          />
          <Principle
            icon={Plug}
            title="Tenant-owned payments"
            desc="Tenant payments use the tenant's own gateway. Never the platform's."
          />
        </section>
      </main>

      <footer className="mt-16 border-t bg-card/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 text-xs text-muted-foreground">
          <span>LV-1 · App shell, navigation, information architecture</span>
          <span className="inline-flex items-center gap-1.5">
            <Bot className="h-3 w-3" /> Aura Ops
          </span>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function WorkspaceCard({
  level,
  icon: Icon,
  title,
  subtitle,
  desc,
  chips,
  cta,
}: {
  level: "A" | "B";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  desc: string;
  chips: string[];
  cta: { to: string; label: string };
}) {
  const tone =
    level === "A"
      ? {
          bar: "bg-level-a",
          chip: "bg-level-a/12 text-level-a",
          btn: "bg-level-a hover:bg-level-a/90 text-level-a-foreground",
        }
      : {
          bar: "bg-level-b",
          chip: "bg-level-b/12 text-level-b",
          btn: "bg-level-b hover:bg-level-b/90 text-level-b-foreground",
        };

  return (
    <Card className="relative overflow-hidden p-0 shadow-sm transition-shadow hover:shadow-md">
      <div className={`absolute inset-x-0 top-0 h-1 ${tone.bar}`} />
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone.chip}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold">{title}</div>
            <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              {subtitle}
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{desc}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span
              key={c}
              className={`inline-flex h-6 items-center rounded-md px-2 text-[11px] font-medium ${tone.chip}`}
            >
              {c}
            </span>
          ))}
        </div>
        <Button asChild className={`mt-5 gap-1.5 ${tone.btn}`}>
          <Link to={cta.to}>
            {cta.label} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

function RoleCard({
  icon: Icon,
  title,
  level,
  tone,
  desc,
  to,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  level: "Level A" | "Level B";
  tone: "a" | "b";
  desc: string;
  to: string;
  highlight?: boolean;
}) {
  const chip = tone === "a" ? "bg-level-a/12 text-level-a" : "bg-level-b/12 text-level-b";
  return (
    <Card
      className={`p-5 shadow-xs transition-all hover:shadow-md ${highlight ? "ring-1 ring-primary/30" : ""}`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`flex h-9 w-9 items-center justify-center rounded-md ${chip}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{level}</div>
        </div>
        {highlight && (
          <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px] font-normal">
            Primary
          </Badge>
        )}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{desc}</p>
      <Button asChild size="sm" variant="ghost" className="mt-3 -ml-2 gap-1 text-foreground/80">
        <Link to={to}>
          Enter <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </Card>
  );
}

function Principle({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Card className="p-5 shadow-xs">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </Card>
  );
}

function DashboardPreview() {
  return (
    <Card className="overflow-hidden p-0 shadow-lg">
      <div className="flex items-center gap-1.5 border-b bg-muted/40 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-warn/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/80" />
        <span className="ml-3 text-[11px] text-muted-foreground tabular-nums">
          aura.ops / bella-trattoria / inbox
        </span>
      </div>
      <div className="grid grid-cols-[80px_1fr] bg-background">
        {/* Mini sidebar */}
        <div className="border-r bg-sidebar p-2">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-level-b text-[10px] font-semibold text-level-b-foreground">
            BT
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`mb-1 h-6 rounded-md ${i === 2 ? "bg-level-b/15" : "bg-muted/50"}`}
            />
          ))}
        </div>
        {/* Content */}
        <div className="p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="h-1 w-12 rounded-full bg-level-b" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-level-b">
              Workspace · Inbox
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { l: "Open", v: "24", c: "bg-primary/10 text-primary" },
              { l: "AI", v: "11", c: "bg-ai/15 text-ai" },
              { l: "Approval", v: "2", c: "bg-warn/30 text-warn-foreground" },
            ].map((s) => (
              <div key={s.l} className="rounded-md border bg-card p-2">
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  {s.l}
                </div>
                <div
                  className={`mt-0.5 inline-flex items-center rounded px-1 text-sm font-semibold tabular-nums ${s.c}`}
                >
                  {s.v}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 space-y-1">
            {[
              { name: "Marco R.", state: "AI", cls: "bg-ai/15 text-ai" },
              { name: "Lena F.", state: "OP", cls: "bg-operator/25 text-operator-foreground" },
              { name: "+44 7700…", state: "APR", cls: "bg-warn/30 text-warn-foreground" },
            ].map((r) => (
              <div key={r.name} className="flex items-center gap-2 rounded-md border bg-card p-1.5">
                <div className="h-5 w-5 rounded-full bg-muted" />
                <div className="text-[11px] font-medium">{r.name}</div>
                <span className={`ml-auto rounded px-1 text-[9px] font-semibold ${r.cls}`}>
                  {r.state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
