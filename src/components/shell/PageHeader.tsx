import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b bg-card/50 px-6 py-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Placeholder({
  title,
  scope,
  notes,
  contract,
}: {
  title: string;
  scope: "Level A" | "Level B";
  notes: string[];
  contract?: string;
}) {
  return (
    <div className="px-6 py-6">
      <Card className="border-dashed p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-muted p-2 text-muted-foreground">
            <Info className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-lg font-semibold">{title}</h2>
              <Badge
                className={
                  scope === "Level A"
                    ? "bg-level-a text-level-a-foreground hover:bg-level-a"
                    : "bg-level-b text-level-b-foreground hover:bg-level-b"
                }
              >
                {scope}
              </Badge>
              <Badge variant="outline" className="font-normal">Structure only — built in later phase</Badge>
            </div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            {contract && (
              <p className="mt-3 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Backend contract: </span>
                {contract}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
