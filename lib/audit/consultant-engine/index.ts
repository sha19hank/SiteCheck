import { GoogleGenAI } from "@google/genai";
import {
  AuditScores,
  CategoryAudit,
  CanonicalFinding,
  ConsultantReport,
  ScrapeDiagnostics,
  WebsiteClassification,
  WebsiteUnderstanding,
  ActionableInsight,
  EvidenceItem,
  SectionAnalysis,
  PriorityMatrix,
  ActionPlanWeek,
  CompetitivePositioning
} from "../../../types";

function mapSeverityToPriority(severity: string): "High" | "Medium" | "Low" {
  if (severity === "critical" || severity === "high") return "High";
  if (severity === "medium") return "Medium";
  return "Low";
}

function mapImpactEffort(severity: string, check: string): { impact: "High" | "Medium" | "Low"; effort: "High" | "Medium" | "Low" } {
  // Simple heuristic for deterministic mapping
  const impact = mapSeverityToPriority(severity);
  
  // High effort markers
  if (check.includes("page") || check.includes("structure") || check.includes("system") || check.includes("policy")) {
    return { impact, effort: "High" };
  }
  // Medium effort markers
  if (check.includes("form") || check.includes("content") || check.includes("social_proof")) {
    return { impact, effort: "Medium" };
  }
  // Default to low effort for quick text/meta/cta tweaks
  return { impact, effort: "Low" };
}

function getWhyItMatters(check: string, category: string): string {
  if (category === "trust") return "Users will not convert or purchase if they don't explicitly trust the business entity.";
  if (category === "conversion") return "Friction in the user journey directly reduces the rate of successful signups or purchases.";
  if (category === "performance") return "Slow loading times directly correlate with higher bounce rates and lost revenue.";
  if (category === "clarity") return "If visitors cannot quickly understand the value proposition, they will leave within seconds.";
  return "This issue degrades the overall user experience and professional feel of the platform.";
}

function getExpectedOutcome(check: string, category: string): string {
  if (category === "trust") return "Increased user trust and lower abandonment rates.";
  if (category === "conversion") return "Higher conversion rates and more captured leads.";
  if (category === "performance") return "Faster page loads and improved SEO rankings.";
  if (category === "clarity") return "Better user comprehension and lower bounce rates.";
  return "Improved overall platform quality.";
}

