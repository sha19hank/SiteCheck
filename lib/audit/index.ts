import { scrapeUrl }        from "./scraper";
import { fetchPageSpeed }   from "./pagespeed";
import { calculateScores }  from "./scorer";
import { generateAIReport } from "./ai-report";
import { generateShareToken, extractDomain } from "@/lib/utils";
import type { AuditRecord, AuditRequest, ScreenshotData } from "@/types";

export async function runAudit(request: AuditRequest): Promise<AuditRecord> {
  const { url } = request;
  const domain  = extractDomain(url);

  // ── Layer 1: Parallel data collection ─────────────────────────────────────
  // Screenshots run separately — non-fatal if they fail
  const [pageSpeedData, scrapedData] = await Promise.all([
    fetchPageSpeed(url),
    scrapeUrl(url),
  ]);

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

  // ── Layer 3: AI explanation (industry-aware) ────────────────────────────────
  const aiReport = await generateAIReport(
    domain, scores, scrapedData, pageSpeedData, screenshotData
  );

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
    screenshotData,
    isPaid:         false,
    paymentId:      null,
    createdAt:      new Date().toISOString(),
  };
}
