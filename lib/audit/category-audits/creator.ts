import { ScrapedData, CategoryAudit, CategoryFinding, CategoryRecommendation } from "@/types";
import { CHECK_NEWSLETTER, CHECK_SOCIAL_LINKS } from "../check-registry";

export function runCreatorAudit(data: ScrapedData): CategoryAudit {
  const findings: CategoryFinding[] = [];
  const recommendations: CategoryRecommendation[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const auditSignals: Record<string, any> = {};

  let earnedPoints = 0;
  const maxPoints = 100;

  // Check 1: Newsletter / Subscribe
  const newsletterCheck = CHECK_NEWSLETTER(data);
  auditSignals.newsletterDetected = newsletterCheck.passed;
  if (!newsletterCheck.passed) {
    findings.push({
      id: "creator_missing_newsletter",
      title: "Missing audience capture",
      description: "No newsletter or subscribe CTA was found. Creators must own their audience off-platform.",
      severity: "critical",
      category: "conversion",
      priority: 95,
      evidence: newsletterCheck.evidence,
      source: "ctaTexts"
    });
    recommendations.push({
      title: "Add a newsletter capture form with a lead magnet",
      why_it_matters: "Social platforms limit reach. An email list guarantees direct access to your superfans.",
      how_to_fix: "Offer a free resource (like a guide or exclusive video) in exchange for email signups.",
      impact: "high",
      effort: "medium"
    });
    weaknesses.push("No audience ownership");
  } else {
    earnedPoints += 50;
    strengths.push("Audience capture enabled");
  }

  // Check 2: Social Links
  const socialCheck = CHECK_SOCIAL_LINKS(data);
  auditSignals.socialLinksDetected = socialCheck.passed;
  if (!socialCheck.passed) {
    findings.push({
      id: "creator_missing_socials",
      title: "Missing social ecosystem links",
      description: "No links to external social platforms detected.",
      severity: "high",
      category: "clarity",
      priority: 80,
      evidence: socialCheck.evidence,
      source: "socialLinks"
    });
    recommendations.push({
      title: "Link all active platforms in the header or footer",
      why_it_matters: "Fans want to follow you across the ecosystem. Cross-pollination drives overall growth.",
      how_to_fix: "Add highly visible icons linking to your YouTube, Twitter/X, Instagram, and TikTok.",
      impact: "medium",
      effort: "low"
    });
    weaknesses.push("Siloed content");
  } else {
    earnedPoints += 50;
    strengths.push("Cross-platform links active");
  }

  const overallScore = Math.round((earnedPoints / maxPoints) * 100);
  let healthGrade = "F";
  if (overallScore >= 90) healthGrade = "A+";
  else if (overallScore >= 80) healthGrade = "A";
  else if (overallScore >= 70) healthGrade = "B";
  else if (overallScore >= 60) healthGrade = "C";
  else if (overallScore >= 50) healthGrade = "D";

  return {
    websiteType: "creator",
    overallScore,
    categoryScores: {
      trust: 100,
      conversion: newsletterCheck.passed ? 100 : 0,
      clarity: socialCheck.passed ? 100 : 0,
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
