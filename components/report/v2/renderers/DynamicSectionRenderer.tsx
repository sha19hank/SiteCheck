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

import RootCauseRenderer from "./RootCauseRenderer";

import TimelineRenderer from "./TimelineRenderer";
import FeaturedRecommendationRenderer from "./FeaturedRecommendationRenderer";
import StrategicRecommendationRenderer from "./StrategicRecommendationRenderer";

export default function DynamicSectionRenderer({ section, targetId, targetTitle }: { section?: ReportSection, targetId: string, targetTitle: string }) {
  const SectionWrapper = ({ children }: { children: React.ReactNode }) => (
    <div id={`section-${targetId}`} className="scroll-mt-32">
      {children}
    </div>
  );

  switch (targetId) {
    case "audit-snapshot":
      return <SectionWrapper><SnapshotRenderer metrics={section?.content} /></SectionWrapper>;
    case "executive-summary":
      return <SectionWrapper><ExecutiveSummaryRenderer section={section} /></SectionWrapper>;
    case "60-second-assessment":
      return <SectionWrapper><TimelineRenderer section={section} /></SectionWrapper>;
    case "opportunities-section":
      return <SectionWrapper><OpportunityListRenderer section={section} /></SectionWrapper>;
    case "featured-recommendations":
      return <SectionWrapper><FeaturedRecommendationRenderer section={section} /></SectionWrapper>;
    case "score-breakdown":
      return <SectionWrapper><ScoreBreakdownRenderer section={section} /></SectionWrapper>;
    case "evidence-ledger":
      return <SectionWrapper><EvidenceLedgerRenderer section={section} /></SectionWrapper>;
    case "root-cause-narrative":
      return <SectionWrapper><RootCauseRenderer section={section} /></SectionWrapper>;
    case "priority-matrix":
      return <SectionWrapper><PriorityMatrixRenderer section={section} /></SectionWrapper>;
    case "strategic-recommendations":
      return <SectionWrapper><StrategicRecommendationRenderer section={section} /></SectionWrapper>;
    case "roadmap-builder":
      return <SectionWrapper><RoadmapRenderer section={section} /></SectionWrapper>;
    case "audit-appendix":
      return <SectionWrapper><AppendixRenderer section={section} /></SectionWrapper>;
    default:
      return (
        <SectionWrapper>
          <div className="p-4 border border-dashed border-amber-300 bg-amber-50 rounded-xl">
            <p className="text-amber-800 text-sm font-medium">Unknown section: {targetId}</p>
          </div>
        </SectionWrapper>
      );
  }
}
