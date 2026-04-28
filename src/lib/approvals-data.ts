// LV-5 demo data for Approvals.
// Mirrors what backend would return; UI never invents permission/decision truth.

import type { Severity } from "./op-states";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired" | "cancelled";

export type ApprovalType =
  | "ai_sensitive_action"
  | "operator_order_cancellation"
  | "ai_refund_escalation"
  | "customer_address_change"
  | "high_value_order"
  | "manual_handoff_escalation";

export type ApprovalAction = "approve" | "reject" | "view_context";

export type ApprovalRelated = {
  conversationId?: string;
  orderId?: string;
  customerName?: string;
};

export type Approval = {
  id: string;
  type: ApprovalType;
  status: ApprovalStatus;
  severity: Severity;
  title: string;
  reason: string;
  requestedByName: string;
  requestedByRole: "AI" | "Operator" | "System";
  requestedAtLabel: string;
  expiresInLabel?: string;
  related: ApprovalRelated;
  // Backend-provided action keys; UI just renders.
  availableActions: ApprovalAction[];
  // Optional context lines to show in detail drawer.
  context?: { label: string; value: string }[];
  // Audit placeholder events
  audit?: { at: string; actor: string; event: string }[];
  // Resolution shown when not pending.
  resolution?: {
    by: string;
    atLabel: string;
    note?: string;
  };
};

export const APPROVAL_TYPE_LABEL: Record<ApprovalType, string> = {
  ai_sensitive_action: "AI · Sensitive action",
  operator_order_cancellation: "Operator · Order cancellation",
  ai_refund_escalation: "AI · Refund escalation",
  customer_address_change: "Customer · Address change",
  high_value_order: "High-value order",
  manual_handoff_escalation: "Manual handoff · Supervisor review",
};

