import { sectionRegistry } from "../registry";
import { CompositionContext, ReportSection } from "@/types";

sectionRegistry.register({
  id: "roadmap-builder",
  name: "Actionable Roadmap",
  priority: 50,
  requiredPlan: "report_unlock",
  applicableWebsiteTypes: "ALL",
  minReportDepth: "STANDARD",
  generate: (context: CompositionContext): ReportSection | null => {
    const { recommendations, reasoningTraces } = context;

    if (!recommendations || recommendations.length === 0) {
      return null;
    }

    // Sort by priority tier, then confidence
    const sortedRecs = [...recommendations].sort((a, b) => {
      if (a.priorityTier !== b.priorityTier) return a.priorityTier.localeCompare(b.priorityTier || "");
      return (b.confidence || 0) - (a.confidence || 0);
    });

    // Bucket into 30 day vs 90 day based on effort
    const thirtyDay: any[] = [];
    const ninetyDay: any[] = [];

    for (const rec of sortedRecs) {
      const isHighEffort = rec.estimatedEffort === "High" || rec.estimatedEffort === "Very High";
      
      const item = {
        id: rec.id,
        title: rec.problem,
        description: rec.recommendedSolution,
        kpi: rec.kpi,
        expectedOutcome: rec.expectedOutcome,
        effort: rec.estimatedEffort,
        impact: rec.businessImpact,
        dependencies: rec.dependencies?.dependsOn || []
      };

      if (!isHighEffort && thirtyDay.length < 5) {
        thirtyDay.push(item);
      } else if (ninetyDay.length < 10) {
        ninetyDay.push(item);
      }
    }

    return {
      id: "roadmap-builder",
      type: "roadmap",
      title: "Implementation Roadmap",
      content: {
        thirtyDay,
        ninetyDay
      },
      metadata: {
        confidence: 90,
        evidenceCount: sortedRecs.length,
        generatedFrom: ["RecommendationEngine", "PrioritizationEngine"],
        reasoningSummary: "Sequenced recommendations based on priority, effort, and graph dependencies."
      }
    };
  }
});
