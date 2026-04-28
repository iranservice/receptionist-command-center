import { Bot, User, ArrowRightLeft, ShoppingBag, BadgeCheck, Radio, UserCheck } from "lucide-react";
import type { Message } from "@/lib/inbox-data";
import { SenderTag } from "./state-badges";
import { cn } from "@/lib/utils";

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

const systemIcon = {
  handoff_to_operator: ArrowRightLeft,
  released_to_ai: Bot,
  assigned: UserCheck,
  order_created: ShoppingBag,
  confirmation_requested: BadgeCheck,
  channel_event: Radio,
} as const;

export function MessageTimeline({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-col gap-3 px-6 py-5">
      {messages.map((m) => {
        if (m.sender === "system") {
          const Icon = m.systemKind ? systemIcon[m.systemKind] : Radio;
          return (
            <div key={m.id} className="my-1 flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/60 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                <Icon className="h-3 w-3" />
                {m.body}
                <span className="text-[10px] tabular-nums opacity-70">· {formatTime(m.at)}</span>
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
          );
        }

        const isOutbound = m.sender === "operator" || m.sender === "ai";
        const isAI = m.sender === "ai";
        const isOperator = m.sender === "operator";

        return (
          <div
            key={m.id}
            className={cn("flex gap-2.5", isOutbound ? "justify-end" : "justify-start")}
          >
            {!isOutbound && (
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground">
                {(m.authorName || "C").slice(0, 1)}
              </div>
            )}
            <div className={cn("max-w-[75%]", isOutbound ? "items-end" : "items-start")}>
              <div className="mb-1 flex items-center gap-1.5">
                <SenderTag sender={m.sender} />
                {m.authorName && (
                  <span className="text-[11px] text-muted-foreground">· {m.authorName}</span>
                )}
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  · {formatTime(m.at)}
                </span>
              </div>
              <div
                className={cn(
                  "rounded-2xl border px-3.5 py-2 text-sm shadow-xs",
                  isAI &&
                    "border-ai/25 bg-ai/8 text-foreground rounded-tr-sm [background:color-mix(in_oklab,var(--ai)_8%,var(--card))]",
                  isOperator &&
                    "border-operator/40 bg-operator/15 text-operator-foreground rounded-tr-sm",
                  !isOutbound && "border-border bg-card text-foreground rounded-tl-sm",
                )}
              >
                {m.body}
              </div>
              {isAI && (m.aiConfidence || m.aiPolicy) && (
                <div className="mt-1 flex flex-wrap items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
                  {m.aiConfidence && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-ai/25 bg-ai/8 px-1.5 py-0.5 font-medium uppercase tracking-wider text-ai">
                      Confidence · {m.aiConfidence}
                    </span>
                  )}
                  {m.aiPolicy && <span>Policy: {m.aiPolicy}</span>}
                </div>
              )}
            </div>
            {isOutbound && (
              <div
                className={cn(
                  "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                  isAI ? "bg-ai/15 text-ai" : "bg-operator/25 text-operator-foreground",
                )}
              >
                {isAI ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
