// Phase II-B — Workspace API.
// Wraps get_my_workspaces() and get_my_platform_access() RPCs.
// Frontend types aligned with backend WorkspaceRow / PlatformAccessRow.

import { rpc } from "./client";

// ── Frontend types (aligned with backend contracts) ─────────

/** Mirrors backend WorkspaceRow from get_my_workspaces() */
export interface WorkspaceRow {
  business_id: string;
  business_slug: string;
  business_name: string;
  business_type: string;
  membership_id: string;
  membership_role: "owner" | "manager" | "operator" | "viewer";
  membership_is_active: boolean;
  is_owner_or_admin: boolean;
  platform_role: string | null;
  default_workspace: boolean;
}

/** Mirrors backend PlatformAccessRow from get_my_platform_access() */
export interface PlatformAccessRow {
  user_id: string;
  platform_role: string | null;
  is_platform_admin: boolean;
}

// ── API functions ───────────────────────────────────────────

/** Fetch all active workspaces for the current user. */
export async function fetchWorkspaces() {
  return rpc<WorkspaceRow[]>("get_my_workspaces");
}

/** Fetch platform access level for the current user. */
export async function fetchPlatformAccess() {
  return rpc<PlatformAccessRow[]>("get_my_platform_access");
}
