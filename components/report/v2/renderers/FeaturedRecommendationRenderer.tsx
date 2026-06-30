import React from "react";
import { ReportSection, RecommendationV2 } from "@/types";
import { cn } from "@/lib/utils";

function FeaturedRecommendationCard({ rec }: { rec: RecommendationV2 }) {
  return (
    <div className="mb-10 border-b border-slate-200 pb-8 last:border-0 last:pb-0 page-break-inside-avoid">
      <div className="w-full text-left flex flex-col sm:flex-row sm:items-start justify-between gap-4">
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
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-transparent px-2 py-0.5">
              Impact: {rec.businessImpact || "High"}
            </span>
          </div>
          <h3 className="text-[1.1rem] sm:text-lg font-bold text-slate-900 leading-snug break-words">
            {(rec as any).title || rec.whatIsWrong || (rec as any).problem}
          </h3>
        </div>
      </div>

      <div className="mt-4 pl-4 sm:pl-5 border-l-2 border-brand-200 space-y-4">
        <p className="text-slate-700 leading-relaxed text-sm sm:text-base m-0">
          {rec.recommendedSolution || rec.recommendedFix || rec.whyItMatters}
        </p>

        <div className="pt-2 print:hidden">
          <a href="#upgrade-wall" className="text-xs font-semibold text-brand-600 hover:text-brand-800 hover:underline underline-offset-4 flex items-center gap-1">
            Read full strategy 
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 ml-1"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedRecommendationRenderer({ section }: { section?: ReportSection }) {
  const cards = section?.content as RecommendationV2[];
  
  if (!cards || !Array.isArray(cards) || cards.length === 0) {
    return (
      <div className="animate-fade-up">
        <div className="mb-10 page-break-inside-avoid">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Featured Recommendations</h2>
          <div className="p-6 border border-dashed border-slate-300 bg-slate-50 rounded-xl text-slate-600 leading-relaxed">
            No featured recommendations could be generated for this audit.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-10 page-break-inside-avoid">
        <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">{section?.title || "Featured Recommendations"}</h2>
        {section?.metadata?.reasoningSummary && (
          <p className="text-lg text-slate-700 leading-relaxed">{section.metadata.reasoningSummary}</p>
        )}
      </div>

      <div className="space-y-4">
        {cards.slice(0, 3).map((card, index) => {
          const safeKey = card.id || `featured-${index}-${(card.whatIsWrong || card.problem || "").substring(0, 15).replace(/\s+/g, '-')}`;
          return <FeaturedRecommendationCard key={safeKey} rec={card} />;
        })}
      </div>
    </div>
  );
}
