"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ScoreRing          from "@/components/report/ScoreRing";
import ScoreBar           from "@/components/report/ScoreBar";
import QuickWinCard       from "@/components/report/QuickWinCard";
import SectionInsightCard from "@/components/report/SectionInsightCard";
import PaymentModal       from "@/components/report/PaymentModal";
import ComparisonBanner   from "@/components/report/ComparisonBanner";
import ScreenshotPanel    from "@/components/report/ScreenshotPanel";
import { cn, formatDate } from "@/lib/utils";
import type { PartialReport, ScreenshotData } from "@/types";

// ─── Share button ─────────────────────────────────────────────────────────────
function ShareButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    const url = `${window.location.origin}/report/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }
  return (
    <button onClick={copy} className={cn(
      "btn-secondary gap-2 text-xs h-8 px-3 transition-colors duration-300",
      copied && "border-brand-300 text-brand-600 bg-brand-50"
    )}>
      {copied ? (
        <><svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" clipRule="evenodd"/></svg>Copied!</>
      ) : (
        <><svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/></svg>Share</>
      )}
    </button>
  );
}

// ─── PDF download button ──────────────────────────────────────────────────────
function PDFButton({ auditId, isPaid }: { auditId: string; isPaid: boolean }) {
  const [loading, setLoading] = useState(false);

  async function download() {
    if (!isPaid) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pdf/${auditId}`);
      if (!res.ok) throw new Error("PDF failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `sitecheck-report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!isPaid) return null;

  return (
    <button onClick={download} disabled={loading} className="btn-ghost gap-1.5 text-xs h-8 px-3">
      {loading ? (
        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      )}
      {loading ? "Generating…" : "PDF"}
    </button>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-16 space-y-5">
      <div className="card p-7 animate-pulse">
        <div className="flex gap-6">
          <div className="w-28 h-28 skeleton rounded-full shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-5 skeleton rounded-lg w-3/4" />
            <div className="h-4 skeleton rounded-lg w-full" />
            <div className="h-4 skeleton rounded-lg w-5/6" />
            <div className="h-4 skeleton rounded-lg w-4/5" />
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[1,2,3,4].map(i => <div key={i} className="h-3 skeleton rounded-lg" />)}
            </div>
          </div>
        </div>
      </div>
      {[1,2,3].map(i => (
        <div key={i} className="card p-6 animate-pulse space-y-3">
          <div className="flex gap-3">
            <div className="w-7 h-7 skeleton rounded-full shrink-0" />
            <div className="h-5 skeleton rounded-lg w-2/3" />
          </div>
          <div className="h-4 skeleton rounded-lg" />
          <div className="h-4 skeleton rounded-lg w-4/5" />
        </div>
      ))}
    </div>
  );
}

