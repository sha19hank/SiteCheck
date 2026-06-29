import { ReportSection } from "@/types";
import SnapshotRenderer from "./SnapshotRenderer";
import ExecutiveSummaryRenderer from "./ExecutiveSummaryRenderer";
import RecommendationListRenderer from "./RecommendationListRenderer";
import RoadmapRenderer from "./RoadmapRenderer";
import OpportunityListRenderer from "./OpportunityListRenderer";
import ScoreBreakdownRenderer from "./ScoreBreakdownRenderer";
import PriorityMatrixRenderer from "./PriorityMatrixRenderer";
import EvidenceLedgerRenderer from "./EvidenceLedgerRenderer";
import AppendixRenderer from "./AppendixRenderer";
import MissingSection from "../MissingSection";

export default function DynamicSectionRenderer({ section }: { section: ReportSection }) {
  // If a section is intentionally suppressed due to low confidence,
  // or if its content is mysteriously empty for a list type, hide it entirely.
  const isListContent = Array.isArray(section.content);
  if (section.metadata?.confidence < 40 || (isListContent && section.content.length === 0)) {
    return null;
  }

  // Common wrapper to ensure anchor targets work for sticky nav
  const SectionWrapper = ({ children }: { children: React.ReactNode }) => (
    <div id={`section-${section.id}`} className="scroll-mt-32">
      {children}
    </div>
  );

  switch (section.type) {
    case "metrics":
      if (section.id === "audit-snapshot") {
        return (
          <SectionWrapper>
            <div className="mb-8 animate-fade-up">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">{section.title}</h2>
              {section.metadata?.reasoningSummary && (
                <p className="text-lg text-slate-700 leading-relaxed mb-10">{section.metadata.reasoningSummary}</p>
              )}
            </div>
            <SnapshotRenderer metrics={section.content} />
          </SectionWrapper>
        );
      }
      return <SectionWrapper><p>Generic metrics renderer not implemented.</p></SectionWrapper>;

    case "text":
      if (section.id === "executive-summary") {
        return <SectionWrapper><ExecutiveSummaryRenderer section={section} /></SectionWrapper>;
      }
      // Generic text fallback
      return (
        <SectionWrapper>
          <div className="animate-fade-up">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">{section.title}</h2>
            <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
              {typeof section.content === "string" ? section.content : JSON.stringify(section.content)}
            </div>
          </div>
        </SectionWrapper>
      );

    case "cards":
      if (section.id === "opportunities-section") {
        return <SectionWrapper><OpportunityListRenderer section={section} /></SectionWrapper>;
      }
      if (section.id === "score-breakdown") {
        return <SectionWrapper><ScoreBreakdownRenderer section={section} /></SectionWrapper>;
      }
      if (section.id === "priority-matrix") {
        return <SectionWrapper><PriorityMatrixRenderer section={section} /></SectionWrapper>;
      }
      return (
        <SectionWrapper>
          <RecommendationListRenderer section={section} />
        </SectionWrapper>
      );

    case "table":
      if (section.id === "evidence-ledger") {
        return <SectionWrapper><EvidenceLedgerRenderer section={section} /></SectionWrapper>;
      }
      if (section.id === "audit-appendix") {
        return <SectionWrapper><AppendixRenderer section={section} /></SectionWrapper>;
      }
      return (
        <SectionWrapper>
          <div className="p-4 border border-dashed border-amber-300 bg-amber-50 rounded-xl">
            <p className="text-amber-800 text-sm font-medium">Generic table renderer not implemented.</p>
          </div>
        </SectionWrapper>
      );

    case "roadmap":
    case "timeline":
      return (
        <SectionWrapper>
          <RoadmapRenderer section={section} />
        </SectionWrapper>
      );

    default:
      return (
        <SectionWrapper>
          <div className="p-4 border border-dashed border-amber-300 bg-amber-50 rounded-xl">
            <p className="text-amber-800 text-sm font-medium">Unknown section type: {section.type}</p>
          </div>
        </SectionWrapper>
      );
  }
}
