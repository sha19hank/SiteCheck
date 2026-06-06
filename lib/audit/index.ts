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
  const [pageSpeedData, scraperResult] = await Promise.all([
    fetchPageSpeed(url),
    scrapeUrl(url),
  ]);
  const { scrapedData, scrapeDiagnostics } = scraperResult;
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

  // Phase 0 metrics
  const fallbackUsed = aiLogs.some(l => l.fallbackUsed);
  const aiAvailable = !fallbackUsed;
  
  let aiFailureReasonCode: any = null;
  let aiFailureReasonMessage: string | null = null;
  
  if (fallbackUsed) {
    const errorLog = aiLogs.find(l => l.fallbackUsed && l.errorReason);
    const reason = errorLog?.errorReason || "";
    
    if (reason.includes("429") || reason.includes("RATE_LIMITED") || reason.includes("exhausted")) {
      aiFailureReasonCode = "QUOTA_EXCEEDED";
    } else if (reason.includes("503") || reason.includes("unavailable")) {
      aiFailureReasonCode = "SERVICE_UNAVAILABLE";
    } else if (reason.includes("API key not valid") || reason.includes("INVALID_API_KEY") || reason.includes("400")) {
      aiFailureReasonCode = "INVALID_API_KEY";
    } else if (reason.includes("timeout")) {
      aiFailureReasonCode = "TIMEOUT";
    } else {
      aiFailureReasonCode = "UNKNOWN";
    }
    aiFailureReasonMessage = reason.substring(0, 200); // cap length
  }

  // Calculate audit confidence
  let auditConfidence: "HIGH" | "MEDIUM" | "LOW" = "HIGH";
  if (!scrapeDiagnostics.scrapeSuccess || !aiAvailable || classification.confidence < 0.40) {
    auditConfidence = "LOW";
  } else if (classification.confidence < 0.75 || scrapeDiagnostics.scrapeQuality === "MEDIUM") {
    auditConfidence = "MEDIUM";
  }

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
    aiAvailable,
    fallbackUsed,
    aiFailureReasonCode,
    aiFailureReasonMessage,
    auditConfidence,
    scrapeDiagnostics,
    screenshotData,
    isPaid:         false,
    paymentId:      null,
    createdAt:      new Date().toISOString(),
  };
}