// ─── Report content ────────────────────────────────────────────────────────────
function ReportContent() {
  const params = useParams<{ token: string }>();
  const token  = params.token;

  const [report,       setReport]       = useState<PartialReport | null>(null);
  const [auditId,      setAuditId]      = useState("");
  const [shareToken,   setShareToken]   = useState(token);
  const [screenshots,  setScreenshots]  = useState<ScreenshotData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [showPayment,  setShowPayment]  = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);

  const fetchReport = useCallback(() => {
    fetch(`/api/audit/${token}`)
      .then(r => r.json() as Promise<{
        report?: PartialReport;
        auditId?: string;
        shareToken?: string;
        screenshots?: ScreenshotData;
        error?: string;
      }>)
      .then(data => {
        if (!data.report) { setError(data.error ?? "Report not found"); return; }
        setReport(data.report);
        setAuditId(data.auditId ?? "");
        setShareToken(data.shareToken ?? token);
        if (data.screenshots) setScreenshots(data.screenshots);
      })
      .catch(() => setError("Failed to load report"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  function handleUnlockSuccess() {
    setShowPayment(false);
    setJustUnlocked(true);
    setLoading(true);
    setTimeout(() => fetchReport(), 800);
  }

  if (loading) return <Skeleton />;

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-7 h-7 text-surface-400">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <p className="text-base font-medium text-surface-700 mb-2">Report not found</p>
        <p className="text-sm text-surface-500 mb-6">{error}</p>
        <Link href="/" className="btn-primary">Run a new audit</Link>
      </div>
    </div>
  );

  if (!report) return null;

  const { scores, consultantSummary, overallNarrative, quickWins, sectionInsights, isPaid, domain, url, createdAt } = report;

  return (
    <>
      {showPayment && (
        <PaymentModal
          auditId={auditId}
          domain={domain}
          onSuccess={handleUnlockSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}

      {justUnlocked && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up fill-both">
          <div className="bg-emerald-600 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg flex items-center gap-2">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            Full report unlocked!
          </div>
        </div>
      )}

      <div className="min-h-screen pb-24">
        {/* ── Sticky top bar ──────────────────────────────────────────────── */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-surface-200/60 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
            <Link href="/" className="shrink-0 flex items-center gap-2 mr-1">
              <div className="w-6 h-6 rounded-md bg-brand-gradient flex items-center justify-center">
                <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5">
                  <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="2"/>
                  <path d="M7 10l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-surface-500 truncate">{url || domain}</p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <ShareButton token={shareToken} />
              <PDFButton auditId={auditId} isPaid={isPaid} />
              {!isPaid && (
                <button onClick={() => setShowPayment(true)} className="btn-primary text-xs h-8 px-3">
                  Unlock full
                </button>
              )}
            </div>
          </div>
        </div>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 space-y-8 sm:space-y-10">

          {/* ── Comparison banner ─────────────────────────────────────────── */}
          {auditId && (
            <ComparisonBanner domain={domain} currentId={auditId} shareToken={shareToken} />
          )}

          {/* ── Hero score card ───────────────────────────────────────────── */}
          <div className="card p-6 sm:p-8 animate-fade-up fill-both">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              <div className="flex flex-col items-center shrink-0">
                <ScoreRing score={scores.overall} size={112} strokeWidth={9} animate />
                <p className="label-sm mt-2.5">Growth score</p>
              </div>
              <div className="flex-1 min-w-0">
                {overallNarrative && (
                  <h1 className="text-lg sm:text-xl font-semibold text-surface-900 leading-snug mb-3">
                    {overallNarrative}
                  </h1>
                )}
                <p className="text-sm text-surface-600 leading-relaxed">{consultantSummary}</p>
                <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-surface-100 text-xs text-surface-400">
                  <span className="font-medium text-surface-600">{domain}</span>
                  <span>·</span>
                  <span>{formatDate(createdAt)}</span>
                  {isPaid && (
                    <><span>·</span>
                    <span className="text-brand-600 font-medium flex items-center gap-1">
                      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M8 1a3.5 3.5 0 00-3.5 3.5V7A1.5 1.5 0 003 8.5v5A1.5 1.5 0 004.5 15h7a1.5 1.5 0 001.5-1.5v-5A1.5 1.5 0 0011.5 7V4.5A3.5 3.5 0 008 1zm2 6V4.5a2 2 0 10-4 0V7h4z" clipRule="evenodd"/>
                      </svg>
                      Full report
                    </span></>
                  )}
                </div>
              </div>
            </div>

            {/* Dimension bars */}
            <div className="mt-7 pt-6 border-t border-surface-100 grid sm:grid-cols-2 gap-4">
              {(["performance","trust","clarity","conversion"] as const).map((dim, i) => (
                <div key={dim} className={`animate-fade-up fill-both delay-${(i+1)*100}`}>
                  <ScoreBar dimension={dim} score={scores[dim]} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Screenshot panel ──────────────────────────────────────────── */}
          {screenshots?.captureSuccess && (
            <div className="animate-fade-up fill-both delay-200">
              <ScreenshotPanel screenshots={screenshots} />
            </div>
          )}

          {/* ── Quick wins ────────────────────────────────────────────────── */}
          <div className="animate-fade-up fill-both delay-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-500">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-surface-900">Top 3 quick wins</h2>
              </div>
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full font-medium">
                Highest impact first
              </span>
            </div>
            <div className="space-y-3.5">
              {quickWins.map((win, i) => (
                <div key={i} className={`animate-fade-up fill-both delay-${(i+1)*100}`}>
                  <QuickWinCard win={win} rank={i + 1} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Detailed sections ─────────────────────────────────────────── */}
          <div className="animate-fade-up fill-both delay-300">
            <h2 className="text-sm font-semibold text-surface-900 mb-4">Detailed analysis</h2>
            <div className="space-y-3">
              {(["performance","trust","clarity","conversion"] as const).map(dim => (
                <SectionInsightCard
                  key={dim}
                  dimension={dim}
                  score={scores[dim]}
                  insight={sectionInsights[dim]}
                  locked={!isPaid && (dim === "clarity" || dim === "conversion")}
                  onUnlock={() => setShowPayment(true)}
                />
              ))}
            </div>
          </div>

          {/* ── Unlock CTA ────────────────────────────────────────────────── */}
          {!isPaid && (
            <div className="animate-fade-up fill-both delay-400 card p-8 sm:p-10 border-brand-200 bg-gradient-to-br from-brand-50/50 via-white to-white text-center sm:text-left relative overflow-hidden mt-4">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-48 h-48 text-brand-900">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-surface-900 mb-2">Stop guessing. Start growing.</h3>
                  <p className="text-sm text-surface-600 mb-5 leading-relaxed max-w-lg mx-auto sm:mx-0">
                    Unlock your complete growth report to see the exact, prioritized changes needed to fix your conversion blockers and capture lost revenue.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button onClick={() => setShowPayment(true)} className="btn-primary px-8 h-12 w-full sm:w-auto shadow-xl shadow-brand-500/20">
                      Unlock full strategy — ₹{process.env.NEXT_PUBLIC_REPORT_PRICE_INR ?? "499"}
                    </button>
                    <p className="text-xs text-surface-400 font-medium">One-time investment • Lifetime access</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 pb-2">
            <Link href="/" className="btn-ghost text-xs">← Audit another website</Link>
            <p className="text-xs text-surface-300">
              Powered by <Link href="/" className="hover:text-surface-500 transition-colors">SiteCheck AI</Link>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>}>
      <ReportContent />
    </Suspense>
  );
}
