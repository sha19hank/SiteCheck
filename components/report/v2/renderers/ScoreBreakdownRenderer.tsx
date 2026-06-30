import React from "react";
import { ReportSection } from "@/types";
import { cn } from "@/lib/utils";

export default function ScoreBreakdownRenderer({ section }: { section?: ReportSection }) {
  const content = section?.content as any[];
  if (!content || !Array.isArray(content) || content.length === 0) {
    return (
      <div className="animate-fade-up">
        <div className="mb-10 page-break-inside-avoid">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Growth Score Breakdown</h2>
          <div className="p-6 border border-dashed border-slate-300 bg-slate-50 rounded-xl text-slate-600 leading-relaxed">
            The growth score breakdown could not be generated.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-10 page-break-inside-avoid">
        <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">{section?.title}</h2>
        <p className="text-lg text-slate-700 leading-relaxed">
          This section explains how your overall Growth Score was calculated.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
        {content.map((dim, idx) => (
          <div key={idx} className="page-break-inside-avoid flex items-start gap-6">
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
            <div className="pt-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{dim.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed m-0">{dim.explanation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
