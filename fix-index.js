const fs = require('fs');

let code = fs.readFileSync('lib/audit/consultant-engine/index.ts', 'utf8');

// 1. Imports
code = code.replace(
  'RecommendationV2\n} from "@/types";',
  'RecommendationV2,\n  PipelineExecution,\n  CompositionContext,\n  PageSpeedData\n} from "@/types";'
);
code = code.replace(
  'import { estimateRevenueImpact } from "./engines/revenue-impact";',
  'import { estimateRevenueImpact } from "./engines/revenue-impact";\nimport { validateConsistency } from "./validators/consistency-validator";\nimport { validateCompleteness } from "./validators/completeness-validator";\nimport { generateReportSections } from "./report-composer";'
);

// 2. Change signature
code = code.replace(
  'pageSpeedData?: PageSpeedData\n): Promise<ConsultantReport> {',
  'pageSpeedData?: PageSpeedData,\n  plan: "free" | "report_unlock" | "enterprise" | "pro" = "enterprise"\n): Promise<ConsultantReport> {'
);

// 3. Validators
const recsStr = `  // 12. Recommendation Engine V2 (Refined with reasoning traces in 5.2B)
  let recommendationsV2 = generateRecommendations(
    scoredGaps,
    businessContext,
    rootCauseResult.data,
    relationshipResult.data,
    psychologyResult.data,
    revenueResult.data,
    benchmarkResult.data
  );

  const vResult = validateConsistency(recommendationsV2);
  recommendationsV2 = vResult.validRecommendations;
  const validatorModifications = vResult.modifications || [];
  const validationWarnings = vResult.warnings || [];

  const cResult = validateCompleteness(recommendationsV2, reportDepth);
  recommendationsV2 = cResult.validRecommendations;
  validatorModifications.push(...(cResult.modifications || []));
  validationWarnings.push(...(cResult.warnings || []));`;

code = code.replace(
  /  \/\/ 12\. Recommendation Engine V2 \(Refined with reasoning traces in 5\.2B\)[\s\S]*?\n  \/\/ 13\. Prioritization Engine/,
  recsStr + '\n\n  // 13. Prioritization Engine'
);

// 4. Pipeline Execution
code = code.replace(
  '  const baseReport: ConsultantReport = {',
  `  const pipelineExecution: PipelineExecution = {
    totalExecutionTime: Math.round(performance.now() - pipelineStartTime),
    engineExecutionOrder: engineTimes.map(e => e.name),
    slowestEngine: engineTimes.length > 0 ? engineTimes[0] : { name: "None", time: 0 },
    totalEvidenceProcessed: gaps.reduce((acc, g) => acc + g.evidence.length, 0) + crossPageResult.evidence.length,
    totalRecommendationsGenerated: scoredGaps.length,
    opportunitiesGenerated: opportunityResult.data.length,
    rootCausesDetected: rootCauseResult.data.length,
    validationWarnings,
    validatorModifications,
    recommendationsRemovedByValidator: validatorModifications.filter(m => m.action === "removed").length,
    recommendationsDowngraded: validatorModifications.filter(m => m.action === "downgraded").length
  };

  const baseReport: ConsultantReport = {`
);

// 5. Add pipelineExecution to baseReport
code = code.replace(
  'evaluatedGaps: gaps,',
  'evaluatedGaps: gaps,\n    pipelineExecution,'
);

// 6. Report Composer
const composerStr = `  // Generate V2 Dynamic Report Sections
  const compositionContext: CompositionContext = {
    reportDepth,
    businessContext,
    diagnostics,
    pageSpeed: pageSpeedData || { lcp: 0, performanceScore: 0, mobileScore: 0, fcp: 0, cls: 0, speedIndex: 0, ttfb: 0, hasImages: false, imageOptimizationScore: 0, renderBlockingResources: 0, passed: false },
    scrapedData,
    classification,
    gaps,
    recommendations: recommendationsV2,
    reasoningTraces: baseReport.reasoningTraces!
  };

  baseReport.reportSections = generateReportSections(compositionContext, plan);`;

code = code.replace(
  '  return baseReport;\n}',
  composerStr + '\n\n  return baseReport;\n}'
);

fs.writeFileSync('lib/audit/consultant-engine/index.ts', code);
console.log('Script completed');
