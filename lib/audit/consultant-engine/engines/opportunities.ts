import { ScrapedData, BusinessContext, EvaluatedGap, Opportunity, IntelligenceEngineResult } from "@/types";

export function discoverOpportunities(
  data: ScrapedData,
  context: BusinessContext,
  gaps: EvaluatedGap[]
): IntelligenceEngineResult<Opportunity[]> {
  const opportunities: Opportunity[] = [];
  const engineEvidence: string[] = [];

  // Category 1: Asset Leverage (Underutilized strengths)
  if (data.hasTestimonials && data.navLinks.length > 0) {
    // If they have testimonials but we see trust gaps elsewhere (or even if we don't), they could reuse them
    opportunities.push({
      category: "Asset Leverage",
      title: "Reuse Existing Testimonials Across the Funnel",
      description: "You have strong customer testimonials, but they are likely only displayed in one location. Reuse these on pricing pages, signup forms, and landing pages to reduce friction at critical conversion points.",
      opportunityScore: 85,
      evidence: ["Testimonials detected on site."]
    });
    engineEvidence.push("Identified Asset Leverage: Reuse testimonials.");
  }

  const hasActiveBlog = data.navLinks.some(n => n.toLowerCase().includes("blog")) && data.bodyWordCount > 1000;
  if (hasActiveBlog && !data.hasEmail && data.ctaTexts.filter(c => c.toLowerCase().includes("subscribe") || c.toLowerCase().includes("newsletter")).length === 0) {
    opportunities.push({
      category: "Asset Leverage",
      title: "Convert Blog Traffic into an Audience Asset",
      description: "You have an active blog generating content, but no clear newsletter/email capture. Add a high-value lead magnet or newsletter signup to turn transient visitors into a recurring audience.",
      opportunityScore: 90,
      evidence: ["Blog detected.", "No newsletter or email capture CTAs found."]
    });
    engineEvidence.push("Identified Asset Leverage: Blog without email capture.");
  }

  // Category 2: Missing Revenue
  if (context.pricingStrategy === "Free / Open Source" && context.growthStage !== "Pre-Launch") {
    opportunities.push({
      category: "Missing Revenue",
      title: "Introduce a Premium Tier for Power Users",
      description: "You are giving away significant value for free. A segment of your users would likely pay for advanced features, priority support, or hosted versions.",
      opportunityScore: 75,
      evidence: ["Pricing strategy is Free/Open Source.", `Growth stage is ${context.growthStage}.`]
    });
    engineEvidence.push("Identified Missing Revenue: Free tool could add premium tier.");
  }

  if (context.pricingStrategy === "Subscription" && !data.ctaTexts.some(c => c.toLowerCase().includes("annual"))) {
    opportunities.push({
      category: "Missing Revenue",
      title: "Offer Annual Pricing Discounts",
      description: "If you only offer monthly subscriptions, you are missing out on upfront cash flow and locking in lower churn rates. Offer a 15-20% discount for annual commitments.",
      opportunityScore: 80,
      evidence: ["Subscription pricing detected.", "No 'annual' discount language found in CTAs."]
    });
    engineEvidence.push("Identified Missing Revenue: Annual pricing discount.");
  }

  // Category 3: Competitive Gaps
  if (context.websiteType === "saas" && !data.navLinks.some(n => n.toLowerCase().includes("vs") || n.toLowerCase().includes("compare"))) {
    opportunities.push({
      category: "Competitive Gaps",
      title: "Create Competitor Comparison Pages",
      description: "Buyers are already comparing you to alternatives. Create dedicated '[You] vs [Competitor]' pages to control the narrative and capture high-intent search traffic.",
      opportunityScore: 88,
      evidence: ["SaaS website type.", "No comparison pages found in navigation."]
    });
    engineEvidence.push("Identified Competitive Gaps: Missing comparison pages for SaaS.");
  }

  return {
    data: opportunities,
    confidence: 0.9, // Opportunities are additive, so confidence is generally high that they are good ideas
    evidence: engineEvidence,
    debugMetadata: {
      opportunitiesFound: opportunities.length
    }
  };
}
