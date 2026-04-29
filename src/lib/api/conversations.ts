// Phase III-B — Conversation Detail API.
// Wraps get_conversation_detail() RPC.
// Frontend types aligned with SQL JSONB response from 00022 (final version).

import { rpc } from "./client";

// ── Frontend types (aligned with backend JSONB response) ─────

export interface ConversationMeta {
  id: string;
  business_id: string;
  status: string;
  channel_type: string;
  channel_id: string | null;
  assigned_to: string | null;
  assigned_at: string | null;
  ai_enabled: boolean;
  subject: string | null;
  metadata: Record<string, unknown>;
  message_count: number;
  last_message_at: string | null;
  created_at: string;
  resolved_at: string | null;
  closed_at: string | null;
}

export interface ConversationCustomer {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  metadata: Record<string, unknown>;
}

export interface ConversationMessage {
  id: string;
  direction: "inbound" | "outbound";
  sender_type: "customer" | "operator" | "ai" | "system";
  sender_id: string | null;
  content_type: string;
  content: string | null;
  content_metadata: Record<string, unknown>;
  is_internal: boolean;
  external_message_id: string | null;
  delivery_status: string | null;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
}

export interface ConversationOrderSummary {
  id: string;
  order_number: string;
  status: string;
  order_type: string;
  total: number | null;
  item_count: number;
  source: string;
  created_at: string;
  available_actions: string[];
}

export interface ConversationDetailResponse {
  conversation: ConversationMeta;
  customer: ConversationCustomer;
  messages: ConversationMessage[];
  message_total: number;
  orders: ConversationOrderSummary[];
}

/** Error shape returned by get_conversation_detail on failure */
export interface ConversationDetailError {
  error: string;
}

// ── API functions ───────────────────────────────────────────

/**
 * Fetch conversation detail.
 * Backend returns JSONB with { conversation, customer, messages[], message_total, orders[] }.
 * On error returns { error: "ACCESS_DENIED" | "CONVERSATION_NOT_FOUND" }.
 */
export async function fetchConversationDetail(
  conversationId: string,
  options?: {
    messageLimit?: number;
    messageOffset?: number;
  },
) {
  const params: Record<string, unknown> = {
    p_conversation_id: conversationId,
  };

  if (options?.messageLimit !== undefined) {
    params.p_message_limit = options.messageLimit;
  }
  if (options?.messageOffset !== undefined) {
    params.p_message_offset = options.messageOffset;
  }

  return rpc<ConversationDetailResponse | ConversationDetailError>(
    "get_conversation_detail",
    params,
  );
}

/**
 * Type guard: check if conversation detail response is an error.
 */
export function isDetailError(
  data: ConversationDetailResponse | ConversationDetailError | null,
): data is ConversationDetailError {
  return data !== null && "error" in data && !("conversation" in data);
}
