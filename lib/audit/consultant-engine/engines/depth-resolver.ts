import { BusinessContext, ScrapeDiagnostics, ReportDepth } from "@/types";

export function resolveReportDepth(
  context: BusinessContext,
  diagnostics: ScrapeDiagnostics,
  evidenceCount: number
): ReportDepth {
  let depthScore = 0;

  // 1. Website Complexity
  if (context.growthStage === "Enterprise" || context.growthStage === "Scale") depthScore += 2;
  if (diagnostics.scrapeSnapshot.navLinkCount > 15) depthScore += 1;
  
  // 2. Evidence Volume
  if (evidenceCount > 20) depthScore += 2;
  else if (evidenceCount > 10) depthScore += 1;
  else depthScore -= 1; // Penalty for low evidence

  // 3. Scrape Quality
  if (diagnostics.scrapeQuality === "HIGH") depthScore += 1;
  else if (diagnostics.scrapeQuality === "LOW") depthScore -= 2; // Hard penalty for poor quality

  // Resolution
  if (depthScore >= 4) return "COMPREHENSIVE";
  if (depthScore >= 1) return "STANDARD";
  return "MINIMAL";
}
