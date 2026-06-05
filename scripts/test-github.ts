import { classifyWebsite } from "../lib/audit/classifier";
import { ScrapedData, PageType } from "../types";

// Mocking some common elements on github.com
const githubData: ScrapedData = {
  title: "GitHub: Let's build from here · GitHub",
  metaDescription: "GitHub is where over 100 million developers shape the future of software, together. Contribute to the open source community, manage your Git repositories, review code like a pro, track bugs and features, power your CI/CD and DevOps workflows, and secure code before you commit it.",
  h1s: ["Let's build from here"],
  h2s: ["Product", "Solutions", "Open Source", "Enterprise", "Pricing", "Features", "Security", "Collaboration"],
  h3s: [],
  hasPhone: false,
  phoneNumber: null,
  hasEmail: false,
  emailAddress: null,
  hasAddress: false,
  hasSocialLinks: true,
  socialLinks: ["https://twitter.com/github", "https://youtube.com/github"],
  ctaTexts: ["Sign up for GitHub", "Start a free enterprise trial", "Sign in", "Search", "Contact Sales", "Subscribe", "Explore GitHub"],
  ctaCount: 7,
  hasTestimonials: true,
  hasAboutPage: true,
  aboutInNav: true,
  hasPrivacyPolicy: true,
  hasContactForm: true,
  formFieldCount: 3,
  hasPricing: true,
  hasTrustBadges: true,
  imageCount: 20,
  hasFooter: true,
  navLinks: ["Product", "Solutions", "Open Source", "Pricing", "Search", "Sign in", "Sign up", "Features", "Enterprise", "Customers", "Sponsors", "Readme"],
  internalLinks: 100,
  bodyWordCount: 1500,
  hasViewport: true,
  pageType: "unknown" as PageType,
};

console.log("=== CLASSIFIER AUDIT: GITHUB.COM ===\n");
const result = classifyWebsite(githubData);
console.log(`Detected Type: ${result.websiteType}`);
console.log(`Confidence: ${result.confidence.toFixed(2)}`);
console.log(`\nScores:`);
for (const [cat, score] of Object.entries(result.categoryScores)) {
  if (score > 0) console.log(` - ${cat}: ${score}`);
}
console.log(`\nReasoning Log:`);
result.reasoning.forEach(r => console.log(r));
