import { GoogleGenAI } from "@google/genai";
import {
  AuditScores,
  CategoryAudit,
  ConsultantReport,
  ScrapeDiagnostics,
  WebsiteClassification,
  WebsiteUnderstanding,
  ActionableInsight,
  EvidenceItem,
  SectionAnalysis,
  PriorityMatrix,
  ActionPlanWeek,
  CompetitivePositioning,
  ScrapedData,
  PageSpeedData,
  RecommendationV2,
  PipelineExecution,
  CompositionContext
} from "@/types";

// Import Phase 5.2A Intelligence Modules
import { resolveBusinessContext } from "./core/context-resolver";
import { getKnowledgeModel } from "./models";
import { analyzeGaps } from "./engines/gap-analysis";
import { scoreImpact } from "./engines/impact-engine";
import { generateRecommendations } from "./engines/recommendation-engine";
import { prioritizeRecommendations } from "./engines/prioritization";
import { calculateConfidence } from "./engines/confidence-engine";
import { resolveReportDepth } from "./engines/depth-resolver";
import { getNotRecommendedItems } from "./engines/not-recommended-engine";

// Import Phase 5.2B Reasoning Modules
import { evaluateWebsiteCoherence } from "./engines/cross-page";
import { buildRelationshipGraph } from "./engines/relationship-graph";
import { inferRootCauses } from "./engines/root-cause";
import { discoverOpportunities } from "./engines/opportunities";
import { evaluateBenchmarks } from "./engines/benchmark";
import { annotatePsychology } from "./engines/psychology";
import { estimateRevenueImpact } from "./engines/revenue-impact";

// Import Phase 5.2C Validators
import { validateConsistency } from "./validators/consistency-validator";
import { validateCompleteness } from "./validators/completeness-validator";

// Import Report Composer
import { generateReportSections } from "./report-composer";

function getWhyItMatters(check: string, category: string): string {
  if (category === "trust") return "Users will not convert or purchase if they don't explicitly trust the business entity.";
  if (category === "conversion") return "Friction in the user journey directly reduces the rate of successful signups or purchases.";
  if (category === "performance") return "Slow loading times directly correlate with higher bounce rates and lost revenue.";
  if (category === "clarity") return "If visitors cannot quickly understand the value proposition, they will leave within seconds.";
  return "This issue degrades the overall user experience and professional feel of the platform.";
}

