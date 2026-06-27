import { ScrapeDiagnostics, WebsiteClassification, ConfidenceV2, EvaluatedGap } from "@/types";

export function calculateConfidence(
  diagnostics: ScrapeDiagnostics,
  classification: WebsiteClassification,
  gaps: EvaluatedGap[]
): ConfidenceV2 {
  // Scrape Quality maps to Evidence Quality
  let evidenceQuality = 0.5;
  if (diagnostics.scrapeQuality === "HIGH") evidenceQuality = 0.9;
  else if (diagnostics.scrapeQuality === "MEDIUM") evidenceQuality = 0.7;

  const dataCompleteness = diagnostics.dataCompleteness / 100;
  const classificationCertainty = classification.confidence;

  // Average finding confidence from gaps (which are pre-calculated)
  const findingConfidence = gaps.length > 0 
    ? gaps.reduce((acc, gap) => acc + gap.confidence, 0) / gaps.length 
    : 0.8; // Default if no gaps

  // Recommendation confidence is tied to finding and evidence quality
  const recommendationConfidence = (findingConfidence + evidenceQuality) / 2;

  // Section confidence depends on completeness of data for that section
  // Simplified for now, can be broken down per section later
  const sectionConfidence = (dataCompleteness + classificationCertainty) / 2;

  // Overall confidence
  const overallConfidence = (findingConfidence + recommendationConfidence + sectionConfidence + classificationCertainty) / 4;

  return {
    findingConfidence,
    recommendationConfidence,
    sectionConfidence,
    overallConfidence,
    evidenceQuality,
    dataCompleteness,
    classificationCertainty
  };
}
