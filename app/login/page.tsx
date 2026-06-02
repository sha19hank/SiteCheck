"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginContent() {
  const searchParams = useSearchParams();
  const next         = searchParams.get("next") ?? "/dashboard";
  const authError    = searchParams.get("error");

  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState(authError === "auth_failed" ? "Sign-in link expired. Try again." : "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authErr } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (authErr) {
      setError(authErr.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 20 20" fill="none" className="w-4.5 h-4.5">
              <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="2"/>
              <path d="M7 10l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-base font-semibold text-surface-900">SiteCheck</span>
        </Link>

        <div className="card p-8">
          {sent ? (
            /* ── Sent state ────────────────────────────────────────────── */
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-7 h-7 text-brand-600">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-surface-900 mb-2">Check your inbox</h2>
              <p className="text-sm text-surface-500 leading-relaxed mb-6">
                We sent a sign-in link to <strong className="text-surface-700">{email}</strong>.
                Click it to access your dashboard — no password needed.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="btn-ghost text-sm"
              >
                Use a different email
              </button>
            </div>
          ) : (
            /* ── Form state ────────────────────────────────────────────── */
            <>
              <div className="text-center mb-7">
                <h1 className="text-xl font-semibold text-surface-900 mb-1.5">Sign in to SiteCheck</h1>
                <p className="text-sm text-surface-500">
                  We&apos;ll email you a magic link — no password required
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (error) setError(""); }}
                    placeholder="you@example.com"
                    className="input"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Sending link…
                    </span>
                  ) : "Send magic link"}
                </button>
              </form>

              <p className="text-center text-xs text-surface-400 mt-6">
                By signing in you agree to our{" "}
                <Link href="/terms" className="underline hover:text-surface-600">Terms</Link>
                {" & "}
                <Link href="/privacy" className="underline hover:text-surface-600">Privacy Policy</Link>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-surface-400 mt-6">
          <Link href="/" className="hover:text-surface-600 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