export async function generateConsultantReport(
  scores: AuditScores,
  scrapedData: ScrapedData,
  diagnostics: ScrapeDiagnostics,
  classification: WebsiteClassification,
  understanding: WebsiteUnderstanding,
  categoryAudit: CategoryAudit,
  pageSpeedData?: PageSpeedData,
  plan: "free" | "report_unlock" | "enterprise" | "pro" = "enterprise"
): Promise<ConsultantReport> {
  const pipelineStartTime = performance.now();
  
  // ==========================================
  // PHASE 5.2B: CONSULTANT REASONING SYSTEM
  // ==========================================

  // 1. Resolve Context
  const businessContext = resolveBusinessContext(classification, understanding);

  // 2. Load Knowledge Model
  const knowledgeModel = getKnowledgeModel(businessContext.websiteType);

  // 3. Gap Analysis
  const gaps = analyzeGaps(
    knowledgeModel,
    scrapedData,
    categoryAudit,
    understanding,
    classification,
    pageSpeedData as PageSpeedData,
    diagnostics
  );

  // 4. Business Impact Engine
  const scoredGaps = scoreImpact(gaps, businessContext);

  // 5. Cross-Page Coherence Engine (5.2B)
  const crossPageResult = evaluateWebsiteCoherence(scrapedData, businessContext, understanding);

  // 6. Relationship Graph Engine (5.2B)
  const relationshipResult = buildRelationshipGraph(scoredGaps);

  // 7. Root Cause Engine (5.2B)
  const rootCauseResult = inferRootCauses(scoredGaps, relationshipResult.data);

  // 8. Opportunity Discovery Engine (5.2B)
  const opportunityResult = discoverOpportunities(scrapedData, businessContext, scoredGaps);

  // 9. Benchmark Engine (5.2B)
  const benchmarkResult = evaluateBenchmarks(scores, businessContext, knowledgeModel);

  // 10. Behavioural Psychology Engine (5.2B)
  const psychologyResult = annotatePsychology(scoredGaps);

  // 11. Revenue Impact Engine (5.2B)
  const revenueResult = estimateRevenueImpact(scoredGaps, businessContext);

  // 12. Recommendation Engine V2 (Refined with reasoning traces in 5.2B)
  let recommendationsV2 = generateRecommendations(
    scoredGaps,
    businessContext,
    rootCauseResult.data,
    relationshipResult.data,
    psychologyResult.data,
    revenueResult.data,
    benchmarkResult.data
  );
  
  // 15. Report Depth Resolver
  const reportDepth = resolveReportDepth(businessContext, diagnostics, recommendationsV2.reduce((acc, rec) => acc + rec.evidence.length, 0));

  const vResult = validateConsistency(recommendationsV2);
  recommendationsV2 = vResult.validRecommendations;
  const validatorModifications = vResult.modifications || [];
  const validationWarnings = vResult.warnings || [];

  const cResult = validateCompleteness(recommendationsV2, reportDepth);
  recommendationsV2 = cResult.validRecommendations;
  if (cResult.modifications) validatorModifications.push(...cResult.modifications);
  if (cResult.warnings) validationWarnings.push(...cResult.warnings);

  // 13. Prioritization Engine
  const priorityMatrixV2 = prioritizeRecommendations(recommendationsV2);

  // 14. Confidence Engine V2
  const confidenceV2 = calculateConfidence(diagnostics, classification, gaps);

  // 16. "Not Recommended" Engine
  const notRecommendedItems = getNotRecommendedItems(gaps, businessContext);

  // ==========================================
  // MAP TO BACKWARDS COMPATIBLE FORMAT
  // ==========================================

  const aiAvailable = classification.aiStatus === "AI_AVAILABLE";
  
  let legacyConfidenceLevel: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  if (confidenceV2.overallConfidence >= 0.8) legacyConfidenceLevel = "HIGH";
  else if (confidenceV2.overallConfidence >= 0.5) legacyConfidenceLevel = "MEDIUM";

  const limitations = `We successfully analyzed the website with a ${diagnostics.scrapeQuality} quality scrape. Recommendations are generated deterministically based on the ${businessContext.websiteType} knowledge model and deep causal reasoning engines.`;

  const priorityMatrix: PriorityMatrix = {
    immediateWins: priorityMatrixV2.immediateWins as ActionableInsight[],
    strategicProjects: priorityMatrixV2.strategicProjects as ActionableInsight[],
    optionalImprovements: priorityMatrixV2.optionalImprovements as ActionableInsight[],
    deprioritize: priorityMatrixV2.deprioritize as ActionableInsight[]
  };

  const topQuickWins = priorityMatrix.immediateWins.slice(0, 3);
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

  const allInsights = [
    ...priorityMatrixV2.immediateWins,
    ...priorityMatrixV2.strategicProjects,
    ...priorityMatrixV2.optionalImprovements,
    ...priorityMatrixV2.deprioritize
  ] as ActionableInsight[];

  const evidenceLedger: EvidenceItem[] = allInsights.map(i => ({
    finding: i.problem,
    source: i.evidence[0] || "Automated Scan",
    impact: i.businessImpact,
    relatedRecommendation: i.recommendedFix,
    recommendationId: i.id
  }));

  const buildSection = (dimension: keyof AuditScores): SectionAnalysis => {
    const dim = scores[dimension] as any;
    const relatedGaps = gaps.filter(g => g.affectedArea === dimension);
    
    return {
      score: dim?.score || 0,
      findings: relatedGaps.map(g => g.title).slice(0, 5),
      whyItMatters: getWhyItMatters("", dimension as string),
      businessImpact: `A low score in ${dimension} restricts business growth.`,
      recommendedActions: relatedGaps.slice(0, 3).map(g => `Fix: ${g.title}`)
    };
  };

  const performanceAnalysis = buildSection("performance");
  const trustAnalysis = buildSection("trust");
  const conversionAnalysis = buildSection("conversion");

  const thirtyDayActionPlan: ActionPlanWeek[] = [
    {
      week: "Week 1: Immediate Wins",
      focus: "Fixing high-impact, low-effort issues.",
      tasks: priorityMatrixV2.immediateWins.slice(0, 3).map(i => i.recommendedFix)
    },
    {
      week: "Week 2: Strategic Kickoff",
      focus: "Beginning work on larger structural issues.",
      tasks: priorityMatrixV2.strategicProjects.slice(0, 2).map(i => i.recommendedFix)
    }
  ];

  const ninetyDayRoadmap: ActionPlanWeek[] = [
    { week: "Month 1", focus: "Foundation", tasks: ["Execute 30-Day Plan"] },
    { week: "Month 2", focus: "Scale", tasks: ["Implement advanced tracking", "A/B test core CTAs"] },
    { week: "Month 3", focus: "Optimize", tasks: ["Review metrics", "Iterate on messaging"] }
  ];

  const compPos: CompetitivePositioning = {
    strengths: categoryAudit.strengths || ["Basic presence established"],
    missingIndustryStandards: gaps.filter(g => g.type === "missing").map(g => g.title),
    potentialDisadvantages: ["Competitors may capture trust faster"]
  };

  const pipelineExecution: PipelineExecution = {
    totalExecutionTime: Math.round(performance.now() - pipelineStartTime),
    engineExecutionOrder: [],
    slowestEngine: { name: "None", time: 0 },
    totalEvidenceProcessed: gaps.reduce((acc, g) => acc + g.evidence.length, 0) + crossPageResult.evidence.length,
    totalRecommendationsGenerated: scoredGaps.length,
    opportunitiesGenerated: opportunityResult.data.length,
    rootCausesDetected: rootCauseResult.data.length,
    validationWarnings,
    validatorModifications,
    recommendationsRemovedByValidator: validatorModifications.filter(m => m.action === "removed").length,
    recommendationsDowngraded: validatorModifications.filter(m => m.action === "downgraded").length
  };

  const baseReport: ConsultantReport = {
    reportConfidence: {
      level: legacyConfidenceLevel,
      explanation: `Confidence is ${legacyConfidenceLevel} based on ${classification.confidenceTier} classification and ${diagnostics.scrapeQuality} scrape.`,
      metrics: {
        evidenceCoverage: confidenceV2.evidenceQuality,
        understandingCompleteness: confidenceV2.dataCompleteness,
        scrapeQuality: diagnostics.scrapeQuality,
        classificationConfidence: confidenceV2.classificationCertainty
      }
    },
    auditLimitations: {
      text: limitations,
      aiAvailable,
      scrapeQuality: diagnostics.scrapeQuality,
      classificationConfidence: classification.confidenceTier
    },
    executiveSummary: `This website is classified as a ${classification.websiteType} with an overall health score of ${scores.overall}. ${benchmarkResult.data.comparisonMessage} It currently has bottlenecks in ${allInsights.length > 0 ? allInsights[0].problem : "several areas"} that are preventing optimal growth.`,
    websiteHealthScore: scores.overall,
    topQuickWins,
    performanceAnalysis,
    trustAnalysis,
    conversionAnalysis,
    growthOpportunities: allInsights, // To be expanded in Phase 5.3 with real opportunity objects
    competitivePositioning: compPos,
    priorityMatrix,
    thirtyDayActionPlan,
    ninetyDayRoadmap,
    evidenceLedger,
    
    // V2 Outputs
    businessContext,
    confidenceV2,
    reportDepth,
    notRecommendedItems,
    evaluatedGaps: gaps,
    pipelineExecution,

    // V2B Reasoning Traces
    reasoningTraces: {
      crossPageFindings: crossPageResult.data,
      rootCauses: rootCauseResult.data,
      relationshipGraph: relationshipResult.data,
      opportunities: opportunityResult.data,
      benchmarkContext: benchmarkResult.data,
      psychologyAnnotations: Object.fromEntries(psychologyResult.data),
      revenueImpacts: Object.fromEntries(revenueResult.data)
    }
  };

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

  // Generate V2 Dynamic Report Sections
  const compositionContext: CompositionContext = {
    reportDepth,
    businessContext,
    diagnostics,
    pageSpeed: pageSpeedData || { lcp: 0, performanceScore: 0, mobileScore: 0, fcp: 0, cls: 0, speedIndex: 0, ttfb: 0, hasImages: false, imageOptimizationScore: 0, renderBlockingResources: 0, passed: false },
    scrapedData,
    classification,
    gaps,
    recommendations: recommendationsV2,
    scores,
    evidenceLedger: baseReport.evidenceLedger,
    priorityMatrix,
    reasoningTraces: baseReport.reasoningTraces as NonNullable<CompositionContext["reasoningTraces"]>
  };

  baseReport.reportSections = generateReportSections(compositionContext, plan);

  return baseReport;
}
