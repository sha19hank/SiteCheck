import { ScrapedData, CategoryAudit, CanonicalFinding, CategoryRecommendation } from "@/types";
import { CHECK_LOCAL_CONTACT, CHECK_TESTIMONIALS } from "../check-registry";

export function runLocalBusinessAudit(data: ScrapedData): CategoryAudit {
  const findings: CanonicalFinding[] = [];
  const recommendations: CategoryRecommendation[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const auditSignals: Record<string, any> = {};

  let earnedPoints = 0;
  const maxPoints = 100;

  // Check 1: Contact Info
  const contactCheck = CHECK_LOCAL_CONTACT(data);
  auditSignals.localContactDetected = contactCheck.passed;
  if (!contactCheck.passed) {
    findings.push({
      id: "local_missing_contact",
      title: "Missing phone number or address",
      description: "Critical NAP (Name, Address, Phone) information was not detected.",
      severity: "critical",
      category: "clarity",
      priority: 100,
      evidence: contactCheck.evidence,
      source: "page_content"
    });
    recommendations.push({
      title: "Display your phone number and address in the header",
      why_it_matters: "Local customers need immediate access to contact info. If they have to search for it, they will call a competitor.",
      how_to_fix: "Add a clickable 'Call Now' phone number and your physical address to the top right of the navigation bar.",
      impact: "high",
      effort: "low"
    });
    weaknesses.push("Hidden contact details");
  } else {
    earnedPoints += 50;
    strengths.push("Contact info visible");
  }

  // Check 2: Local Reviews
  const trustCheck = CHECK_TESTIMONIALS(data);
  auditSignals.reviewsDetected = trustCheck.passed;
  if (!trustCheck.passed) {
    findings.push({
      id: "local_missing_reviews",
      title: "Missing Google/Yelp reviews",
      description: "No testimonials or reviews were detected.",
      severity: "high",
      category: "trust",
      priority: 85,
      evidence: trustCheck.evidence,
      source: "page_structure"
    });
    recommendations.push({
      title: "Embed local reviews (Google My Business or Yelp)",
      why_it_matters: "Local intent buyers heavily rely on community reviews before choosing a business.",
      how_to_fix: "Embed a widget showing your 5-star Google reviews directly on the homepage.",
      impact: "high",
      effort: "low"
    });
    weaknesses.push("Lacking local trust signals");
  } else {
    earnedPoints += 50;
    strengths.push("Reviews visible");
  }

  const overallScore = Math.round((earnedPoints / maxPoints) * 100);
  let healthGrade = "F";
  if (overallScore >= 90) healthGrade = "A+";
  else if (overallScore >= 80) healthGrade = "A";
  else if (overallScore >= 70) healthGrade = "B";
  else if (overallScore >= 60) healthGrade = "C";
  else if (overallScore >= 50) healthGrade = "D";

  return {
    websiteType: "local_business",
    overallScore,
    categoryScores: {
      trust: trustCheck.passed ? 100 : 0,
      conversion: 100,
      clarity: contactCheck.passed ? 100 : 0,
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
