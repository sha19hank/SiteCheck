import { classifyWebsite } from "../lib/audit/classifier";
import { runCategoryAudit } from "../lib/audit/category-audits";
import { ScrapedData, PageType } from "../types";

function createMockData(navLinks: string[], ctaTexts: string[], h1s: string[], title: string, metaDescription: string, h2s: string[], h3s: string[]): ScrapedData {
  return {
    title,
    metaDescription,
    h1s,
    h2s,
    h3s,
    hasPhone: false,
    phoneNumber: null,
    hasEmail: false,
    emailAddress: null,
    hasAddress: false,
    hasSocialLinks: false,
    socialLinks: [],
    ctaTexts,
    ctaCount: ctaTexts.length,
    hasTestimonials: false,
    hasAboutPage: false,
    aboutInNav: false,
    hasPrivacyPolicy: false,
    hasContactForm: false,
    formFieldCount: 0,
    hasPricing: false,
    hasTrustBadges: false,
    imageCount: 0,
    hasFooter: false,
    navLinks,
    internalLinks: 0,
    bodyWordCount: 500,
    hasViewport: true,
    pageType: "unknown" as PageType,
    structuredDataTypes: [],
  };
}

const tests = [
  {
    name: "SaaS company",
    expected: "saas",
    data: createMockData(
      ["Features", "Pricing", "Integrations", "Login"],
      ["Start free trial", "Book demo"],
      ["The best CRM software for modern teams"],
      "Acme CRM | Best Software",
      "Grow your revenue with our powerful dashboard and features. Start free today.",
      ["Why choose our software?"],
      []
    )
  },
  {
    name: "Shopify store",
    expected: "ecommerce",
    data: createMockData(
      ["Shop", "Collections", "About", "Contact"],
      ["Add to cart", "Checkout"],
      ["Premium Leather Goods"],
      "Acme Leather | Buy Now",
      "Free shipping on all premium leather goods. Shop the new collection.",
      ["New Arrivals", "Best Sellers"],
      ["View product"]
    )
  },
  {
    name: "Agency website",
    expected: "agency",
    data: createMockData(
      ["Services", "Our Work", "Case Studies", "Contact"],
      ["Strategy Call", "See our portfolio"],
      ["We build brands that stand out"],
      "Acme Agency | Creative Services",
      "We are a creative agency helping brands grow. See our clients and case studies.",
      ["What we do", "Featured Clients"],
      []
    )
  },
  {
    name: "YouTube creator website",
    expected: "creator",
    data: createMockData(
      ["Videos", "Podcast", "Merch", "About"],
      ["Subscribe to channel", "Support on Patreon"],
      ["Welcome to my creator hub"],
      "Jane Doe | YouTube Creator",
      "Watch my latest videos, listen to the podcast, and buy merch.",
      ["Latest YouTube Videos"],
      []
    )
  },
  {
    name: "Local business",
    expected: "local_business",
    data: createMockData(
      ["Menu", "Location", "Opening Hours"],
      ["Book appointment", "Call now"],
      ["Best Coffee in Downtown"],
      "Acme Cafe | Visit Us",
      "Visit us at our downtown location. Check our opening hours and menu.",
      ["Get Directions"],
      []
    )
  }
];

console.log("=== RUNNING CATEGORY AUDIT TESTS ===\n");

for (const test of tests) {
  console.log(`\n=== Testing: ${test.name} ===`);
  const classification = classifyWebsite(test.data);
  console.log("\n[4/5] Testing Website Understanding...");
  const { understandWebsite } = await import("@/lib/audit/website-understanding");
  const understandingResult = await understandWebsite(test.data, undefined);
  const { calculateScores } = await import("@/lib/audit/scorer");
  const scores = calculateScores(test.data, { performanceScore: 90, lcp: 2.5, fcp: 1.5, cls: 0.05, speedIndex: 2.0, mobileScore: 0.9, imageOptimizationScore: 0.9, renderBlockingResources: 1, ttfb: 0.5, hasImages: true, passed: true });
  const audit = runCategoryAudit(classification.websiteType, test.data, scores);
  
  console.log(`Detected Website Type: ${audit.websiteType} (Expected: ${test.expected})`);
  console.log(`Health Grade: ${audit.healthGrade}`);
  console.log(`Category Scores:`);
  console.log(`  Trust: ${audit.categoryScores.trust}`);
  console.log(`  Conversion: ${audit.categoryScores.conversion}`);
  console.log(`  Clarity: ${audit.categoryScores.clarity}`);
  console.log(`  Performance: ${audit.categoryScores.performance}`);
  
  console.log(`\nTop Findings:`);
  audit.findings.forEach(f => {
    console.log(`- [${f.severity.toUpperCase()}] ${f.title} (Priority: ${f.priority})`);
    console.log(`  Evidence: ${f.evidence.join(", ")}`);
  });
  
  console.log(`\nTop Recommendations:`);
  audit.recommendations.forEach(r => {
    console.log(`- ${r.title} (Impact: ${r.impact}, Effort: ${r.effort})`);
  });
  
  const passed = classification.websiteType === test.expected;
  console.log(`\nResult: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log("----------------------------------------\n");
}
