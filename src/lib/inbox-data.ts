// Demo data for LV-3 Inbox + LV-4 Order Panel.
// NOTE: All states (ownership, AI/handoff, order, available actions, customer
// confirmation) are presentational mirrors of backend state. Frontend never
// invents truth — it renders what the backend exposes.

export type Channel = "whatsapp" | "sms" | "email" | "web";

export type ConversationStatus =
  | "ai_active"
  | "operator_active"
  | "needs_handoff"
  | "waiting_customer"
  | "pending_confirmation"
  | "closed";

export type OwnerType = "ai" | "operator" | "unassigned";

export type SenderType = "customer" | "operator" | "ai" | "system";

export type Message = {
  id: string;
  sender: SenderType;
  authorName?: string;
  body: string;
  at: string; // ISO
  systemKind?:
    | "handoff_to_operator"
    | "released_to_ai"
    | "assigned"
    | "order_created"
    | "confirmation_requested"
    | "order_confirmed"
    | "order_cancelled"
    | "channel_event";
  aiConfidence?: "low" | "medium" | "high";
  aiPolicy?: string;
};

// ----- Order model -----------------------------------------------------------

export type OrderStatus = "draft" | "pending_customer_confirmation" | "confirmed" | "cancelled";

// Backend-provided action keys. Frontend renders these as buttons; actual
// permission, validity, and side effects are enforced server-side.
export type OrderAction =
  | "view_order"
  | "request_customer_confirmation"
  | "confirm_order"
  | "cancel_order"
  | "edit_order";

export type OrderItem = {
  qty: number;
  name: string;
  // Free-form modifiers/notes per item — kept generic so non-restaurant
  // business types (clinics, salons, etc.) can reuse this structure.
  modifiers?: string[];
  note?: string;
  unitPriceLabel?: string;
  lineTotalLabel?: string;
};

// Snapshot of fulfilment/destination details captured at order time.
// Generic on purpose — restaurant uses address; clinic could use room/practitioner.
export type OrderSnapshot = {
  // E.g. "Delivery", "Takeaway", "Dine-in", "Appointment"
  fulfilmentLabel: string;
  // E.g. "Today · 20:30"
  scheduledForLabel?: string;
  // Free address or location label
  locationLabel?: string;
  // Optional secondary details (party size, practitioner name, etc.)
  details?: { label: string; value: string }[];
};

export type CustomerConfirmation = {
  // Mirrors backend confirmation lifecycle for THIS order.
  status: "not_required" | "not_requested" | "requested" | "received" | "declined" | "expired";
  // Last time backend updated this state.
  lastUpdatedLabel?: string;
  // Suggested message preview the backend would send to the customer.
  // Frontend shows it; backend owns the actual send.
  suggestedMessagePreview?: string;
  // Channel the confirmation will be sent through.
  channelLabel?: string;
};

export type LinkedOrder = {
  id: string;
  orderNumber: string; // human-readable
  status: OrderStatus;
  // Generic label — restaurant: "Delivery"/"Takeaway"; clinic: "Appointment", etc.
  channel: "dine_in" | "takeaway" | "delivery" | "service" | "appointment";
  businessTypeLabel?: string; // e.g. "Restaurant order", "Clinic appointment"
  createdAtLabel: string;
  items: OrderItem[];
  subtotalLabel?: string;
  taxLabel?: string;
  totalLabel: string; // backend-formatted currency string
  snapshot?: OrderSnapshot;
  customerConfirmation: CustomerConfirmation;
  // Available actions are decided by the backend per order state and per role.
  availableActions: OrderAction[];
  // Optional reason a normally-expected action is missing/disabled.
  unavailableActionNotes?: Partial<Record<OrderAction, string>>;
};

export type Customer = {
  name: string;
  identityLabel: string;
  language?: string;
  tags?: string[];
  addressLabel?: string;
  previousInteractionsLabel?: string;
};

export type Conversation = {
  id: string;
  /** Backend customer UUID — used for mutations like create_order. */
  customerId?: string;
  customer: Customer;
  channel: Channel;
  status: ConversationStatus;
  owner: OwnerType;
  assignedTo?: { name: string; team?: string };
  unread: number;
  lastMessagePreview: string;
  lastMessageAt: string;
  tags?: string[];
  noteCount?: number;
  messages: Message[];
  // A conversation can carry multiple linked orders (e.g. add-on order).
  // Backward-compatible: keep `order` for the primary one.
  order?: LinkedOrder;
  orders?: LinkedOrder[];
  replyAllowed: boolean;
  replyDisallowedReason?: string;
};

