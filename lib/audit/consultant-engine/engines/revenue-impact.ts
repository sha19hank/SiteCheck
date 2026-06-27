import { BusinessContext, EvaluatedGap, RevenueImpact, IntelligenceEngineResult } from "@/types";

export function estimateRevenueImpact(
  gaps: EvaluatedGap[],
  context: BusinessContext
): IntelligenceEngineResult<Map<string, RevenueImpact>> {
  const impacts = new Map<string, RevenueImpact>();
  const engineEvidence: string[] = [];

  // Determine Traffic Proxy Tier
  let trafficTier: RevenueImpact["trafficTier"] = "Tier 1: < 1K";
  let estimatedMonthlyTraffic = 500;
  
  if (context.growthStage === "Enterprise") {
    trafficTier = "Tier 4: 100K+";
    estimatedMonthlyTraffic = 150000;
  } else if (context.growthStage === "Scale") {
    trafficTier = "Tier 3: 10K-100K";
    estimatedMonthlyTraffic = 30000;
  } else if (context.growthStage === "Growth") {
    trafficTier = "Tier 2: 1K-10K";
    estimatedMonthlyTraffic = 3000;
  }

  // Determine average customer value (LTV or AOV proxy)
  let averageValue = 50; // Default low
  if (context.pricingStrategy === "Enterprise / Custom") averageValue = 5000;
  else if (context.pricingStrategy === "Subscription") averageValue = 500; // Proxy for SaaS LTV
  else if (context.businessModel === "Ecommerce") averageValue = 100;
  
  for (const gap of gaps) {
    // Only estimate revenue for High/Critical impact gaps to avoid over-promising
    if (gap.importance !== "critical" && gap.importance !== "important") {
      continue;
    }

    if (gap.confidence < 0.5) {
      engineEvidence.push(`Skipped revenue estimate for '${gap.id}' due to low confidence (${gap.confidence}).`);
      continue;
    }

    let expectedImprovementRate = 0.05; // 5% improvement baseline
    if (gap.affectedArea === "conversion") expectedImprovementRate = 0.15;
    else if (gap.affectedArea === "trust") expectedImprovementRate = 0.10;

    const baseConversionRate = 0.02; // 2% industry avg
    const additionalConversions = estimatedMonthlyTraffic * baseConversionRate * expectedImprovementRate;
    
    const estimateMid = additionalConversions * averageValue;
    const estimateLow = Math.floor(estimateMid * 0.5);
    const estimateHigh = Math.floor(estimateMid * 1.5);

    impacts.set(gap.id, {
      estimateLow,
      estimateHigh,
      trafficTier,
      assumptions: [
        `Traffic estimated at ${trafficTier} based on growth stage (${context.growthStage}).`,
        `Assumed base conversion rate of ${(baseConversionRate * 100).toFixed(1)}%.`,
        `Expected relative improvement of ${(expectedImprovementRate * 100).toFixed(0)}% from fixing this issue.`,
        `Average customer value estimated at $${averageValue}.`
      ]
    });
    
    engineEvidence.push(`Estimated revenue impact for '${gap.id}': $${estimateLow} - $${estimateHigh}/mo.`);
  }

  return {
    data: impacts,
    confidence: 0.7, // Revenue estimates are inherently uncertain proxies
    evidence: engineEvidence,
    debugMetadata: {
      calculatedImpacts: impacts.size,
      trafficTier,
      averageValue
    }
  };
}
