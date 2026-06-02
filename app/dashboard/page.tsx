"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatDate, scoreToHex, scoreToLabel } from "@/lib/utils";
import UrlInput from "@/components/landing/UrlInput";
import Navbar   from "@/components/layout/Navbar";

interface AuditRow {
  id:              string;
  domain:          string;
  url:             string;
  share_token:     string;
  score_overall:   number;
  score_performance: number;
  score_trust:     number;
  score_clarity:   number;
  score_conversion: number;
  is_paid:         boolean;
  created_at:      string;
}

// ─── Score chip ───────────────────────────────────────────────────────────────
function ScoreChip({ score }: { score: number }) {
  const color = scoreToHex(score);
  const label = scoreToLabel(score);
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
        style={{ background: color }}
      >
        {Math.round(score)}
      </div>
      <span className="text-xs text-surface-500">{label}</span>
    </div>
  );
}

// ─── Audit card ───────────────────────────────────────────────────────────────
function AuditCard({ audit }: { audit: AuditRow }) {
  return (
    <Link
      href={`/report/${audit.share_token}`}
      className="card p-5 hover:shadow-card-md transition-all duration-200 hover:-translate-y-0.5 block group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-surface-900 truncate">{audit.domain}</p>
            {audit.is_paid && (
              <span className="shrink-0 text-xs bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full font-medium">
                Full report
              </span>
            )}
          </div>
          <p className="text-xs text-surface-400 truncate mb-3">{audit.url}</p>

          {/* Mini score bars */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {(["score_performance", "score_trust", "score_clarity", "score_conversion"] as const).map(key => {
              const label = key.replace("score_", "");
              const val   = audit[key];
              const color = scoreToHex(val);
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-xs text-surface-400 w-20 capitalize shrink-0">{label}</span>
                  <div className="flex-1 h-1 bg-surface-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${val}%`, background: color }} />
                  </div>
                  <span className="text-xs font-medium w-6 text-right" style={{ color }}>{Math.round(val)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <ScoreChip score={audit.score_overall} />
          <p className="text-xs text-surface-400 mt-2">{formatDate(audit.created_at)}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between">
        <span className="text-xs text-surface-400">View full report</span>
        <svg viewBox="0 0 20 20" fill="currentColor"
          className="w-4 h-4 text-surface-300 group-hover:text-brand-500 transition-colors">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      </div>
    </Link>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8 text-surface-400">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
      </div>
      <h3 className="text-base font-semibold text-surface-900 mb-2">No audits yet</h3>
      <p className="text-sm text-surface-500 mb-8 max-w-xs mx-auto">
        Run your first website audit to see your growth score and quick wins.
      </p>
      <div className="max-w-sm mx-auto">
        <UrlInput size="compact" />
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router  = useRouter();
  const [audits,  setAudits]  = useState<AuditRow[]>([]);
  const [user,    setUser]    = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login?next=/dashboard");
        return;
      }
      setUser({ email: data.user.email ?? "" });

      supabase
        .from("audits")
        .select("id,domain,url,share_token,score_overall,score_performance,score_trust,score_clarity,score_conversion,is_paid,created_at")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })
        .limit(50)
        .then(({ data: rows }) => {
          setAudits((rows ?? []) as AuditRow[]);
          setLoading(false);
        });
    });
  }, [router]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-surface-900">Your audits</h1>
            {user && (
              <p className="text-sm text-surface-500 mt-1">{user.email}</p>
            )}
          </div>
          <button onClick={handleSignOut} className="btn-ghost text-sm shrink-0">
            Sign out
          </button>
        </div>

        {/* New audit bar */}
        <div className="card p-5 mb-8">
          <p className="text-sm font-medium text-surface-700 mb-3">Run a new audit</p>
          <UrlInput size="compact" />
        </div>

        {/* Audit list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-5 animate-pulse space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 skeleton rounded w-32" />
                  <div className="h-8 w-8 skeleton rounded-full" />
                </div>
                <div className="h-3 skeleton rounded w-48" />
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {[1,2,3,4].map(j => <div key={j} className="h-2 skeleton rounded" />)}
                </div>
              </div>
            ))}
          </div>
        ) : audits.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {audits.map(audit => (
              <AuditCard key={audit.id} audit={audit} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
