import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Lock, Loader2, Paperclip, Send, StickyNote, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReplyComposer({
  replyAllowed,
  reason,
  ownerLabel,
  onSendReply,
  sending,
}: {
  replyAllowed: boolean;
  reason?: string;
  ownerLabel: string;
  /** Called when operator submits a reply. Returns true on success (clears composer). */
  onSendReply?: (content: string) => Promise<boolean>;
  /** True while a reply is being sent. */
  sending?: boolean;
}) {
  const [mode, setMode] = useState<"reply" | "note">("reply");
  const [value, setValue] = useState("");

  if (!replyAllowed) {
    return (
      <div className="border-t bg-muted/40 px-6 py-4">
        <div className="flex items-start gap-3 rounded-md border border-dashed bg-card px-4 py-3">
          <Lock className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Reply not available</p>
            <p className="text-muted-foreground">
              {reason ?? "Backend currently disallows operator reply on this conversation."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if (!value.trim() || mode !== "reply" || !onSendReply) return;
    const ok = await onSendReply(value.trim());
    if (ok) setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && value.trim() && mode === "reply") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-card">
      <div className="flex items-center justify-between border-b px-6 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode("reply")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              mode === "reply"
                ? "bg-operator/20 text-operator-foreground"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            Reply as operator
          </button>
          <button
            onClick={() => setMode("note")}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              mode === "note"
                ? "bg-warn/30 text-warn-foreground"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            <StickyNote className="h-3 w-3" /> Internal note
          </button>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Sending as <span className="font-medium text-foreground">{ownerLabel}</span>
        </span>
      </div>

      <div
        className={cn(
          "px-6 py-3",
          mode === "note" && "[background:color-mix(in_oklab,var(--warn)_8%,var(--card))]",
        )}
      >
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          placeholder={
            mode === "reply"
              ? "Type a reply to the customer…"
              : "Type an internal note (only visible to your team)"
          }
          className="min-h-[72px] resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
              <Paperclip className="h-3.5 w-3.5" /> Attach
            </Button>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
              <Sparkles className="h-3.5 w-3.5" /> Suggest reply
            </Button>
          </div>
          <Button
            size="sm"
            className="h-8 gap-1.5"
            disabled={!value.trim() || sending || mode !== "reply"}
            onClick={handleSend}
          >
            {sending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {mode === "reply" ? (sending ? "Sending…" : "Send reply") : "Save note"}
          </Button>
        </div>
      </div>
    </div>
  );
}
