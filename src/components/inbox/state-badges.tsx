import {
  Bot,
  User,
  Clock,
  CircleAlert,
  CheckCircle2,
  ArrowRightLeft,
  MessageSquare,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import type { Channel, ConversationStatus, OwnerType, SenderType } from "@/lib/inbox-data";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: {
  status: ConversationStatus;
  className?: string;
}) {
  const map: Record<ConversationStatus, { cls: string; icon: typeof Bot; label: string }> = {
    ai_active: { cls: "bg-ai/12 text-ai border-ai/30", icon: Bot, label: "AI active" },
    operator_active: {
      cls: "bg-operator/25 text-operator-foreground border-operator/40",
      icon: User,
      label: "Operator",
    },
    needs_handoff: {
      cls: "bg-warn/30 text-warn-foreground border-warn/50",
      icon: ArrowRightLeft,
      label: "Needs handoff",
    },
    waiting_customer: {
      cls: "bg-muted text-muted-foreground border-border",
      icon: Clock,
      label: "Waiting",
    },
    pending_confirmation: {
      cls: "bg-warn/25 text-warn-foreground border-warn/40",
      icon: CircleAlert,
      label: "Pending confirm",
    },
    closed: {
      cls: "bg-muted/60 text-muted-foreground border-border",
      icon: CheckCircle2,
      label: "Closed",
    },
  };
  const { cls, icon: Icon, label } = map[status];
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-md border px-1.5 text-[10px] font-medium uppercase tracking-wider",
        cls,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export function OwnerBadge({ owner }: { owner: OwnerType }) {
  if (owner === "ai")
    return (
      <span className="inline-flex h-5 items-center gap-1 rounded-md border border-ai/30 bg-ai/12 px-1.5 text-[10px] font-medium uppercase tracking-wider text-ai">
        <Bot className="h-3 w-3" /> AI
      </span>
    );
  if (owner === "operator")
    return (
      <span className="inline-flex h-5 items-center gap-1 rounded-md border border-operator/40 bg-operator/25 px-1.5 text-[10px] font-medium uppercase tracking-wider text-operator-foreground">
        <User className="h-3 w-3" /> Operator
      </span>
    );
  return (
    <span className="inline-flex h-5 items-center gap-1 rounded-md border border-border bg-muted px-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      Unassigned
    </span>
  );
}

const channelIconMap = {
  whatsapp: MessageSquare,
  sms: Phone,
  email: Mail,
  web: Globe,
} as const;

const channelLabel: Record<Channel, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
  web: "Web",
};

export function ChannelBadge({ channel, withLabel }: { channel: Channel; withLabel?: boolean }) {
  const Icon = channelIconMap[channel];
  const tone =
    channel === "whatsapp"
      ? "bg-success/15 text-success border-success/25"
      : channel === "sms"
        ? "bg-chart-3/15 text-foreground border-border"
        : channel === "email"
          ? "bg-chart-2/15 text-foreground border-border"
          : "bg-primary/10 text-primary border-primary/20";
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-md border px-1.5 text-[10px] font-medium",
        tone,
      )}
    >
      <Icon className="h-3 w-3" />
      {withLabel && channelLabel[channel]}
    </span>
  );
}

export function SenderTag({ sender }: { sender: SenderType }) {
  const map = {
    customer: "Customer",
    operator: "Operator",
    ai: "AI",
    system: "System",
  } as const;
  const cls =
    sender === "ai"
      ? "text-ai"
      : sender === "operator"
        ? "text-operator-foreground"
        : sender === "system"
          ? "text-muted-foreground"
          : "text-foreground";
  return (
    <span className={cn("text-[10px] font-semibold uppercase tracking-wider", cls)}>
      {map[sender]}
    </span>
  );
}
