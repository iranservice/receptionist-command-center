import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Clock,
  ImagePlus,
  Languages,
  MapPin,
  Rocket,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { businessTypes, type BusinessTypeId } from "@/lib/business-types";
import { demoTenants } from "@/lib/nav-config";

export const Route = createFileRoute("/app/$tenant/setup")({
  head: () => ({ meta: [{ title: "Business setup · Workspace" }] }),
  component: SetupWizard,
});

type StepId = "type" | "profile" | "hours" | "service" | "modules" | "review";

const steps: { id: StepId; label: string; hint: string }[] = [
  { id: "type", label: "Business type", hint: "Pick the closest match." },
  { id: "profile", label: "Business profile", hint: "Identity and contact." },
  { id: "hours", label: "Working hours", hint: "When you operate." },
  { id: "service", label: "Service area", hint: "Where you operate." },
  { id: "modules", label: "Type-specific", hint: "Optional extensions." },
  { id: "review", label: "Review", hint: "Confirm and finish." },
];

function SetupWizard() {
  const { tenant } = useParams({ from: "/app/$tenant/setup" });
  const t = demoTenants.find((x) => x.slug === tenant) ?? demoTenants[0];
  const [stepIdx, setStepIdx] = useState(0);
  const [type, setType] = useState<BusinessTypeId>("restaurant");
  const step = steps[stepIdx];
  const progress = useMemo(() => Math.round(((stepIdx + 1) / steps.length) * 100), [stepIdx]);

  const goNext = () => setStepIdx((i) => Math.min(i + 1, steps.length - 1));
  const goBack = () => setStepIdx((i) => Math.max(i - 1, 0));
  const isLast = stepIdx === steps.length - 1;

  return (
    <>
      <PageHeader
        title="Business setup"
        description="Guided onboarding for this tenant workspace. The frontend collects intent — backend persists and validates."
        meta={
          <>
            <Badge
              variant="secondary"
              className="h-5 border-0 bg-level-b/12 px-1.5 text-[10px] font-medium text-level-b"
            >
              Level B · {t.name}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Step {stepIdx + 1} of {steps.length} · {progress}%
            </span>
          </>
        }
        actions={
          <Button asChild size="sm" variant="outline">
            <Link to="/app/$tenant" params={{ tenant: t.slug }}>
              Skip for now
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 p-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Stepper */}
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <Card className="overflow-hidden p-0 shadow-xs">
            <div className="border-b px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Rocket className="h-3.5 w-3.5" /> Setup steps
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-level-b transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <ol className="p-2">
              {steps.map((s, i) => {
                const done = i < stepIdx;
                const active = i === stepIdx;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setStepIdx(i)}
                      className={[
                        "flex w-full items-start gap-3 rounded-md px-2.5 py-2 text-left transition-colors",
                        active
                          ? "bg-level-b/10 text-level-b"
                          : "text-foreground/85 hover:bg-muted",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                          done
                            ? "bg-success text-success-foreground"
                            : active
                              ? "bg-level-b text-level-b-foreground"
                              : "bg-muted text-muted-foreground",
                        ].join(" ")}
                      >
                        {done ? <Check className="h-3 w-3" /> : i + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium leading-tight">{s.label}</span>
                        <span className="block text-[11px] text-muted-foreground">{s.hint}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </Card>
        </aside>

        {/* Step content */}
        <div className="min-w-0 space-y-4">
          <Card className="p-6 shadow-xs">
            <div className="mb-5 flex items-center gap-2">
              <h2 className="font-display text-lg font-semibold">{step.label}</h2>
              <span className="text-sm text-muted-foreground">— {step.hint}</span>
            </div>

            {step.id === "type" && <StepType value={type} onChange={setType} />}
            {step.id === "profile" && <StepProfile defaultName={t.name} />}
            {step.id === "hours" && <StepHours />}
            {step.id === "service" && <StepService />}
            {step.id === "modules" && <StepModules type={type} />}
            {step.id === "review" && <StepReview tenantName={t.name} type={type} />}
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={goBack} disabled={stepIdx === 0} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {!isLast ? (
              <Button onClick={goNext} className="gap-1.5">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button asChild className="gap-1.5">
                <Link to="/app/$tenant" params={{ tenant: t.slug }}>
                  Finish setup <Check className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground">
            Submitted values are passed to the backend, which validates, persists, and returns the
            authoritative business record. The wizard does not enforce business rules itself.
          </p>
        </div>
      </div>
    </>
  );
}

function StepType({
  value,
  onChange,
}: {
  value: BusinessTypeId;
  onChange: (v: BusinessTypeId) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {businessTypes.map((bt) => {
        const Icon = bt.icon;
        const active = bt.id === value;
        const disabled = bt.status === "preview";
        return (
          <button
            key={bt.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(bt.id)}
            className={[
              "flex items-start gap-3 rounded-lg border p-4 text-left transition-all",
              active
                ? "border-level-b bg-level-b/5 ring-2 ring-level-b/30"
                : "hover:border-foreground/20 hover:bg-muted/40",
              disabled && "opacity-60",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span
              className={[
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                active ? "bg-level-b text-level-b-foreground" : "bg-muted text-foreground/70",
              ].join(" ")}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{bt.label}</span>
                {bt.status === "preview" && (
                  <Badge variant="outline" className="h-4 px-1.5 text-[10px] font-normal">
                    Preview
                  </Badge>
                )}
                {active && <Check className="ml-auto h-4 w-4 text-level-b" />}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{bt.tagline}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function StepProfile({ defaultName }: { defaultName: string }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed bg-muted/40 text-muted-foreground">
          <ImagePlus className="h-5 w-5" />
        </div>
        <div>
          <Button type="button" size="sm" variant="outline" className="gap-1.5">
            <ImagePlus className="h-3.5 w-3.5" /> Upload logo
          </Button>
          <p className="mt-1 text-[11px] text-muted-foreground">
            PNG / SVG · square recommended · stored by backend.
          </p>
        </div>
      </div>
      <Field label="Business name">
        <Input defaultValue={defaultName} placeholder="e.g. Bella Trattoria" />
      </Field>
      <Field label="Phone">
        <Input placeholder="+1 555 010 1234" />
      </Field>
      <Field label="Email">
        <Input type="email" placeholder="hello@business.com" />
      </Field>
      <Field label="Default display language" hint="Used for AI replies and operator UI.">
        <Select defaultValue="en">
          <SelectTrigger>
            <Languages className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="tr">Turkish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Address">
          <Textarea rows={2} placeholder="Street, city, postal code, country" />
        </Field>
      </div>
    </div>
  );
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function StepHours() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" /> Set operating hours per day. Off-hours route to the AI
        receptionist by default.
      </div>
      <div className="overflow-hidden rounded-md border">
        {days.map((d, i) => (
          <div
            key={d}
            className={[
              "grid grid-cols-[80px_minmax(0,1fr)_minmax(0,1fr)_80px] items-center gap-3 px-4 py-2.5 text-sm",
              i > 0 && "border-t",
              d === "Sun" && "bg-muted/30",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="font-medium">{d}</span>
            <Input type="time" defaultValue={d === "Sun" ? "" : "09:00"} disabled={d === "Sun"} />
            <Input type="time" defaultValue={d === "Sun" ? "" : "22:00"} disabled={d === "Sun"} />
            <label className="flex items-center gap-1.5 justify-end text-[11px] text-muted-foreground">
              <Checkbox defaultChecked={d === "Sun"} /> Closed
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepService() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Service mode">
          <Select defaultValue="hybrid">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="onsite">On-site only</SelectItem>
              <SelectItem value="delivery">Delivery / mobile only</SelectItem>
              <SelectItem value="hybrid">Both</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Radius (km)" hint="Used as a soft hint; backend defines real geometry.">
          <Input type="number" defaultValue={5} min={0} />
        </Field>
      </div>
      <Field label="Service area notes">
        <Textarea
          rows={3}
          placeholder="Postal codes, neighborhoods, or hand-drawn boundaries are stored by the backend."
        />
      </Field>
      <div className="flex items-center gap-3 rounded-md border border-dashed bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        <MapPin className="h-4 w-4 shrink-0" />
        Map editor will appear here in a later phase. Backend will own the canonical geometry.
      </div>
    </div>
  );
}

function StepModules({ type }: { type: BusinessTypeId }) {
  if (type === "restaurant") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-md border bg-level-b/5 px-3 py-2 text-xs">
          <UtensilsCrossed className="h-4 w-4 text-level-b" />
          <span className="font-medium text-level-b">Restaurant module</span>
          <span className="text-muted-foreground">
            — extension; not the entire product. Other types use their own modules.
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Menu source" hint="POS, sheet, or manual. Backend ingests and validates.">
            <Select defaultValue="manual">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual entry</SelectItem>
                <SelectItem value="sheet">Spreadsheet upload</SelectItem>
                <SelectItem value="pos">POS sync (later)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Reservations">
            <Select defaultValue="enabled">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Menu / setup notes">
          <Textarea
            rows={3}
            placeholder="Any quick notes for AI behavior — backend remains the source of truth."
          />
        </Field>
      </div>
    );
  }
  return (
    <div className="rounded-md border border-dashed bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
      <Sparkles className="mx-auto mb-2 h-5 w-5" />
      Type-specific modules for this business type are reserved.
      <br />
      They will appear here in a later phase without redesigning setup.
    </div>
  );
}

function StepReview({ tenantName, type }: { tenantName: string; type: BusinessTypeId }) {
  const bt = businessTypes.find((b) => b.id === type)!;
  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-level-b" />
          <span className="font-medium">{tenantName}</span>
          <Badge variant="outline" className="font-normal">
            {bt.label}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          On finish, the wizard hands off all collected fields to the backend, which creates or
          updates the business record and returns the authoritative state.
        </p>
      </div>
      <ul className="grid gap-2 text-sm sm:grid-cols-2">
        {[
          ["Type", bt.label],
          ["Modules", bt.modules.length ? bt.modules.join(", ") : "—"],
          ["Profile", "Submitted"],
          ["Hours", "Submitted"],
          ["Service area", "Submitted"],
          ["Language", "English (default)"],
        ].map(([k, v]) => (
          <li
            key={k}
            className="flex items-center justify-between rounded-md border bg-card px-3 py-2"
          >
            <span className="text-xs uppercase tracking-wider text-muted-foreground">{k}</span>
            <span className="font-medium">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
