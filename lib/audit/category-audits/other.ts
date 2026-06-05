import { ScrapedData, CategoryAudit, CategoryFinding, CategoryRecommendation } from "@/types";

export function runOtherAudit(data: ScrapedData): CategoryAudit {
  return {
    websiteType: "other",
    overallScore: 100,
    categoryScores: { trust: 100, conversion: 100, clarity: 100, performance: 100 },
    findings: [],
    recommendations: [],
    strengths: [],
    weaknesses: [],
    healthGrade: "A",
    auditSignals: {}
  };
}
