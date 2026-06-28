import { sectionRegistry } from "../registry";
import { CompositionContext, ReportSection } from "@/types";

sectionRegistry.register({
  id: "opportunities-section",
  name: "Growth Opportunities",
  priority: 60,
  requiredPlan: "report_unlock",
  applicableWebsiteTypes: "ALL",
  minReportDepth: "STANDARD",
  generate: (context: CompositionContext): ReportSection | null => {
    const { reasoningTraces } = context;

    if (!reasoningTraces.opportunities || reasoningTraces.opportunities.length === 0) {
      return null;
    }

    const content = reasoningTraces.opportunities.map(opp => ({
      title: opp.title,
      description: opp.description,
      impact: "High",
      effort: "Medium",
      type: opp.category
    }));

    return {
      id: "opportunities-section",
      type: "cards",
      title: "Growth Opportunities",
      content,
      metadata: {
        confidence: 70,
        evidenceCount: reasoningTraces.opportunities.length,
        generatedFrom: ["OpportunityEngine"],
        reasoningSummary: "Extracted forward-looking growth opportunities based on underleveraged assets."
      }
    };
  }
});
