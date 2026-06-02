import Anthropic from "@anthropic-ai/sdk";
import type {
  AuditScores, ScrapedData, PageSpeedData,
  AIReport, QuickWin, SectionInsight, ScreenshotData, PageType,
} from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Industry context blocks injected into the prompt ─────────────────────────
const INDUSTRY_CONTEXT: Record<PageType, string> = {
  service_business: `
This is a service business website (agency, consultant, freelancer, or professional services).
Key conversion drivers for this type: trust signals (testimonials, credentials, contact info),
clear service descriptions, easy contact methods, and social proof. Visitors are evaluating
whether to hire this person/company — trust is the #1 factor.`,

  ecommerce: `
This is an ecommerce or online shop. Key conversion drivers: product clarity, trust badges,
shipping info visibility, easy cart/checkout flow, customer reviews, and return policy visibility.
Visitors need to feel safe handing over payment details — security signals are critical.`,

  saas: `
This is a SaaS or software product website. Key conversion drivers: clear value proposition,
free trial or demo CTA above the fold, pricing transparency, feature comparisons, and
social proof from recognisable customers. Visitors are evaluating whether the software
solves their specific problem — clarity and specificity beat generic claims.`,

  portfolio: `
This is a portfolio or personal brand website. Key conversion drivers: visible contact info,
clear showcase of work/case studies, personality and voice, and an obvious "hire me" or
"work together" CTA. Visitors are evaluating fit — authenticity matters more than polish.`,

  local_business: `
This is a local business website (restaurant, salon, clinic, shop, etc). Key conversion
drivers: address and phone number prominently displayed, opening hours, Google Maps embed,
local social proof (reviews mentioning location), and easy booking or reservation flow.
Visitors often just want to confirm the business exists and find out how to get there.`,

  blog: `
This is a blog or content site. Key conversion drivers: email newsletter signup,
related content discovery, clear author identity, and social sharing. The primary
conversion goal is building an audience rather than direct sales.`,

  unknown: `
This appears to be a general business website. Apply universal best practices:
clear value proposition, contact info, social proof, and a primary CTA.`,
};

// ─── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a calm, expert website growth consultant helping non-technical business owners understand their website.

STRICT RULES:
1. Only explain issues that appear in the findings JSON — never invent new problems
2. Never use technical jargon. Translate everything:
   - LCP → "time for your main content to appear"
   - CLS → "page jumping around while loading"
   - FCP → "time until visitors see anything"
   - TTFB → "server response time"
3. Write as a trusted advisor — warm, specific, non-judgmental, intelligent
4. Frame ALL insights in terms of business impact (customers, trust, revenue, enquiries)
5. Generate EXACTLY 3 quick wins — ranked by business impact, not technical severity
6. Each quick win: title (max 8 words), businessImpact (2–3 sentences), howToFix (specific, tool names where helpful), category, effortLevel
7. effortLevel: "easy" = under 1hr no-code, "medium" = half day with some help, "involved" = needs a developer
8. The consultantSummary is the most important paragraph — make it feel like a trusted expert opened your report
9. Tailor recommendations to the specific industry/page type provided
10. Output ONLY valid JSON — no markdown, no preamble, no explanation outside JSON

OUTPUT SCHEMA (return exactly this structure):
{
  "consultantSummary": "string (3–4 sentences, personalised to this specific site and industry)",
  "overallNarrative": "string (1 punchy headline sentence, max 12 words)",
  "quickWins": [
    {
      "title": "string (max 8 words)",
      "businessImpact": "string (2–3 sentences, business-focused)",
      "howToFix": "string (specific, actionable, mention tools by name)",
      "category": "performance|trust|clarity|conversion",
      "effortLevel": "easy|medium|involved"
    }
  ],
  "sectionInsights": [
    {
      "dimension": "performance|trust|clarity|conversion",
      "summary": "string (2–3 sentence consultant paragraph, industry-aware)",
      "keyFinding": "string (1 sentence — single most important thing)",
      "positives": ["string (plain English, what is working)"],
      "improvements": ["string (plain English, what needs work — one per finding)"]
    }
  ]
}`;

// ─── Build the user message ────────────────────────────────────────────────────
function buildPrompt(
  domain: string,
  scores: AuditScores,
  scraped: ScrapedData,
  _pageSpeed: PageSpeedData,
  screenshot: ScreenshotData | null,
): string {
  const allFindings = [
    ...scores.performance.findings,
    ...scores.trust.findings,
    ...scores.clarity.findings,
    ...scores.conversion.findings,
  ];

  const industryCtx = INDUSTRY_CONTEXT[scraped.pageType] ?? INDUSTRY_CONTEXT.unknown;

  // Screenshot visual context
  const screenshotCtx = screenshot?.captureSuccess
    ? `Visual analysis from screenshot:
- CTA visible above fold (desktop): ${screenshot.ctaAboveFold ?? "unknown"}
- CTA visible above fold (mobile): ${screenshot.ctaAboveFoldMobile ?? "unknown"}
- CTA button text detected: "${screenshot.ctaText ?? "none detected"}"
- Hero image present: ${screenshot.hasHeroImage ?? "unknown"}
- Navigation height: ${screenshot.navHeight ?? "unknown"}px`
    : "Screenshot capture was not available for this audit.";

  return `Analyse this website and generate a consultant-style growth report.

WEBSITE: ${domain}
PAGE TYPE: ${scraped.pageType}
INDUSTRY CONTEXT: ${industryCtx}

