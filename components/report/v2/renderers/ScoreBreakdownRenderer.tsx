import React from "react";
import { ReportSection } from "@/types";
import { cn } from "@/lib/utils";

export default function ScoreBreakdownRenderer({ section }: { section: ReportSection }) {
  const content = section.content as any[];
  if (!content || !Array.isArray(content) || content.length === 0) return null;

  return (
    <div className="animate-fade-up">
      <div className="mb-8 page-break-inside-avoid">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">{section.title}</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {content.map((dim, idx) => (
          <div key={idx} className="card p-6 border border-slate-200 bg-white page-break-inside-avoid flex items-center gap-6">
            <div className="shrink-0 flex items-center justify-center relative">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={`${(dim.score / 100) * (2 * Math.PI * 28)} 999`}
                  className={cn(
                    dim.score >= 80 ? "text-emerald-500" :
                    dim.score >= 50 ? "text-amber-500" :
                    "text-rose-500"
                  )}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-900">
                {dim.score}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1 leading-snug">{dim.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed m-0">{dim.explanation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
