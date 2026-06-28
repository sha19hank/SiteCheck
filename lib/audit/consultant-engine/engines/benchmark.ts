import { BusinessContext, BenchmarkContext, IntelligenceEngineResult, KnowledgeModel, AuditScores } from "@/types";

export function evaluateBenchmarks(
  scores: AuditScores,
  context: BusinessContext,
  model: KnowledgeModel
): IntelligenceEngineResult<BenchmarkContext> {
  const startTime = performance.now();
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

  // Translate numerical range into maturity levels for accurate consultant reporting
  const healthScore = scores.overall;
  
  let currentMaturity = "Low";
  if (healthScore >= 80) currentMaturity = "Very High";
  else if (healthScore >= 60) currentMaturity = "High";
  else if (healthScore >= 40) currentMaturity = "Moderate";
  
  let expectedMaturity = "Moderate";
  if (expectedScoreRange[1] >= 85) expectedMaturity = "Very High";
  else if (expectedScoreRange[1] >= 75) expectedMaturity = "High";
  else if (expectedScoreRange[1] >= 55) expectedMaturity = "Moderate";
  else expectedMaturity = "Low";

  // Calculate gap difference
  const maturityLevels = ["Low", "Moderate", "High", "Very High"];
  const currentIndex = maturityLevels.indexOf(currentMaturity);
  const expectedIndex = maturityLevels.indexOf(expectedMaturity);
  const diffIndex = expectedIndex - currentIndex;
  
  let difference = "Meets expectations";
  if (diffIndex > 0) difference = `${diffIndex} maturity level${diffIndex > 1 ? 's' : ''} below expectation`;
  if (diffIndex < 0) difference = `${Math.abs(diffIndex)} maturity level${Math.abs(diffIndex) > 1 ? 's' : ''} above expectation`;

  let percentile: "Top 25%" | "Average" | "Below average" | "Unknown" = "Average";
  if (healthScore >= expectedScoreRange[1]) percentile = "Top 25%";
  else if (healthScore <= expectedScoreRange[0]) percentile = "Below average";
  else percentile = "Average";

  engineEvidence.push(`Calculated overall health score is ${healthScore.toFixed(1)} (${currentMaturity}). Expected maturity is ${expectedMaturity}.`);

  const comparisonMessage = `Your overall website maturity is ${currentMaturity}, which is ${difference.toLowerCase()} for a ${model.type} website at the ${context.growthStage} stage.`;

  const endTime = performance.now();

  return {
    data: {
      actualScore: healthScore,
      industryAverage: expectedMaturity,
      topQuartile: expectedIndex < 3 ? maturityLevels[expectedIndex + 1] : "Very High",
      difference,
      primaryReasonForDifference: diffIndex > 0 ? "Under-investment in conversion and trust signals relative to growth stage." : "Strong foundation across all key areas.",
      suggestedTargetScore: expectedMaturity,
      
      // Legacy
      overallScorePercentile: percentile,
      expectedScoreRange,
      comparisonMessage
    },
    confidence: 0.9,
    evidence: engineEvidence,
    engineMetadata: {
      engineName: "BenchmarkEngine",
      version: "1.2.0",
      executionTimeMs: Math.round(endTime - startTime),
      confidence: 0.9,
      evidenceProcessed: 1
    },
    debugMetadata: {
      healthScore,
      currentMaturity,
      expectedMaturity
    }
  };
}
