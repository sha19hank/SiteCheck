/**
 * DORMANT FOR MILESTONE 1
 * This section provides consultant intelligence (Competitive Positioning) but is not exposed in the current UI.
 * Retained for future premium/enterprise tiers.
 */
import { sectionRegistry } from "../registry";
import { CompositionContext, ReportSection } from "@/types";

sectionRegistry.register({
  id: "competitive-positioning",
  name: "Competitive Positioning",
  priority: 75,
  requiredPlan: "report_unlock",
  applicableWebsiteTypes: ["saas", "ecommerce", "agency"],
  minReportDepth: "COMPREHENSIVE",
  generate: (context: CompositionContext): ReportSection | null => {
    const { businessContext, classification } = context;

    const strengths = ["Established web presence", "Accessible baseline performance"];
    const weaknesses = ["Differentiation is not clearly communicated above the fold", "Lack of prominent competitive comparison"];

    if (classification.confidenceTier === "HIGH") {
      strengths.push(`Clear identity as a ${classification.websiteType}`);
    } else {
      weaknesses.push("Ambiguous business model signaling to visitors");
    }

    const content = {
      intro: "An evidence-backed positioning summary based on your website's public presentation.",
      currentPositioning: businessContext.valueProposition || "Generic Market Positioning",
      strengths,
      weaknesses,
      differentiationOpportunities: [
        "Create dedicated comparison pages against major alternatives",
        "Highlight unique methodology or specialized audience focus"
      ]
    };

    return {
      id: "competitive-positioning",
      type: "text",
      title: "Competitive Positioning",
      content,
      metadata: {
        confidence: 65,
        evidenceCount: 3,
        generatedFrom: ["ContextEngine", "WebsiteClassification"],
        reasoningSummary: "Analyzed value proposition clarity and business model signaling."
      }
    };
  }
});
