import { ScrapedData, CategoryAudit, CanonicalFinding, CategoryRecommendation } from "@/types";

export function runCommunityAudit(data: ScrapedData): CategoryAudit {
  const findings: CanonicalFinding[] = [];
  const recommendations: CategoryRecommendation[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const auditSignals: Record<string, any> = {};

  // Stub for now.
  const overallScore = 100;
  const healthGrade = "A+";

  return {
    websiteType: "community",
    overallScore,
    categoryScores: { trust: 100, conversion: 100, clarity: 100, performance: 100 },
    findings,
    recommendations,
    strengths,
    weaknesses,
    healthGrade,
    auditSignals
  };
}