// ---------------------------------------------------------------------------
// Demo orders covering every lifecycle state.
// ---------------------------------------------------------------------------

const draftDeliveryOrder: LinkedOrder = {
  id: "ord-1042",
  orderNumber: "#1042",
  status: "draft",
  channel: "delivery",
  businessTypeLabel: "Restaurant order",
  createdAtLabel: "Today · 17:54",
  items: [
    {
      qty: 1,
      name: "Tagliatelle al ragù",
      modifiers: ["Gluten-free pasta"],
      note: "Extra parmesan on the side",
      unitPriceLabel: "€ 16.00",
      lineTotalLabel: "€ 16.00",
    },
    { qty: 1, name: "Insalata mista", unitPriceLabel: "€ 8.50", lineTotalLabel: "€ 8.50" },
  ],
  subtotalLabel: "€ 24.50",
  taxLabel: "Included",
  totalLabel: "€ 24.50",
  snapshot: {
    fulfilmentLabel: "Delivery",
    scheduledForLabel: "Today · 19:30",
    locationLabel: "Via Garibaldi 22, Milano · 3rd floor",
    details: [{ label: "Contact phone", value: "+39 333 902 4410" }],
  },
  customerConfirmation: {
    status: "not_requested",
    suggestedMessagePreview:
      "Hi Lena, here's your order draft for delivery at 19:30 — total € 24.50. Reply YES to confirm.",
    channelLabel: "Web chat",
  },
  availableActions: ["view_order", "edit_order", "request_customer_confirmation", "cancel_order"],
};

const pendingConfirmationTakeawayOrder: LinkedOrder = {
  id: "ord-1051",
  orderNumber: "#1051",
  status: "pending_customer_confirmation",
  channel: "takeaway",
  businessTypeLabel: "Restaurant order",
  createdAtLabel: "Today · 17:50",
  items: [
    {
      qty: 1,
      name: "Pizza Margherita",
      unitPriceLabel: "€ 10.00",
      lineTotalLabel: "€ 10.00",
    },
    {
      qty: 1,
      name: "Pizza Diavola",
      modifiers: ["Extra spicy"],
      unitPriceLabel: "€ 12.00",
      lineTotalLabel: "€ 12.00",
    },
  ],
  subtotalLabel: "€ 22.00",
  taxLabel: "Included",
  totalLabel: "€ 22.00",
  snapshot: {
    fulfilmentLabel: "Takeaway",
    scheduledForLabel: "Today · 20:00",
    details: [{ label: "Pickup name", value: "+44 7700 900 123" }],
  },
  customerConfirmation: {
    status: "requested",
    lastUpdatedLabel: "9m ago via SMS",
    channelLabel: "SMS",
    suggestedMessagePreview:
      "Your order #1051 (€ 22.00) is ready to lock in for 20:00 pickup. Reply YES to confirm or NO to cancel.",
  },
  availableActions: [
    "view_order",
    "request_customer_confirmation", // re-send / resend
    "cancel_order",
  ],
  unavailableActionNotes: {
    confirm_order:
      "Operators cannot confirm on behalf of customer for this order type — backend requires customer confirmation.",
    edit_order: "Editing locked while waiting on customer confirmation.",
  },
};

const confirmedReservationOrder: LinkedOrder = {
  id: "ord-1029",
  orderNumber: "#1029",
  status: "confirmed",
  channel: "dine_in",
  businessTypeLabel: "Reservation",
  createdAtLabel: "Today · 18:02",
  items: [{ qty: 1, name: "Table for 4 — window seating preferred" }],
  totalLabel: "—",
  snapshot: {
    fulfilmentLabel: "Dine-in",
    scheduledForLabel: "Tomorrow · 20:00",
    details: [
      { label: "Party size", value: "4 guests" },
      { label: "Seating", value: "Window (held)" },
    ],
  },
  customerConfirmation: {
    status: "received",
    lastUpdatedLabel: "Confirmed by customer · 2m ago",
    channelLabel: "WhatsApp",
  },
  availableActions: ["view_order", "cancel_order"],
  unavailableActionNotes: {
    edit_order: "Modifications to confirmed reservations require manager approval.",
  },
};

