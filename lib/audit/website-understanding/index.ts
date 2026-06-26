import { GoogleGenAI } from "@google/genai";
import { ScrapedData, WebsiteType, WebsiteUnderstanding, WebsiteUnderstandingResult, WebsiteClassification } from "../../../types";

export async function understandWebsite(
  data: ScrapedData,
  classification?: WebsiteClassification // Phase 1A classification
): Promise<WebsiteUnderstandingResult> {
  
  // ─── Deterministic Extraction (Phase 4.5) ──────────────────────────────────
  
  // Value Proposition Extraction (Priority: Meta > OG > Hero > H1+H2)
  let rawVP = "";
  if (data.metaDescription && data.metaDescription.length > 20) {
    rawVP = data.metaDescription;
  } else if (data.h1s && data.h1s.length > 0) {
    rawVP = data.h1s[0];
    if (data.h2s && data.h2s.length > 0) {
      rawVP += " - " + data.h2s[0];
    }
  } else {
    rawVP = "Could not deterministically extract value proposition.";
  }

  // Audience & Business Model inferred from Classification
  const baseType = classification?.websiteType || "unknown";
  let targetAudience = "General Audience";
  let businessModel = "Unknown";
  let monetizationModel = "Unknown";
  
  if (baseType === "saas") {
    businessModel = "Software as a Service (B2B/B2C)";
    monetizationModel = data.hasPricing ? "Subscription Tiered" : "Enterprise / Custom Pricing";
    targetAudience = "Businesses and Professionals";
  } else if (baseType === "ecommerce") {
    businessModel = "Direct to Consumer (D2C)";
    monetizationModel = "One-time Purchase";
    targetAudience = "Consumers";
  } else if (baseType === "creator") {
    businessModel = "Creator / Influencer";
    monetizationModel = "Sponsorships, Infoproducts, or Community";
    targetAudience = "Fans and Followers";
  } else if (baseType === "agency") {
    businessModel = "Service Provider / Agency";
    monetizationModel = "Services (Retainer or Project)";
    targetAudience = "Businesses needing services";
  } else if (baseType === "local_business") {
    businessModel = "Local Service Business";
    monetizationModel = "Services (In-person)";
    targetAudience = "Local Residents/Businesses";
  }
  
  const deterministicFallback: WebsiteUnderstanding = {
    proposedWebsiteType: baseType,
    platformType: classification?.platformType || "N/A",
    websiteType: baseType,
    businessModel,
    primaryGoal: data.hasPricing ? "Direct Sales/Conversion" : (data.hasContactForm ? "Lead Generation" : "Brand Awareness"),
    targetAudience,
    pagePurpose: "Homepage / Landing Page",
    monetizationModel,
    valuePropositionRaw: rawVP,
    valuePropositionNormalized: rawVP,
    customerJourneyStage: "Awareness / Consideration",
    confidence: 0.5,
    evidence: ["Extracted deterministically from metadata, H1s, and classification."]
  };

  // ─── AI Cleanup ─────────────────────────────────────────────────────────────

  const prompt = `
You are a master business analyst and conversion rate optimization expert.
Analyze the following scraped website data to clean up and normalize the value proposition, and infer the deeper business model and target audience.

### SCRAPED DATA:
Title: ${data.title || "N/A"}
Meta Description: ${data.metaDescription || "N/A"}
H1s: ${(data.h1s || []).join(" | ")}
H2s: ${(data.h2s || []).slice(0, 10).join(" | ")}
CTAs: ${(data.ctaTexts || []).join(" | ")}
Has Pricing: ${data.hasPricing}
Has Contact Form: ${data.hasContactForm}
Deterministic Base Type: ${baseType}
Deterministic Raw Value Prop: ${rawVP}

### INSTRUCTIONS:
Return ONLY a valid JSON object matching this schema exactly, with NO markdown formatting, NO backticks, NO explanations.

{
  "proposedWebsiteType": "string (MUST BE EXACTLY ONE OF: saas, ecommerce, agency, creator, blog, local_business, marketplace, nonprofit, community, portfolio, or other)",
  "platformType": "string (e.g., Developer Platform, Design Platform, Website Platform, Productivity Platform, Creator Platform, Media Platform, or N/A)",
  "businessModel": "string (e.g., B2B SaaS, D2C Ecommerce, Local Service Provider, Creator/Influencer, Enterprise Agency)",
  "primaryGoal": "string (e.g., Lead Generation, Direct Sales, Audience Building, Brand Awareness)",
  "targetAudience": "string (e.g., Enterprise IT Buyers, Expecting Mothers, Local Homeowners, Independent Developers)",
  "pagePurpose": "string (e.g., Homepage, Product Landing Page, Pricing Page, Contact Page)",
  "monetizationModel": "string (e.g., Subscription, One-time Purchase, Advertising, Services, Freemium SaaS)",
  "valuePropositionRaw": "string (Copy the Deterministic Raw Value Prop exactly)",
  "valuePropositionNormalized": "string (Clean up the raw VP into a crisp, 10-word-or-less value proposition)",
  "customerJourneyStage": "string (e.g., Awareness, Consideration, Decision, Retention)",
  "confidence": number (0 to 1, indicating how certain you are of this analysis),
  "evidence": ["string", "string"] (List exactly 2-3 specific phrases or elements from the data that led to this conclusion)
}
`;

  let rawResponse = "";
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
      }
    });

    rawResponse = response.text || "";
    const parsed = JSON.parse(rawResponse) as WebsiteUnderstanding;
    
    // Safety check - ensure raw VP is carried over correctly
    if (!parsed.valuePropositionRaw) {
      parsed.valuePropositionRaw = rawVP;
    }
    
    return {
      data: parsed,
      log: {
        step: "website_understanding",
        status: "Success",
        fallbackUsed: false,
        rawResponse: rawResponse,
      }
    };
  } catch (error: any) {
    console.error("Website Understanding AI generation failed:", error);
    let aiStatus: import("../../../types").AiStatus = "AI_ERROR";
    const errorMessage = error.message || "";
    
    if (errorMessage.includes("429") || errorMessage.includes("RATE_LIMITED") || errorMessage.includes("exhausted")) {
      aiStatus = "AI_QUOTA_EXCEEDED";
    } else if (errorMessage.includes("503") || errorMessage.includes("unavailable") || errorMessage.includes("high demand")) {
      aiStatus = "AI_RATE_LIMITED";
    } else if (errorMessage.includes("API key not valid") || errorMessage.includes("INVALID_API_KEY") || errorMessage.includes("400")) {
      aiStatus = "AI_DISABLED";
    } else if (errorMessage.includes("timeout")) {
      aiStatus = "AI_TIMEOUT";
    }

    // Since AI failed, we fallback entirely to deterministic understanding
    return {
      data: deterministicFallback,
      log: {
        step: "website_understanding",
        status: "Failed",
        fallbackUsed: true,
        errorReason: errorMessage,
        rawResponse: rawResponse,
        aiStatus
      }
    };
  }
}
