import React from "react";
import { ReportSection } from "@/types";
import { cn } from "@/lib/utils";

export default function EvidenceLedgerRenderer({ section }: { section: ReportSection }) {
  const content = section.content as any[];
  if (!content || !Array.isArray(content) || content.length === 0) return null;

  return (
    <div className="animate-fade-up">
      <div className="mb-8 page-break-inside-avoid">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">{section.title}</h2>
      </div>

      <div className="space-y-4">
        {content.map((item, idx) => (
          <div key={idx} className="card p-6 border border-slate-200 bg-white page-break-inside-avoid">
            <div className="flex flex-col sm:flex-row gap-6">
              
              {/* Left Column: Finding & Source */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    Observation
                  </span>
                  <span className="text-xs font-medium text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    Source: {item.source}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 leading-snug">{item.finding}</h3>
              </div>
              
              {/* Right Column: Impact & Related Rec */}
              <div className="sm:w-1/3 shrink-0 flex flex-col gap-3 sm:border-l sm:border-slate-100 sm:pl-6">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Business Effect</div>
                  <p className="text-sm text-slate-700 m-0 leading-snug">{item.impact}</p>
                </div>
                
                {item.relatedRecommendation && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-brand-600 mb-1 flex items-center gap-1">
                      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M3.75 3.5a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-4.19l4.72 4.72a.75.75 0 01-1.06 1.06L5.25 5.31v4.19a.75.75 0 01-1.5 0v-6z" clipRule="evenodd"/></svg>
                      Related Recommendation
                    </div>
                    <p className="text-sm font-medium text-brand-900 m-0 leading-snug">{item.relatedRecommendation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
