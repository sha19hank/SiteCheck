import { ReportSection, RecommendationV2 } from "@/types";
import RecommendationCard from "../RecommendationCard";

export default function RecommendationListRenderer({ section }: { section: ReportSection }) {
  const cards = section.content as RecommendationV2[];
  
  if (!cards || !Array.isArray(cards) || cards.length === 0) return null;

  return (
    <div className="animate-fade-up">
      <div className="mb-12 page-break-inside-avoid">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">{section.title}</h2>
        {section.metadata?.reasoningSummary && (
          <p className="text-lg text-slate-700 leading-relaxed">{section.metadata.reasoningSummary}</p>
        )}
      </div>

      <div className="space-y-4">
        {cards.map((card, index) => {
          // If the backend object lacks an ID (e.g., legacy ActionableInsight), create a deterministic key
          const safeKey = card.id || `rec-${index}-${(card.whatIsWrong || card.problem || "").substring(0, 15).replace(/\s+/g, '-')}`;
          return <RecommendationCard key={safeKey} rec={card} />;
        })}
      </div>
    </div>
  );
}
