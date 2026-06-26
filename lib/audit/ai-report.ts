import { GoogleGenAI } from "@google/genai";
import type {
  AuditScores, ScrapedData, PageSpeedData,
  AIReport, QuickWin, SectionInsight, ScreenshotData, PageType,
} from "@/types";

// Initialize cautiously so it doesn't crash on import if key is missing
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "missing" });

// ─── Industry context blocks injected into the prompt ─────────────────────────
const INDUSTRY_CONTEXT: Record<PageType, string> = {
  service_business: `Service business (agency/consultant). Key: trust signals (testimonials, contact info), clear services. Visitors evaluate trust.`,
  ecommerce: `Ecommerce. Key: product clarity, trust badges, shipping info, reviews. Visitors evaluate security.`,
  saas: `SaaS. Key: clear value prop, free trial CTA above fold, pricing transparency. Specificity beats generic claims.`,
  portfolio: `Portfolio. Key: contact info, case studies, authentic voice, 'hire me' CTA.`,
  local_business: `Local business (restaurant/clinic/shop). Key: address, phone, hours, Google Maps, local reviews.`,
  blog: `Blog. Key: email signup, related content, author identity. Goal: audience building.`,
  unknown: `General business. Apply universal best practices: clear value prop, contact info, social proof, primary CTA.`,
};

// ─── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `You are an elite, highly-paid website growth consultant reviewing a client's site.
STRICT RULES:
1. Only explain issues in the findings JSON. NO hallucinations.
2. NO technical jargon (e.g. translate LCP -> "time for main content to appear").
3. TONE & CAUTION: Use nuanced, conditional phrasing for missing elements (e.g., "We couldn't clearly identify a primary CTA..." rather than "You have no CTA"). Do not make absolute claims when confidence is low.
4. COMMUNICATION ANALYSIS: Describe how users psychologically experience the page. If the body word count is low, mention if the offer is clear. If it is a wall of text, point out the cognitive overload.
5. VALUE PROPOSITION: Explicitly critique the provided H1. Is it a generic buzzword salad? Does it clearly state what they do and who it is for?
6. TRUST FLOW: Analyze how they sequence trust. Point out friction if they ask for the sale/contact before proving value with social proof.
7. Explain WHY things matter using psychological hooks (e.g., "Visitors may hesitate when...", "Trust is broken when...").
8. POSITIVE REINFORCEMENT: Acknowledge at least 1-2 things they are doing right (e.g., "Your site establishes a clean first impression") to build trust and emotional balance.
9. BLUF SUMMARY: Start the consultantSummary with the single biggest business bottleneck (the "Bottom Line Up Front"). Do not just list issues; tell a strategic story.
10. Prioritize business impact: trust/contact info > minor technical issues.
11. Generate EXACTLY 3 quick wins ranked by business impact. effortLevel: "easy", "medium", "involved".
12. Avoid repetitive phrasing. Use varied sentence structures and avoid starting every tip with "Add" or "Fix".
13. Output strictly as JSON.`;

const JSON_SCHEMA_SKELETON = `
{
  "consultantSummary": "3-4 sentences personalized to site/industry",
  "overallNarrative": "1 punchy headline sentence, max 12 words",
  "quickWins": [
    {
      "title": "max 8 words",
      "whyItMatters": "2-3 sentences, business-focused psychological explanation",
      "howToFix": "specific, actionable, mention tools",
      "category": "performance|trust|clarity|conversion",
      "effortLevel": "easy|medium|involved"
    }
  ],
  "sectionInsights": [
    {
      "dimension": "performance|trust|clarity|conversion",
      "summary": "2-3 sentence consultant paragraph",
      "keyFinding": "1 sentence, most important takeaway",
      "positives": ["plain English, what is working"],
      "improvements": ["plain English, what needs work"]
    }
  ]
}
`;

// ─── Build the user message ────────────────────────────────────────────────────
function buildPrompt(
  domain: string,
  scores: AuditScores,
  scraped: ScrapedData,
  screenshot: ScreenshotData | null,
): string {
  const allFindings = [
    ...scores.performance.findings.map(f => ({ category: "performance", check: f.title || f.id, detail: f.description || "", severity: f.severity })),
    ...scores.trust.findings.map(f => ({ category: "trust", check: f.title || f.id, detail: f.description || "", severity: f.severity })),
    ...scores.clarity.findings.map(f => ({ category: "clarity", check: f.title || f.id, detail: f.description || "", severity: f.severity })),
    ...scores.conversion.findings.map(f => ({ category: "conversion", check: f.title || f.id, detail: f.description || "", severity: f.severity })),
  ];

  const industryCtx = INDUSTRY_CONTEXT[scraped.pageType] ?? INDUSTRY_CONTEXT.unknown;

  // Minimal token usage for screenshot context
  let screenshotCtx = "Screenshot: N/A";
  if (screenshot?.captureSuccess) {
    screenshotCtx = `CTA above fold: Desktop=${screenshot.ctaAboveFold}, Mobile=${screenshot.ctaAboveFoldMobile}. CTA Text: "${screenshot.ctaText}". Hero Image: ${screenshot.hasHeroImage}.`;
  }

  // Compress findings payload to save tokens
  const findingsPayload = allFindings.map(f => `${f.category}|${f.severity}|${f.check}${f.detail ? `|${f.detail}` : ''}`).join('\\n');

  return `Analyse this website and generate a consultant-style growth report.

