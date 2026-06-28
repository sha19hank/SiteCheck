import { RecommendationV2, ReportDepthConfig, PipelineExecution } from "@/types";
import { ValidatorResult } from "./consistency-validator";

export function validateCompleteness(
  recommendations: RecommendationV2[],
  depthConfig: ReportDepthConfig
): ValidatorResult {
  const modifications: PipelineExecution["validatorModifications"] = [];
  const warnings: string[] = [];

  // Enforce Max Recommendations constraint from Depth Config
  let validRecommendations = [...recommendations];
  
  // Sort them by priority before truncating, if not already
  validRecommendations.sort((a, b) => b.priorityScore - a.priorityScore);

  if (validRecommendations.length > depthConfig.maxRecommendations) {
    const toRemove = validRecommendations.splice(depthConfig.maxRecommendations);
    for (const rec of toRemove) {
      modifications.push({
        recommendationId: rec.id,
        action: "removed",
        reason: `Exceeded depth configuration maximum of ${depthConfig.maxRecommendations} recommendations.`,
        validatorName: "CompletenessValidator",
        originalConfidence: rec.consultantConfidence.score,
        newConfidence: 0,
        failingEvidence: []
      });
      warnings.push(`Truncated '${rec.problem}' due to depth limit (${depthConfig.maxRecommendations}).`);
    }
  }

  // Check if we didn't generate enough recommendations for the tier
  const minRequired = depthConfig.level === "COMPREHENSIVE" ? 5 : depthConfig.level === "STANDARD" ? 3 : 1;
  
  if (validRecommendations.length < minRequired) {
    warnings.push(`Insufficient evidence collected to generate a reliable recommendation. Expected at least ${minRequired}, but got ${validRecommendations.length}.`);
    // Note: As per architecture, we DO NOT fabricate recommendations here. We only log the warning for Debug payload.
  }

  return {
    validRecommendations,
    modifications,
    warnings
  };
}
