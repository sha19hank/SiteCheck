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

  // ── Phase 1A: Deterministic Classification ──────────────────────────────────
  const classStart = performance.now();
  const deterministicClassification = classifyWebsite(scrapedData);
  const classEnd = performance.now();

  // ── Phase 1B: Website Understanding (AI Proposal) ────────────────────────
  const wuStart = performance.now();
  const { understandWebsite } = await import("./website-understanding");
  const wuResult = await understandWebsite(scrapedData, deterministicClassification);
  const websiteUnderstanding = wuResult.data;
  const wuEnd = performance.now();
  // ── Phase 1C: Classification Reconciliation ──────────────────────────────────
  const { reconcileClassification } = await import("./classifier");
  const classification = reconcileClassification(deterministicClassification, websiteUnderstanding, scrapeDiagnostics, wuResult.log);
  
  // ── Layer 2: Deterministic scoring (Base Findings) ────────────────────────
  const scores = calculateScores(scrapedData, pageSpeedData);

  // ── Phase 2: Category Audit ───────────────────────────────────────────────
  const catStart = performance.now();
  const { runCategoryAudit } = await import("./category-audits");
  const categoryAudit = runCategoryAudit(classification.websiteType, scrapedData, scores);
  const catEnd = performance.now();

  // ── Phase 3: Growth Intelligence ──────────────────────────────────────────
  // Re-run website understanding if classification changed significantly, or use existing.
  // Actually, we already have it from Phase 1B. Let's just use it.


  const geStart = performance.now();
  const { generateGrowthReport } = await import("./growth-engine");
  const geResult = await generateGrowthReport(websiteUnderstanding, categoryAudit.findings);
  const growthReport = geResult.data;
  
  // Calculate audit confidence here so it can be passed to Consultant Report
  const evidenceCoverage = (categoryAudit.findings.length > 0) ? categoryAudit.findings.filter(f => f.evidence && f.evidence.length > 0).length / categoryAudit.findings.length : 0;
  const understandingCompleteness = (websiteUnderstanding.businessModel !== "Unknown" && websiteUnderstanding.targetAudience !== "General Audience") ? 1 : 0.5;
  
  let auditConfidence: "HIGH" | "MEDIUM" | "LOW" = "HIGH";
  
  if (!scrapeDiagnostics.scrapeSuccess || classification.confidence < 0.40 || evidenceCoverage < 0.3) {
    auditConfidence = "LOW";
  } else if (classification.confidence < 0.75 || scrapeDiagnostics.scrapeQuality === "MEDIUM" || evidenceCoverage < 0.7 || understandingCompleteness < 1) {
    auditConfidence = "MEDIUM";
  }

  const { generateConsultantReport } = await import("./consultant-engine");
  const consultantReport = await generateConsultantReport(
    scores,
    scrapedData,
    scrapeDiagnostics,
    classification,
    websiteUnderstanding,
    categoryAudit,
    pageSpeedData,
    "enterprise"
  );
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
  // (already calculated above to pass to Consultant Engine)

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
    consultantReport,
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
