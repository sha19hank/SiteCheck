import { sectionRegistry } from "../registry";
import { CompositionContext, ReportSection } from "@/types";

sectionRegistry.register({
  id: "priority-matrix",
  name: "Opportunity Prioritization",
  priority: 65,
  requiredPlan: "report_unlock",
  applicableWebsiteTypes: "ALL",
  minReportDepth: "STANDARD",
  generate: (context: CompositionContext): ReportSection | null => {
    const { priorityMatrix } = context;
    if (!priorityMatrix) return null;

    const matrixData = [
      {
        category: "Quick Wins",
        description: "High Impact, Low Effort. Do these immediately.",
        items: priorityMatrix.immediateWins.map(i => i.problem)
      },
      {
        category: "High Impact",
        description: "High Impact, High Effort. Plan these as strategic projects.",
        items: priorityMatrix.strategicProjects.map(i => i.problem)
      },
      {
        category: "Foundation Improvements",
        description: "Low Impact, Low Effort. Good for maintenance.",
        items: priorityMatrix.optionalImprovements.map(i => i.problem)
      },
      {
        category: "Long-Term Growth",
        description: "Low Impact, High Effort. Deprioritize for now.",
        items: priorityMatrix.deprioritize.map(i => i.problem)
      }
    ].filter(cat => cat.items.length > 0); // Only show non-empty categories

    if (matrixData.length === 0) return null;

    return {
      id: "priority-matrix",
      type: "cards",
      title: "Opportunity Prioritization",
      content: matrixData,
      metadata: {
        confidence: 100,
        evidenceCount: matrixData.reduce((acc, cat) => acc + cat.items.length, 0),
        generatedFrom: ["PriorityMatrix"],
        reasoningSummary: "Strategic categorization of recommendations based on estimated ROI."
      }
    };
  }
});
