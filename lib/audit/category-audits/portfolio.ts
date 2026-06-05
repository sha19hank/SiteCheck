import { ScrapedData, CategoryAudit, CategoryFinding, CategoryRecommendation } from "@/types";
import { CHECK_CASE_STUDIES } from "../check-registry";

export function runPortfolioAudit(data: ScrapedData): CategoryAudit {
  const findings: CategoryFinding[] = [];
  const recommendations: CategoryRecommendation[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const auditSignals: Record<string, any> = {};

  let earnedPoints = 0;
  const maxPoints = 100;

  // Check 1: Projects
  const caseStudyCheck = CHECK_CASE_STUDIES(data);
  auditSignals.projectsDetected = caseStudyCheck.passed;
  if (!caseStudyCheck.passed) {
    findings.push({
      id: "portfolio_missing_projects",
      title: "Projects or portfolio not clearly linked",
      description: "Could not find dedicated project links in the navigation.",
      severity: "high",
      category: "clarity",
      priority: 90,
      evidence: caseStudyCheck.evidence,
      source: "navigation"
    });
    recommendations.push({
      title: "Highlight your best 3 projects",
      why_it_matters: "Visitors scan portfolios quickly. They will not hunt for your work.",
      how_to_fix: "Feature your top 3 projects directly on the homepage with high-quality thumbnails.",
      impact: "high",
      effort: "medium"
    });
    weaknesses.push("Missing project visibility");
  } else {
    earnedPoints += 100;
    strengths.push("Projects easily visible");
  }

  const overallScore = Math.round((earnedPoints / maxPoints) * 100);
  let healthGrade = "F";
  if (overallScore >= 90) healthGrade = "A+";
  else if (overallScore >= 80) healthGrade = "A";
  else if (overallScore >= 70) healthGrade = "B";
  else if (overallScore >= 60) healthGrade = "C";
  else if (overallScore >= 50) healthGrade = "D";

  return {
    websiteType: "portfolio",
    overallScore,
    categoryScores: {
      trust: 100,
      conversion: 100,
      clarity: caseStudyCheck.passed ? 100 : 0,
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
