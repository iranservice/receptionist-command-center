// Phase IV-B — Conversation action mutation RPCs.
// Wraps operator reply, assignment, transfer, unassign, and release-to-AI.
// Uses existing rpc() client from ./client.ts — never creates a second Supabase client.
// Does NOT wire: persist_ai_reply, persist_ai_handoff, log_ai_blocked, collect_ai_context.
// Does NOT wire: create_order, confirm_order, cancel_order, request_customer_confirmation.

import { rpc, type RpcResult } from "./client";

// ── Response Types ──────────────────────────────────────────

export interface OperatorReplyResult {
  message_id: string;
  conversation_id: string;
  delivery_status: "queued";
}

export interface AssignmentResult {
  conversation_id: string;
  assigned_to: string;
  status: string;
  event_type: string;
}

export interface UnassignResult {
  conversation_id: string;
  status: "open";
  event_type: "unassigned";
}

export interface TransferResult {
  conversation_id: string;
  assigned_to: string;
  status: "assigned";
  event_type: "transferred";
}

export interface ReleaseToAIResult {
  conversation_id: string;
  status: "open";
  ai_enabled: true;
  event_type: "released_to_ai";
}

/** Backend error payload shape for all mutation RPCs. */
export interface ActionError {
  error: string;
  message?: string;
}

// ── Type Guards ─────────────────────────────────────────────

export function isActionError(data: unknown): data is ActionError {
  return (
    data !== null &&
    typeof data === "object" &&
    "error" in (data as Record<string, unknown>) &&
    typeof (data as ActionError).error === "string"
  );
}

// ── Error Message Map ───────────────────────────────────────

const errorMessages: Record<string, string> = {
  CONVERSATION_NOT_FOUND: "Conversation not found.",
  CONVERSATION_CLOSED: "This conversation is closed.",
  PERMISSION_DENIED: "You do not have permission to perform this action.",
  NOT_ASSIGNED_TO_YOU: "You must be assigned to this conversation before replying.",
  NOT_ASSIGNED: "This conversation is not assigned.",
  INVALID_OPERATOR: "Selected operator is not valid for this business.",
  AI_NOT_ALLOWED: "AI cannot take over this conversation based on current policy.",
  ACCESS_DENIED: "Access denied.",
};

/** Map a backend error code to a user-friendly message. */
export function getActionErrorMessage(errorCode: string): string {
  return errorMessages[errorCode] ?? "An unexpected error occurred. Please try again.";
}

// ── RPC Wrappers ────────────────────────────────────────────

/**
 * Send an operator reply to a conversation.
 * Backend: operator_reply(p_conversation_id, p_content, p_content_type)
 */
export async function sendOperatorReply(
  conversationId: string,
  content: string,
  contentType: "text" = "text",
): Promise<RpcResult<OperatorReplyResult | ActionError>> {
  return rpc<OperatorReplyResult | ActionError>("operator_reply", {
    p_conversation_id: conversationId,
    p_content: content,
    p_content_type: contentType,
  });
}

/**
 * Assign a conversation to an operator.
 * Backend: assign_conversation(p_conversation_id, p_operator_id)
 */
export async function assignConversation(
  conversationId: string,
  operatorId: string,
): Promise<RpcResult<AssignmentResult | ActionError>> {
  return rpc<AssignmentResult | ActionError>("assign_conversation", {
    p_conversation_id: conversationId,
    p_operator_id: operatorId,
  });
}

/**
 * Unassign a conversation (release from current operator).
 * Backend: unassign_conversation(p_conversation_id)
 */
export async function unassignConversation(
  conversationId: string,
): Promise<RpcResult<UnassignResult | ActionError>> {
  return rpc<UnassignResult | ActionError>("unassign_conversation", {
    p_conversation_id: conversationId,
  });
}

/**
 * Transfer a conversation to another operator.
 * Backend: transfer_conversation(p_conversation_id, p_to_operator_id, p_reason)
 */
export async function transferConversation(
  conversationId: string,
  toOperatorId: string,
  reason?: string,
): Promise<RpcResult<TransferResult | ActionError>> {
  const params: Record<string, unknown> = {
    p_conversation_id: conversationId,
    p_to_operator_id: toOperatorId,
  };
  if (reason) {
    params.p_reason = reason;
  }
  return rpc<TransferResult | ActionError>("transfer_conversation", params);
}

/**
 * Release a conversation back to AI control.
 * Backend: release_to_ai(p_conversation_id)
 */
export async function releaseConversationToAI(
  conversationId: string,
): Promise<RpcResult<ReleaseToAIResult | ActionError>> {
  return rpc<ReleaseToAIResult | ActionError>("release_to_ai", {
    p_conversation_id: conversationId,
  });
}
