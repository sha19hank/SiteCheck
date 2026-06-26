"use client";
import { useState } from "react";
import type { SectionInsight, DimensionScore } from "@/types";
import { scoreToHex, scoreToLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-rose-500",
  high:     "bg-amber-500",
  medium:   "bg-amber-400",
  low:      "bg-surface-400",
  pass:     "bg-emerald-500",
};

const ICONS: Record<string, React.ReactNode> = {
  performance: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>
  ),
  trust: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
    </svg>
  ),
  clarity: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 6.253v13m-3-2.252c.064.566.273 1.12.615 1.567.342.447.804.8 1.385.978 1.33.4 2.72-.13 3.615-1.14.372-.42.657-.916.84-1.44M15.75 3C15.332 1.776 13.797 1 12 1c-1.797 0-3.332.776-3.75 2M4.5 7.5h11M4.5 12h11M4.5 16.5h11"/>
    </svg>
  ),
  conversion: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/>
    </svg>
  ),
};

interface SectionInsightCardProps {
  insight:     SectionInsight | null;
  score:       DimensionScore;
  dimension:   string;
  locked?:     boolean;
  onUnlock?:   () => void;
  forceExpanded?: boolean;
}

export default function SectionInsightCard({
  insight, score, dimension, locked = false, onUnlock, forceExpanded = false
}: SectionInsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isExpanded = expanded || forceExpanded;
  const color = scoreToHex(score.score);
  const label = scoreToLabel(score.score);
  const dimLabel = dimension.charAt(0).toUpperCase() + dimension.slice(1);

  const issues  = score.findings.filter(f => f.severity !== "pass");
  const passing = score.findings.filter(f => f.severity === "pass");

  const isDevUnlocked = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_DEV_UNLOCK_ALL === "true";
  const isEffectivelyLocked = locked && !isDevUnlocked;

  return (
    <div className="card overflow-hidden print:break-inside-avoid">
      {/* Header — always visible */}
      <button
        className={cn(
          "w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors duration-150",
          isEffectivelyLocked ? "hover:bg-surface-50 cursor-pointer" : "hover:bg-surface-50"
        )}
        onClick={() => {
          if (isEffectivelyLocked) {
            onUnlock?.();
          } else {
            console.log(`[Accordion] Toggled dimension: ${dimension}, new state: ${!expanded}`);
            setExpanded(!expanded);
          }
        }}
        aria-expanded={isEffectivelyLocked ? false : isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, color }}>
            {ICONS[dimension]}
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-900">
              {dimLabel}
              {isDevUnlocked && locked && <span className="ml-2 text-[10px] bg-rose-100 text-rose-600 px-1 py-0.5 rounded uppercase font-bold tracking-widest">DEV UNLOCKED</span>}
            </p>
            {insight?.keyFinding && !isEffectivelyLocked && (
              <p className="text-xs text-surface-500 mt-0.5 max-w-xs truncate">{insight.keyFinding}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-lg font-bold" style={{ color }}>{Math.round(score.score)}</span>
            <span className="text-surface-400 text-sm">/100</span>
          </div>
          <span
            className="hidden sm:inline text-xs px-2.5 py-1 rounded-full font-medium border"
            style={{ background: `${color}15`, color, borderColor: `${color}30` }}
          >
            {label}
          </span>

          {isEffectivelyLocked ? (
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-surface-400">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="currentColor" className={cn("w-4 h-4 text-surface-400 transition-transform duration-200", isExpanded && "rotate-180")}>
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          )}
        </div>
      </button>

      {/* Body */}
      {!isEffectivelyLocked && isExpanded && (
        <div className="border-t border-surface-100 p-5 sm:p-6 space-y-5">
          {/* Summary */}
          {insight?.summary && (
            <p className="text-sm text-surface-600 leading-relaxed">{insight.summary}</p>
          )}

          {/* Issues */}
          {issues.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                What needs attention
              </p>
              <div className="space-y-2.5">
                {issues.map((f, i) => (
                  <div key={i} className="flex flex-col border border-slate-100 rounded bg-slate-50 p-3 space-y-1">
                    <div className="flex gap-3">
                      <div className={cn("w-2 h-2 rounded-full shrink-0 mt-1.5", SEVERITY_DOT[f.severity])} />
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {f.title ?? f.id.replace(/_/g, " ")}
                        </p>
                        {f.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{f.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passing */}
          {passing.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                What&rsquo;s working well
              </p>
              <div className="space-y-2">
                {passing.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0 mt-1.5 bg-emerald-500" />
                    <p className="text-sm text-surface-600">
                      {insight?.positives?.[i] ?? (f.title || f.id.replace(/_/g, " "))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Locked overlay */}
      {isEffectivelyLocked && (
        <div
          className="border-t border-surface-100 px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-surface-50 transition-colors group"
          onClick={onUnlock}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm" aria-hidden="true">🔒</span>
            <p className="text-sm font-medium text-surface-800">
              {issues.length > 0 
                ? `${issues.length} high-impact ${dimension} ${issues.length === 1 ? 'blocker' : 'blockers'} found`
                : `Hidden ${dimension} insights and AI analysis`}
            </p>
          </div>
          <span className="text-xs font-semibold text-brand-600 group-hover:text-brand-700 transition-colors shrink-0 print:hidden">
            Unlock to view →
          </span>
        </div>
      )}
    </div>
  );
}
