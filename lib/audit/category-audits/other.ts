import { ScrapedData, CategoryAudit, CategoryFinding, CategoryRecommendation } from "@/types";

export function runOtherAudit(data: ScrapedData): CategoryAudit {
  return {
    websiteType: "other",
    overallScore: 0,
    categoryScores: { trust: 0, conversion: 0, clarity: 0, performance: 0 },
    findings: [{
      id: "insufficient_confidence",
      title: "Insufficient category confidence for category-specific audit.",
      description: "The system could not confidently determine your business model. Standard generic rules applied.",
      severity: "critical",
      category: "trust",
      priority: 100,
      evidence: [],
      source: "classifier"
    }],
    recommendations: [],
    strengths: [],
    weaknesses: [],
    healthGrade: "N/A",
    auditSignals: { unavailable: true }
  };
}
