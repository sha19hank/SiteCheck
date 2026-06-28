import { BusinessContext, ScrapeDiagnostics, ReportDepth, ReportDepthConfig } from "@/types";

export function resolveReportDepth(
  context: BusinessContext,
  diagnostics: ScrapeDiagnostics,
  evidenceCount: number
): ReportDepthConfig {
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
  let level: ReportDepth = "MINIMAL";
  if (depthScore >= 4) level = "COMPREHENSIVE";
  else if (depthScore >= 1) level = "STANDARD";
  
  switch (level) {
    case "MINIMAL":
      return {
        level: "MINIMAL",
        maxRecommendations: 3,
        maxRoadmapTasks: 2,
        evidenceVerbosity: "low",
        includeAppendix: false,
        opportunityCount: 1,
      };
    case "STANDARD":
      return {
        level: "STANDARD",
        maxRecommendations: 5,
        maxRoadmapTasks: 4,
        evidenceVerbosity: "medium",
        includeAppendix: false,
        opportunityCount: 2,
      };
    case "COMPREHENSIVE":
      return {
        level: "COMPREHENSIVE",
        maxRecommendations: 10,
        maxRoadmapTasks: 8,
        evidenceVerbosity: "high",
        includeAppendix: true,
        opportunityCount: 4,
      };
  }
}
