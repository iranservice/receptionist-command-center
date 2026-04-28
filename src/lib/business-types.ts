import {
  UtensilsCrossed,
  Stethoscope,
  Scissors,
  ShoppingCart,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * Business types are an extensible catalog. The product is restaurant-first
 * today, but the UI must not be restaurant-locked. Each type can opt into
 * extension modules (e.g. a menu module for restaurants, a practitioner
 * module for clinics) without changing the core setup flow.
 *
 * Backend remains the source of truth for which types and modules a tenant
 * can actually use. The frontend only displays the catalog.
 */
export type BusinessTypeId = "restaurant" | "clinic" | "salon" | "supermarket" | "service";

export type BusinessTypeModule =
  | "menu"
  | "reservations"
  | "delivery_area"
  | "practitioners"
  | "appointments"
  | "stylists"
  | "inventory"
  | "service_jobs";

export type BusinessTypeDef = {
  id: BusinessTypeId;
  label: string;
  tagline: string;
  icon: LucideIcon;
  status: "available" | "preview";
  modules: BusinessTypeModule[];
};

export const businessTypes: BusinessTypeDef[] = [
  {
    id: "restaurant",
    label: "Restaurant",
    tagline: "Orders, reservations, delivery area, menu.",
    icon: UtensilsCrossed,
    status: "available",
    modules: ["menu", "reservations", "delivery_area"],
  },
  {
    id: "clinic",
    label: "Clinic",
    tagline: "Appointments, practitioners, intake.",
    icon: Stethoscope,
    status: "preview",
    modules: ["appointments", "practitioners"],
  },
  {
    id: "salon",
    label: "Salon",
    tagline: "Bookings, stylists, services.",
    icon: Scissors,
    status: "preview",
    modules: ["appointments", "stylists"],
  },
  {
    id: "supermarket",
    label: "Supermarket",
    tagline: "Orders, inventory, pickup windows.",
    icon: ShoppingCart,
    status: "preview",
    modules: ["inventory", "delivery_area"],
  },
  {
    id: "service",
    label: "Service business",
    tagline: "Jobs, callbacks, scheduling.",
    icon: Sparkles,
    status: "preview",
    modules: ["service_jobs", "appointments"],
  },
];

export const moduleLabels: Record<BusinessTypeModule, string> = {
  menu: "Menu",
  reservations: "Reservations",
  delivery_area: "Delivery / service area",
  practitioners: "Practitioners",
  appointments: "Appointments",
  stylists: "Stylists",
  inventory: "Inventory",
  service_jobs: "Service jobs",
};

export function getBusinessType(id: BusinessTypeId | string | undefined): BusinessTypeDef {
  return businessTypes.find((t) => t.id === id) ?? businessTypes[0];
}
