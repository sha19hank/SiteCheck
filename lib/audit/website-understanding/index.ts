import { GoogleGenAI } from "@google/genai";
import { ScrapedData, WebsiteType, WebsiteUnderstanding, WebsiteUnderstandingResult } from "../../../types";

export async function understandWebsite(
  data: ScrapedData,
  websiteType: WebsiteType
): Promise<WebsiteUnderstandingResult> {
  const prompt = `
You are a master business analyst and conversion rate optimization expert.
Analyze the following scraped website data to understand the underlying business model, target audience, and primary goals.

### SCRAPED DATA:
Title: ${data.title || "N/A"}
Meta Description: ${data.metaDescription || "N/A"}
H1s: ${(data.h1s || []).join(" | ")}
H2s: ${(data.h2s || []).slice(0, 10).join(" | ")}
CTAs: ${(data.ctaTexts || []).join(" | ")}
Has Pricing: ${data.hasPricing}
Has Contact Form: ${data.hasContactForm}
Has E-commerce Elements (Cart/Checkout): ${data.ctaTexts?.some(t => t.toLowerCase().includes("cart") || t.toLowerCase().includes("checkout")) ? "Yes" : "No"}

### INSTRUCTIONS:
Return ONLY a valid JSON object matching this schema exactly, with NO markdown formatting, NO backticks, NO explanations.

{
  "websiteType": "${websiteType}",
  "businessModel": "string (e.g., B2B SaaS, D2C Ecommerce, Local Service Provider, Creator/Influencer, Enterprise Agency)",
  "primaryGoal": "string (e.g., Lead Generation, Direct Sales, Audience Building, Brand Awareness)",
  "targetAudience": "string (e.g., Enterprise IT Buyers, Expecting Mothers, Local Homeowners, Independent Developers)",
  "pagePurpose": "string (e.g., Homepage, Product Landing Page, Pricing Page, Contact Page)",
  "monetizationModel": "string (e.g., Subscription, One-time Purchase, Advertising, Services, Freemium SaaS)",
  "valueProposition": "string (The core promise being made to the user, in 10 words or less)",
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
    return {
      data: {
        websiteType: websiteType,
        businessModel: "Unknown Business",
        primaryGoal: "Conversion",
        targetAudience: "General Audience",
        pagePurpose: "Homepage",
        monetizationModel: "Unknown",
        valueProposition: "Unknown",
        customerJourneyStage: "Awareness",
        confidence: 0,
        evidence: ["Fallback used due to missing API key or failure."]
      },
      log: {
        step: "website_understanding",
        status: "Failed",
        fallbackUsed: true,
        errorReason: error.message,
        rawResponse: rawResponse,
      }
    };
  }
}
