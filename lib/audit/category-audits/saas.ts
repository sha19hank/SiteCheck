import { ScrapedData, CategoryAudit, CanonicalFinding, CategoryRecommendation } from "@/types";
import { CHECK_PRICING_PAGE, CHECK_FREE_TRIAL, CHECK_DEMO_BOOKING, CHECK_TESTIMONIALS } from "../check-registry";

export function runSaaSAudit(data: ScrapedData): CategoryAudit {
  const findings: CanonicalFinding[] = [];
  const recommendations: CategoryRecommendation[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const auditSignals: Record<string, any> = {};

  let earnedPoints = 0;
  const maxPoints = 100;

  // Check 1: Pricing
  const pricingCheck = CHECK_PRICING_PAGE(data);
  auditSignals.pricingPageDetected = pricingCheck.passed;
  if (!pricingCheck.passed) {
    findings.push({
      id: "saas_missing_pricing",
      title: "Pricing is hidden or missing",
      description: "No 'Pricing' link was found. B2B buyers expect immediate cost transparency.",
      severity: "critical",
      category: "conversion",
      priority: 95,
      evidence: pricingCheck.evidence,
      source: "navigation"
    });
    recommendations.push({
      title: "Add a dedicated Pricing page to the top navigation",
      why_it_matters: "SaaS buyers evaluating software will bounce immediately if they cannot determine if it fits their budget.",
      how_to_fix: "Add a 'Pricing' link to your header. Even if you require a sales call, provide starting tiers to set expectations.",
      impact: "high",
      effort: "low"
    });
    weaknesses.push("Missing pricing transparency");
  } else {
    earnedPoints += 30;
    strengths.push("Pricing transparency");
    findings.push({
      id: "saas_has_pricing",
      title: "Pricing is visible",
      description: "Pricing links are accessible to potential buyers.",
      severity: "pass",
      category: "trust",
      priority: 95,
      evidence: pricingCheck.evidence,
      source: "navigation"
    });
  }

  // Check 2: Free Trial or Demo
  const trialCheck = CHECK_FREE_TRIAL(data);
  const demoCheck = CHECK_DEMO_BOOKING(data);
  auditSignals.freeTrialDetected = trialCheck.passed;
  auditSignals.demoDetected = demoCheck.passed;
  
  if (!trialCheck.passed && !demoCheck.passed) {
    findings.push({
      id: "saas_missing_entry_cta",
      title: "No frictionless entry point",
      description: "Did not detect a 'Free Trial' or 'Book Demo' option.",
      severity: "high",
      category: "conversion",
      priority: 90,
      evidence: [...trialCheck.evidence, ...demoCheck.evidence],
      source: "ctaTexts"
    });
    recommendations.push({
      title: "Change generic CTAs to 'Book a Demo' or 'Start Free'",
      why_it_matters: "Generic contact forms do not set expectations for software buyers.",
      how_to_fix: "Update your primary CTA to describe the exact next step in your software adoption funnel.",
      impact: "high",
      effort: "low"
    });
    weaknesses.push("High friction entry point");
  } else {
    earnedPoints += 40;
    strengths.push("Clear adoption funnel");
  }

  // Check 3: Trust (Testimonials)
  const trustCheck = CHECK_TESTIMONIALS(data);
  auditSignals.testimonialCount = trustCheck.passed ? 1 : 0; // heuristic
  if (!trustCheck.passed) {
    findings.push({
      id: "saas_missing_social_proof",
      title: "Missing SaaS social proof",
      description: "No testimonials or reviews detected.",
      severity: "medium",
      category: "trust",
      priority: 70,
      evidence: trustCheck.evidence,
      source: "page_structure"
    });
    recommendations.push({
      title: "Add customer logos or testimonials above the pricing section",
      why_it_matters: "B2B SaaS requires high trust before adoption.",
      how_to_fix: "Place 3 recognizable customer logos and a strong quote near your primary CTA.",
      impact: "medium",
      effort: "medium"
    });
    weaknesses.push("Lacking social proof");
  } else {
    earnedPoints += 30;
    strengths.push("Social proof visible");
  }

  const overallScore = Math.round((earnedPoints / maxPoints) * 100);
  let healthGrade = "F";
  if (overallScore >= 90) healthGrade = "A+";
  else if (overallScore >= 80) healthGrade = "A";
  else if (overallScore >= 70) healthGrade = "B";
  else if (overallScore >= 60) healthGrade = "C";
  else if (overallScore >= 50) healthGrade = "D";

  return {
    websiteType: "saas",
    overallScore,
    categoryScores: {
      trust: trustCheck.passed ? 100 : 0,
      conversion: (pricingCheck.passed ? 50 : 0) + ((trialCheck.passed || demoCheck.passed) ? 50 : 0),
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
