import { CompositionContext, ReportSection } from "@/types";
import { sectionRegistry } from "./registry";

// Ensure all sections are imported so they register themselves
import "./sections/audit-snapshot";
import "./sections/executive-summary";
import "./sections/60-second-assessment";
import "./sections/growth-bottleneck";
import "./sections/root-cause-narrative";
import "./sections/messaging-audit";
import "./sections/competitive-positioning";
import "./sections/advisor-narrative";
import "./sections/opportunities";
import "./sections/roadmap-builder";
import "./sections/score-breakdown";
import "./sections/evidence-ledger";
import "./sections/priority-matrix";
import "./sections/audit-appendix";

export function generateReportSections(
  context: CompositionContext,
  plan: "free" | "report_unlock" | "enterprise" | "pro"
): ReportSection[] {
  const eligibleSections = sectionRegistry.getEligibleSections(context, plan);
  const composedSections: ReportSection[] = [];

  for (const section of eligibleSections) {
    try {
      const generated = section.generate(context);
      if (generated) {
        composedSections.push(generated);
      }
    } catch (error) {
      console.error(`[ReportComposer] Error generating section ${section.id}:`, error);
    }
  }

  return composedSections;
}