WEBSITE: ${domain}
INDUSTRY: ${scraped.pageType}. ${industryCtx}
SCORES (0-100): Overall ${scores.overall}, Perf ${scores.performance.score}, Trust ${scores.trust.score}, Clarity ${scores.clarity.score}, Conv ${scores.conversion.score}

FINDINGS (category|severity|check|detail):
${findingsPayload}

CONTEXT:
H1: "${scraped.h1s[0] ?? "none"}"
Meta: "${scraped.metaDescription ?? "none"}"
Word Count: ${scraped.bodyWordCount} words
CTAs: ${scraped.ctaTexts.slice(0, 2).join(", ")}
Nav: ${scraped.navLinks.slice(0, 4).join(", ")}
Forms/Contact: Phone=${scraped.hasPhone}, Form=${scraped.hasContactForm}(${scraped.formFieldCount} fields)
Elements: Pricing=${scraped.hasPricing}, Testimonials=${scraped.hasTestimonials}
${screenshotCtx}

Return JSON matching exactly this skeleton:
${JSON_SCHEMA_SKELETON}`;
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function generateAIReport(
  domain:      string,
  scores:      AuditScores,
  scraped:     ScrapedData,
  pageSpeed:   PageSpeedData,
  screenshot:  ScreenshotData | null = null,
): Promise<AIReport> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY missing, using fallback report.");
      return fallbackAIReport(domain, scores, scraped.pageType);
    }

    const prompt = buildPrompt(domain, scores, scraped, screenshot);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    const rawText = response.text;
    if (!rawText) throw new Error("Empty response from Gemini");

    const parsed = JSON.parse(rawText);

    if (!parsed.consultantSummary || !Array.isArray(parsed.quickWins)) {
      throw new Error("Invalid AI response structure");
    }

    return {
      consultantSummary: parsed.consultantSummary,
      overallNarrative:  parsed.overallNarrative ?? "",
      quickWins:         parsed.quickWins.slice(0, 3),
      sectionInsights:   parsed.sectionInsights ?? [],
      generatedAt:       new Date().toISOString(),
    };
  } catch (err) {
    console.error("AI report generation failed:", err);
    return fallbackAIReport(domain, scores, scraped.pageType);
  }
}

// ─── Industry-aware fallback ──────────────────────────────────────────────────
function fallbackAIReport(domain: string, scores: AuditScores, pageType: PageType): AIReport {
  const worstDim = (["trust","conversion","clarity","performance"] as const)
    .slice()
    .sort((a, b) => scores[a].score - scores[b].score)[0];

  const industryTips: Record<PageType, QuickWin> = {
    service_business: {
      title: "Add client testimonials with specific results",
      whyItMatters: "Service businesses live or die by social proof. Visitors naturally hesitate to commit time or money without seeing that others have successfully trusted you first. A single specific testimonial is often worth more than five generic ones.",
      howToFix: "Place 2–3 testimonials directly on your homepage, ideally with the client's name, company, and a specific result they achieved. Position them immediately near your main CTA button.",
      category: "trust", effortLevel: "easy",
    },
    ecommerce: {
      title: "Add trust badges near your purchase CTA",
      whyItMatters: "Shoppers frequently abandon their carts when they don't feel entirely safe entering payment details. Visible security badges and a clear returns policy provide the psychological safety needed to complete a purchase.",
      howToFix: "Integrate an SSL badge, accepted payment icons, and a one-line returns policy just below your Add to Cart button.",
      category: "trust", effortLevel: "easy",
    },
    saas: {
      title: "Position your free trial CTA above the fold",
      whyItMatters: "SaaS visitors decide in seconds whether to evaluate your product. If they have to scroll to find the signup button, you risk losing their momentum. Visibility of the next step is crucial for software conversions.",
      howToFix: "Move your primary CTA ('Start free trial' or 'Get started free') into the hero section headline area so it is the very first interactive element they see.",
      category: "conversion", effortLevel: "easy",
    },
    portfolio: {
      title: "Make your contact information immediately visible",
      whyItMatters: "Prospective clients who want to hire you need a frictionless way to reach out. A buried contact page creates unnecessary hurdles—making yourself accessible builds immediate professional trust.",
      howToFix: "Include your email address or a prominent 'Work with me' button directly in your navigation bar and footer. Repeat this call-to-action after your strongest case study.",
      category: "conversion", effortLevel: "easy",
    },
    local_business: {
      title: "Display your phone number in the header",
      whyItMatters: "Local customers often arrive with high intent, simply wanting to call or find your address. If your phone number requires hunting, they may switch to a competitor who makes it easier.",
      howToFix: "Format your phone number as a clickable tel: link in your navigation header, allowing mobile users to call you with a single tap.",
      category: "trust", effortLevel: "easy",
    },
    blog: {
      title: "Include an email capture on every article",
      whyItMatters: "Blog traffic is largely anonymous and transient. Capturing an email address allows you to convert one-time readers into a loyal audience, which is the foundation of media growth.",
      howToFix: "Place a simple email signup box at the end of each post offering a specific incentive, using a free tier tool like ConvertKit or Mailchimp.",
      category: "conversion", effortLevel: "easy",
    },
    unknown: {
      title: "Add a visible phone number and email address",
      whyItMatters: "Visitors who cannot easily find a way to contact you will quickly lose trust. Accessible contact information is the most fundamental indicator that a legitimate business stands behind the website.",
      howToFix: "Place your phone number and email address in your header and footer. Make the phone number a clickable link (tel:) so mobile users can dial effortlessly.",
      category: "trust", effortLevel: "easy",
    },
  };

  return {
    consultantSummary: `We've completed a full analysis of ${domain} across performance, trust, clarity, and conversion readiness. Your score of ${scores.overall}/100 suggests real opportunities for improvement — particularly around ${worstDim}, which is where most sites in your category see the fastest gains. The three quick wins below are ranked by likely business impact, not technical complexity.`,
    overallNarrative:  `${domain} has clear strengths and specific, fixable gaps`,
    quickWins: [
      industryTips[pageType] ?? industryTips.unknown,
      {
        title: "Sharpen your main call-to-action text",
        whyItMatters: "Generic CTA buttons like 'Get in touch' or 'Contact us' fail to build momentum. Buttons that describe the exact outcome—like 'Book a free call'—convert significantly better because they set clear psychological expectations.",
        howToFix: "Rewrite your main button text to describe exactly what the visitor receives, focusing on the value rather than the action they have to take.",
        category: "conversion", effortLevel: "easy",
      },
      {
        title: "Compress your hero image for faster loading",
        whyItMatters: "With over 60% of web traffic on mobile devices, a slow-loading hero image leaves visitors staring at a blank screen. This friction causes many to abandon the site before they even see your primary offer.",
        howToFix: "Run your hero image through Squoosh.app and export as WebP at 80% quality. This typically reduces file size significantly with no visible loss in fidelity.",
        category: "performance", effortLevel: "easy",
      },
    ],
    sectionInsights: [],
    generatedAt: new Date().toISOString(),
  };
}
