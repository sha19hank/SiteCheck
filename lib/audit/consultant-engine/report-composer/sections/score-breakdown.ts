import { sectionRegistry } from "../registry";
import { CompositionContext, ReportSection } from "@/types";

sectionRegistry.register({
  id: "score-breakdown",
  name: "Growth Score Breakdown",
  priority: 80,
  requiredPlan: "report_unlock",
  applicableWebsiteTypes: "ALL",
  minReportDepth: "STANDARD",
  generate: (context: CompositionContext): ReportSection | null => {
    const { scores } = context;
    if (!scores) return null;

    const dimensions = [
      {
        id: "performance",
        title: "Performance",
        score: scores.performance?.score || 0,
        explanation: "Measures perceived speed, technical responsiveness, and core web vitals."
      },
      {
        id: "trust",
        title: "Trust",
        score: scores.trust?.score || 0,
        explanation: "Measures credibility, safety signals, and visitor confidence."
      },
      {
        id: "clarity",
        title: "Clarity",
        score: scores.clarity?.score || 0,
        explanation: "Measures how easily visitors can understand the value proposition and messaging."
      },
      {
        id: "conversion",
        title: "Conversion",
        score: scores.conversion?.score || 0,
        explanation: "Measures friction in the user journey and effectiveness of calls-to-action."
      }
    ];

    return {
      id: "score-breakdown",
      type: "cards", 
      title: "Growth Score Breakdown",
      content: dimensions,
      metadata: {
        confidence: 100,
        evidenceCount: 4,
        generatedFrom: ["AuditScores"],
        reasoningSummary: "Provides transparency into how the overall Growth Score was calculated."
      }
    };
  }
});
