import { sectionRegistry } from "../registry";
import { CompositionContext, ReportSection } from "@/types";

sectionRegistry.register({
  id: "growth-bottleneck",
  name: "Growth Bottleneck Analysis",
  priority: 90,
  requiredPlan: "report_unlock",
  applicableWebsiteTypes: "ALL",
  minReportDepth: "STANDARD",
  generate: (context: CompositionContext): ReportSection | null => {
    const { reasoningTraces } = context;
    const topRootCause = reasoningTraces.rootCauses?.[0];

    if (!topRootCause) {
      return null;
    }

    const impactEstimate = "Significant conversion loss";

    const content = {
      intro: "YOUR #1 GROWTH BOTTLENECK",
      bottleneck: topRootCause.title,
      description: `This single issue is responsible for a significant portion of your conversion loss. Here's the chain:\n\n${topRootCause.title} → Cascading Symptoms → Lost Customers`,
      actionableAdvice: "If you fix nothing else from this report, fix this.",
      expectedImpact: impactEstimate,
      effortRequired: "Medium",
      timeToResults: "30-60 days"
    };

    return {
      id: "growth-bottleneck",
      type: "cards",
      title: "Growth Bottleneck Analysis",
      content,
      metadata: {
        confidence: 80,
        evidenceCount: topRootCause.affectedGapIds.length,
        generatedFrom: ["RootCauseEngine"],
        reasoningSummary: "Extracted the highest-confidence root cause that connects the most downstream symptoms."
      }
    };
  }
});
