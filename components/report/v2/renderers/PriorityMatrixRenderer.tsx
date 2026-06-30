import React from "react";
import { ReportSection } from "@/types";

export default function PriorityMatrixRenderer({ section }: { section?: ReportSection }) {
  const content = section?.content as any[];
  if (!content || !Array.isArray(content) || content.length === 0) {
    return (
      <div className="animate-fade-up">
        <div className="mb-10 page-break-inside-avoid">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Opportunity Prioritization</h2>
          <div className="p-6 border border-dashed border-slate-300 bg-slate-50 rounded-xl text-slate-600 leading-relaxed">
            The opportunity prioritization matrix could not be generated.
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
          High-level prioritization based on expected business impact and implementation effort.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
        {content.map((cat, idx) => (
          <div key={idx} className="page-break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-900 mb-1 leading-snug">{cat.category}</h3>
            <p className="text-xs font-medium text-slate-500 mb-4">{cat.description}</p>
            
            <ul className="space-y-3 m-0 p-0 list-none">
              {cat.items.map((item: string, itemIdx: number) => (
                <li key={itemIdx} className="text-sm text-slate-700 flex items-start gap-3">
                  <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5" />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
