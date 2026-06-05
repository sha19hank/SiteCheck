import { ScrapedData, WebsiteType, WebsiteClassification, CategoryScores } from "@/types";

const CATEGORY_KEYWORDS: Record<WebsiteType, string[]> = {
  saas: ["pricing", "free trial", "start free", "book demo", "features", "integrations", "dashboard", "software", "login", "sign up"],
  ecommerce: ["cart", "checkout", "product", "add to cart", "shop", "shipping", "buy now", "store"],
  agency: ["services", "clients", "case studies", "portfolio", "consultation", "strategy call", "what we do", "our work"],
  creator: ["youtube", "videos", "subscribe", "channel", "podcast", "creator", "merch", "patreon"],
  blog: ["articles", "blog", "newsletter", "categories", "latest posts", "read more", "posts"],
  local_business: ["location", "visit us", "appointment", "opening hours", "directions", "call now", "menu", "book appointment"],
  marketplace: ["buyers", "sellers", "listings", "vendors", "marketplace"],
  nonprofit: ["donate", "volunteer", "mission", "charity", "foundation", "support us"],
  community: ["forum", "community", "members", "discussions", "discord", "join us", "groups"],
  portfolio: ["projects", "my work", "designer", "developer", "photographer", "resume"],
  other: [],
  unknown: []
};

export function classifyWebsite(data: ScrapedData): WebsiteClassification {
  const scores: CategoryScores = {
    saas: 0,
    ecommerce: 0,
    agency: 0,
    creator: 0,
    blog: 0,
    local_business: 0,
    marketplace: 0,
    nonprofit: 0,
    community: 0,
    portfolio: 0,
    other: 0,
    unknown: 0
  };

  const reasoning: string[] = [];

  // Helper to check keywords against an array of strings
  const checkSignal = (items: string[], weight: number, source: string) => {
    if (!items || items.length === 0) return;
    
    for (const item of items) {
      if (!item || typeof item !== "string") continue;
      const lowerItem = item.toLowerCase();
      
      for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const kw of keywords) {
          if (lowerItem.includes(kw.toLowerCase())) {
            scores[category as WebsiteType] += weight;
            reasoning.push(`[+${weight} ${category}] '${kw}' found in ${source}: "${item.substring(0, 50)}"`);
          }
        }
      }
    }
  };

  // 1. Navigation Links (weight 5)
  checkSignal(data.navLinks, 5, "Navigation");

  // 2. CTA Buttons (weight 4)
  checkSignal(data.ctaTexts, 4, "CTA");

  // 3. H1 (weight 4)
  checkSignal(data.h1s, 4, "H1");

  // 4. Title (weight 3)
  checkSignal([data.title || ""], 3, "Title");

  // 5. Meta Description (weight 2)
  checkSignal([data.metaDescription || ""], 2, "Meta Description");

  // 6. H2/H3 (weight 2)
  checkSignal([...data.h2s, ...data.h3s], 2, "H2/H3");

  // Calculate top categories
  const sortedCategories = Object.entries(scores)
    .filter(([cat]) => cat !== "other" && cat !== "unknown")
    .sort((a, b) => b[1] - a[1]);

  const topScore = sortedCategories[0][1];
  const secondScore = sortedCategories[1][1];
  const topCategory = sortedCategories[0][0] as WebsiteType;

  // Calculate Confidence: EvidenceStrength * SeparationStrength
  // Define theoretical maximum (a heuristic limit to normalize against)
  // We assume a "strong" evidence score is 20 points.
  const THEORETICAL_MAX = 20; 
  const evidenceStrength = Math.min(topScore / THEORETICAL_MAX, 1.0);
  
  let separationStrength = 0;
  if (topScore > 0) {
    separationStrength = (topScore - secondScore) / topScore;
  }

  const confidence = evidenceStrength * separationStrength;

  // Apply safety threshold
  let finalCategory = topCategory;
  if (confidence < 0.35) {
    finalCategory = "other";
    reasoning.push(`Fallback: Confidence ${confidence.toFixed(2)} is below 0.35 threshold. Switching ${topCategory} to other.`);
  }

  // Debug logging
  console.log("\n[CLASSIFIER]");
  console.log("Type:", finalCategory);
  console.log("Confidence:", confidence.toFixed(2));
  console.log("Scores:", sortedCategories.slice(0, 3).map(([c, s]) => `${c}: ${s}`).join(", "));
  console.log("Reasoning:");
  reasoning.forEach(r => console.log(" - " + r));
  console.log("\n");

  return {
    websiteType: finalCategory,
    confidence: Number(confidence.toFixed(4)),
    categoryScores: scores,
    reasoning
  };
}
