import { RecommendationV2, BusinessContext, RootCause, RelationshipEdge, PsychologyAnnotation, RevenueImpact, BenchmarkContext } from "@/types";
import { ScoredGap } from "./impact-engine";
import { getKPIForGap } from "./kpi-engine";

export function generateRecommendations(
  scoredGaps: ScoredGap[],
  context: BusinessContext,
  rootCauses: RootCause[],
  relationshipGraph: RelationshipEdge[],
  psychologyAnnotations: Map<string, PsychologyAnnotation>,
  revenueImpacts: Map<string, RevenueImpact>,
  benchmarkContext: BenchmarkContext
): RecommendationV2[] {
  return scoredGaps.map(gap => {
    // Determine priority tier
    let priorityTier: RecommendationV2["priorityTier"] = "Tier 4: Backlog";
    if (gap.priorityScore >= 80) priorityTier = "Tier 1: Do This Today";
    else if (gap.priorityScore >= 60) priorityTier = "Tier 2: Do This Month";
    else if (gap.priorityScore >= 40) priorityTier = "Tier 3: Do This Quarter";

    const kpi = getKPIForGap(gap.affectedArea, context);

    // Dynamic dependencies from Relationship Graph
    const prerequisites = relationshipGraph
      .filter(e => e.targetId === gap.id && (e.type === "BLOCKS" || e.type === "DEPENDS_ON"))
      .map(e => e.sourceId);

    const blocks = relationshipGraph
      .filter(e => e.sourceId === gap.id && e.type === "BLOCKS")
      .map(e => e.targetId);
      
    const dependsOn = relationshipGraph
      .filter(e => e.targetId === gap.id && e.type === "ENABLES")
      .map(e => e.sourceId);

    const dependencies = { prerequisites, dependsOn, blocks };

    const rootCause = rootCauses.find(rc => rc.affectedGapIds.includes(gap.id));
    const psychology = psychologyAnnotations.get(gap.id);
    const revenue = revenueImpacts.get(gap.id);

    let whyItMatters = gap.businessReason;
    if (rootCause) {
      whyItMatters = `${gap.businessReason} This is a symptom of a deeper issue: ${rootCause.description}`;
    }

    let businessImpactText = `Impacts ${gap.affectedArea} with a severity score of ${gap.impactScores.overall}/100.`;
    if (revenue) {
      businessImpactText += ` We estimate this is costing you between $${revenue.estimateLow} and $${revenue.estimateHigh} in lost monthly revenue, assuming a ${revenue.trafficTier} traffic profile.`;
    } else if (gap.confidence < 0.5) {
      businessImpactText += ` Insufficient evidence to produce a reliable revenue estimate.`;
    }

    if (psychology) {
      businessImpactText += ` Psychologically, this violates the principle of '${psychology.principle}', directly impacting ${psychology.metricAffected}.`;
    }

    return {
      id: gap.id,
      problem: gap.title,
      evidence: gap.evidence,
      whyItMatters,
      businessImpact: businessImpactText,
      expectedOutcome: `Improve ${kpi.metric} to achieve ${kpi.target}.`,
      recommendedAction: gap.type === "missing" ? `Implement ${gap.title.replace("Missing: ", "")}.` : `Optimize existing ${gap.affectedArea} implementation.`,
      priorityScore: gap.priorityScore,
      priorityTier,
      effortV2: gap.effortV2,
      owner: gap.owner,
      dependencies,
      confidence: gap.confidence,
      kpi,
      isQuickWin: priorityTier === "Tier 1: Do This Today" && (gap.effortV2 === "Trivial" || gap.effortV2 === "Small"),
      
      // Phase 5.2B Additions
      rootCauseId: rootCause?.id,
      psychologyPrinciple: psychology,
      revenueImpact: revenue,
      benchmarkContext,
      reasoningTrace: {
        evidence: gap.evidence,
        gapDescription: gap.businessReason,
        rootCauseDescription: rootCause?.description,
        impactDescription: businessImpactText,
        priorityReasoning: `Scored ${gap.priorityScore} due to impact and effort.`,
        recommendationReasoning: `Mapped to category ${gap.affectedArea} fix.`,
        confidenceReasoning: `Confidence is ${(gap.confidence * 100).toFixed(0)}%.`
      },

      // Backwards compatibility fields for UI
      priority: (gap.priorityScore >= 70 ? "High" : gap.priorityScore >= 40 ? "Medium" : "Low") as any,
      effort: (gap.effortV2 === "Trivial" || gap.effortV2 === "Small" ? "Low" : gap.effortV2 === "Medium" ? "Medium" : "High") as any,
      recommendedFix: gap.type === "missing" ? `Implement ${gap.title.replace("Missing: ", "")}.` : `Optimize existing ${gap.affectedArea} implementation.`
    };
  });
}
