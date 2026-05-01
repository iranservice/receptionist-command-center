// Phase V-B — Order action mutation RPCs.
// Wraps confirm_order, cancel_order, request_customer_confirmation,
// and get_order_confirmation_payload.
// Uses existing rpc() client from ./client.ts — never creates a second Supabase client.
// Does NOT wire: create_order, execute_create_order_action, edit_order.

import { rpc, type RpcResult } from "./client";

// ── Response Types ──────────────────────────────────────────

/** Backend response for status transition RPCs (confirm_order, cancel_order). */
export interface OrderTransitionResult {
  order_id: string;
  from_status: string;
  to_status: string;
}

/** Backend response for get_order_confirmation_payload. */
export interface OrderConfirmationPayload {
  order: {
    id: string;
    order_number: string;
    status: string;
    order_type: string;
    total: number | null;
    subtotal: number | null;
    notes: string | null;
    delivery_address: string | null;
    created_at: string;
  };
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number | null;
    total_price: number | null;
    notes: string | null;
  }>;
  available_actions: string[];
  suggested_confirmation_text: string | null;
}

/** Backend error payload shape (shared with conversation-actions). */
export interface OrderActionError {
  error: string;
  message?: string;
}

// ── Type Guards ─────────────────────────────────────────────

export function isOrderActionError(data: unknown): data is OrderActionError {
  return (
    data !== null &&
    typeof data === "object" &&
    "error" in (data as Record<string, unknown>) &&
    typeof (data as OrderActionError).error === "string"
  );
}

// ── Error Message Map ───────────────────────────────────────

const orderErrorMessages: Record<string, string> = {
  ORDER_NOT_FOUND: "Order not found.",
  PERMISSION_DENIED: "You do not have permission to update this order.",
  ACCESS_DENIED: "Access denied.",
  INVALID_TRANSITION: "This order cannot move to that status.",
  INVALID_STATUS: "This order is not in the correct status for this action.",
  MISSING_REQUIRED_FIELDS: "This order is missing required fields.",
  CONVERSATION_NOT_FOUND: "Conversation not found.",
  CUSTOMER_NOT_FOUND: "Customer not found.",
};

/** Map a backend order error code to a user-friendly message. */
export function getOrderErrorMessage(errorCode: string): string {
  return orderErrorMessages[errorCode] ?? "An unexpected order error occurred. Please try again.";
}

// ── RPC Wrappers ────────────────────────────────────────────

/**
 * Fetch the full order confirmation payload (items, totals, suggested text).
 * Backend: get_order_confirmation_payload(p_order_id)
 */
export async function fetchOrderConfirmationPayload(
  orderId: string,
): Promise<RpcResult<OrderConfirmationPayload | OrderActionError>> {
  return rpc<OrderConfirmationPayload | OrderActionError>("get_order_confirmation_payload", {
    p_order_id: orderId,
  });
}

/**
 * Request customer confirmation for an order (draft → pending_confirmation).
 * Backend: request_customer_confirmation(p_order_id)
 */
export async function requestCustomerConfirmation(
  orderId: string,
): Promise<RpcResult<OrderConfirmationPayload | OrderActionError>> {
  return rpc<OrderConfirmationPayload | OrderActionError>("request_customer_confirmation", {
    p_order_id: orderId,
  });
}

/**
 * Confirm an order (operator-initiated).
 * Backend: confirm_order(p_order_id)
 */
export async function confirmOrder(
  orderId: string,
): Promise<RpcResult<OrderTransitionResult | OrderActionError>> {
  return rpc<OrderTransitionResult | OrderActionError>("confirm_order", {
    p_order_id: orderId,
  });
}

/**
 * Cancel an order with an optional reason.
 * Backend: cancel_order(p_order_id, p_reason)
 */
export async function cancelOrder(
  orderId: string,
  reason?: string,
): Promise<RpcResult<OrderTransitionResult | OrderActionError>> {
  const params: Record<string, unknown> = {
    p_order_id: orderId,
  };
  if (reason) {
    params.p_reason = reason;
  }
  return rpc<OrderTransitionResult | OrderActionError>("cancel_order", params);
}
