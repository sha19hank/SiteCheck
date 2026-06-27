import { BusinessContext, BenchmarkContext, IntelligenceEngineResult, KnowledgeModel, AuditScores } from "@/types";

export function evaluateBenchmarks(
  scores: AuditScores,
  context: BusinessContext,
  model: KnowledgeModel
): IntelligenceEngineResult<BenchmarkContext> {
  const engineEvidence: string[] = [];

  // Determine expected range based on Growth Stage
  let expectedScoreRange: [number, number] = [50, 75]; // Default for Growth
  
  switch (context.growthStage) {
    case "Pre-Launch":
      expectedScoreRange = [25, 45];
      break;
    case "Early Stage":
      expectedScoreRange = [35, 55];
      break;
    case "Growth":
      expectedScoreRange = [50, 75];
      break;
    case "Scale":
      expectedScoreRange = [65, 85];
      break;
    case "Enterprise":
      expectedScoreRange = [75, 95];
      break;
    default:
      expectedScoreRange = [40, 60];
  }

  engineEvidence.push(`Growth stage is ${context.growthStage}, setting expected score range to ${expectedScoreRange[0]}-${expectedScoreRange[1]}.`);

  let percentile: "Top 25%" | "Average" | "Below average" | "Unknown" = "Average";
  
  // A perfect score would be 100 - (impact / max_impact).
  // The scores provided are actually the "impact" of the gaps, so lower is better if it's gap impact.
  // Wait, no. In the architecture, score = 100 - impact.
  // Assuming the `scores.overall` passed here is the actual Health Score (0-100).
  const healthScore = scores.overall;

  if (healthScore >= expectedScoreRange[1]) {
    percentile = "Top 25%";
  } else if (healthScore <= expectedScoreRange[0]) {
    percentile = "Below average";
  } else {
    percentile = "Average";
  }

  engineEvidence.push(`Calculated overall health score is ${healthScore.toFixed(1)}. Percentile assigned: ${percentile}.`);

  const comparisonMessage = `Your overall website health is ${healthScore.toFixed(0)}/100, which is ${percentile.toLowerCase()} for a ${model.type} website at the ${context.growthStage} stage.`;

  return {
    data: {
      overallScorePercentile: percentile,
      expectedScoreRange,
      comparisonMessage
    },
    confidence: 0.9,
    evidence: engineEvidence,
    debugMetadata: {
      healthScore
    }
  };
}