export async function generateConsultantReport(
  scores: AuditScores,
  scrapedData: any,
  diagnostics: ScrapeDiagnostics,
  classification: WebsiteClassification,
  understanding: WebsiteUnderstanding,
  categoryAudit: CategoryAudit,
  confidenceParams: {
    level: "HIGH" | "MEDIUM" | "LOW";
    metrics: { evidenceCoverage: number; understandingCompleteness: number; scrapeQuality: string; classificationConfidence: number };
  }
): Promise<ConsultantReport> {
  
  // 1. Audit Limitations & Confidence
  const aiAvailable = classification.aiStatus === "AI_AVAILABLE";
  
  const reportConfidenceLevel = confidenceParams.level;
  const metricsMsg = `Coverage: ${(confidenceParams.metrics.evidenceCoverage*100).toFixed(0)}% | Completeness: ${(confidenceParams.metrics.understandingCompleteness*100).toFixed(0)}% | Scrape: ${confidenceParams.metrics.scrapeQuality}`;
  const limitations = `We successfully analyzed the website with a ${diagnostics.scrapeQuality} quality scrape. AI assistance was ${aiAvailable ? "available" : `unavailable due to ${classification.aiStatus}`}. Recommendations are based on deterministic signals.`;

  // 2. Build Insights from Findings
  const allInsights: ActionableInsight[] = [];
  const evidenceLedger: EvidenceItem[] = [];

  categoryAudit.findings.forEach(f => {
    if (f.severity === "pass") return;
    
    const { impact, effort } = mapImpactEffort(f.severity, f.id);
    const priority = mapSeverityToPriority(f.severity);
    
    const insight: ActionableInsight = {
      problem: f.title || f.id || "Issue detected",
      evidence: f.evidence && f.evidence.length > 0 ? f.evidence : [f.description || `Detected in ${f.category} analysis`],
      whyItMatters: getWhyItMatters(f.id, f.category),
      businessImpact: `Impacts ${f.category} metrics and overall growth readiness.`,
      recommendedFix: `Resolve the ${f.title} issue based on category best practices.`,
      priority,
      effort,
      expectedOutcome: getExpectedOutcome(f.id, f.category)
    };
    allInsights.push(insight);

    evidenceLedger.push({
      finding: insight.problem,
      source: `Automated Check: ${f.category}`,
      impact: `${impact} Impact`
    });
  });

  // Sort insights by priority
  const highPriority = allInsights.filter(i => i.priority === "High");
  const mediumPriority = allInsights.filter(i => i.priority === "Medium");
  const lowPriority = allInsights.filter(i => i.priority === "Low");

  // Task 7: Minimum of real findings, cap at 3
  const topQuickWins = [...highPriority, ...mediumPriority, ...lowPriority].slice(0, 3);

  if (topQuickWins.length === 0) {
    topQuickWins.push({
      problem: "No critical quick wins identified",
      evidence: ["Automated scans found no major friction points"],
      whyItMatters: "Your foundation is solid.",
      businessImpact: "Ready to scale traffic.",
      recommendedFix: "Focus on top-of-funnel marketing.",
      priority: "Low",
      effort: "Low",
      expectedOutcome: "Growth scale"
    });
  }

  // 3. Section Analysis
  const buildSection = (dimension: keyof AuditScores): SectionAnalysis => {
    const dim = scores[dimension] as any;
    const findings = (categoryAudit.findings.filter(f => f.category === dimension && f.severity !== "pass") || []).map(f => f.title || f.id);
    return {
      score: dim?.score || 0,
      findings: findings.slice(0, 5),
      whyItMatters: getWhyItMatters("", dimension as string),
      businessImpact: `A low score in ${dimension} restricts business growth.`,
      recommendedActions: findings.slice(0, 3).map(f => `Fix: ${f}`)
    };
  };

  const performanceAnalysis = buildSection("performance");
  const trustAnalysis = buildSection("trust");
  const conversionAnalysis = buildSection("conversion");
  const clarityAnalysis = buildSection("clarity"); // Used implicitly if needed

  // 4. Priority Matrix
  const priorityMatrix: PriorityMatrix = {
    immediateWins: allInsights.filter(i => i.priority === "High" && i.effort === "Low"),
    strategicProjects: allInsights.filter(i => i.priority === "High" && (i.effort === "Medium" || i.effort === "High")),
    optionalImprovements: allInsights.filter(i => (i.priority === "Medium" || i.priority === "Low") && i.effort === "Low"),
    deprioritize: allInsights.filter(i => (i.priority === "Medium" || i.priority === "Low") && (i.effort === "Medium" || i.effort === "High")),
  };

  // 5. 30-Day Action Plan
  const thirtyDayActionPlan: ActionPlanWeek[] = [
    {
      week: "Week 1: Immediate Wins",
      focus: "Fixing high-impact, low-effort issues.",
      tasks: priorityMatrix.immediateWins.slice(0, 3).map(i => i.recommendedFix)
    },
    {
      week: "Week 2: Strategic Kickoff",
      focus: "Beginning work on larger structural issues.",
      tasks: priorityMatrix.strategicProjects.slice(0, 2).map(i => i.recommendedFix)
    },
    {
      week: "Week 3: Core Enhancements",
      focus: "Improving trust and clarity.",
      tasks: priorityMatrix.strategicProjects.slice(2, 4).map(i => i.recommendedFix)
    },
    {
      week: "Week 4: Optimization",
      focus: "Cleaning up optional improvements.",
      tasks: priorityMatrix.optionalImprovements.slice(0, 3).map(i => i.recommendedFix)
    }
  ];

  const ninetyDayRoadmap: ActionPlanWeek[] = [
    { week: "Month 1", focus: "Foundation", tasks: ["Execute 30-Day Plan"] },
    { week: "Month 2", focus: "Scale", tasks: ["Implement advanced tracking", "A/B test core CTAs"] },
    { week: "Month 3", focus: "Optimize", tasks: ["Review metrics", "Iterate on messaging"] }
  ];

  // 6. Competitive Positioning
  const compPos: CompetitivePositioning = {
    strengths: categoryAudit.strengths || ["Basic presence established"],
    missingIndustryStandards: ["Comprehensive case studies", "Clear pricing tiers"], // Placeholder, improved by LLM
    potentialDisadvantages: ["Competitors may capture trust faster"]
  };

  // 7. Base Deterministic Report
  const baseReport: ConsultantReport = {
    reportConfidence: {
      level: reportConfidenceLevel,
      explanation: `Confidence is ${reportConfidenceLevel} based on ${classification.confidenceTier} classification and ${diagnostics.scrapeQuality} scrape.`,
      metrics: confidenceParams.metrics
    },
    auditLimitations: {
      text: limitations,
      aiAvailable,
      scrapeQuality: diagnostics.scrapeQuality,
      classificationConfidence: classification.confidenceTier
    },
    executiveSummary: `This website is classified as a ${classification.websiteType} with an overall health score of ${scores.overall}. It currently has critical bottlenecks in ${allInsights.length > 0 ? allInsights[0].problem : "several areas"} that are preventing optimal growth.`,
    websiteHealthScore: scores.overall,
    topQuickWins,
    performanceAnalysis,
    trustAnalysis,
    conversionAnalysis,
    growthOpportunities: allInsights,
    competitivePositioning: compPos,
    priorityMatrix,
    thirtyDayActionPlan,
    ninetyDayRoadmap,
    evidenceLedger
  };

  // 8. LLM Overlay (Optional)
  if (aiAvailable) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("No API key");
      
      const prompt = `
      You are a high-end Digital Growth Consultant reviewing an automated audit for a ${classification.websiteType} website.
      Your job is ONLY to rewrite the specific text fields provided below to make them sound like a professional, highly-paid consultant wrote them.
      DO NOT change the underlying facts, scores, or lists. ONLY rewrite the prose.

      Context:
      Website Type: ${classification.websiteType}
      Primary Issue: ${allInsights[0]?.problem}

      JSON Input:
      {
        "executiveSummary": "${baseReport.executiveSummary}",
        "missingIndustryStandards": ["Standard 1", "Standard 2"],
        "potentialDisadvantages": ["Disadvantage 1", "Disadvantage 2"]
      }

      Return ONLY a JSON object with those three keys rewritten. Do NOT use markdown code blocks.
      `;

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { temperature: 0.3, responseMimeType: "application/json" }
      });

      if (response.text) {
        const enhanced = JSON.parse(response.text);
        if (enhanced.executiveSummary) baseReport.executiveSummary = enhanced.executiveSummary;
        if (enhanced.missingIndustryStandards) baseReport.competitivePositioning.missingIndustryStandards = enhanced.missingIndustryStandards;
        if (enhanced.potentialDisadvantages) baseReport.competitivePositioning.potentialDisadvantages = enhanced.potentialDisadvantages;
      }
    } catch (e) {
      console.error("Consultant LLM overlay failed, falling back to deterministic:", e);
    }
  }

  return baseReport;
}
