import { runAudit } from "../lib/audit/index";
import fs from "fs";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

const SITES = [
  { url: "https://github.com", expected: "saas" },
  { url: "https://youtube.com", expected: "creator" }, // Media/Creator
  { url: "https://canva.com", expected: "saas" },
  { url: "https://notion.so", expected: "saas" },
  { url: "https://amazon.com", expected: "ecommerce" },
  { url: "https://etsy.com", expected: "marketplace" },
  { url: "https://aliabdaal.com", expected: "creator" },
  { url: "https://webflow.com", expected: "saas" }
];

async function testAudit() {
  console.log("Running Phase 2 Benchmark...\n");
  
  const results: any[] = [];
  
  for (const site of SITES) {
    console.log(`Auditing: ${site.url}...`);
    try {
      const record = await runAudit({ url: site.url });
      results.push({
        url: site.url,
        expected: site.expected,
        actual: record.classification?.websiteType,
        confidence: record.classification?.confidence,
        deterministicScore: record.classification?.deterministicScore,
        aiAgreement: record.classification?.aiAgreement,
        aiStatus: record.classification?.aiStatus,
        platformType: record.classification?.platformType,
        scrapeQuality: record.scrapeDiagnostics?.scrapeQuality,
        evidence: record.classification?.evidence,
        summary: record.classification?.classificationSummary
      });
    } catch (err: any) {
      console.error(`Audit failed for ${site.url}:`, err.message);
      results.push({ url: site.url, expected: site.expected, error: err.message });
    }
  }

  let md = "# Phase 2.5 Benchmark Report\n\n";

  // 1. Classification Accuracy Table
  md += "## Classification Accuracy Table\n\n";
  md += "| Site | Expected | Actual | Match | Confidence | Platform Type |\n";
  md += "|---|---|---|---|---|---|\n";
  results.forEach(r => {
    if (r.error) {
      md += `| ${r.url} | ${r.expected} | ERROR | ❌ | - | - |\n`;
    } else {
      const match = r.expected === r.actual || (r.expected === "ecommerce" && r.actual === "marketplace") ? "✅" : "❌";
      md += `| ${r.url} | ${r.expected} | ${r.actual} | ${match} | ${r.confidence?.toFixed(2)} | ${r.platformType || "N/A"} |\n`;
    }
  });

  // 2. Confidence Analysis Table
  md += "\n## Confidence Analysis Table\n\n";
  md += "| Site | Det. Score | Evidence Count | AI Agreement | Scrape Quality | Final Confidence |\n";
  md += "|---|---|---|---|---|---|\n";
  results.forEach(r => {
    if (r.error) return;
    md += `| ${r.url} | ${r.deterministicScore} | ${r.evidence?.length || 0} | ${r.aiAgreement ? "Yes" : "No"} | ${r.scrapeQuality} | ${r.confidence?.toFixed(2)} |\n`;
  });

  // 3. AI Status Report
  md += "\n## AI Status Report\n\n";
  md += "| Site | AI Status | AI Agreement |\n";
  md += "|---|---|---|\n";
  results.forEach(r => {
    if (r.error) return;
    md += `| ${r.url} | ${r.aiStatus} | ${r.aiAgreement ? "Yes" : "No"} |\n`;
  });

  // 4. Platform Type Results
  md += "\n## Platform Type Results\n\n";
  md += "| Site | Platform Type |\n";
  md += "|---|---|\n";
  results.forEach(r => {
    if (r.error) return;
    md += `| ${r.url} | ${r.platformType || "N/A"} |\n`;
  });

  // 5. Canva Validation Report
  md += "\n## Canva Validation Report\n\n";
  const canva = results.find(r => r.url === "https://canva.com");
  if (canva && !canva.error) {
    md += `**Expected**: ${canva.expected}\n\n`;
    md += `**Actual**: ${canva.actual}\n\n`;
    md += `**Summary**:\n`;
    canva.summary.forEach((s: string) => {
      md += `- ${s}\n`;
    });
    md += `\n**Top 5 Evidence**:\n`;
    (canva.evidence || []).sort((a: any, b: any) => b.voteValue - a.voteValue).slice(0, 5).forEach((v: any) => {
      md += `- [${v.voteValue}pts -> ${v.category}] ${v.signalType} (${v.source}): "${v.matchedText}"\n`;
    });
  }

  // 6. Remaining Misclassification Report
  md += "\n## Remaining Misclassification Report\n\n";
  const misclassifications = results.filter(r => !r.error && r.expected !== r.actual && !(r.expected === "ecommerce" && r.actual === "marketplace") && r.url !== "https://canva.com");
  if (misclassifications.length === 0) {
    md += "No other misclassifications!\n";
  } else {
    misclassifications.forEach(m => {
      md += `### ${m.url}\n`;
      md += `- **Expected**: ${m.expected}\n`;
      md += `- **Actual**: ${m.actual}\n`;
      md += `- **Confidence**: ${m.confidence}\n`;
      md += `- **AI Status**: ${m.aiStatus}\n`;
      md += `- **Top Evidence**:\n`;
      (m.evidence || []).sort((a: any, b: any) => b.voteValue - a.voteValue).slice(0, 5).forEach((v: any) => {
        md += `  - [${v.voteValue}pts -> ${v.category}] ${v.signalType} (${v.source}): "${v.matchedText}"\n`;
      });
      md += "\n";
    });
  }

  fs.writeFileSync("phase2_5_benchmark.md", md);
  console.log("Benchmark complete. Results written to phase2_5_benchmark.md");
}

testAudit().catch(console.error);
