import React from "react";
import { ReportSection, RecommendationV2 } from "@/types";
import RecommendationCard from "../RecommendationCard";

export default function StrategicRecommendationRenderer({ section }: { section?: ReportSection }) {
  const cards = section?.content as RecommendationV2[];
  
  if (!cards || !Array.isArray(cards) || cards.length === 0) {
    return (
      <div className="animate-fade-up">
        <div className="mb-10 page-break-inside-avoid">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Strategic Recommendations</h2>
          <div className="p-6 border border-dashed border-slate-300 bg-slate-50 rounded-xl text-slate-600 leading-relaxed">
            No strategic recommendations were generated for this audit.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-10 page-break-inside-avoid">
        <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">{section?.title || "Strategic Recommendations"}</h2>
        {section?.metadata?.reasoningSummary ? (
          <p className="text-lg text-slate-700 leading-relaxed">{section.metadata.reasoningSummary}</p>
        ) : (
          <p className="text-lg text-slate-700 leading-relaxed">The complete consultant playbook to fix the identified issues and drive growth.</p>
        )}
      </div>

      <div className="space-y-4">
        {cards.map((card, index) => {
          // If the backend object lacks an ID, create a deterministic key
          const safeKey = card.id || `rec-${index}-${(card.whatIsWrong || card.problem || "").substring(0, 15).replace(/\s+/g, '-')}`;
          return <RecommendationCard key={safeKey} rec={card} />;
        })}
      </div>
    </div>
  );
}
