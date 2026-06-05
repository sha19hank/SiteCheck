import { ScrapedData, CategoryAudit, CategoryFinding, CategoryRecommendation } from "@/types";
import { CHECK_TESTIMONIALS } from "../check-registry";

export function runMarketplaceAudit(data: ScrapedData): CategoryAudit {
  const findings: CategoryFinding[] = [];
  const recommendations: CategoryRecommendation[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const auditSignals: Record<string, any> = {};

  let earnedPoints = 0;
  const maxPoints = 100;

  // Check 1: Trust
  const trustCheck = CHECK_TESTIMONIALS(data);
  auditSignals.reviewsDetected = trustCheck.passed;
  if (!trustCheck.passed) {
    findings.push({
      id: "marketplace_missing_trust",
      title: "Missing buyer/seller trust signals",
      description: "No reviews or testimonials detected.",
      severity: "critical",
      category: "trust",
      priority: 95,
      evidence: trustCheck.evidence,
      source: "page_structure"
    });
    recommendations.push({
      title: "Add buyer and seller protection guarantees",
      why_it_matters: "Two-sided marketplaces suffer from the cold start problem. Trust is the only way to overcome it.",
      how_to_fix: "Clearly state refund policies, seller verification processes, and display reviews prominently.",
      impact: "high",
      effort: "medium"
    });
    weaknesses.push("Missing trust signals");
  } else {
    earnedPoints += 100;
    strengths.push("Trust signals present");
  }

  const overallScore = Math.round((earnedPoints / maxPoints) * 100);
  let healthGrade = "F";
  if (overallScore >= 90) healthGrade = "A+";
  else if (overallScore >= 80) healthGrade = "A";
  else if (overallScore >= 70) healthGrade = "B";
  else if (overallScore >= 60) healthGrade = "C";
  else if (overallScore >= 50) healthGrade = "D";

  return {
    websiteType: "marketplace",
    overallScore,
    categoryScores: {
      trust: trustCheck.passed ? 100 : 0,
      conversion: 100,
      clarity: 100,
      performance: 100
    },
    findings,
    recommendations,
    strengths,
    weaknesses,
    healthGrade,
    auditSignals
  };
}
