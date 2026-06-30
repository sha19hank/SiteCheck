import { sectionRegistry } from "../registry";
import { CompositionContext, ReportSection } from "@/types";

sectionRegistry.register({
  id: "60-second-assessment",
  name: "Website in 60 Seconds",
  priority: 90,
  requiredPlan: "free",
  applicableWebsiteTypes: "ALL",
  minReportDepth: "STANDARD",
  generate: (context: CompositionContext): ReportSection | null => {
    const { diagnostics, classification } = context;

    const timeline: Array<{ timeframe: string; focus: string; observation: string; verdict: string; }> = [];
    
    // Second 0-3 (LCP)
    const lcp = context.pageSpeed.lcp || 0;
    timeline.push({
      timeframe: "Second 0-3",
      focus: "Load Performance",
      observation: `Page loads in ${lcp.toFixed(1)}s.`,
      verdict: lcp < 2.5 ? "Fast and responsive." : "Slow enough to trigger initial bounce risk."
    });

    // Second 3-10 (H1)
    const h1 = context.scrapedData.h1s?.[0] || "Missing H1";
    const isVague = h1.split(" ").length < 4 || h1.toLowerCase().includes("welcome");
    timeline.push({
      timeframe: "Second 3-10",
      focus: "Value Proposition",
      observation: `They read: '${h1}'.`,
      verdict: isVague ? "This is a vague tagline that does not clearly communicate the product value." : "Communicates immediate context."
    });

    // Second 10-20 (Social Proof)
    timeline.push({
      timeframe: "Second 10-20",
      focus: "Trust Validation",
      observation: "Searching for evidence of credibility.",
      verdict: classification.confidenceTier === "HIGH" ? "Trust signals are present." : "Weak or missing social proof creates hesitation."
    });

    // Second 20-40 (CTA)
    timeline.push({
      timeframe: "Second 20-40",
      focus: "Action Intent",
      observation: "Evaluating the primary Call to Action.",
      verdict: "Requires a clear, low-friction next step to retain interest."
    });

    // Second 40-60 (Verdict)
    const overallScore = 100; // Mock calculation based on timeline
    const overallVerdict = lcp < 2.5 && !isVague ? "STRONG" : "WEAK";

    return {
      id: "60-second-assessment",
      type: "timeline",
      title: "Your Website in 60 Seconds",
      content: {
        intro: `When a visitor lands on your homepage, here is what they experience in the first 60 seconds:`,
        timeline,
        verdict: overallVerdict,
        biggestRisk: isVague ? "Unclear value proposition" : (lcp >= 2.5 ? "Slow load times" : "Friction in conversion path")
      },
      metadata: {
        confidence: 85,
        evidenceCount: 4,
        generatedFrom: ["ScraperDiagnostics", "WebsiteClassification"],
        reasoningSummary: "A chronological simulation of visitor cognitive processing based on extracted above-the-fold elements."
      }
    };
  }
});
