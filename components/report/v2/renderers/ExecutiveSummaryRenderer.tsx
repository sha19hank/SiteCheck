import { ReportSection } from "@/types";

export default function ExecutiveSummaryRenderer({ section }: { section: ReportSection }) {
  // Executive summary content is structured text blocks
  const content = section.content as any;
  if (!content) return null;

  return (
    <div className="animate-fade-up">
      <div className="mb-8 page-break-inside-avoid">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">{section.title}</h2>
      </div>

      <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed">
        {content.growthStage && (
          <div className="mb-6 page-break-inside-avoid">
            <div className="font-bold text-slate-900 mb-1">
              Growth Score: {content.growthScore}
            </div>
            <div className="font-bold text-slate-900 mb-2">
              Growth Stage: {content.growthStage}
            </div>
            <p className="m-0 text-base">{content.growthStageExplanation}</p>
          </div>
        )}

        {content.currentState && (
          <p>{content.currentState}</p>
        )}
        
        {content.topStrength && (
          <p>
            <strong>Primary Strength:</strong> {content.topStrength}
          </p>
        )}
        
        {content.bottleneck && (
          <p>
            <strong>Critical Bottleneck:</strong> {content.bottleneck}
          </p>
        )}

        {content.opportunity && (
          <p>
            <strong>Key Opportunity:</strong> {content.opportunity}
          </p>
        )}

        {content.conclusion && (
          <p className="font-medium text-slate-900 border-l-4 border-brand-600 pl-4 mt-8 py-1">
            <strong>First Action:</strong> {content.conclusion}
          </p>
        )}
      </div>
    </div>
  );
}
