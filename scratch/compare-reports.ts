import { classifyWebsite } from "../lib/audit/classifier";
import { runCategoryAudit } from "../lib/audit/category-audits";
import { understandWebsite } from "../lib/audit/website-understanding";
import { generateGrowthReport } from "../lib/audit/growth-engine";
import { generateConsultantReport } from "../lib/audit/consultant-engine";
import { calculateScores } from "../lib/audit/scorer";
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
  console.log("Running comparative audit...");
  
  const classification = classifyWebsite(githubData);
  const scores = calculateScores(githubData, { performanceScore: 90, lcp: 2.5, fcp: 1.5, cls: 0.05, speedIndex: 2.0, mobileScore: 0.9, imageOptimizationScore: 0.9, renderBlockingResources: 1, ttfb: 0.5, hasImages: true, passed: true });
  const categoryAudit = runCategoryAudit(classification.websiteType, githubData, scores);
  
  const wuResult = await understandWebsite(githubData, classification);
  const websiteUnderstanding = wuResult.data;

  // Generate Old Growth Report
  const geResult = await generateGrowthReport(websiteUnderstanding, categoryAudit.findings);
  const oldReport = geResult.data;

  // Generate New Consultant Report
  const newReport = await generateConsultantReport(
    scores,
    githubData,
    { scrapeSuccess: true, scrapeQuality: "HIGH" } as any,
    classification,
    websiteUnderstanding,
    categoryAudit,
    { level: "HIGH", metrics: { evidenceCoverage: 0.8, understandingCompleteness: 1, scrapeQuality: "HIGH", classificationConfidence: 0.95 } }
  );

  fs.writeFileSync(
    "scratch/github_comparison.md",
    `# Premium Value Audit Comparison: GitHub

## Old Growth Report (Legacy)
### Readiness Score: ${oldReport?.readinessScore ?? "N/A"}/100

### Top Insights:
${oldReport?.insights?.map((i: any) => `- **${i.title}** (${i.impact} impact)\n  - Finding: ${i.findingContext}\n  - Why It Matters: ${i.whyItMatters}\n  - Recommendation: ${i.recommendedAction}`).join("\n\n")}

---

## New Consultant Report (Premium)
### Confidence: ${newReport.reportConfidence.level} (${newReport.reportConfidence.explanation})

### Consultant Summary:
${newReport.executiveSummary}

### Top Quick Wins:
${newReport.topQuickWins?.map((w: any) => `- **${w.problem}** (${w.priority})\n  - Why It Matters: ${w.whyItMatters}\n  - How To Fix: ${w.recommendedFix}`).join("\n\n")}

### Section Insights:
#### Performance
- Score: ${newReport.performanceAnalysis.score}
- Improvements: ${newReport.performanceAnalysis.recommendedActions.join(", ")}

#### Trust
- Score: ${newReport.trustAnalysis.score}
- Improvements: ${newReport.trustAnalysis.recommendedActions.join(", ")}

#### Conversion
- Score: ${newReport.conversionAnalysis.score}
- Improvements: ${newReport.conversionAnalysis.recommendedActions.join(", ")}

### Evidence Ledger (Traceability):
${newReport.evidenceLedger?.map((e: any) => `- [${e.source}] ${e.finding} (${e.impact})`).join("\n")}
`
  );

  console.log("Comparison generated at scratch/github_comparison.md");
}

run().catch(console.error);