const cancelledOrder: LinkedOrder = {
  id: "ord-1018",
  orderNumber: "#1018",
  status: "cancelled",
  channel: "dine_in",
  businessTypeLabel: "Reservation",
  createdAtLabel: "Today · 16:48",
  items: [{ qty: 1, name: "Table for 2 — tonight" }],
  totalLabel: "—",
  snapshot: {
    fulfilmentLabel: "Dine-in",
    scheduledForLabel: "Tonight · 20:30",
    details: [{ label: "Party size", value: "2 guests" }],
  },
  customerConfirmation: {
    status: "not_required",
    lastUpdatedLabel: "Cancelled by operator · 1h ago",
  },
  availableActions: ["view_order"],
};

export const conversations: Conversation[] = [
  {
    id: "c-101",
    customer: {
      name: "Marco Rossi",
      identityLabel: "+39 333 901 2231 · WhatsApp",
      language: "Italian",
      tags: ["Repeat guest", "VIP"],
      addressLabel: "Via Roma 14, Milano",
      previousInteractionsLabel: "12 prior conversations · 8 orders",
    },
    channel: "whatsapp",
    status: "ai_active",
    owner: "ai",
    unread: 1,
    lastMessagePreview: "Table for 4 tomorrow 8pm — possible by the window?",
    lastMessageAt: "2m",
    tags: ["reservation"],
    noteCount: 0,
    replyAllowed: true,
    messages: [
      {
        id: "m1",
        sender: "customer",
        body: "Ciao! Table for 4 tomorrow 8pm — possible by the window?",
        at: "2026-04-28T18:02:00Z",
      },
      {
        id: "m2",
        sender: "ai",
        body: "Hi Marco! I can hold a window table for 4 tomorrow at 20:00. Want me to confirm under your usual name?",
        at: "2026-04-28T18:02:30Z",
        aiConfidence: "high",
        aiPolicy: "Reservation auto-handle within capacity policy",
      },
      {
        id: "m3",
        sender: "system",
        systemKind: "order_created",
        body: "Reservation #1029 drafted from conversation",
        at: "2026-04-28T18:02:45Z",
      },
      {
        id: "m4",
        sender: "system",
        systemKind: "order_confirmed",
        body: "Reservation #1029 confirmed by customer",
        at: "2026-04-28T18:03:50Z",
      },
    ],
    order: confirmedReservationOrder,
    orders: [confirmedReservationOrder],
  },
  {
    id: "c-102",
    customer: {
      name: "Lena Foster",
      identityLabel: "lena.foster@hey.com · Web chat",
      language: "English",
      tags: ["Allergies: gluten"],
      previousInteractionsLabel: "3 prior conversations · 2 orders",
    },
    channel: "web",
    status: "operator_active",
    owner: "operator",
    assignedTo: { name: "Sara M.", team: "Front of house" },
    unread: 0,
    lastMessagePreview: "Can I add gluten-free pasta to my order #1042?",
    lastMessageAt: "5m",
    tags: ["order edit"],
    noteCount: 1,
    replyAllowed: true,
    messages: [
      {
        id: "m1",
        sender: "customer",
        body: "Hi! Can I add gluten-free pasta to my order #1042?",
        at: "2026-04-28T17:54:00Z",
      },
      {
        id: "m2",
        sender: "system",
        systemKind: "handoff_to_operator",
        body: "AI handed off to operator · reason: dietary request needs kitchen confirmation",
        at: "2026-04-28T17:54:20Z",
      },
      {
        id: "m3",
        sender: "system",
        systemKind: "assigned",
        body: "Assigned to Sara M.",
        at: "2026-04-28T17:54:25Z",
      },
      {
        id: "m4",
        sender: "operator",
        authorName: "Sara M.",
        body: "Hi Lena, checking with the kitchen now — one moment.",
        at: "2026-04-28T17:55:10Z",
      },
      {
        id: "m5",
        sender: "system",
        systemKind: "order_created",
        body: "Order #1042 drafted from conversation",
        at: "2026-04-28T17:55:40Z",
      },
    ],
    order: draftDeliveryOrder,
    orders: [draftDeliveryOrder],
  },
  {
    id: "c-103",
    customer: {
      name: "+44 7700 900 123",
      identityLabel: "+44 7700 900 123 · SMS",
      tags: ["New customer"],
      previousInteractionsLabel: "First contact",
    },
    channel: "sms",
    status: "pending_confirmation",
    owner: "operator",
    assignedTo: { name: "Diego P.", team: "Front of house" },
    unread: 2,
    lastMessagePreview: "Order confirmation needed before kitchen sends",
    lastMessageAt: "9m",
    tags: ["order"],
    noteCount: 0,
    replyAllowed: true,
    messages: [
      {
        id: "m1",
        sender: "customer",
        body: "1x Margherita, 1x Diavola — for pickup at 8pm.",
        at: "2026-04-28T17:50:00Z",
      },
      {
        id: "m2",
        sender: "ai",
        body: "Got it. I've drafted your order — total € 22.00. Shall I send a confirmation link to lock the kitchen slot?",
        at: "2026-04-28T17:50:30Z",
        aiConfidence: "medium",
      },
      {
        id: "m3",
        sender: "system",
        systemKind: "order_created",
        body: "Order #1051 drafted from conversation",
        at: "2026-04-28T17:50:45Z",
      },
      {
        id: "m4",
        sender: "system",
        systemKind: "confirmation_requested",
        body: "Confirmation requested · waiting on customer",
        at: "2026-04-28T17:51:00Z",
      },
    ],
    order: pendingConfirmationTakeawayOrder,
    orders: [pendingConfirmationTakeawayOrder],
  },
  {
    id: "c-104",
    customer: {
      name: "Karim Saidi",
      identityLabel: "+33 6 12 34 56 78 · WhatsApp",
      language: "French",
      previousInteractionsLabel: "5 prior conversations · 3 reservations",
    },
    channel: "whatsapp",
    status: "waiting_customer",
    owner: "ai",
    unread: 0,
    lastMessagePreview: "Thanks, see you Friday at 7!",
    lastMessageAt: "22m",
    tags: ["reservation"],
    replyAllowed: true,
    messages: [
      {
        id: "m1",
        sender: "ai",
        body: "Your table for 2 on Friday at 19:00 is held. Reply YES to confirm.",
        at: "2026-04-28T17:35:00Z",
        aiConfidence: "high",
      },
      {
        id: "m2",
        sender: "customer",
        body: "Thanks, see you Friday at 7!",
        at: "2026-04-28T17:37:00Z",
      },
    ],
    // No linked order — drives empty-state UI
  },
  {
    id: "c-105",
    customer: {
      name: "Aiko Tanaka",
      identityLabel: "aiko.t@studio.jp · Web chat",
      language: "English",
      tags: ["Tourist"],
      previousInteractionsLabel: "First contact",
    },
    channel: "web",
    status: "needs_handoff",
    owner: "ai",
    unread: 3,
    lastMessagePreview: "We have a service dog — is that ok on the terrace?",
    lastMessageAt: "34m",
    tags: ["policy question"],
    noteCount: 0,
    replyAllowed: true,
    messages: [
      {
        id: "m1",
        sender: "customer",
        body: "Hi, we have a service dog with us — is that ok on the terrace?",
        at: "2026-04-28T17:24:00Z",
      },
      {
        id: "m2",
        sender: "ai",
        body: "Let me check our pet policy and get back to you shortly.",
        at: "2026-04-28T17:24:20Z",
        aiConfidence: "low",
        aiPolicy: "Outside known policy scope",
      },
      {
        id: "m3",
        sender: "system",
        systemKind: "handoff_to_operator",
        body: "AI requested handoff · reason: low confidence on pet policy",
        at: "2026-04-28T17:24:30Z",
      },
    ],
  },
  {
    id: "c-106",
    customer: {
      name: "Pedro Alves",
      identityLabel: "+351 91 234 5678 · WhatsApp",
      language: "Portuguese",
      previousInteractionsLabel: "9 prior conversations · 6 orders",
    },
    channel: "whatsapp",
    status: "closed",
    owner: "operator",
    assignedTo: { name: "Sara M." },
    unread: 0,
    lastMessagePreview: "Cancelled tonight's reservation — refund handled.",
    lastMessageAt: "1h",
    tags: ["reservation", "cancelled"],
    replyAllowed: false,
    replyDisallowedReason: "Conversation closed by operator. Reopen to continue.",
    messages: [
      {
        id: "m1",
        sender: "customer",
        body: "Need to cancel reservation for tonight, sorry.",
        at: "2026-04-28T16:48:00Z",
      },
      {
        id: "m2",
        sender: "operator",
        authorName: "Sara M.",
        body: "No problem Pedro — cancelled. Hope to see you next time!",
        at: "2026-04-28T16:50:00Z",
      },
      {
        id: "m3",
        sender: "system",
        systemKind: "order_cancelled",
        body: "Reservation #1018 cancelled by Sara M.",
        at: "2026-04-28T16:50:20Z",
      },
      {
        id: "m4",
        sender: "system",
        systemKind: "channel_event",
        body: "Conversation closed by Sara M.",
        at: "2026-04-28T16:50:30Z",
      },
    ],
    order: cancelledOrder,
    orders: [cancelledOrder],
  },
];
