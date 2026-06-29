import { AuditMetricSummary } from "@/types";

export type MetricGroup = {
  title: string;
  metrics: AuditMetricSummary[];
};

export function groupMetrics(metrics: AuditMetricSummary[]): MetricGroup[] {
  const categories: Record<string, AuditMetricSummary[]> = {
    Performance: [],
    Content: [],
    Conversion: [],
    Trust: [],
    Accessibility: [],
    Technical: [],
    Other: [],
  };

  const idToCategory: Record<string, string> = {
    "metric-lcp": "Performance",
    "metric-fcp": "Performance",
    "metric-ttfb": "Performance",
    "metric-speed-index": "Performance",
    "metric-cls": "Performance",
    "metric-performance-score": "Performance",
    "metric-render-blocking": "Performance",
    
    "metric-word-count": "Content",
    "metric-reading-time": "Content",
    "metric-h1": "Content",
    "metric-h2": "Content",
    "metric-image-count": "Content",
    "metric-videos": "Content",
    "metric-internal-links": "Content",
    
    "metric-primary-cta": "Conversion",
    "metric-secondary-cta": "Conversion",
    "metric-cta-count": "Conversion",
    "metric-forms": "Conversion",
    "metric-buttons": "Conversion",
    "metric-newsletter": "Conversion",
    "metric-pricing-visibility": "Conversion",
    
    "metric-testimonials": "Trust",
    "metric-reviews": "Trust",
    "metric-contact": "Trust",
    "metric-ssl": "Trust",
    "metric-privacy-policy": "Trust",
    "metric-terms": "Trust",
    "metric-social-links": "Trust",
    
    "metric-alt-text": "Accessibility",
    "metric-heading-structure": "Accessibility",
    "metric-labels": "Accessibility",
    "metric-keyboard-support": "Accessibility",
    "metric-contrast": "Accessibility",
    
    "metric-canonical": "Technical",
    "metric-robots": "Technical",
    "metric-sitemap": "Technical",
    "metric-meta-description": "Technical",
    "metric-opengraph": "Technical",
    "metric-structured-data": "Technical",
  };

  for (const metric of metrics) {
    // Determine category based on prefix/map or explicit field if it ever exists
    const category = idToCategory[metric.id] || "Other";
    if (categories[category]) {
      categories[category].push(metric);
    }
  }

  // Filter out empty groups to prevent placeholder UI
  const groups: MetricGroup[] = [];
  for (const [title, groupMetrics] of Object.entries(categories)) {
    if (groupMetrics.length > 0) {
      groups.push({ title, metrics: groupMetrics });
    }
  }

  return groups;
}
