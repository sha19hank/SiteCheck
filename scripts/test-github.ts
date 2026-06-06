import { classifyWebsite } from "../lib/audit/classifier";
import { runCategoryAudit } from "../lib/audit/category-audits";
import { understandWebsite } from "../lib/audit/website-understanding";
import { generateGrowthReport } from "../lib/audit/growth-engine";
import { ScrapedData, PageType } from "../types";
import * as fs from "fs";

try {
  const env = fs.readFileSync(".env.local", "utf8");
  for (const line of env.split("\n")) {
    if (line.trim() && !line.startsWith("#")) {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
    }
  }
} catch (e) {
  // ignore
}

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
  structuredDataTypes: [],
};

async function run() {
  console.log("=== CLASSIFIER AUDIT: GITHUB.COM ===\n");
  const classification = classifyWebsite(githubData);
  console.log(`Detected Type: ${classification.websiteType}`);
  console.log(`Confidence: ${classification.confidence.toFixed(2)}\n`);

  console.log("=== PHASE 2: CATEGORY AUDIT ===\n");
  const categoryAudit = runCategoryAudit(classification.websiteType, githubData);

  console.log("\n=== 4. Website Understanding (Phase 3A) ===");
  const wuResult = await understandWebsite(githubData, classification.websiteType);
  const websiteUnderstanding = wuResult.data;
  console.log("Business Model:", websiteUnderstanding.businessModel);
  console.log("Target Audience:", websiteUnderstanding.targetAudience);
  console.log("Primary Goal:", websiteUnderstanding.primaryGoal);
  console.log("Value Proposition:", websiteUnderstanding.valueProposition);

  console.log("\n=== 5. Growth Intelligence Engine (Phase 3B) ===");
  const geResult = await generateGrowthReport(websiteUnderstanding, categoryAudit.findings);
  const growthReport = geResult.data;
  console.log("Readiness Score:", growthReport.readinessScore);
}

run().catch(console.error);
