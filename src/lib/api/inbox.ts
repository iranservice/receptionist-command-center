// Phase III-B — Inbox API.
// Wraps get_inbox_list() RPC.
// Frontend types aligned with SQL JSONB response from 00019.

import { rpc } from "./client";

// ── Frontend types (aligned with backend JSONB response) ─────

export interface InboxCustomer {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
}

export interface InboxLastMessage {
  id: string;
  content: string | null;
  content_type: string;
  sender_type: "customer" | "operator" | "ai" | "system";
  direction: "inbound" | "outbound";
  created_at: string;
}

export interface InboxConversation {
  id: string;
  business_id: string;
  status: string;
  channel_type: string;
  assigned_to: string | null;
  ai_enabled: boolean;
  message_count: number;
  last_message_at: string | null;
  created_at: string;
  customer: InboxCustomer;
  last_message: InboxLastMessage | null;
  unread_count: number;
}

export interface InboxListResponse {
  conversations: InboxConversation[];
  total: number;
}

// ── API functions ───────────────────────────────────────────

/**
 * Fetch inbox list for a business.
 * Backend returns JSONB with { conversations[], total }.
 */
export async function fetchInboxList(
  businessId: string,
  options?: {
    statusFilter?: string[];
    limit?: number;
    offset?: number;
  },
) {
  const params: Record<string, unknown> = {
    p_business_id: businessId,
  };

  if (options?.statusFilter && options.statusFilter.length > 0) {
    params.p_status_filter = options.statusFilter;
  }
  if (options?.limit !== undefined) {
    params.p_limit = options.limit;
  }
  if (options?.offset !== undefined) {
    params.p_offset = options.offset;
  }

  return rpc<InboxListResponse>("get_inbox_list", params);
}
