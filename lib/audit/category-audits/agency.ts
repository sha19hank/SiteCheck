import { ScrapedData, CategoryAudit, CanonicalFinding, CategoryRecommendation } from "@/types";
import { CHECK_CASE_STUDIES, CHECK_DEMO_BOOKING, CHECK_TESTIMONIALS } from "../check-registry";

export function runAgencyAudit(data: ScrapedData): CategoryAudit {
  const findings: CanonicalFinding[] = [];
  const recommendations: CategoryRecommendation[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const auditSignals: Record<string, any> = {};

  let earnedPoints = 0;
  const maxPoints = 100;

  // Check 1: Case Studies
  const caseStudyCheck = CHECK_CASE_STUDIES(data);
  auditSignals.caseStudiesDetected = caseStudyCheck.passed;
  if (!caseStudyCheck.passed) {
    findings.push({
      id: "agency_missing_case_studies",
      title: "Missing case studies or portfolio",
      description: "No dedicated section for past work was found in the navigation.",
      severity: "critical",
      category: "trust",
      priority: 95,
      evidence: caseStudyCheck.evidence,
      source: "navigation"
    });
    recommendations.push({
      title: "Add 3 client case studies with measurable outcomes",
      why_it_matters: "Agencies sell trust. Prospects need to see proof of past success before booking a call.",
      how_to_fix: "Create a 'Case Studies' page detailing the client problem, your solution, and the exact ROI achieved.",
      impact: "high",
      effort: "high"
    });
    weaknesses.push("Missing proof of work");
  } else {
    earnedPoints += 40;
    strengths.push("Portfolio visible");
  }

  // Check 2: Consultation CTA
  const demoCheck = CHECK_DEMO_BOOKING(data);
  auditSignals.consultationDetected = demoCheck.passed;
  if (!demoCheck.passed) {
    findings.push({
      id: "agency_missing_booking",
      title: "No clear consultation CTA",
      description: "The primary CTA does not direct users to book a call or consultation.",
      severity: "high",
      category: "conversion",
      priority: 90,
      evidence: demoCheck.evidence,
      source: "ctaTexts"
    });
    recommendations.push({
      title: "Change 'Contact Us' to 'Book a Strategy Call'",
      why_it_matters: "A generic contact form feels like a black hole. Prospects prefer booking directly into a calendar.",
      how_to_fix: "Replace contact forms with an embedded Calendly link and a value-driven CTA.",
      impact: "high",
      effort: "low"
    });
    weaknesses.push("Friction in booking funnel");
  } else {
    earnedPoints += 30;
    strengths.push("Clear booking funnel");
  }

  // Check 3: Social Proof
  const trustCheck = CHECK_TESTIMONIALS(data);
  auditSignals.testimonialsDetected = trustCheck.passed;
  if (!trustCheck.passed) {
    findings.push({
      id: "agency_missing_testimonials",
      title: "Missing client testimonials",
      description: "No testimonials or reviews detected.",
      severity: "high",
      category: "trust",
      priority: 85,
      evidence: trustCheck.evidence,
      source: "page_structure"
    });
    recommendations.push({
      title: "Add video testimonials or detailed client quotes",
      why_it_matters: "For high-ticket agency services, peer validation is critical.",
      how_to_fix: "Ask 3 past clients for a short quote and place them directly below your hero section.",
      impact: "high",
      effort: "medium"
    });
    weaknesses.push("Missing peer validation");
  } else {
    earnedPoints += 30;
    strengths.push("Testimonials present");
  }

  const overallScore = Math.round((earnedPoints / maxPoints) * 100);
  let healthGrade = "F";
  if (overallScore >= 90) healthGrade = "A+";
  else if (overallScore >= 80) healthGrade = "A";
  else if (overallScore >= 70) healthGrade = "B";
  else if (overallScore >= 60) healthGrade = "C";
  else if (overallScore >= 50) healthGrade = "D";

  return {
    websiteType: "agency",
    overallScore,
    categoryScores: {
      trust: (caseStudyCheck.passed ? 50 : 0) + (trustCheck.passed ? 50 : 0),
      conversion: demoCheck.passed ? 100 : 0,
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
