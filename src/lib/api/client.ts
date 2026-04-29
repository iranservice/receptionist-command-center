// Phase II-B — Supabase RPC client utilities.
// Thin wrapper over getSupabase() for typed RPC calls.
// Never uses service_role. Never hardcodes secrets.
// Returns null data when Supabase is not configured (demo mode).

import { getSupabase, isSupabaseConfigured } from "../supabase";

export type RpcResult<T> = { data: T; error: null } | { data: null; error: string };

/**
 * Call a Supabase RPC function with typed params.
 * Returns `{ data: null, error: "DEMO_MODE" }` when backend is not configured.
 */
export async function rpc<T>(
  fnName: string,
  params?: Record<string, unknown>,
): Promise<RpcResult<T>> {
  if (!isSupabaseConfigured) {
    return { data: null, error: "DEMO_MODE" };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { data: null, error: "SUPABASE_NOT_AVAILABLE" };
  }

  const { data, error } = await supabase.rpc(fnName, params ?? {});

  if (error) {
    // Extract meaningful error message from Supabase/Postgres error
    const msg = error.message || error.details || "RPC_ERROR";
    return { data: null, error: msg };
  }

  return { data: data as T, error: null };
}

/**
 * Parse a backend error message into a user-friendly category.
 */
export function classifyError(
  errorMsg: string,
): "access_denied" | "not_found" | "conflict" | "lockout" | "network" | "unknown" {
  const upper = errorMsg.toUpperCase();
  if (upper.includes("ACCESS_DENIED")) return "access_denied";
  if (upper.includes("NOT_FOUND")) return "not_found";
  if (upper.includes("CONFLICT")) return "conflict";
  if (upper.includes("BUSINESS_LOCKOUT")) return "lockout";
  if (upper.includes("FETCH") || upper.includes("NETWORK")) return "network";
  return "unknown";
}
