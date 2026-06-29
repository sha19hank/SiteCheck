import React from "react";
import { ReportSection } from "@/types";

export default function OpportunityListRenderer({ section }: { section: ReportSection }) {
  const content = section.content as any[];
  if (!content || !Array.isArray(content) || content.length === 0) return null;

  return (
    <div className="animate-fade-up">
      <div className="mb-8 page-break-inside-avoid">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">{section.title}</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {content.map((opp, idx) => (
          <div key={idx} className="card p-6 border border-slate-200 bg-white page-break-inside-avoid">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-1 rounded">
                {opp.type || "Opportunity"}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{opp.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed m-0">{opp.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
