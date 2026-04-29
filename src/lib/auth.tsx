// Phase I — Auth context & hook.
// Loads Supabase session + user profile + business memberships.
// Falls back to demo data when Supabase is not configured.
// Backend is always source of truth — frontend never invents authz.

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { Session, User } from "@supabase/supabase-js";

// ── Types ───────────────────────────────────────────────────

export type UserProfile = {
  id: string;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  platformRole: "super_admin" | "platform_admin" | "support" | null;
  preferredLanguage: string;
  timezone: string;
};

export type BusinessMembership = {
  membershipId: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  businessType: string;
  role: "owner" | "manager" | "operator" | "viewer";
  isActive: boolean;
};

type AuthPhase = "loading" | "authenticated" | "unauthenticated" | "error";

type AuthState = {
  phase: AuthPhase;
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  memberships: BusinessMembership[];
  error: string | null;
  /** True when Supabase env vars are not set — UI uses demo data. */
  isDemoMode: boolean;
  signOut: () => Promise<void>;
};

// ── Demo fallback (no backend configured) ───────────────────

const DEMO_PROFILE: UserProfile = {
  id: "demo-user-000",
  displayName: "Alex Morgan",
  email: "alex@aura.ops",
  phone: null,
  avatarUrl: null,
  platformRole: "super_admin",
  preferredLanguage: "en",
  timezone: "UTC",
};

const DEMO_MEMBERSHIPS: BusinessMembership[] = [
  {
    membershipId: "m-1",
    businessId: "b-1",
    businessName: "Bella Trattoria",
    businessSlug: "bella-trattoria",
    businessType: "restaurant",
    role: "owner",
    isActive: true,
  },
  {
    membershipId: "m-2",
    businessId: "b-2",
    businessName: "Harbor Grill",
    businessSlug: "harbor-grill",
    businessType: "restaurant",
    role: "manager",
    isActive: true,
  },
  {
    membershipId: "m-3",
    businessId: "b-3",
    businessName: "Sunrise Clinic",
    businessSlug: "sunrise-clinic",
    businessType: "clinic",
    role: "viewer",
    isActive: true,
  },
];

// ── Context ─────────────────────────────────────────────────

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [memberships, setMemberships] = useState<BusinessMembership[]>([]);
  const [phase, setPhase] = useState<AuthPhase>("loading");
  const [error, setError] = useState<string | null>(null);

  const isDemoMode = !isSupabaseConfigured;

  // ── Bootstrap ───────────────────────────────────────────
  useEffect(() => {
    if (isDemoMode) {
      // No backend — use demo data immediately.
      setProfile(DEMO_PROFILE);
      setMemberships(DEMO_MEMBERSHIPS);
      setPhase("authenticated");
      return;
    }

    const supabase = getSupabase()!;
    let cancelled = false;

    async function init() {
      try {
        const {
          data: { session: s },
          error: sErr,
        } = await supabase.auth.getSession();

        if (cancelled) return;
        if (sErr) throw sErr;

        if (!s) {
          setPhase("unauthenticated");
          return;
        }

        setSession(s);
        setUser(s.user);
        await loadProfileAndMemberships(s.user.id);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Auth init failed");
          setPhase("error");
        }
      }
    }

    async function loadProfileAndMemberships(userId: string) {
      try {
        // Load profile
        const { data: profileRow, error: pErr } = await supabase
          .from("user_profiles")
          .select(
            "id, display_name, email, phone, avatar_url, platform_role, preferred_language, timezone",
          )
          .eq("id", userId)
          .single();

        if (pErr) throw pErr;

        const p: UserProfile = {
          id: profileRow.id,
          displayName: profileRow.display_name,
          email: profileRow.email,
          phone: profileRow.phone,
          avatarUrl: profileRow.avatar_url,
          platformRole: profileRow.platform_role,
          preferredLanguage: profileRow.preferred_language ?? "en",
          timezone: profileRow.timezone ?? "UTC",
        };
        if (!cancelled) setProfile(p);

        // Load memberships (business slug + name via join)
        const { data: memberRows, error: mErr } = await supabase
          .from("business_memberships")
          .select("id, business_id, role, is_active, businesses(name, slug, business_type)")
          .eq("user_id", userId)
          .eq("is_active", true);

        if (mErr) throw mErr;

        const mems: BusinessMembership[] = (memberRows ?? []).map((r: Record<string, unknown>) => {
          const biz = r.businesses as Record<string, unknown> | null;
          return {
            membershipId: r.id as string,
            businessId: r.business_id as string,
            businessName: (biz?.name as string) ?? "Unknown",
            businessSlug: (biz?.slug as string) ?? "",
            businessType: (biz?.business_type as string) ?? "general",
            role: r.role as BusinessMembership["role"],
            isActive: r.is_active as boolean,
          };
        });
        if (!cancelled) {
          setMemberships(mems);
          setPhase("authenticated");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load profile/memberships");
          setPhase("error");
        }
      }
    }

    init();

    // Listen for auth state changes (login/logout/token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (!s) {
        setProfile(null);
        setMemberships([]);
        setPhase("unauthenticated");
      } else if (s.user) {
        loadProfileAndMemberships(s.user.id);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [isDemoMode]);

  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setMemberships([]);
    setPhase("unauthenticated");
  };

  const value = useMemo<AuthState>(
    () => ({
      phase,
      session,
      user,
      profile,
      memberships,
      error,
      isDemoMode,
      signOut,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, session, user, profile, memberships, error, isDemoMode],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

/** Access auth state. Must be used within <AuthProvider>. */
export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

/**
 * Find a membership by business slug.
 * Returns undefined if user has no access to that workspace.
 */
export function useMembershipBySlug(slug: string | undefined): BusinessMembership | undefined {
  const { memberships } = useAuth();
  return slug ? memberships.find((m) => m.businessSlug === slug) : undefined;
}
