import { CompositionContext, ReportSection } from "@/types";
import { sectionRegistry } from "./registry";

// Ensure all sections are imported so they register themselves
import "./sections/audit-snapshot";
import "./sections/executive-summary";
import "./sections/60-second-assessment";
// import "./sections/growth-bottleneck"; // DORMANT for Milestone 1
import "./sections/root-cause-narrative";
// import "./sections/messaging-audit"; // DORMANT for Milestone 1
// import "./sections/competitive-positioning"; // DORMANT for Milestone 1
// import "./sections/advisor-narrative"; // DORMANT for Milestone 1
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
