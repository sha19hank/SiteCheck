"use client";
import { useState } from "react";
import { RecommendationV2 } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Shared Layout Component
 * Ensures the Print and Interactive versions never visually diverge.
 */
function RecommendationCardLayout({ 
  rec, 
  expanded, 
  isInteractive, 
  onToggle 
}: { 
  rec: RecommendationV2, 
  expanded: boolean, 
  isInteractive: boolean, 
  onToggle?: () => void 
}) {
  const hasObservation = !!(rec.whatIsWrong || rec.problem || (rec.evidence && rec.evidence.length > 0));
  const hasDiagnosis = !!(rec.whyItMatters || rec.rootCauseDescription);
  const hasAction = !!(rec.recommendedSolution || rec.recommendedFix);
  const hasOutcome = !!(rec.expectedOutcome || rec.kpi?.metric || rec.businessImpact);

  if (!hasObservation && !hasAction && process.env.NODE_ENV === "development") {
    console.warn(`[RecommendationCard] Recommendation "${(rec as any).title || rec.whatIsWrong || rec.problem}" is missing both Observation and Action data. It may look incomplete.`);
  }

  const HeaderTag = isInteractive ? "button" : "div";
  const headerProps = isInteractive ? { onClick: onToggle } : {};

  return (
    <div id={isInteractive ? `rec-${rec.id || (rec as any).problem}` : undefined} className="mb-10 border-b border-slate-200 pb-8 last:border-0 last:pb-0">
      <HeaderTag 
        {...headerProps}
        className={cn(
          "w-full text-left flex flex-col sm:flex-row sm:items-start justify-between gap-4 group",
          isInteractive ? "focus:outline-none cursor-pointer" : ""
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest border px-2 py-0.5 rounded",
              rec.priority === "High" ? "border-rose-200 text-rose-700 bg-rose-50" :
              rec.priority === "Medium" ? "border-amber-200 text-amber-700 bg-amber-50" :
              "border-slate-200 text-slate-600 bg-slate-50"
            )}>
              {rec.priorityScore ? `Priority ${rec.priorityScore}` : `${rec.priority || 'Low'} Priority`}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-transparent">
              Impact: {rec.businessImpact || "High"}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-transparent">
              Effort: {rec.estimatedTime || rec.effortV2 || rec.effort || "Medium"}
            </span>
          </div>
          <h3 className={cn(
            "text-[1.1rem] sm:text-lg font-bold text-slate-900 leading-snug break-words transition-colors",
            isInteractive ? "group-hover:text-brand-700" : ""
          )}>
            {(rec as any).title || rec.whatIsWrong || (rec as any).problem}
          </h3>
        </div>
        
        {isInteractive && (
          <div className="shrink-0 pt-1">
            <span className="text-sm font-medium text-brand-600 group-hover:text-brand-800 transition-colors flex items-center gap-1">
              {expanded ? "Close details" : "Read recommendation"}
              <svg viewBox="0 0 20 20" fill="currentColor" className={cn("w-4 h-4 transition-transform duration-200", expanded ? "rotate-180" : "")}>
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        )}
      </HeaderTag>

      {expanded && (
        <div className={cn(
          "mt-6 pl-4 sm:pl-5 border-l-2 border-brand-200 space-y-6",
          isInteractive ? "animate-fade-up block" : "block"
        )}>
          <div className="space-y-6 prose prose-slate prose-sm sm:prose-base max-w-none">
            
            {hasObservation && (
              <div className="break-inside-avoid page-break-inside-avoid">
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-2 m-0">1. The Observation</h4>
                {(rec.whatIsWrong || rec.problem) && (
                  <p className="text-slate-700 leading-relaxed m-0">{rec.whatIsWrong || rec.problem}</p>
                )}
                
                {rec.evidence && rec.evidence.length > 0 && (
                  <div className="mt-3 bg-slate-50 border border-slate-100 p-3 sm:p-4 rounded-md">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Evidence</span>
                    <ul className="list-disc pl-4 space-y-1 text-sm text-slate-700 m-0">
                      {rec.evidence.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {hasDiagnosis && (
              <div className="break-inside-avoid page-break-inside-avoid">
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-2 m-0 mt-6">2. The Diagnosis</h4>
                {rec.whyItMatters && (
                  <p className="text-slate-700 leading-relaxed mb-2 m-0"><strong>Why it matters:</strong> {rec.whyItMatters}</p>
                )}
                {rec.rootCauseDescription && (
                  <p className="text-slate-700 leading-relaxed m-0"><strong>Root Cause:</strong> {rec.rootCauseDescription}</p>
                )}
              </div>
            )}

            {hasAction && (
              <div className="break-inside-avoid page-break-inside-avoid">
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-2 m-0 mt-6">3. The Strategic Action</h4>
                <p className="text-slate-900 font-medium leading-relaxed sm:text-lg border-l-[3px] border-brand-500 pl-3 sm:pl-4 py-0.5 m-0 whitespace-pre-wrap break-words">{rec.recommendedSolution || rec.recommendedFix}</p>
              </div>
            )}

            {hasOutcome && (
              <div className="break-inside-avoid page-break-inside-avoid">
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3 m-0 mt-6">4. Expected Business Impact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rec.expectedOutcome && (
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Expected Outcome</span>
                      <p className="text-slate-700 font-medium m-0 text-sm">{rec.expectedOutcome}</p>
                    </div>
                  )}
                  {(rec.kpi?.metric || rec.businessImpact) && (
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Success Metric (KPI)</span>
                      <p className="text-brand-700 font-medium m-0 text-sm">{rec.kpi?.metric || rec.businessImpact}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default function RecommendationCard({ rec }: { rec: RecommendationV2 }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className="print:hidden">
        <RecommendationCardLayout 
          rec={rec} 
          expanded={expanded} 
          isInteractive={true} 
          onToggle={() => setExpanded(!expanded)} 
        />
      </div>
      <div className="hidden print:block">
        <RecommendationCardLayout 
          rec={rec} 
          expanded={true} 
          isInteractive={false} 
        />
      </div>
    </>
  );
}
