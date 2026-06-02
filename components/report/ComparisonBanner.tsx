"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { scoreToHex, formatDate } from "@/lib/utils";
import type { ComparisonResult } from "@/types";

interface ComparisonBannerProps {
  domain:      string;
  currentId:   string;
  shareToken:  string;
}

function DeltaChip({ delta }: { delta: number }) {
  if (Math.abs(delta) <= 2) {
    return <span className="text-xs text-surface-400 font-medium">±{Math.abs(delta)}</span>;
  }
  const improved = delta > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
      improved ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
    }`}>
      {improved ? "▲" : "▼"} {Math.abs(delta)}
    </span>
  );
}

export default function ComparisonBanner({ domain, currentId }: ComparisonBannerProps) {
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    fetch(`/api/compare?domain=${encodeURIComponent(domain)}&current=${currentId}`)
      .then(r => r.json() as Promise<{ comparison: ComparisonResult | null }>)
      .then(d => { setComparison(d.comparison); setLoading(false); })
      .catch(() => setLoading(false));
  }, [domain, currentId]);

  if (loading || !comparison) return null;

  const overallDelta = comparison.scoreDelta.overall;
  const improved     = overallDelta > 2;
  const declined     = overallDelta < -2;

  return (
    <div className={`rounded-2xl border p-4 mb-6 animate-fade-in ${
      improved ? "bg-emerald-50 border-emerald-200" :
      declined ? "bg-rose-50 border-rose-200" :
                 "bg-surface-50 border-surface-200"
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-surface-900">
              {improved ? "📈 Score improved since last audit" :
               declined ? "📉 Score declined since last audit" :
                          "↔️ Score unchanged since last audit"}
            </span>
            {Math.abs(overallDelta) > 2 && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                improved ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              }`}>
                {improved ? "+" : ""}{overallDelta} points
              </span>
            )}
          </div>
          <p className="text-xs text-surface-500">
            Compared to audit from {formatDate(comparison.previousDate)}
          </p>
        </div>
      </div>

      {/* Score deltas grid */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(["performance","trust","clarity","conversion"] as const).map(dim => {
          const delta     = comparison.scoreDelta[dim];
          const prevScore = comparison.previousScores[dim];
          const currScore = comparison.currentScores[dim];
          const color     = scoreToHex(currScore);

          return (
            <div key={dim} className="bg-white/80 rounded-xl p-2.5 border border-white">
              <p className="text-xs text-surface-500 capitalize mb-1">{dim}</p>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold" style={{ color }}>{Math.round(currScore)}</span>
                <DeltaChip delta={delta} />
              </div>
              <p className="text-xs text-surface-400 mt-0.5">was {Math.round(prevScore)}</p>
            </div>
          );
        })}
      </div>

      {comparison.improved.length > 0 && (
        <p className="text-xs text-emerald-700 mt-3">
          ✓ Improved: {comparison.improved.join(", ")}
        </p>
      )}
    </div>
  );
}
