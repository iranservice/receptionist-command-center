// Phase VII-A — Auth entry route.
// Provides email/password sign-in and magic-link (OTP) sign-in.
// Uses existing getSupabase() singleton — never creates a second client.
// Never uses service_role key.
// In demo mode (no Supabase env), shows informational state.

import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { Link } from "@tanstack/react-router";
import { Loader2, ArrowLeft, Mail, KeyRound, Info } from "lucide-react";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in · Aura AI Receptionist" },
      { name: "description", content: "Sign in to the Aura AI Receptionist operations workspace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

type AuthMethod = "password" | "magic-link";
type AuthStatus = "idle" | "loading" | "magic-link-sent" | "error";

function AuthPage() {
  const navigate = useNavigate();
  const { phase, isDemoMode, memberships } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [method, setMethod] = useState<AuthMethod>("password");
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect from validated search params
  const { redirect: redirectTo } = useSearch({ from: "/auth" });

  // ── Already authenticated → redirect ──────────────────────
  useEffect(() => {
    if (phase === "authenticated" && !isDemoMode) {
      const target = redirectTo || getDefaultRoute(memberships);
      navigate({ to: target });
    }
  }, [phase, isDemoMode, redirectTo, memberships, navigate]);

  // ── Demo mode → informational state ───────────────────────
  if (isDemoMode) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/20">
            <Info className="h-5 w-5" />
          </span>
          <h2 className="text-lg font-semibold text-foreground">Demo mode active</h2>
          <p className="text-sm text-muted-foreground">
            Supabase environment is not configured. The app is running with mock data.
            <br />
            To enable real sign-in, set{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
              VITE_SUPABASE_URL
            </code>{" "}
            and{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
              VITE_SUPABASE_ANON_KEY
            </code>{" "}
            in <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">.env.local</code>.
          </p>
          <Link
            to="/"
            className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
        </div>
      </AuthShell>
    );
  }

  // ── Magic link sent → success state ───────────────────────
  if (status === "magic-link-sent") {
    return (
      <AuthShell>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/12 text-green-600 ring-1 ring-green-500/20">
            <Mail className="h-5 w-5" />
          </span>
          <h2 className="text-lg font-semibold text-foreground">Check your email</h2>
          <p className="text-sm text-muted-foreground">
            We sent a sign-in link to <strong className="text-foreground">{email}</strong>.
            <br />
            Click the link in your email to sign in. You can close this tab.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setEmail("");
            }}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Use a different email
          </button>
        </div>
      </AuthShell>
    );
  }

  // ── Sign-in form ──────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMsg("Please enter your email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const supabase = getSupabase();
    if (!supabase) {
      setErrorMsg("Supabase is not configured.");
      setStatus("error");
      return;
    }

    try {
      if (method === "password") {
        if (!password) {
          setErrorMsg("Please enter your password.");
          setStatus("error");
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) {
          setErrorMsg(error.message);
          setStatus("error");
          return;
        }
        // Success — onAuthStateChange will trigger, useEffect will redirect
        setStatus("idle");
      } else {
        // Magic link
        const { error } = await supabase.auth.signInWithOtp({
          email: trimmedEmail,
          options: {
            emailRedirectTo: `${window.location.origin}${redirectTo || "/"}`,
          },
        });
        if (error) {
          setErrorMsg(error.message);
          setStatus("error");
          return;
        }
        setStatus("magic-link-sent");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
      setStatus("error");
    }
  };

  const isLoading = status === "loading";

  return (
    <AuthShell>
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-xl font-semibold text-foreground">Sign in to Aura</h2>
        <p className="text-sm text-muted-foreground">
          Operator &amp; admin access to the AI receptionist workspace.
        </p>
      </div>

      {/* Method tabs */}
      <div className="flex rounded-lg border border-border bg-muted/50 p-0.5">
        <button
          type="button"
          onClick={() => {
            setMethod("password");
            setErrorMsg("");
          }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            method === "password"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <KeyRound className="h-3.5 w-3.5" />
          Password
        </button>
        <button
          type="button"
          onClick={() => {
            setMethod("magic-link");
            setErrorMsg("");
          }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            method === "magic-link"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          Magic link
        </button>
      </div>

      {/* Error */}
      {status === "error" && errorMsg && (
        <div className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="auth-email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
          />
        </div>

        {method === "password" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {method === "password" ? "Sign in" : "Send magic link"}
        </button>
      </form>

      <div className="text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to home
        </Link>
      </div>
    </AuthShell>
  );
}

// ── Shell ────────────────────────────────────────────────────

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            A
          </div>
          <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            AI Receptionist
          </span>
        </div>

        {children}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────

function getDefaultRoute(memberships: { businessSlug: string }[]): string {
  if (memberships.length > 0) {
    return `/app/${memberships[0].businessSlug}/inbox`;
  }
  return "/";
}
