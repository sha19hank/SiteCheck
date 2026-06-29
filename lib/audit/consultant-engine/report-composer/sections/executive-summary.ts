import { sectionRegistry } from "../registry";
import { CompositionContext, ReportSection } from "@/types";

sectionRegistry.register({
  id: "executive-summary",
  name: "Executive Summary",
  priority: 99, // Second highest priority, just after Audit Snapshot
  requiredPlan: "free",
  applicableWebsiteTypes: "ALL",
  minReportDepth: "BASIC",
  dependencies: ["audit-snapshot"], // Typically relies on snapshot being present logically, though not strictly code-wise
  generate: (context: CompositionContext): ReportSection | null => {
    const { businessContext, reasoningTraces, gaps, reportDepth } = context;

    // Build Current State narrative
    let currentState = `This ${businessContext.websiteType || "business"} website is currently functioning at a ${context.classification.confidenceTier === "HIGH" ? "clear" : "developing"} baseline. `;
    if (businessContext.targetAudience) {
      currentState += `It targets ${businessContext.targetAudience}, offering ${businessContext.valueProposition || "its services"}.`;
    }

    // Determine Top Strength
    const strongGaps = gaps.filter(g => g.confidence >= 80);
    const topStrength = strongGaps.length > 0 
      ? `A notable strength is its ${strongGaps[0].affectedArea} execution, specifically regarding ${strongGaps[0].title.toLowerCase()}.` 
      : "The foundation is established, but there are multiple areas requiring immediate optimization.";

    // Determine Bottleneck
    const topRootCause = reasoningTraces.rootCauses?.[0];
    const bottleneck = topRootCause 
      ? `The primary growth bottleneck is: ${topRootCause.title}. This underlying issue cascades into multiple symptoms across the visitor journey.`
      : "No severe, singular structural bottleneck was detected, though incremental friction points exist.";

    // Top Opportunity
    const topOpportunity = reasoningTraces.opportunities?.[0];
    const opportunity = topOpportunity 
      ? `The most significant untapped opportunity is ${topOpportunity.title.toLowerCase()}, which leverages existing assets for immediate growth.`
      : "Focus should remain on foundational conversion optimization before seeking expansion opportunities.";

    const overallScore = context.scores?.overall || 0;
    let growthStage = "Unknown";
    let growthStageExplanation = "";
    if (overallScore >= 90) {
      growthStage = "Leader";
      growthStageExplanation = "The website is highly optimized and sets the standard in its category.";
    } else if (overallScore >= 70) {
      growthStage = "Optimized";
      growthStageExplanation = "The foundation is strong, with focused opportunities for advanced scaling.";
    } else if (overallScore >= 40) {
      growthStage = "Growing";
      growthStageExplanation = "Traction is established, but structural friction points are limiting growth.";
    } else {
      growthStage = "Emerging";
      growthStageExplanation = "The digital presence requires immediate foundational improvements before scaling.";
    }

    const content = {
      growthScore: overallScore,
      growthStage,
      growthStageExplanation,
      currentState,
      topStrength,
      bottleneck,
      opportunity,
      conclusion: "Address the bottleneck first to unlock the effectiveness of all subsequent optimizations."
    };

    return {
      id: "executive-summary",
      type: "text",
      title: "Executive Summary",
      content,
      metadata: {
        confidence: 85,
        evidenceCount: (strongGaps.length > 0 ? 1 : 0) + (topRootCause ? topRootCause.affectedGapIds.length : 0),
        generatedFrom: ["RootCauseEngine", "GapAnalysis", "OpportunityEngine"],
        reasoningSummary: "Synthesized from core business context, the highest-priority root cause, and the top-ranked opportunity."
      }
    };
  }
});
