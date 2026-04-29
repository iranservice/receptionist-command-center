// Phase II-B — Business Settings API.
// Wraps get_business_profile() and update_business_profile() RPCs.
// Frontend types aligned with backend BusinessProfileRow.

import { rpc } from "./client";

// ── Frontend types (aligned with backend contracts) ─────────

/** Mirrors backend BusinessProfileRow from get_business_profile() */
export interface BusinessProfileRow {
  business_id: string;
  slug: string;
  name: string;
  business_type: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  default_language: string;
  business_config: Record<string, unknown>;
  subscription_tier: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Allowed business_config keys that the Settings UI may send.
 * This constrains what the frontend writes into the JSONB field.
 *
 * Keys not in this list MUST NOT be sent from the frontend.
 * Backend accepts arbitrary JSONB, but frontend enforces discipline.
 */
export const ALLOWED_BUSINESS_CONFIG_KEYS = [
  "address",
  "menu_source",
  "reservations_enabled",
  "service_mode",
  "service_radius_km",
  "ai_replies_enabled",
  "auto_handoff_enabled",
  "require_order_approval",
  "menu_notes",
] as const;

export type AllowedBusinessConfigKey = (typeof ALLOWED_BUSINESS_CONFIG_KEYS)[number];

/** Params for update_business_profile — all fields optional */
export interface UpdateBusinessProfileParams {
  p_business_id: string;
  p_name?: string;
  p_logo_url?: string;
  p_phone?: string;
  p_email?: string;
  p_timezone?: string;
  p_default_language?: string;
  p_business_config?: Partial<Record<AllowedBusinessConfigKey, unknown>>;
}

// ── API functions ───────────────────────────────────────────

/** Fetch business profile for a specific business. */
export async function fetchBusinessProfile(businessId: string) {
  return rpc<BusinessProfileRow[]>("get_business_profile", {
    p_business_id: businessId,
  });
}

/**
 * Update business profile.
 * Only sends non-undefined fields to the RPC.
 * Constrains business_config keys to the allowed list.
 */
export async function updateBusinessProfile(params: UpdateBusinessProfileParams) {
  // Strip undefined values and enforce config key allowlist
  const cleanParams: Record<string, unknown> = {
    p_business_id: params.p_business_id,
  };

  if (params.p_name !== undefined) cleanParams.p_name = params.p_name;
  if (params.p_logo_url !== undefined) cleanParams.p_logo_url = params.p_logo_url;
  if (params.p_phone !== undefined) cleanParams.p_phone = params.p_phone;
  if (params.p_email !== undefined) cleanParams.p_email = params.p_email;
  if (params.p_timezone !== undefined) cleanParams.p_timezone = params.p_timezone;
  if (params.p_default_language !== undefined)
    cleanParams.p_default_language = params.p_default_language;

  if (params.p_business_config) {
    // Only allow known keys
    const safeConfig: Record<string, unknown> = {};
    for (const key of ALLOWED_BUSINESS_CONFIG_KEYS) {
      if (key in params.p_business_config) {
        safeConfig[key] = params.p_business_config[key];
      }
    }
    if (Object.keys(safeConfig).length > 0) {
      cleanParams.p_business_config = safeConfig;
    }
  }

  return rpc<Record<string, unknown>>("update_business_profile", cleanParams);
}
