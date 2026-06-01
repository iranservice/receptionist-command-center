// Phase II — Business settings data adapter.
// Demo/mock implementation with per-tenant isolation.
// TODO(backend): Replace with Supabase query when tables are ready.

import type { BusinessSettings, SettingsUpdateInput } from "./types";

// ── Demo data — one settings object per demo tenant ─────────

const demoSettings: Record<string, BusinessSettings> = {
  "bella-trattoria": {
    businessId: "b-1",
    slug: "bella-trattoria",
    name: "Bella Trattoria",
    publicDisplayName: "Bella Trattoria",
    businessType: "restaurant",
    status: "active",
    timezone: "Europe/Istanbul",
    language: "en",
    operatingHoursSummary: "Mon–Sat 09:00–22:00 · Sun closed",
    aiPolicyEnabled: true,
    customerConfirmationRequired: false,
    escalationPolicyEnabled: true,
    defaultOperatorBehavior: "ai_only",
    address: "14 Via Roma, Istanbul 34000, TR",
    phone: "+90 212 555 0101",
    email: "hello@bellatrattoria.com",
  },
  "harbor-grill": {
    businessId: "b-2",
    slug: "harbor-grill",
    name: "Harbor Grill",
    publicDisplayName: "Harbor Grill & Bar",
    businessType: "restaurant",
    status: "active",
    timezone: "America/New_York",
    language: "en",
    operatingHoursSummary: "Mon–Sun 11:00–23:00",
    aiPolicyEnabled: true,
    customerConfirmationRequired: true,
    escalationPolicyEnabled: false,
    defaultOperatorBehavior: "queue",
    address: "88 Harbor Blvd, New York, NY 10001",
    phone: "+1 212 555 0202",
    email: "info@harborgrill.com",
  },
  "sunrise-clinic": {
    businessId: "b-3",
    slug: "sunrise-clinic",
    name: "Sunrise Clinic",
    publicDisplayName: "Sunrise Health Clinic",
    businessType: "clinic",
    status: "setup_required",
    timezone: "Europe/London",
    language: "en",
    operatingHoursSummary: "Mon–Fri 08:00–18:00 · Sat 09:00–13:00",
    aiPolicyEnabled: false,
    customerConfirmationRequired: true,
    escalationPolicyEnabled: true,
    defaultOperatorBehavior: "voicemail",
    address: "22 Sunrise Way, London SW1A 1AA, UK",
    phone: "+44 20 7946 0303",
    email: "reception@sunriseclinic.co.uk",
  },
};

// ── Adapter functions ───────────────────────────────────────

/**
 * Get business settings for a tenant.
 * Returns null if the slug is unknown (tenant not found).
 *
 * TODO(backend): Replace with `supabase.from('businesses').select(...).eq('slug', slug).single()`
 */
export function getBusinessSettings(slug: string): BusinessSettings | null {
  return demoSettings[slug] ?? null;
}

/**
 * Update business settings (demo — in-memory only, resets on refresh).
 *
 * TODO(backend): Replace with `supabase.from('businesses').update(patch).eq('slug', slug)`
 */
export function updateBusinessSettings(
  slug: string,
  patch: SettingsUpdateInput,
): { success: boolean; error?: string } {
  const current = demoSettings[slug];
  if (!current) return { success: false, error: "Business not found" };

  // Apply patch in-memory
  Object.assign(current, patch);
  return { success: true };
}

/**
 * Get all available demo tenant slugs.
 * Useful for validation and listing.
 */
export function getAvailableTenantSlugs(): string[] {
  return Object.keys(demoSettings);
}
