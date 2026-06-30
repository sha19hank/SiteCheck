import React from "react";
import { ReportSection } from "@/types";

export default function TimelineRenderer({ section }: { section?: ReportSection }) {
  const content = section?.content as any;
  
  if (!content || !content.timeline || !Array.isArray(content.timeline) || content.timeline.length === 0) {
    return (
      <div className="animate-fade-up">
        <div className="mb-10 page-break-inside-avoid">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Website in 60 Seconds</h2>
          <div className="p-6 border border-dashed border-slate-300 bg-slate-50 rounded-xl text-slate-600 leading-relaxed">
            Unable to generate the 60 Second Assessment for this audit.
          </div>
        </div>
      </div>
    );
  }

  const { verdict, biggestRisk, timeline } = content;

  return (
    <div className="animate-fade-up">
      <div className="mb-10 page-break-inside-avoid">
        <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Website in 60 Seconds</h2>
        <p className="text-lg text-slate-700 leading-relaxed">
          {content.intro || "A consultant's perspective on the immediate visitor experience, evaluating initial friction, trust, and clarity."}
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm page-break-inside-avoid">
        {/* Executive Summary Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 sm:p-8">
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Overall Verdict</span>
              <span className="text-xl font-bold text-slate-900">{verdict === "STRONG" ? "Strong Foundation" : "High Friction"}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Biggest Weakness</span>
              <span className="text-xl font-bold text-slate-900">{biggestRisk || "Conversion bottlenecks detected"}</span>
            </div>
          </div>
        </div>

        {/* Detailed Consultant Notes */}
        <div className="p-6 sm:p-8 space-y-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-2">Consultant Assessment Notes</h3>
          
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
            {timeline.map((item: any, idx: number) => (
              <div key={idx} className="page-break-inside-avoid">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.timeframe}</span>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{item.focus}</span>
                </div>
                <p className="text-slate-800 font-medium mb-1 leading-snug">{item.observation}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{item.verdict}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
