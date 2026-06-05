import { ScrapedData, CategoryAudit, CategoryFinding, CategoryRecommendation } from "@/types";
import { CHECK_NEWSLETTER } from "../check-registry";

export function runBlogAudit(data: ScrapedData): CategoryAudit {
  const findings: CategoryFinding[] = [];
  const recommendations: CategoryRecommendation[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const auditSignals: Record<string, any> = {};

  let earnedPoints = 0;
  const maxPoints = 100;

  // Check 1: Newsletter
  const newsletterCheck = CHECK_NEWSLETTER(data);
  auditSignals.newsletterDetected = newsletterCheck.passed;
  if (!newsletterCheck.passed) {
    findings.push({
      id: "blog_missing_newsletter",
      title: "No reader retention mechanism",
      description: "No newsletter or subscribe CTA was found.",
      severity: "critical",
      category: "conversion",
      priority: 95,
      evidence: newsletterCheck.evidence,
      source: "ctaTexts"
    });
    recommendations.push({
      title: "Add a highly visible newsletter opt-in",
      why_it_matters: "Without an email list, you rely entirely on unpredictable search or social algorithms for return traffic.",
      how_to_fix: "Add an inline subscribe form within your articles and a pop-up offering a lead magnet.",
      impact: "high",
      effort: "medium"
    });
    weaknesses.push("No email list capture");
  } else {
    earnedPoints += 100;
    strengths.push("Newsletter capture active");
  }

  const overallScore = Math.round((earnedPoints / maxPoints) * 100);
  let healthGrade = "F";
  if (overallScore >= 90) healthGrade = "A+";
  else if (overallScore >= 80) healthGrade = "A";
  else if (overallScore >= 70) healthGrade = "B";
  else if (overallScore >= 60) healthGrade = "C";
  else if (overallScore >= 50) healthGrade = "D";

  return {
    websiteType: "blog",
    overallScore,
    categoryScores: {
      trust: 100,
      conversion: newsletterCheck.passed ? 100 : 0,
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
