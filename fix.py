import os
import sys

def main():
    path = 'lib/audit/consultant-engine/index.ts'
    
    # Check out fresh
    os.system('git checkout -- lib/audit/consultant-engine/index.ts')
    
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Imports
    code = code.replace(
        '  PageSpeedData,\n  RecommendationV2\n} from "@/types";',
        '  PageSpeedData,\n  RecommendationV2,\n  PipelineExecution,\n  CompositionContext\n} from "@/types";'
    )
    code = code.replace(
        'import { estimateRevenueImpact } from "./engines/revenue-impact";',
        'import { estimateRevenueImpact } from "./engines/revenue-impact";\n\n// Import Phase 5.2C Validators\nimport { validateConsistency } from "./validators/consistency-validator";\nimport { validateCompleteness } from "./validators/completeness-validator";\n\n// Import Report Composer\nimport { generateReportSections } from "./report-composer";'
    )

    # 2. Signature
    code = code.replace(
        '  pageSpeedData?: PageSpeedData,\n  confidenceParams?: any\n): Promise<ConsultantReport> {',
        '  pageSpeedData?: PageSpeedData,\n  plan: "free" | "report_unlock" | "enterprise" | "pro" = "enterprise"\n): Promise<ConsultantReport> {\n  const pipelineStartTime = performance.now();'
    )

    # 3. Validators
    old_recs = '''  // 12. Recommendation Engine V2 (Refined with reasoning traces in 5.2B)
  const recommendationsV2 = generateRecommendations(
    scoredGaps,
    businessContext,
    rootCauseResult.data,
    relationshipResult.data,
    psychologyResult.data,
    revenueResult.data,
    benchmarkResult.data
  );

  // 13. Prioritization Engine
  const priorityMatrixV2 = prioritizeRecommendations(recommendationsV2);

  // 14. Confidence Engine V2
  const confidenceV2 = calculateConfidence(diagnostics, classification, gaps);

  // 15. Report Depth Resolver
  const reportDepth = resolveReportDepth(businessContext, diagnostics, recommendationsV2.reduce((acc, rec) => acc + rec.evidence.length, 0));'''
    
    new_recs = '''  // 12. Recommendation Engine V2 (Refined with reasoning traces in 5.2B)
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
  const confidenceV2 = calculateConfidence(diagnostics, classification, gaps);'''

    code = code.replace(old_recs, new_recs)

    # 4. Pipeline Execution
    code = code.replace(
        '  const baseReport: ConsultantReport = {',
        '''  const pipelineExecution: PipelineExecution = {
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

  const baseReport: ConsultantReport = {'''
    )

    # 5. Add pipelineExecution to baseReport
    code = code.replace(
        '    evaluatedGaps: gaps,',
        '    evaluatedGaps: gaps,\n    pipelineExecution,'
    )

    # 6. Report Composer
    old_end = '''  return baseReport;
}'''
    new_end = '''  // Generate V2 Dynamic Report Sections
  const compositionContext: CompositionContext = {
    reportDepth,
    businessContext,
    diagnostics,
    pageSpeed: pageSpeedData || { lcp: 0, performanceScore: 0, mobileScore: 0, fcp: 0, cls: 0, speedIndex: 0, ttfb: 0, hasImages: false, imageOptimizationScore: 0, renderBlockingResources: 0, passed: false },
    scrapedData,
    classification,
    gaps,
    recommendations: recommendationsV2,
    reasoningTraces: baseReport.reasoningTraces as NonNullable<CompositionContext["reasoningTraces"]>
  };

  baseReport.reportSections = generateReportSections(compositionContext, plan);

  return baseReport;
}'''
    code = code.replace(old_end, new_end)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Script complete.")

if __name__ == '__main__':
    main()
