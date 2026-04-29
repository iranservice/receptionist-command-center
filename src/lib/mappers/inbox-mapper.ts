// Phase III-B — Backend → Demo type mapper.
// Converts backend JSONB inbox/detail responses to the existing
// Conversation / Message / Customer / LinkedOrder types used by
// LV-3/LV-4 components (MessageTimeline, CustomerPanel, OrderPanel).
//
// This preserves all existing UI components without modification.

import type { InboxConversation } from "../api/inbox";
import type {
  ConversationDetailResponse,
  ConversationMessage as BackendMessage,
  ConversationOrderSummary,
} from "../api/conversations";
import type {
  Conversation,
  Channel,
  ConversationStatus,
  OwnerType,
  Message,
  SenderType,
  LinkedOrder,
  OrderStatus,
  OrderAction,
  Customer,
} from "../inbox-data";

// ── Inbox List → Conversation (list-level) ──────────────────

/** Map backend channel_type to demo Channel type */
function mapChannel(channelType: string): Channel {
  const map: Record<string, Channel> = {
    whatsapp: "whatsapp",
    web: "web",
    sms: "sms",
    email: "email",
    telegram: "web", // fallback
    instagram: "web", // fallback
  };
  return map[channelType] ?? "web";
}

/** Derive frontend ConversationStatus from backend fields */
function mapConversationStatus(
  status: string,
  aiEnabled: boolean,
  assignedTo: string | null,
): ConversationStatus {
  switch (status) {
    case "closed":
      return "closed";
    case "resolved":
      return "closed";
    case "waiting":
      return "waiting_customer";
    case "assigned":
      return assignedTo ? "operator_active" : "ai_active";
    case "open":
      return aiEnabled ? "ai_active" : "needs_handoff";
    default:
      return "ai_active";
  }
}

/** Derive frontend OwnerType from backend fields */
function mapOwner(assignedTo: string | null, aiEnabled: boolean): OwnerType {
  if (assignedTo) return "operator";
  if (aiEnabled) return "ai";
  return "unassigned";
}

