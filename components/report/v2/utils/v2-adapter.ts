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
    const hasFeatured = sections.some(s => s.id === "featured-recommendations");
    const hasStrategic = sections.some(s => s.id === "strategic-recommendations");
    
    // Find where to insert (before roadmap if it exists)
    const roadmapIndex = sections.findIndex(s => s.id === "roadmap-builder");
    
    const additions: ReportSection[] = [];

    // Always inject Featured (Top 3)
    if (!hasFeatured) {
      additions.push({
        id: "featured-recommendations",
        type: "cards",
        title: "Featured Recommendations",
        content: report.growthOpportunities.slice(0, 3),
        metadata: {
          confidence: report.reportConfidence?.metrics?.classificationConfidence ? Math.round(report.reportConfidence.metrics.classificationConfidence * 100) : 80,
          evidenceCount: Math.min(3, report.growthOpportunities.length),
          generatedFrom: ["OpportunityEngine", "RootCauseEngine"],
          reasoningSummary: "The top 3 priority recommendations to address immediately."
        }
      });
    }

    // Conditionally inject Strategic (All) if isPaid
    if (isPaid && !hasStrategic) {
      additions.push({
        id: "strategic-recommendations",
        type: "cards",
        title: "Strategic Recommendations",
        content: report.growthOpportunities,
        metadata: {
          confidence: report.reportConfidence?.metrics?.classificationConfidence ? Math.round(report.reportConfidence.metrics.classificationConfidence * 100) : 80,
          evidenceCount: report.growthOpportunities.length,
          generatedFrom: ["OpportunityEngine", "RootCauseEngine"],
          reasoningSummary: "The complete, prioritized catalogue of all recommendations."
        }
      });
    }

    if (roadmapIndex !== -1) {
      sections.splice(roadmapIndex, 0, ...additions);
    } else {
      sections.push(...additions);
    }
  }

  return sections;
}
