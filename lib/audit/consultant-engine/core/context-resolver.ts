import { WebsiteClassification, WebsiteUnderstanding, BusinessContext } from "@/types";

export function resolveBusinessContext(
  classification: WebsiteClassification,
  understanding: WebsiteUnderstanding
): BusinessContext {
  const websiteType = classification.websiteType;
  
  // Deterministic mapping for Growth Stage
  let growthStage: BusinessContext["growthStage"] = "Unknown";
  const rawStage = understanding.customerJourneyStage?.toLowerCase() || "";
  if (rawStage.includes("pre-launch") || rawStage.includes("idea")) growthStage = "Pre-Launch";
  else if (rawStage.includes("early")) growthStage = "Early Stage";
  else if (rawStage.includes("growth") || rawStage.includes("scale")) growthStage = "Growth";
  else if (rawStage.includes("enterprise") || rawStage.includes("mature")) growthStage = "Enterprise";
  else growthStage = "Early Stage"; // Safe default

  // Deterministic mapping for Go-to-Market Motion
  let goToMarketMotion: BusinessContext["goToMarketMotion"] = "Unknown";
  if (websiteType === "saas") {
    goToMarketMotion = "PLG"; // Default for SaaS unless sales-led signals
  } else if (websiteType === "creator") {
    goToMarketMotion = "Content-Led";
  } else if (websiteType === "community") {
    goToMarketMotion = "Community-Led";
  } else {
    goToMarketMotion = "Hybrid";
  }

  // Deterministic mapping for Pricing Strategy
  let pricingStrategy: BusinessContext["pricingStrategy"] = "Unknown";
  if (websiteType === "saas") {
    pricingStrategy = "Subscription";
  } else if (websiteType === "ecommerce") {
    pricingStrategy = "One-Time";
  } else if (websiteType === "agency") {
    pricingStrategy = "Enterprise / Custom";
  }

  // Default to conservative estimates
  return {
    websiteType,
    businessModel: understanding.businessModel || "Unknown",
    targetAudience: understanding.targetAudience || "Unknown",
    primaryGoal: understanding.primaryGoal || "Unknown",
    valueProposition: understanding.valuePropositionNormalized || "Unknown",
    monetization: understanding.monetizationModel || "Unknown",
    platformType: understanding.platformType || "Unknown",
    growthStage,
    visitorIntent: understanding.pagePurpose || "Unknown",
    industryVertical: "Unknown", // Will refine in v3
    goToMarketMotion,
    pricingStrategy,
    acquisitionModel: "Unknown",
    competitivePosition: "Unknown",
    businessMaturity: "Unknown",
    revenueModel: "Unknown"
  };
}
