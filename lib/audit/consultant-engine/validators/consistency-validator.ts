import { RecommendationV2, PipelineExecution } from "@/types";

export interface ValidatorResult {
  validRecommendations: RecommendationV2[];
  modifications: PipelineExecution["validatorModifications"];
  warnings: string[];
}

export function validateConsistency(recommendations: RecommendationV2[]): ValidatorResult {
  const validRecommendations: RecommendationV2[] = [];
  const modifications: PipelineExecution["validatorModifications"] = [];
  const warnings: string[] = [];

  for (const rec of recommendations) {
    let isValid = true;
    let originalConfidence = rec.consultantConfidence.score;
    let newConfidence = originalConfidence;

    // Rule 1: A recommendation must have at least 1 piece of supporting evidence.
    if (rec.consultantConfidence.supportingEvidenceCount === 0) {
      modifications.push({
        recommendationId: rec.id,
        action: "removed",
        reason: "Zero supporting evidence found in the evidence chain.",
        validatorName: "ConsistencyValidator",
        originalConfidence,
        newConfidence: 0,
        failingEvidence: []
      });
      isValid = false;
      continue;
    }

    // Rule 2: If a recommendation is Tier 1 but has low confidence (<50%), downgrade its tier
    if (rec.priorityTier === "Tier 1: Do This Today" && originalConfidence < 50) {
      rec.priorityTier = "Tier 2: Do This Month";
      rec.isQuickWin = false;
      modifications.push({
        recommendationId: rec.id,
        action: "downgraded",
        reason: "Tier 1 recommendation lacked sufficient confidence score (>50%). Downgraded to Tier 2.",
        validatorName: "ConsistencyValidator",
        originalConfidence,
        newConfidence: originalConfidence,
        failingEvidence: ["Confidence < 50%"]
      });
      warnings.push(`Downgraded '${rec.problem}' from Tier 1 due to low confidence.`);
    }

    // Rule 3: High revenue impact claims must have high confidence
    if (rec.revenueImpact && rec.revenueImpact.estimateHigh > 10000 && originalConfidence < 60) {
      // Downgrade confidence further or remove revenue claim to protect trust
      newConfidence -= 10;
      rec.consultantConfidence.score = newConfidence;
      rec.consultantConfidence.level = "LOW";
      rec.businessImpact = rec.businessImpact.replace(/Estimated to cost between \$\d+ and \$\d+\/mo\./, "Revenue impact is difficult to reliably estimate due to low confidence.");
      delete rec.revenueImpact;

      modifications.push({
        recommendationId: rec.id,
        action: "downgraded",
        reason: "High revenue claim with low evidence confidence. Stripped revenue claim to maintain trust.",
        validatorName: "ConsistencyValidator",
        originalConfidence,
        newConfidence,
        failingEvidence: ["Confidence < 60% with $10k+ impact"]
      });
      warnings.push(`Stripped revenue claim from '${rec.problem}' due to insufficient evidence confidence.`);
    }

    if (isValid) {
      validRecommendations.push(rec);
    }
  }

  return {
    validRecommendations,
    modifications,
    warnings
  };
}
