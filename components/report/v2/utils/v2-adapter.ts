import { ConsultantReport, ReportSection } from "@/types";

/**
 * The V2 Adapter Layer.
 * 
 * Responsibilities:
 * - Normalize legacy backend data (like root-level growthOpportunities) into the new ReportSection architecture.
 * - Expose it for the UI renderer.
 * 
 * This layer does NOT:
 * - Generate intelligence.
 * - Calculate priorities.
 * - Rewrite recommendations.
 * - Decide business order.
 */
export function injectVirtualSections(report: ConsultantReport, isPaid: boolean): ReportSection[] {
  const sections = [...(report.reportSections || [])];

  if (report.growthOpportunities && report.growthOpportunities.length > 0) {
    const hasRecommendationsSection = sections.some(s => s.id === "actionable-recommendations" || s.id === "featured-recommendations");
    
    if (!hasRecommendationsSection) {
      // Find the index of the roadmap so we can insert right before it if it exists
      const roadmapIndex = sections.findIndex(s => s.id === "roadmap-builder");
      
      const recommendations = isPaid 
        ? report.growthOpportunities 
        : report.growthOpportunities.slice(0, 3);
        
      const recommendationsSection: ReportSection = {
        id: isPaid ? "actionable-recommendations" : "featured-recommendations",
        type: "cards",
        title: isPaid ? "Complete Strategic Recommendations" : "Featured Recommendations",
        content: recommendations,
        metadata: {
          confidence: report.reportConfidence?.metrics?.classificationConfidence ? Math.round(report.reportConfidence.metrics.classificationConfidence * 100) : 80,
          evidenceCount: recommendations.length,
          generatedFrom: ["OpportunityEngine", "RootCauseEngine"],
          reasoningSummary: "Prioritized strategic recommendations directly extracted from the Consultant Engine's root cause and opportunity analysis."
        }
      };

      if (roadmapIndex !== -1) {
        sections.splice(roadmapIndex, 0, recommendationsSection);
      } else {
        sections.push(recommendationsSection);
      }
    }
  }

  return sections;
}
