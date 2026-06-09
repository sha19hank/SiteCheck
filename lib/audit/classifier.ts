import { ScrapedData, WebsiteType, WebsiteClassification, CategoryScores, ClassificationEvidence, VoteBreakdown, WebsiteUnderstanding, AiStatus } from "@/types";

const CATEGORY_KEYWORDS: Record<WebsiteType, string[]> = {
  saas: ["pricing", "free trial", "start free", "book demo", "features", "integrations", "dashboard", "software", "login", "sign up"],
  ecommerce: ["cart", "checkout", "add to cart", "shop", "shipping", "buy now", "store"],
  agency: ["case studies", "consultation", "strategy call", "what we do", "our work"],
  creator: ["youtube", "videos", "channel", "podcast", "creator", "merch", "patreon"],
  blog: ["articles", "blog", "latest posts", "read more", "posts"],
  local_business: ["location", "visit us", "appointment", "opening hours", "directions", "call now", "book appointment"],
  marketplace: ["buyers", "sellers", "listings", "vendors", "marketplace"],
  nonprofit: ["donate", "volunteer", "mission", "charity", "foundation", "support us"],
  community: ["forum", "members", "discussions", "discord", "join us", "groups"],
  portfolio: ["projects", "my work", "designer", "photographer", "resume"],
  other: [],
  unknown: []
};

export function classifyWebsite(data: ScrapedData): WebsiteClassification {
  const voteBreakdown: VoteBreakdown = {
    keyword: [],
    navigation: [],
    cta: [],
    structuredData: [],
    ai: [],
    businessModel: []
  };

  const totalVotes: CategoryScores = { saas: 0, ecommerce: 0, agency: 0, creator: 0, blog: 0, local_business: 0, marketplace: 0, nonprofit: 0, community: 0, portfolio: 0, other: 0, unknown: 0 };
  const evidenceList: ClassificationEvidence[] = [];

  const addVote = (signalType: keyof VoteBreakdown, category: WebsiteType, source: string, matchedText: string, voteValue: number) => {
    totalVotes[category] += voteValue;
    const ev: ClassificationEvidence = { signalType, category, source, matchedText, voteValue };
    voteBreakdown[signalType].push(ev);
    evidenceList.push(ev);
  };

  // Cap keyword contributions globally to prevent repeated words from skewing results
  const matchedKeywords = new Set<string>();

  // Helper for keyword checking
  const checkSignal = (items: string[], weight: number, source: string, signalType: keyof VoteBreakdown) => {
    if (!items || items.length === 0) return;
    for (const item of items) {
      if (!item || typeof item !== "string") continue;
      const lowerItem = item.toLowerCase();
      for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const kw of keywords) {
          if (lowerItem.includes(kw.toLowerCase())) {
            const matchKey = `${category}-${kw.toLowerCase()}`;
            if (!matchedKeywords.has(matchKey)) {
              addVote(signalType, category as WebsiteType, source, kw, weight);
              matchedKeywords.add(matchKey);
            }
          }
        }
      }
    }
  };

  // 1. Navigation Links (weight 5)
  checkSignal(data.navLinks, 5, "Navigation", "navigation");

  // 2. CTA Buttons (weight 5)
  checkSignal(data.ctaTexts, 5, "CTA", "cta");

  // 3. H1 & Headers & Meta & Title
  checkSignal(data.h1s, 4, "H1", "keyword");
  checkSignal([data.title || ""], 3, "Title", "keyword");
  checkSignal([data.metaDescription || ""], 2, "Meta Description", "keyword");
  checkSignal([...data.h2s, ...data.h3s], 2, "H2/H3", "keyword");

  // 4. Structured Data
  const sdMapping: Record<string, WebsiteType> = {
    "SoftwareApplication": "saas",
    "Product": "ecommerce",
    "LocalBusiness": "local_business",
    "Person": "creator",
    "BlogPosting": "blog",
    "Course": "creator"
  };
  for (const sd of data.structuredDataTypes) {
    if (sdMapping[sd]) {
      addVote("structuredData", sdMapping[sd], "JSON-LD", sd, 15); // Strong vote
    } else if (sd === "Organization") {
      addVote("structuredData", "saas", "JSON-LD", "Organization", 3);
      addVote("structuredData", "agency", "JSON-LD", "Organization", 3);
    }
  }

  // 5. Business Model Detector
  const textBody = (data.title + " " + data.metaDescription + " " + data.h1s.join(" ")).toLowerCase();
  if (textBody.includes("platform") && textBody.includes("software")) {
    addVote("businessModel", "saas", "Pattern Match", "platform + software", 10);
  }
  if (textBody.includes("marketplace") || textBody.includes("creators") || textBody.includes("buy and sell")) {
     addVote("businessModel", "marketplace", "Pattern Match", "marketplace terms", 10);
  }

  // Calculate deterministic top category
  const sortedCategories = Object.entries(totalVotes)
    .filter(([cat]) => cat !== "other" && cat !== "unknown")
    .sort((a, b) => b[1] - a[1]);

  const topScore = sortedCategories[0][1];
  const secondScore = sortedCategories.length > 1 ? sortedCategories[1][1] : 0;
  const topCategory = sortedCategories[0][0] as WebsiteType;

  // Initial Deterministic Confidence
  const THEORETICAL_MAX = 40; 
  const evidenceStrength = Math.min(topScore / THEORETICAL_MAX, 1.0);
  let separationStrength = 0;
  if (topScore > 0) {
    separationStrength = (topScore - secondScore) / topScore;
  }
  
  const baseConfidence = evidenceStrength * separationStrength;

  return {
    websiteType: topCategory,
    confidence: baseConfidence,
    confidenceTier: baseConfidence >= 0.4 ? "HIGH" : baseConfidence >= 0.25 ? "MEDIUM" : "LOW",
    evidence: evidenceList,
    deterministicScore: topScore,
    aiAgreement: false,
    aiStatus: "AI_DISABLED",
    classificationSummary: [],
    voteBreakdown,
    categoryScores: totalVotes,
    reasoning: [] // Deprecated
  };
}

