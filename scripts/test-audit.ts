import { runAudit } from "../lib/audit/index";

const SITES = [
  "https://github.com",
  "https://youtube.com",
  "https://canva.com",
  "https://notion.so",
  "https://amazon.com",
  "https://etsy.com",
  "https://aliabdaal.com",
  "https://webflow.com"
];

async function testAudit() {
  console.log("Running Phase 1 Benchmark...");
  
  const results = [];
  
  for (const url of SITES) {
    console.log(`Auditing: ${url}...`);
    try {
      const record = await runAudit({ url });
      const diag = record.scrapeDiagnostics!;
      const data = record.scrapedData!;
      
      results.push({
        site: url,
        httpStatus: diag.httpStatus,
        scrapeTime: record.executionTiming?.scrapingMs,
        completeness: diag.dataCompleteness,
        quality: diag.scrapeQuality,
        challenge: diag.challengeDetected,
        captcha: diag.captchaDetected,
        structuredData: data.structuredDataTypes.join(", ") || "None",
        classConf: record.classification?.confidence.toFixed(2),
        topNav: data.navLinks.slice(0, 3).join(", "),
        topCta: data.ctaTexts.slice(0, 3).join(", "),
        wordCount: diag.bodyWordCount,
        classResult: record.classification?.websiteType,
      });
    } catch (err: any) {
      console.error(`Audit failed for ${url}:`, err.message);
      results.push({ site: url, error: err.message });
    }
  }

  console.log("\n### Benchmark Results Table\n");
  console.log("| Site | Status | Time(ms) | Comp. | Qual. | Chall. | CAPTCHA | JSON-LD | Conf. | Top Nav | Top CTA | Words | Class Result |");
  console.log("|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const r of results) {
    if ((r as any).error) {
      console.log(`| ${r.site} | ERROR | ${(r as any).error} | - | - | - | - | - | - | - | - | - | - |`);
      continue;
    }
    console.log(`| ${r.site} | ${r.httpStatus} | ${r.scrapeTime} | ${r.completeness} | ${r.quality} | ${r.challenge} | ${r.captcha} | ${r.structuredData} | ${r.classConf} | ${r.topNav} | ${r.topCta} | ${r.wordCount} | ${r.classResult} |`);
  }
}

testAudit().catch(console.error);
