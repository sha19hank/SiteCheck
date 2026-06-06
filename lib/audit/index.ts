import { scrapeUrl }        from "./scraper";
import { fetchPageSpeed }   from "./pagespeed";
import { calculateScores }  from "./scorer";
import { generateAIReport } from "./ai-report";
import { classifyWebsite }  from "./classifier";
import { generateShareToken, extractDomain } from "@/lib/utils";
import type { AuditRecord, AuditRequest, ScreenshotData } from "@/types";

export async function runAudit(request: AuditRequest): Promise<AuditRecord> {
  const { url } = request;
  const domain  = extractDomain(url);

  const totalStart = performance.now();

  // ── Layer 1: Parallel data collection ─────────────────────────────────────
  // Screenshots run separately — non-fatal if they fail
  const scrapeStart = performance.now();
  const [pageSpeedData, scrapedData] = await Promise.all([
    fetchPageSpeed(url),
    scrapeUrl(url),
  ]);
  const scrapeEnd = performance.now();

  // ── Phase 1: Classification ───────────────────────────────────────────────
  const classStart = performance.now();
  const classification = classifyWebsite(scrapedData);
  const classEnd = performance.now();

  // ── Phase 2: Category Audit ───────────────────────────────────────────────
  const catStart = performance.now();
  const { runCategoryAudit } = await import("./category-audits");
  const categoryAudit = runCategoryAudit(classification.websiteType, scrapedData);
  const catEnd = performance.now();

  // ── Phase 3A: Website Understanding ────────────────────────────────────────
  const wuStart = performance.now();
  const { understandWebsite } = await import("./website-understanding");
  const wuResult = await understandWebsite(scrapedData, classification.websiteType);
  const websiteUnderstanding = wuResult.data;
  const wuEnd = performance.now();

  // ── Phase 3B: Growth Engine ────────────────────────────────────────────────
  const geStart = performance.now();
  const { generateGrowthReport } = await import("./growth-engine");
  const geResult = await generateGrowthReport(websiteUnderstanding, categoryAudit.findings);
  const growthReport = geResult.data;
  const geEnd = performance.now();

  // ── Screenshots (optional, non-blocking) ──────────────────────────────────
  // Only attempt if ENABLE_SCREENSHOTS env var is set to avoid cold-start cost
  let screenshotData: ScreenshotData | null = null;
  if (process.env.ENABLE_SCREENSHOTS === "true") {
    try {
      const { captureScreenshots } = await import("@/lib/screenshot/capture");
      screenshotData = await captureScreenshots(url);
    } catch (err) {
      console.warn("Screenshot capture skipped:", err);
    }
  }

  // ── Layer 2: Deterministic scoring ─────────────────────────────────────────
  const scores = calculateScores(scrapedData, pageSpeedData);

  // ── Layer 3: AI explanation (industry-aware) [LEGACY SIDE-BY-SIDE] ──────────
  const aiReport = await generateAIReport(
    domain, scores, scrapedData, pageSpeedData, screenshotData
  );

  const totalEnd = performance.now();
  const executionTiming = {
    scrapingMs: Math.round(scrapeEnd - scrapeStart),
    pageSpeedMs: Math.round(scrapeEnd - scrapeStart), // Parallel, approximate
    classificationMs: Math.round(classEnd - classStart),
    categoryAuditMs: Math.round(catEnd - catStart),
    websiteUnderstandingMs: Math.round(wuEnd - wuStart),
    growthEngineMs: Math.round(geEnd - geStart),
    totalMs: Math.round(totalEnd - totalStart),
  };

  const aiLogs = [wuResult.log, geResult.log];

  return {
    id:             crypto.randomUUID(),
    userId:         null,
    url,
    domain,
    shareToken:     generateShareToken(),
    isPublic:       true,
    scores,
    scrapedData,
    pageSpeedData,
    aiReport,
    classification,
    categoryAudit,
    websiteUnderstanding,
    growthReport,
    executionTiming,
    aiLogs,
    screenshotData,
    isPaid:         false,
    paymentId:      null,
    createdAt:      new Date().toISOString(),
  };
}