export function reconcileClassification(deterministic: WebsiteClassification, ai: WebsiteUnderstanding, scrapeDiagnostics: any, aiLog?: any): WebsiteClassification {
  
  const aiVoteValue = 15;
  if (ai.proposedWebsiteType && ai.proposedWebsiteType !== "unknown" && ai.proposedWebsiteType !== "other") {
    deterministic.voteBreakdown.ai.push({
      signalType: "ai",
      category: ai.proposedWebsiteType,
      source: "Website Understanding",
      matchedText: `AI Proposed: ${ai.proposedWebsiteType}`,
      voteValue: aiVoteValue
    });
    deterministic.evidence.push(deterministic.voteBreakdown.ai[0]);
    deterministic.categoryScores[ai.proposedWebsiteType] = (deterministic.categoryScores[ai.proposedWebsiteType] || 0) + aiVoteValue;
  }

  // Recalculate top category
  const sortedCategories = Object.entries(deterministic.categoryScores)
    .filter(([cat]) => cat !== "other" && cat !== "unknown")
    .sort((a, b) => b[1] - a[1]);

  const topScore = sortedCategories[0][1];
  const secondScore = sortedCategories.length > 1 ? sortedCategories[1][1] : 0;
  const topCategory = sortedCategories[0][0] as WebsiteType;

  const aiAgreement = ai.proposedWebsiteType === topCategory;
  
  let aiStatus: AiStatus = aiLog?.aiStatus || "AI_AVAILABLE";
  if (!aiLog?.fallbackUsed && !aiAgreement) {
    aiStatus = "AI_DISAGREEMENT";
  }

  // Rebuild confidence
  // Confidence must consider: Signal Strength, Vote Separation, Evidence Volume, Scrape Quality, AI Agreement.
  const signalStrength = Math.min(topScore / 50, 1.0);
  const voteSeparation = topScore > 0 ? (topScore - secondScore) / topScore : 0;
  const evidenceVolume = Math.min(deterministic.evidence.length / 10, 1.0);
  
  let confidence = (signalStrength * 0.35) + (voteSeparation * 0.35) + (evidenceVolume * 0.1);
  
  if (aiAgreement) {
    confidence += 0.2;
  }
  
  // Scrape Quality floor
  if (scrapeDiagnostics?.scrapeQuality === "HIGH") {
    confidence = Math.max(confidence, 0.4);
  } else if (scrapeDiagnostics?.scrapeQuality === "LOW") {
     confidence *= 0.5; // Penalty
  }

  // Safety fallback
  let finalCategory = topCategory;
  if (confidence < 0.25) {
     finalCategory = "other";
  }

  // Classification Explainability
  const classificationSummary: string[] = [];
  const topSignals = [...deterministic.evidence]
    .filter(s => s.category === finalCategory)
    .sort((a,b) => b.voteValue - a.voteValue)
    .slice(0, 4);

  topSignals.forEach(s => {
    let text = "";
    if (s.signalType === "ai") text = "AI understanding agreed";
    else if (s.signalType === "structuredData") text = `${s.matchedText} schema detected`;
    else if (s.signalType === "cta") text = `"${s.matchedText}" CTA detected`;
    else if (s.signalType === "navigation") text = `"${s.matchedText}" navigation detected`;
    else text = `"${s.matchedText}" keyword detected in ${s.source}`;
    classificationSummary.push(text);
  });
  
  if (classificationSummary.length === 0) {
    classificationSummary.push(`Assigned ${finalCategory} due to fallback or generic features.`);
  }

  deterministic.websiteType = finalCategory;
  deterministic.platformType = ai.platformType && ai.platformType !== "Unknown" ? ai.platformType : undefined;
  deterministic.confidence = Number(confidence.toFixed(4));
  
  let confidenceTier: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  if (confidence >= 0.4) confidenceTier = "HIGH";
  else if (confidence >= 0.25) confidenceTier = "MEDIUM";
  
  deterministic.confidenceTier = confidenceTier;
  deterministic.aiAgreement = aiAgreement;
  deterministic.aiStatus = aiStatus;
  deterministic.classificationSummary = classificationSummary;

  return deterministic;
}
