import { sectionRegistry } from "../registry";
import { CompositionContext, ReportSection } from "@/types";

sectionRegistry.register({
  id: "root-cause-narrative",
  name: "Root Cause Analysis",
  priority: 70,
  requiredPlan: "report_unlock",
  applicableWebsiteTypes: "ALL",
  minReportDepth: "STANDARD",
  generate: (context: CompositionContext): ReportSection | null => {
    const { reasoningTraces, recommendations } = context;

    if (!reasoningTraces.rootCauses || reasoningTraces.rootCauses.length === 0) {
      return null;
    }

    const narratives = reasoningTraces.rootCauses.map(rc => {
      // Find all recommendations that are linked to this root cause
      const linkedRecs = recommendations.filter(r => r.relatedFindings?.includes(rc.id) || r.whatIsWrong.includes(rc.title));
      
      return {
        rootCauseId: rc.id,
        title: rc.title,
        description: rc.description,
        symptomCount: rc.affectedGapIds.length,
        narrative: `We identified "${rc.title}" as the underlying issue causing ${rc.affectedGapIds.length} related problems across your site.`,
        relatedRecommendations: linkedRecs.map(r => ({
          id: r.id,
          title: r.problem,
          impact: r.businessImpact,
        })),
        confidence: 85
      };
    });

    return {
      id: "root-cause-narrative",
      type: "cards",
      title: "Core Problems & Root Causes",
      content: narratives,
      metadata: {
        confidence: narratives.reduce((sum, n) => sum + n.confidence, 0) / narratives.length,
        evidenceCount: narratives.reduce((sum, n) => sum + n.symptomCount, 0),
        generatedFrom: ["RootCauseEngine"],
        reasoningSummary: "Consolidated isolated findings into grouped business problems."
      }
    };
  }
});