SCORES:
- Overall growth score: ${scores.overall}/100
- Performance: ${scores.performance.score}/100
- Trust: ${scores.trust.score}/100
- Clarity: ${scores.clarity.score}/100
- Conversion: ${scores.conversion.score}/100

REAL FINDINGS (only explain these — do not invent others):
${JSON.stringify(allFindings, null, 2)}

SITE CONTEXT:
- H1 headline: "${scraped.h1s[0] ?? "none found"}"
- Meta description: "${scraped.metaDescription ?? "missing"}"
- CTA button texts: ${JSON.stringify(scraped.ctaTexts.slice(0, 3))}
- Nav links: ${JSON.stringify(scraped.navLinks.slice(0, 6))}
- Has testimonials: ${scraped.hasTestimonials}
- Has pricing: ${scraped.hasPricing}
- Has contact form: ${scraped.hasContactForm} (${scraped.formFieldCount} fields)
- Has phone: ${scraped.hasPhone} (${scraped.phoneNumber ?? "none"})

${screenshotCtx}

Generate the JSON report now. Personalise to the ${scraped.pageType} industry context. Be the trusted advisor.`;
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
    const response = await client.messages.create({
      model:      "claude-haiku-4-5",
      max_tokens: 2200,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: "user", content: buildPrompt(domain, scores, scraped, pageSpeed, screenshot) }],
    });

    const rawText = response.content
      .filter(b => b.type === "text")
      .map(b => (b as { type: "text"; text: string }).text)
      .join("");

    const cleaned = rawText
      .replace(/^```(?:json)?\s*/m, "")
      .replace(/\s*```\s*$/m, "")
      .trim();

    const parsed = JSON.parse(cleaned) as {
      consultantSummary: string;
      overallNarrative:  string;
      quickWins:         QuickWin[];
      sectionInsights:   SectionInsight[];
    };

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
      businessImpact: "Service businesses live or die by social proof. Visitors need to see that others have trusted you before they will. A single specific testimonial ('Increased our bookings by 40%') is worth more than five generic ones.",
      howToFix: "Add 2–3 testimonials to your homepage, ideally with the client's name, company, and a specific result they achieved. Place them near your main CTA button.",
      category: "trust", effortLevel: "easy",
    },
    ecommerce: {
      title: "Add trust badges near your purchase CTA",
      businessImpact: "Shoppers abandon carts when they don't feel safe entering payment details. Visible security badges and a clear returns policy can recover a significant portion of lost sales.",
      howToFix: "Add SSL badge, accepted payment icons, and a one-line returns policy near your Add to Cart button. These take under an hour to add and have immediate impact.",
      category: "trust", effortLevel: "easy",
    },
    saas: {
      title: "Put your free trial CTA above the fold",
      businessImpact: "SaaS visitors decide in seconds whether to try your product. If they have to scroll to find the signup button, most won't bother. Positioning the CTA in the hero section is the single highest-leverage change.",
      howToFix: "Move your primary CTA ('Start free trial' or 'Get started free') into the hero section headline area. It should be the first interactive element a visitor can click.",
      category: "conversion", effortLevel: "easy",
    },
    portfolio: {
      title: "Make your contact info impossible to miss",
      businessImpact: "Portfolio visitors who want to hire you need to reach you with minimal friction. A buried contact page loses you work — add your email or a 'Hire me' link directly in your navigation.",
      howToFix: "Add your email address or a 'Work with me' button to your nav bar. Also add it to your footer. Repeat it after your best case study.",
      category: "conversion", effortLevel: "easy",
    },
    local_business: {
      title: "Display your phone number in the header",
      businessImpact: "Local customers often just want to call. If your phone number requires hunting, they'll call your competitor instead. Header placement means they can reach you from any page without scrolling.",
      howToFix: "Add your phone number as a clickable tel: link in your navigation header. On mobile this lets users call with one tap — critical for local businesses.",
      category: "trust", effortLevel: "easy",
    },
    blog: {
      title: "Add an email capture to every article",
      businessImpact: "Blog traffic is largely anonymous and one-time. An email capture converts readers into subscribers you can reach again — it's the highest-value action a content site can optimise for.",
      howToFix: "Add a simple email signup box at the end of each post with a specific incentive ('Get the next post in your inbox'). Use ConvertKit or Mailchimp's free tier.",
      category: "conversion", effortLevel: "easy",
    },
    unknown: {
      title: "Add a visible phone number and email address",
      businessImpact: "Visitors who can't immediately see how to contact you will leave. Basic contact information — phone, email, or a contact form — is the foundation of website trust.",
      howToFix: "Add your phone number and email address to your header area and footer. Make the phone number a clickable link (tel:) so mobile users can call with one tap.",
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
        businessImpact: "Generic CTA buttons like 'Get in touch' or 'Contact us' lose momentum. Buttons that describe the outcome — 'Book a free call', 'Get your quote', 'Start your free trial' — convert significantly better because they set clear expectations.",
        howToFix: "Change your main button text to describe exactly what happens next. Think about what the visitor receives, not what they have to do.",
        category: "conversion", effortLevel: "easy",
      },
      {
        title: "Compress your hero image for faster mobile load",
        businessImpact: "Over 60% of web traffic arrives on mobile. A slow-loading hero image means visitors see a blank page and leave before seeing your offer — directly reducing enquiries.",
        howToFix: "Run your hero image through Squoosh.app (free). Export as WebP at 80% quality. This typically cuts file size by 60–70% with no visible quality loss.",
        category: "performance", effortLevel: "easy",
      },
    ],
    sectionInsights: [],
    generatedAt: new Date().toISOString(),
  };
}
