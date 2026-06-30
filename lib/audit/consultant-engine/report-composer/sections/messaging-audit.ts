/**
 * DORMANT FOR MILESTONE 1
 * This section provides consultant intelligence (Messaging Audit) but is not exposed in the current UI.
 * Retained for future premium/enterprise tiers.
 */
import { sectionRegistry } from "../registry";
import { CompositionContext, ReportSection } from "@/types";

sectionRegistry.register({
  id: "messaging-audit",
  name: "Messaging Audit",
  priority: 80,
  requiredPlan: "report_unlock",
  applicableWebsiteTypes: "ALL",
  minReportDepth: "COMPREHENSIVE",
  generate: (context: CompositionContext): ReportSection | null => {
    const { diagnostics } = context;

    const audits: Array<{element: string; current: string; problem: string; verdict: string}> = [];

    // Hero Headline
    const h1 = context.scrapedData.h1s?.[0];
    if (h1) {
      const words = h1.split(" ").length;
      audits.push({
        element: "Hero Headline (H1)",
        current: h1,
        problem: words < 4 ? "Too short to communicate specific value." : (h1.toLowerCase().includes("welcome") ? "Wastes valuable real estate on a generic greeting." : "None"),
        verdict: (words >= 4 && !h1.toLowerCase().includes("welcome")) ? "STRONG" : "NEEDS_WORK"
      });
    }

    // CTA
    const ctas = context.scrapedData.navLinks;
    if (ctas.length > 0) {
      const mainCta = ctas[0];
      const genericWords = ["click here", "submit", "learn more"];
      const isGeneric = genericWords.some(w => mainCta.toLowerCase().includes(w));
      
      audits.push({
        element: "Primary CTA",
        current: mainCta,
        problem: isGeneric ? "Action lacks context. Visitors don't know what they are 'learning more' about." : "None",
        verdict: isGeneric ? "NEEDS_WORK" : "STRONG"
      });
    }

    if (audits.length === 0) {
      return null;
    }

    return {
      id: "messaging-audit",
      type: "comparison",
      title: "Messaging Audit",
      content: audits,
      metadata: {
        confidence: 90,
        evidenceCount: audits.length,
        generatedFrom: ["ScraperDiagnostics"],
        reasoningSummary: "Line-by-line analysis of key messaging elements extracted directly from the page DOM."
      }
    };
  }
});
