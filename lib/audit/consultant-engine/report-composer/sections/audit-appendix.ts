import { sectionRegistry } from "../registry";
import { CompositionContext, ReportSection } from "@/types";

sectionRegistry.register({
  id: "audit-appendix",
  name: "Technical Appendix",
  priority: 50, // Very end
  requiredPlan: "report_unlock",
  applicableWebsiteTypes: "ALL",
  minReportDepth: "STANDARD",
  generate: (context: CompositionContext): ReportSection | null => {
    const { diagnostics, classification } = context;

    const appendixData = {
      crawlMetadata: {
        htmlLength: diagnostics.htmlLength,
        pageErrors: diagnostics.pageErrors,
        blockedRequests: diagnostics.blockedRequests,
        httpStatus: diagnostics.httpStatus,
      },
      methodology: {
        classificationConfidence: classification.confidenceTier,
        aiAgreement: classification.aiAgreement,
        scrapeQuality: diagnostics.scrapeQuality
      }
    };

    return {
      id: "audit-appendix",
      type: "table",
      title: "Technical Appendix",
      content: appendixData,
      metadata: {
        confidence: 100,
        evidenceCount: 0,
        generatedFrom: ["ScrapeDiagnostics", "Classification"],
        reasoningSummary: "Raw metadata and confidence scoring for transparency."
      }
    };
  }
});
