/**
 * DORMANT FOR MILESTONE 1
 * This section provides consultant intelligence (Advisor Narrative) but is not exposed in the current UI.
 * Retained for future premium/enterprise tiers.
 */
import { sectionRegistry } from "../registry";
import { CompositionContext, ReportSection } from "@/types";

sectionRegistry.register({
  id: "advisor-narrative",
  name: "If I Were Your Growth Advisor",
  priority: 70,
  requiredPlan: "enterprise",
  applicableWebsiteTypes: "ALL",
  minReportDepth: "COMPREHENSIVE",
  generate: (context: CompositionContext): ReportSection | null => {
    const { reasoningTraces } = context;

    const rootCause = reasoningTraces.rootCauses?.[0]?.title || "foundational friction points";
    const opportunity = reasoningTraces.opportunities?.[0]?.title || "expanding your conversion paths";

    const content = `Here is exactly what I would recommend for the next 90 days:\n\n**MONTH 1: FOUNDATION**\nYour immediate priority is resolving ${rootCause.toLowerCase()}. Right now, this is acting as a bottleneck. Before optimizing anything else, we need to fix this foundation. I would expect this done within the first 30 days.\n\n**MONTH 2: ACCELERATION**\nWith the foundation fixed, the next leverage point is ${opportunity.toLowerCase()}. Currently you're leaving this opportunity on the table. The play here is to deploy this asset aggressively.\n\n**MONTH 3: MEASUREMENT & ITERATION**\nBy now you should be seeing improvements in your primary conversion KPIs. Set up strict tracking. If metrics haven't improved, we need to re-evaluate the messaging resonance.`;

    return {
      id: "advisor-narrative",
      type: "text",
      title: "If I Were Your Growth Advisor",
      content,
      metadata: {
        confidence: 85,
        evidenceCount: 0, // Synthesized narrative
        generatedFrom: ["RootCauseEngine", "OpportunityEngine"],
        reasoningSummary: "A strategic, narrative-driven 90-day execution plan formulated from top priorities."
      }
    };
  }
});
