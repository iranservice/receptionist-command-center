// Demo data for LV-3 Inbox + Conversation Workspace.
// NOTE: All states (ownership, AI/handoff, order, available actions) are
// presentational mirrors of backend state. Frontend never invents truth.

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
  // System events use a kind for icon/label rendering
  systemKind?:
    | "handoff_to_operator"
    | "released_to_ai"
    | "assigned"
    | "order_created"
    | "confirmation_requested"
    | "channel_event";
  // AI metadata (display-only)
  aiConfidence?: "low" | "medium" | "high";
  aiPolicy?: string;
};

export type OrderItem = { qty: number; name: string; note?: string };
export type LinkedOrder = {
  id: string;
  status: "draft" | "pending_confirmation" | "confirmed" | "cancelled";
  items: OrderItem[];
  totalLabel: string; // backend-formatted currency string
  channel: "dine_in" | "takeaway" | "delivery" | "service" | "appointment";
  // Available actions are backend-decided; frontend just renders a placeholder list
  availableActions: Array<"view" | "request_confirmation" | "confirm" | "cancel">;
};

export type Customer = {
  name: string;
  identityLabel: string; // phone / email / handle
  language?: string;
  tags?: string[];
  addressLabel?: string;
  previousInteractionsLabel?: string;
};

export type Conversation = {
  id: string;
  customer: Customer;
  channel: Channel;
  status: ConversationStatus;
  owner: OwnerType;
  assignedTo?: { name: string; team?: string };
  unread: number;
  lastMessagePreview: string;
  lastMessageAt: string; // relative label
  tags?: string[];
  noteCount?: number;
  messages: Message[];
  order?: LinkedOrder;
  // True if backend currently allows the operator to reply.
  // Frontend just mirrors. Final enforcement is server-side.
  replyAllowed: boolean;
  replyDisallowedReason?: string;
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
    ],
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
    ],
    order: {
      id: "1042",
      status: "draft",
      channel: "delivery",
      items: [
        { qty: 1, name: "Tagliatelle al ragù" },
        { qty: 1, name: "Insalata mista" },
      ],
      totalLabel: "€ 24.50",
      availableActions: ["view", "request_confirmation"],
    },
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
    order: {
      id: "1051",
      status: "pending_confirmation",
      channel: "takeaway",
      items: [
        { qty: 1, name: "Pizza Margherita" },
        { qty: 1, name: "Pizza Diavola" },
      ],
      totalLabel: "€ 22.00",
      availableActions: ["view", "request_confirmation", "cancel"],
    },
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
        systemKind: "channel_event",
        body: "Conversation closed by Sara M.",
        at: "2026-04-28T16:50:30Z",
      },
    ],
  },
];
