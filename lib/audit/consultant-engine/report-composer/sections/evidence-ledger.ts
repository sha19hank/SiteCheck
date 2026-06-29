import { sectionRegistry } from "../registry";
import { CompositionContext, ReportSection } from "@/types";

sectionRegistry.register({
  id: "evidence-ledger",
  name: "Evidence Ledger",
  priority: 88, // Before Root Cause Analysis
  requiredPlan: "report_unlock",
  applicableWebsiteTypes: "ALL",
  minReportDepth: "STANDARD",
  generate: (context: CompositionContext): ReportSection | null => {
    const { evidenceLedger } = context;
    if (!evidenceLedger || evidenceLedger.length === 0) return null;

    return {
      id: "evidence-ledger",
      type: "table", 
      title: "Evidence Ledger",
      content: evidenceLedger,
      metadata: {
        confidence: 100,
        evidenceCount: evidenceLedger.length,
        generatedFrom: ["EvidenceLedger"],
        reasoningSummary: "Raw findings and observations mapped to their sources and related recommendations."
      }
    };
  }
});
