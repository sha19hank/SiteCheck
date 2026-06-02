import type { PageSpeedData } from "@/types";

const PAGESPEED_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export async function fetchPageSpeed(url: string): Promise<PageSpeedData> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  const params = new URLSearchParams({
    url,
    strategy: "mobile",
    category: "performance",
    ...(apiKey ? { key: apiKey } : {}),
  });

  let data: Record<string, unknown>;

  try {
    const res = await fetch(`${PAGESPEED_API}?${params}`, {
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      // Fallback to estimated data if API fails
      return fallbackPageSpeedData();
    }

    data = await res.json() as Record<string, unknown>;
  } catch {
    return fallbackPageSpeedData();
  }

  try {
    const cats = (data.lighthouseResult as Record<string, unknown>)?.categories as Record<string, unknown>;
    const audits = (data.lighthouseResult as Record<string, unknown>)?.audits as Record<string, Record<string, unknown>>;

    const performanceScore = ((cats?.performance as Record<string, unknown>)?.score as number) ?? 0.5;
    const lcp  = getNumericValue(audits, "largest-contentful-paint", 3.5);
    const fcp  = getNumericValue(audits, "first-contentful-paint", 2.0);
    const cls  = getNumericValue(audits, "cumulative-layout-shift", 0.1);
    const si   = getNumericValue(audits, "speed-index", 4.0);
    const ttfb = getNumericValue(audits, "server-response-time", 0.5);

    const imageAudit = audits?.["uses-optimized-images"];
    const imageOptimizationScore = imageAudit?.score != null
      ? (imageAudit.score as number)
      : 0.7;

    const renderBlocking = audits?.["render-blocking-resources"];
    const renderBlockingResources = (renderBlocking?.details as Record<string, unknown[]> | undefined)?.items?.length ?? 0;

    return {
      performanceScore,
      mobileScore: performanceScore,
      lcp,
      fcp,
      cls,
      speedIndex: si,
      ttfb,
      hasImages: true,
      imageOptimizationScore,
      renderBlockingResources,
      passed: true,
    };
  } catch {
    return fallbackPageSpeedData();
  }
}

function getNumericValue(
  audits: Record<string, Record<string, unknown>> | undefined,
  key: string,
  fallback: number
): number {
  if (!audits?.[key]) return fallback;
  const raw = audits[key].numericValue;
  if (typeof raw !== "number") return fallback;
  // LCP, FCP, SI, TTFB come in ms — convert to seconds
  if (key !== "cumulative-layout-shift") return raw / 1000;
  return raw;
}

function fallbackPageSpeedData(): PageSpeedData {
  // Conservative estimates when the API is unavailable
  return {
    performanceScore: 0.6,
    mobileScore: 0.6,
    lcp: 3.2,
    fcp: 1.8,
    cls: 0.08,
    speedIndex: 3.5,
    ttfb: 0.45,
    hasImages: true,
    imageOptimizationScore: 0.65,
    renderBlockingResources: 2,
    passed: false,
  };
}
