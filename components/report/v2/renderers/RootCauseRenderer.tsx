import React from "react";
import { ReportSection } from "@/types";

export default function RootCauseRenderer({ section }: { section?: ReportSection }) {
  const content = section?.content as any[];
  
  if (!content || !Array.isArray(content) || content.length === 0) {
    return (
      <div className="animate-fade-up">
        <div className="mb-10 page-break-inside-avoid">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Root Cause Analysis</h2>
          <div className="p-6 border border-dashed border-slate-300 bg-slate-50 rounded-xl text-slate-600 leading-relaxed">
            No dominant systemic root cause was identified for this website. The detected issues appear isolated rather than being driven by one underlying issue.
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
          This section explains why the identified issues exist, not just what they are.
        </p>
      </div>

      <div className="space-y-8">
        {content.map((rc, idx) => (
          <div key={idx} className="border-l-[3px] border-amber-500 pl-6 py-2 page-break-inside-avoid">
            <h3 className="text-xl font-bold text-slate-900 mb-3">{rc.title}</h3>
            <p className="text-slate-700 leading-relaxed mb-4">{rc.description || rc.narrative}</p>
            
            {rc.relatedRecommendations && rc.relatedRecommendations.length > 0 && (
              <div className="mt-4">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Affected Recommendations</span>
                <ul className="space-y-2 m-0 p-0 list-none">
                  {rc.relatedRecommendations.map((rec: any, rIdx: number) => (
                    <li key={rIdx} className="text-sm">
                      <a href={`#rec-${rec.id}`} className="text-brand-600 hover:text-brand-700 font-medium hover:underline underline-offset-4 flex items-center gap-1">
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M3.75 3.5a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-4.19l4.72 4.72a.75.75 0 01-1.06 1.06L5.25 5.31v4.19a.75.75 0 01-1.5 0v-6z" clipRule="evenodd"/></svg>
                        {rec.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
