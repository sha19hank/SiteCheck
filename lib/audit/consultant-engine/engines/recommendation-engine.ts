import { RecommendationV2, BusinessContext, RootCause, RelationshipEdge, PsychologyAnnotation, RevenueImpact, BenchmarkContext, RecommendationConfidence, EvidenceChain } from "@/types";
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
  let globalOrder = 1;

  return scoredGaps.map(gap => {
    // 1. Determine priority tier
    let priorityTier: RecommendationV2["priorityTier"] = "Tier 4: Backlog";
    if (gap.priorityScore >= 80) priorityTier = "Tier 1: Do This Today";
    else if (gap.priorityScore >= 60) priorityTier = "Tier 2: Do This Month";
    else if (gap.priorityScore >= 40) priorityTier = "Tier 3: Do This Quarter";

    const kpi = getKPIForGap(gap.affectedArea, context);

    // 2. Map dependencies
    const prerequisites = relationshipGraph.filter(e => e.targetId === gap.id && (e.type === "BLOCKS" || e.type === "DEPENDS_ON"));
    const blocks = relationshipGraph.filter(e => e.sourceId === gap.id && e.type === "BLOCKS");
    const dependsOn = relationshipGraph.filter(e => e.targetId === gap.id && e.type === "ENABLES");
    const causes = relationshipGraph.filter(e => e.sourceId === gap.id && e.type === "CAUSES");

    const dependencies = { 
      prerequisites: prerequisites.map(e => e.sourceId), 
      dependsOn: dependsOn.map(e => e.sourceId), 
      blocks: blocks.map(e => e.targetId) 
    };

    // 3. Find traces
    const rootCause = rootCauses.find(rc => rc.affectedGapIds.includes(gap.id));
    const psychology = psychologyAnnotations.get(gap.id);
    const revenue = revenueImpacts.get(gap.id);

    // 4. Calculate Consultant Confidence (Weighted Quality)
    let weightScore = 0;
    const maxWeight = 14; // Gap(3) + RootCause(3) + Rel(3) + Psych(2) + Bench(2) + Rev(1)
    let engineCount = 1; // Gap Analysis is baseline

    weightScore += (gap.confidence * 3); // Gap Analysis: High

    if (rootCause) {
      weightScore += 3; // Root Cause: High
      engineCount++;
    }
    if (prerequisites.length > 0 || blocks.length > 0 || causes.length > 0) {
      weightScore += 3; // Relationship: High
      engineCount++;
    }
    if (psychology) {
      weightScore += (psychology.confidence * 2); // Psychology: Medium
      engineCount++;
    }
    if (benchmarkContext) {
      weightScore += 2; // Benchmark: Medium
      engineCount++;
    }
    if (revenue) {
      weightScore += (revenue.confidence * 1); // Revenue: Low-Med
      engineCount++;
    }

    const rawConfidenceScore = (weightScore / maxWeight) * 100;
    const finalScore = Math.min(100, Math.max(0, Math.round(rawConfidenceScore)));
    
    let confLevel: "HIGH" | "MEDIUM" | "LOW" = "LOW";
    if (finalScore >= 75) confLevel = "HIGH";
    else if (finalScore >= 50) confLevel = "MEDIUM";

    const consultantConfidence: RecommendationConfidence = {
      score: finalScore,
      level: confLevel,
      explanation: `Supported by ${engineCount} deterministic engines with a weighted evidence score of ${finalScore}/100.`,
      supportingEvidenceCount: gap.evidence.length + (rootCause ? rootCause.evidence.length : 0),
      reasoningEngineCount: engineCount
    };

    // 5. Construct Evidence Chain with IDs and Object References
    const evidenceChain: EvidenceChain = {
      evidenceIds: gap.evidence.map((_, i) => `ev_${gap.id}_${i}`), // proxy IDs for raw text
      findingIds: [gap.id],
      gapIds: [gap.id],
      rootCauseIds: rootCause ? [rootCause.id] : [],
      relationshipGraphIds: [...prerequisites, ...blocks, ...causes, ...dependsOn].map(e => `${e.sourceId}_${e.targetId}`),
      psychologyIds: psychology ? [gap.id] : [],
      benchmarkIds: ["benchmark_global"],
      revenueIds: revenue ? [gap.id] : [],
      priorityIds: [gap.id],
      references: {
        gaps: [gap],
        rootCauses: rootCause ? [rootCause] : [],
        relationships: [...prerequisites, ...blocks, ...causes, ...dependsOn],
        psychology: psychology ? [psychology] : [],
        benchmarks: [benchmarkContext],
        revenue: revenue ? [revenue] : []
      }
    };

    // 6. Map Effort to Time Bucket
    let estimatedTime = "Unknown";
    let estimatedEffort: RecommendationV2["estimatedEffort"] = "Medium";
    if (gap.effortV2 === "Trivial") { estimatedEffort = "Very Low"; estimatedTime = "15-30 minutes"; }
    else if (gap.effortV2 === "Small") { estimatedEffort = "Low"; estimatedTime = "Under 2 hours"; }
    else if (gap.effortV2 === "Medium") { estimatedEffort = "Medium"; estimatedTime = "Half day to 2 days"; }
    else if (gap.effortV2 === "Large") { estimatedEffort = "High"; estimatedTime = "2-7 days"; }
    else if (gap.effortV2 === "Major") { estimatedEffort = "Very High"; estimatedTime = "Multiple weeks"; }

    // 7. Expanded Consultant Fields
    const whatIsWrong = gap.title;
    let whyItExists = "Likely arose organically during development without a structured review process.";
    if (rootCause) whyItExists = `Stemming from a deeper structural issue: ${rootCause.title}.`;
    
    const whyItMatters = gap.businessReason;
    
    let businessImpactText = `Impacts ${gap.affectedArea} maturity.`;
    if (revenue) businessImpactText += ` Estimated to cost between $${revenue.estimateLow} and $${revenue.estimateHigh}/mo.`;
    if (psychology) businessImpactText += ` Violates ${psychology.principle} principles, damaging ${psychology.metricAffected}.`;

    const recommendedSolution = gap.type === "missing" ? `Implement ${gap.title.replace("Missing: ", "")}.` : `Optimize existing ${gap.affectedArea} implementation.`;
    const whyAppropriate = "Standard industry best practice for this growth stage to reduce friction.";

    return {
      id: gap.id,
      whatIsWrong,
      whyItExists,
      whyItMatters,
      businessImpact: businessImpactText,
      rootCauseDescription: rootCause?.description,
      recommendedSolution,
      whyAppropriate,
      
      dependencies,
      recommendedOrder: globalOrder++,
      owner: gap.owner,
      estimatedEffort,
      estimatedTime,
      kpi,
      expectedOutcome: `Improve ${kpi.metric} to achieve ${kpi.target}.`,
      
      consultantConfidence,
      evidenceChain,
      
      // Original Compat fields
      title: whatIsWrong,
      description: businessImpactText,
      problem: whatIsWrong,
      evidence: gap.evidence,
      recommendedAction: recommendedSolution,
      priorityScore: gap.priorityScore,
      priorityTier,
      isQuickWin: priorityTier === "Tier 1: Do This Today" && estimatedEffort === "Very Low",
      
      // Legacy required ActionableInsight fields
      effort: (gap.effortV2 === "Trivial" || gap.effortV2 === "Small" ? "Low" : gap.effortV2 === "Medium" ? "Medium" : "High") as "Low" | "Medium" | "High",
      priority: (gap.priorityScore >= 70 ? "High" : gap.priorityScore >= 40 ? "Medium" : "Low") as "Low" | "Medium" | "High",
      recommendedFix: recommendedSolution
    };
  });
}
