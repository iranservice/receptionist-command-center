import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Building2, HeadphonesIcon, Inbox, Shield, User, UserCog } from "lucide-react";
import { demoTenants } from "@/lib/nav-config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Receptionist · Workspace" },
      { name: "description", content: "Multi-tenant B2B AI receptionist platform. Operate inbox, orders, and conversations across your business." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const tenant = demoTenants[0];
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-semibold">AI Receptionist</span>
            <Badge variant="outline" className="ml-2 font-normal text-xs">LV-1 · App Shell</Badge>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/app/$tenant/inbox" params={{ tenant: tenant.slug }}>
              Open Inbox <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="max-w-3xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            App shell, navigation, and information architecture.
          </h1>
          <p className="mt-3 text-muted-foreground">
            A multi-tenant B2B AI receptionist platform. Two clearly separated levels, three role-shaped experiences, an
            inbox-first operational workspace, and a structure ready for more business types beyond restaurants.
          </p>
        </section>

        {/* Levels */}
        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <Card className="overflow-hidden border-l-4" style={{ borderLeftColor: "var(--level-a)" }}>
            <div className="p-5">
              <div className="flex items-center gap-2">
                <Badge className="bg-level-a text-level-a-foreground hover:bg-level-a"><Shield className="mr-1 h-3 w-3" />Level A</Badge>
                <span className="text-sm font-medium">Platform</span>
              </div>
              <h2 className="mt-3 font-display text-lg font-semibold">Our own business operations</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tenants, plans & subscriptions, internal sales, platform support, platform analytics, system & integrations,
                platform members and settings.
              </p>
              <Button asChild className="mt-4" variant="default">
                <Link to="/platform">Enter Platform <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          </Card>

          <Card className="overflow-hidden border-l-4" style={{ borderLeftColor: "var(--level-b)" }}>
            <div className="p-5">
              <div className="flex items-center gap-2">
                <Badge className="bg-level-b text-level-b-foreground hover:bg-level-b"><Building2 className="mr-1 h-3 w-3" />Level B</Badge>
                <span className="text-sm font-medium">Tenant Workspace</span>
              </div>
              <h2 className="mt-3 font-display text-lg font-semibold">Each customer business</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Inbox, approvals, tickets & callbacks, customers, orders, reservations, members, integrations, analytics,
                and tenant settings. Restaurant-shaped today, ready for clinics, salons, and more.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {demoTenants.map((t) => (
                  <Button key={t.slug} asChild size="sm" variant="outline">
                    <Link to="/app/$tenant/inbox" params={{ tenant: t.slug }}>{t.name}</Link>
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* Roles */}
        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold">Three role-shaped experiences</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the role switcher in the top bar inside each workspace. UI only — backend is the source of truth for permissions.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <RoleCard
              icon={Shield}
              title="Super Admin"
              level="Level A"
              desc="Runs the platform. Tenants, plans, sales, support, system."
              to="/platform"
            />
            <RoleCard
              icon={UserCog}
              title="Business Admin"
              level="Level B"
              desc="Owns a tenant workspace. Inbox + full settings, members, integrations, analytics."
              to={`/app/${tenant.slug}`}
            />
            <RoleCard
              icon={User}
              title="Operator"
              level="Level B"
              desc="Lives in the inbox. Handles conversations, approvals, tickets, customers, orders."
              to={`/app/${tenant.slug}/inbox`}
              highlight
            />
          </div>
        </section>

        {/* Principles */}
        <section className="mt-10 grid gap-3 md:grid-cols-3">
          <Principle icon={Inbox} title="Inbox-first" desc="The most prominent nav item. AI-active vs operator-active states are visually distinct." />
          <Principle icon={Shield} title="Backend is truth" desc="UI never invents permissions, business rules, or available actions." />
          <Principle icon={HeadphonesIcon} title="Voice-ready, not voice-built" desc="Navigation and state model leave room for voice without redesign." />
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-muted-foreground">
          LV-1 deliverable · App shell, navigation, information architecture.
        </div>
      </footer>
    </div>
  );
}

function RoleCard({
  icon: Icon,
  title,
  level,
  desc,
  to,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  level: "Level A" | "Level B";
  desc: string;
  to: string;
  highlight?: boolean;
}) {
  return (
    <Card className={`p-4 ${highlight ? "ring-2 ring-primary/40" : ""}`}>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{level}</div>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{desc}</p>
      <Button asChild size="sm" variant="ghost" className="mt-3 -ml-2">
        <a href={to}>Enter <ArrowRight className="ml-1 h-3.5 w-3.5" /></a>
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
    <Card className="p-4">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="mt-2 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </Card>
  );
}