export const demoApprovals: Approval[] = [
  {
    id: "APV-1042",
    type: "high_value_order",
    status: "pending",
    severity: "high",
    title: "Order €310.00 needs manager approval",
    reason: "Order total exceeds tenant policy threshold of €250.",
    requestedByName: "AI Receptionist",
    requestedByRole: "AI",
    requestedAtLabel: "4 min ago",
    expiresInLabel: "Expires in 56 min",
    related: {
      conversationId: "CV-8821",
      orderId: "ORD-2049",
      customerName: "Marta Russo",
    },
    availableActions: ["approve", "reject", "view_context"],
    context: [
      { label: "Order total", value: "€310.00" },
      { label: "Items", value: "12" },
      { label: "Channel", value: "WhatsApp" },
      { label: "Policy", value: "auto_approve_under_eur_250" },
    ],
    audit: [
      { at: "12:04", actor: "AI", event: "Approval requested (rule: high_value_order)" },
      { at: "12:04", actor: "System", event: "Routed to: managers" },
    ],
  },
  {
    id: "APV-1041",
    type: "operator_order_cancellation",
    status: "pending",
    severity: "medium",
    title: "Cancel confirmed order ORD-2044",
    reason: "Operator requested cancellation of an already-confirmed order.",
    requestedByName: "Sara Conti",
    requestedByRole: "Operator",
    requestedAtLabel: "11 min ago",
    expiresInLabel: "Expires in 3h 49m",
    related: {
      conversationId: "CV-8814",
      orderId: "ORD-2044",
      customerName: "Luca Bianchi",
    },
    availableActions: ["approve", "reject", "view_context"],
    context: [
      { label: "Order status", value: "confirmed" },
      { label: "Reason", value: "Customer no-show" },
      { label: "Refund implied", value: "No (paid offline)" },
    ],
    audit: [
      { at: "11:57", actor: "Sara Conti", event: "Submitted cancellation request" },
    ],
  },
  {
    id: "APV-1040",
    type: "ai_refund_escalation",
    status: "pending",
    severity: "critical",
    title: "Refund €84.00 — escalation",
    reason: "AI detected refund request outside auto-handle policy.",
    requestedByName: "AI Receptionist",
    requestedByRole: "AI",
    requestedAtLabel: "23 min ago",
    expiresInLabel: "Expires in 37 min",
    related: {
      conversationId: "CV-8809",
      orderId: "ORD-2031",
      customerName: "Hannah Weber",
    },
    availableActions: ["approve", "reject", "view_context"],
    context: [
      { label: "Refund amount", value: "€84.00" },
      { label: "Reason given", value: "Item missing on delivery" },
      { label: "Policy", value: "manual_review_over_eur_50" },
    ],
  },
  {
    id: "APV-1039",
    type: "customer_address_change",
    status: "pending",
    severity: "low",
    title: "Address change on confirmed order",
    reason: "Customer asked to change delivery address after confirmation.",
    requestedByName: "AI Receptionist",
    requestedByRole: "AI",
    requestedAtLabel: "38 min ago",
    related: {
      conversationId: "CV-8801",
      orderId: "ORD-2028",
      customerName: "Pedro Alves",
    },
    availableActions: ["approve", "reject", "view_context"],
    context: [
      { label: "From", value: "Via Roma 14" },
      { label: "To", value: "Corso Italia 88, Apt 3" },
      { label: "Distance change", value: "+1.2 km" },
    ],
  },
  {
    id: "APV-1038",
    type: "manual_handoff_escalation",
    status: "pending",
    severity: "medium",
    title: "Supervisor review for repeated handoff",
    reason: "Conversation handed off 3 times in 20 min — supervisor input needed.",
    requestedByName: "System",
    requestedByRole: "System",
    requestedAtLabel: "1 h ago",
    related: {
      conversationId: "CV-8788",
      customerName: "Anna Müller",
    },
    availableActions: ["approve", "reject", "view_context"],
    context: [
      { label: "Handoffs in window", value: "3" },
      { label: "Last operator", value: "Marco Greco" },
    ],
  },
  {
    id: "APV-1036",
    type: "ai_sensitive_action",
    status: "approved",
    severity: "high",
    title: "AI may share invoice PDF",
    reason: "AI requested permission to send tax invoice to customer email.",
    requestedByName: "AI Receptionist",
    requestedByRole: "AI",
    requestedAtLabel: "Yesterday · 18:12",
    related: {
      conversationId: "CV-8702",
      customerName: "Giulia Romano",
    },
    availableActions: ["view_context"],
    resolution: { by: "Sara Conti", atLabel: "Yesterday · 18:14", note: "Approved — invoice sent." },
  },
  {
    id: "APV-1035",
    type: "high_value_order",
    status: "rejected",
    severity: "high",
    title: "Order €420.00 — bulk catering",
    reason: "Operator rejected: requires deposit per catering policy.",
    requestedByName: "AI Receptionist",
    requestedByRole: "AI",
    requestedAtLabel: "Yesterday · 14:31",
    related: {
      conversationId: "CV-8688",
      orderId: "ORD-2010",
      customerName: "Office Plaza Ltd.",
    },
    availableActions: ["view_context"],
    resolution: {
      by: "Marco Greco",
      atLabel: "Yesterday · 14:36",
      note: "Rejected — asked customer to use catering form.",
    },
  },
  {
    id: "APV-1031",
    type: "ai_refund_escalation",
    status: "expired",
    severity: "medium",
    title: "Refund €18.00 — auto-expired",
    reason: "No reviewer acted within 1h SLA window.",
    requestedByName: "AI Receptionist",
    requestedByRole: "AI",
    requestedAtLabel: "2 days ago",
    related: {
      conversationId: "CV-8612",
      orderId: "ORD-1988",
      customerName: "Ralf Becker",
    },
    availableActions: ["view_context"],
    resolution: { by: "System", atLabel: "2 days ago", note: "Expired — reverted to AI policy." },
  },
  {
    id: "APV-1029",
    type: "operator_order_cancellation",
    status: "cancelled",
    severity: "low",
    title: "Cancellation withdrawn",
    reason: "Operator withdrew cancellation request before review.",
    requestedByName: "Marco Greco",
    requestedByRole: "Operator",
    requestedAtLabel: "3 days ago",
    related: {
      conversationId: "CV-8590",
      orderId: "ORD-1972",
      customerName: "Elena Sorrentino",
    },
    availableActions: ["view_context"],
    resolution: { by: "Marco Greco", atLabel: "3 days ago", note: "Withdrew before review." },
  },
];

export function approvalToOpState(s: ApprovalStatus) {
  return s; // ApprovalStatus is a subset of OpState keys
}
