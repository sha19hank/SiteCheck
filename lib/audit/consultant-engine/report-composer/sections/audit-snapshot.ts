import { sectionRegistry } from "../registry";
import { CompositionContext, AuditMetricSummary, ReportSection } from "@/types";

sectionRegistry.register({
  id: "audit-snapshot",
  name: "Audit Snapshot",
  priority: 100, // Very high priority, usually appears near the top
  requiredPlan: "free",
  applicableWebsiteTypes: "ALL",
  minReportDepth: "BASIC",
  generate: (context: CompositionContext): ReportSection | null => {
    const { diagnostics, gaps, recommendations } = context;

    const metrics: AuditMetricSummary[] = [];

    // LCP
    metrics.push({
      id: "metric-lcp",
      title: "Largest Contentful Paint (LCP)",
      currentValue: `${(context.pageSpeed.lcp || 0).toFixed(2)}s`,
      expectedRange: "< 2.5s",
      verdict: (context.pageSpeed.lcp || 0) < 2.5 ? "STRONG" : "NEEDS_WORK",
      whyItMatters: "LCP measures loading performance. Slow LCP causes high bounce rates before visitors even see your value proposition.",
      visibility: "free",
      confidence: 100,
    });

    // Word Count
    metrics.push({
      id: "metric-word-count",
      title: "Page Word Count",
      currentValue: context.scrapedData.bodyWordCount || 0,
      expectedRange: "300 - 1500 words",
      verdict: ((context.scrapedData.bodyWordCount || 0) > 300) ? "ADEQUATE" : "NEEDS_WORK",
      whyItMatters: "Too little content prevents search engines and visitors from understanding your value. Too much creates cognitive overload.",
      visibility: "free",
      confidence: 100,
    });

    // Image Count (Premium visibility)
    metrics.push({
      id: "metric-image-count",
      title: "Media Elements",
      currentValue: context.scrapedData.imageCount || 0,
      expectedRange: "Dependant on visual storytelling",
      verdict: "ADEQUATE",
      whyItMatters: "Images and videos break up text and provide visual proof of your claims.",
      visibility: "premium",
      confidence: 100,
    });

    // Map related recommendations
    for (const metric of metrics) {
      const related = recommendations.filter(r => r.relatedMetrics?.includes(metric.id));
      if (related.length > 0) {
        metric.relatedRecommendationIds = related.map(r => r.id);
      }
    }

    return {
      id: "audit-snapshot",
      type: "metrics",
      title: "Audit Snapshot",
      content: metrics,
      metadata: {
        confidence: 100,
        evidenceCount: metrics.length,
        generatedFrom: ["ScraperDiagnostics"],
        reasoningSummary: "Raw performance and structural metrics extracted during the page scrape.",
      }
    };
  }
});
