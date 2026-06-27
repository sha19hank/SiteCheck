import { EvaluatedGap, BusinessContext, NotRecommendedItem } from "@/types";

export function getNotRecommendedItems(
  gaps: EvaluatedGap[],
  context: BusinessContext
): NotRecommendedItem[] {
  const items: NotRecommendedItem[] = [];

  // Filter out contradictory gaps (which represent forbidden signals)
  const forbiddenGaps = gaps.filter(g => g.type === "contradictory");
  
  forbiddenGaps.forEach(gap => {
    items.push({
      feature: gap.title.replace("Forbidden Signal Detected: ", ""),
      reason: `Not recommended because ${gap.businessReason}`
    });
  });

  // Also manually add common "not recommended" items based on context if no gaps exist
  // This builds trust by showing intentional omissions
  if (context.websiteType === "saas" && context.goToMarketMotion === "PLG") {
    if (!items.find(i => i.feature.toLowerCase().includes("phone"))) {
      items.push({
        feature: "Phone Number Support",
        reason: "Not recommended because PLG SaaS businesses typically convert and support users asynchronously to scale effectively."
      });
    }
  }

  if (context.growthStage === "Pre-Launch") {
    items.push({
      feature: "Heavy SEO Content (Blog)",
      reason: "Not recommended because your company appears pre-launch. Focus on validating the core product and direct acquisition first."
    });
  }

  return items;
}
