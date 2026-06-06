import { GoogleGenAI } from "@google/genai";
import { CategoryFinding, WebsiteUnderstanding, GrowthReport, GrowthReportResult } from "../../../types";

export async function generateGrowthReport(
  understanding: WebsiteUnderstanding,
  findings: CategoryFinding[]
): Promise<GrowthReportResult> {
  // Only process high and medium severity findings to focus on true growth levers
  const actionableFindings = findings.filter(f => f.severity === "high" || f.severity === "medium").slice(0, 8);

  const prompt = `
You are a Growth Consultant. 
We have already run deterministic audits on a website and inferred its business model.

### BUSINESS CONTEXT (From AI Understanding):
- Business Model: ${understanding.businessModel}
- Target Audience: ${understanding.targetAudience}
- Primary Goal: ${understanding.primaryGoal}
- Monetization Model: ${understanding.monetizationModel}
- Value Proposition: ${understanding.valueProposition}

### DETERMINISTIC FINDINGS (From Rule-based Audit):
${actionableFindings.map((f, i) => `
Finding ${i + 1}:
- Title: ${f.title}
- Severity: ${f.severity}
- Category: ${f.category}
- Description: ${f.description || "None"}
`).join("\n")}

### INSTRUCTIONS:
You must translate these rigid, technical findings into contextual Growth Insights that explain WHY this matters to THIS specific business model.

Return ONLY a valid JSON object matching this schema exactly, with NO markdown formatting, NO backticks.

{
  "readinessScore": number (0-100, calculate based on how well the site supports the ${understanding.primaryGoal} for ${understanding.targetAudience}),
  "insights": [
    {
      "title": "string (A punchy, actionable title for the insight)",
      "impact": "high" | "medium" | "low",
      "confidence": number (0-1),
      "detected": "string (Exactly what was found, referring directly to the finding)",
      "evidence": ["string", "string"] (List the specific technical details or missing elements),
      "whyItMatters": "string (Explain the conversion or revenue impact)",
      "recommendedAction": "string (Specific instruction on what to fix)"
    }
  ]
}

Note: Generate exactly one insight per finding provided above.
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
        temperature: 0.2,
        responseMimeType: "application/json",
      }
    });

    rawResponse = response.text || "";
    const parsed = JSON.parse(rawResponse) as GrowthReport;
    
    // Map contexts dynamically if the LLM missed them or we want strict mapping
    parsed.insights.forEach((insight, i) => {
        const finding = actionableFindings[i];
        if (finding) {
            insight.findingContext = finding.description || finding.title;
        }
        if (!insight.understandingContext) {
            insight.understandingContext = `Impacts ${understanding.businessModel} targeting ${understanding.targetAudience}`;
        }
    });

    return {
      data: parsed,
      log: {
        step: "growth_engine",
        status: "Success",
        fallbackUsed: false,
        rawResponse: rawResponse,
      }
    };
  } catch (error: any) {
    console.error("Growth Engine AI generation failed:", error);
    
    // Create deterministic fallback insights
    const fallbackInsights = actionableFindings.map(f => ({
      title: f.title,
      impact: (f.severity === "high" || f.severity === "critical" ? "high" : "medium") as "high" | "medium" | "low",
      confidence: 1,
      detected: f.description || "Issue detected by automated checks.",
      evidence: [f.title],
      findingContext: f.description || f.title,
      understandingContext: `Fallback context for ${understanding.businessModel}`,
      whyItMatters: "This issue impacts user experience and conversion.",
      recommendedAction: "Fix the identified issue according to best practices."
    }));

    return {
      data: {
        readinessScore: 80,
        insights: fallbackInsights
      },
      log: {
        step: "growth_engine",
        status: "Failed",
        fallbackUsed: true,
        errorReason: error.message,
        rawResponse: rawResponse,
      }
    };
  }
}