/** Format relative timestamp for list display */
function formatRelativeTime(isoDate: string | null): string {
  if (!isoDate) return "";
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "now";
    if (diffMin < 60) return `${diffMin}m`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD}d`;
  } catch {
    return "";
  }
}

/** Build a customer identity label from backend fields */
function buildIdentityLabel(
  phone: string | null,
  email: string | null,
  channelType: string,
): string {
  const parts: string[] = [];
  if (phone) parts.push(phone);
  if (email) parts.push(email);
  const channelLabel = channelType.charAt(0).toUpperCase() + channelType.slice(1);
  if (parts.length > 0) return `${parts[0]} · ${channelLabel}`;
  return channelLabel;
}

/**
 * Map a backend InboxConversation (list item) to the demo Conversation type.
 * Only populates list-level fields; messages/orders will be empty.
 */
export function mapInboxItemToConversation(item: InboxConversation): Conversation {
  const frontendStatus = mapConversationStatus(item.status, item.ai_enabled, item.assigned_to);
  const owner = mapOwner(item.assigned_to, item.ai_enabled);

  return {
    id: item.id,
    customer: {
      name: item.customer.name ?? item.customer.phone ?? "Unknown",
      identityLabel: buildIdentityLabel(
        item.customer.phone,
        item.customer.email,
        item.channel_type,
      ),
    },
    channel: mapChannel(item.channel_type),
    status: frontendStatus,
    owner,
    assignedTo: item.assigned_to ? { name: "Assigned operator" } : undefined,
    unread: item.unread_count,
    lastMessagePreview: item.last_message?.content ?? "No messages yet",
    lastMessageAt: formatRelativeTime(item.last_message_at),
    messages: [], // Populated when detail is loaded
    replyAllowed: frontendStatus !== "closed",
    replyDisallowedReason:
      frontendStatus === "closed" ? "Conversation closed. Reopen to continue." : undefined,
  };
}

// ── Conversation Detail → Full Conversation ─────────────────

/** Map backend message to demo Message type */
function mapMessage(msg: BackendMessage): Message {
  const sender: SenderType = msg.sender_type;

  // Derive systemKind from content_type and content
  let systemKind: Message["systemKind"] | undefined;
  if (sender === "system" && msg.content_type === "system_event") {
    const content = (msg.content ?? "").toLowerCase();
    if (content.includes("handoff") || content.includes("handed off"))
      systemKind = "handoff_to_operator";
    else if (content.includes("released to ai") || content.includes("release"))
      systemKind = "released_to_ai";
    else if (content.includes("assigned")) systemKind = "assigned";
    else if (content.includes("order") && content.includes("created")) systemKind = "order_created";
    else if (content.includes("confirmation") && content.includes("requested"))
      systemKind = "confirmation_requested";
    else if (content.includes("confirmed")) systemKind = "order_confirmed";
    else if (content.includes("cancelled") || content.includes("canceled"))
      systemKind = "order_cancelled";
    else systemKind = "channel_event";
  }

  return {
    id: msg.id,
    sender,
    body: msg.content ?? (msg.content_type !== "text" ? `[${msg.content_type}]` : ""),
    at: msg.created_at,
    systemKind,
    // AI metadata not available in message response — left undefined
  };
}

/** Map backend order summary to demo LinkedOrder */
function mapOrder(order: ConversationOrderSummary): LinkedOrder {
  const statusMap: Record<string, OrderStatus> = {
    draft: "draft",
    pending_customer_confirmation: "pending_customer_confirmation",
    confirmed: "confirmed",
    cancelled: "cancelled",
  };

  const actionMap: Record<string, OrderAction> = {
    view: "view_order",
    request_confirmation: "request_customer_confirmation",
    confirm: "confirm_order",
    cancel: "cancel_order",
    edit: "edit_order",
  };

  return {
    id: order.id,
    orderNumber: order.order_number ?? `#${order.id.slice(0, 6)}`,
    status: statusMap[order.status] ?? "draft",
    channel: "delivery", // Default — backend doesn't expose fulfilment channel
    createdAtLabel: new Date(order.created_at).toLocaleDateString(),
    items: [{ qty: order.item_count, name: `${order.item_count} item(s)` }],
    totalLabel: order.total != null ? `€ ${Number(order.total).toFixed(2)}` : "—",
    customerConfirmation: {
      status: order.status === "pending_customer_confirmation" ? "requested" : "not_required",
    },
    availableActions: (order.available_actions ?? []).map(
      (a) => actionMap[a] ?? ("view_order" as OrderAction),
    ),
  };
}

/**
 * Map a full backend conversation detail response to the demo Conversation type.
 * Replaces messages and orders on a list-level Conversation stub.
 */
export function mapDetailToConversation(
  detail: ConversationDetailResponse,
  existingListItem?: Conversation,
): Conversation {
  const conv = detail.conversation;
  const cust = detail.customer;
  const frontendStatus = mapConversationStatus(conv.status, conv.ai_enabled, conv.assigned_to);
  const owner = mapOwner(conv.assigned_to, conv.ai_enabled);

  const customer: Customer = {
    name: cust.name ?? cust.phone ?? "Unknown",
    identityLabel: buildIdentityLabel(cust.phone, cust.email, conv.channel_type),
    language: (cust.metadata?.preferred_language as string) ?? undefined,
    tags: Array.isArray(cust.metadata?.tags) ? (cust.metadata.tags as string[]) : undefined,
    addressLabel: (cust.metadata?.address as string) ?? undefined,
  };

  const orders = (detail.orders ?? []).map(mapOrder);

  return {
    id: conv.id,
    customer,
    channel: mapChannel(conv.channel_type),
    status: frontendStatus,
    owner,
    assignedTo: conv.assigned_to ? { name: "Assigned operator" } : undefined,
    unread: existingListItem?.unread ?? 0,
    lastMessagePreview:
      existingListItem?.lastMessagePreview ??
      detail.messages[detail.messages.length - 1]?.content ??
      "",
    lastMessageAt: existingListItem?.lastMessageAt ?? formatRelativeTime(conv.last_message_at),
    messages: detail.messages.map(mapMessage),
    order: orders[0],
    orders,
    replyAllowed: frontendStatus !== "closed",
    replyDisallowedReason:
      frontendStatus === "closed" ? "Conversation closed. Reopen to continue." : undefined,
  };
}
