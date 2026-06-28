import { EvaluatedGap, RelationshipEdge, IntelligenceEngineResult } from "@/types";

export function buildRelationshipGraph(gaps: EvaluatedGap[]): IntelligenceEngineResult<RelationshipEdge[]> {
  const startTime = performance.now();
  const edges: RelationshipEdge[] = [];
  const evidence: string[] = [];
  
  // Categorize gaps for easier rule matching
  const trustGaps = gaps.filter(g => g.affectedArea === "trust");
  const conversionGaps = gaps.filter(g => g.affectedArea === "conversion");
  const clarityGaps = gaps.filter(g => g.affectedArea === "clarity");
  const performanceGaps = gaps.filter(g => g.affectedArea === "performance");

  // Rule 1: Trust issues AMPLIFY conversion issues
  for (const trust of trustGaps) {
    for (const conv of conversionGaps) {
      edges.push({
        sourceId: trust.id,
        targetId: conv.id,
        type: "AMPLIFIES",
        confidence: 0.85
      });
      evidence.push(`Lack of trust (${trust.id}) amplifies conversion friction (${conv.id}).`);
    }
  }

  // Rule 2: Clarity issues CAUSE conversion issues
  for (const clarity of clarityGaps) {
    for (const conv of conversionGaps) {
      edges.push({
        sourceId: clarity.id,
        targetId: conv.id,
        type: "CAUSES",
        confidence: 0.80
      });
      evidence.push(`Poor clarity (${clarity.id}) causes lower conversion (${conv.id}).`);
    }
  }

  // Rule 3: Performance issues CAUSE all other issues (visitors bounce early)
  for (const perf of performanceGaps) {
    for (const other of gaps) {
      if (other.id !== perf.id) {
        edges.push({
          sourceId: perf.id,
          targetId: other.id,
          type: "CAUSES",
          confidence: 0.70
        });
        evidence.push(`Performance issue (${perf.id}) causes downstream failure for ${other.id} by increasing early bounce rate.`);
      }
    }
  }

  // Rule 4: Missing Pricing BLOCKS pricing optimization
  const missingPricingGap = gaps.find(g => g.id.includes("missing") && g.title.toLowerCase().includes("pricing"));
  const pricingOptGaps = gaps.filter(g => !g.id.includes("missing") && g.title.toLowerCase().includes("pricing") && g.id !== missingPricingGap?.id);
  
  if (missingPricingGap) {
    for (const opt of pricingOptGaps) {
      edges.push({
        sourceId: missingPricingGap.id,
        targetId: opt.id,
        type: "BLOCKS",
        confidence: 0.95
      });
      evidence.push(`Missing pricing page (${missingPricingGap.id}) blocks optimization of pricing (${opt.id}).`);
    }
  }

  // Rule 5: Value prop clarity ENABLES effective CTAs
  const valuePropGap = gaps.find(g => g.id.includes("hero") || g.id.includes("value_prop"));
  const ctaGaps = gaps.filter(g => g.id.includes("cta"));
  
  if (valuePropGap) {
    for (const cta of ctaGaps) {
      edges.push({
        sourceId: valuePropGap.id,
        targetId: cta.id,
        type: "ENABLES",
        confidence: 0.85
      });
      evidence.push(`Fixing value proposition (${valuePropGap.id}) enables CTA effectiveness (${cta.id}).`);
    }
  }

  // Calculate overall confidence based on edge volume and gap confidence
  const avgGapConfidence = gaps.length > 0 ? gaps.reduce((acc, g) => acc + g.confidence, 0) / gaps.length : 1;
  const overallConfidence = edges.length > 0 ? avgGapConfidence * 0.9 : 1.0;

  const endTime = performance.now();

  return {
    data: edges,
    confidence: overallConfidence,
    evidence,
    engineMetadata: {
      engineName: "RelationshipGraphEngine",
      version: "1.1.0",
      executionTimeMs: Math.round(endTime - startTime),
      confidence: overallConfidence,
      evidenceProcessed: edges.length
    },
    debugMetadata: {
      edgeCount: edges.length,
      nodeCount: gaps.length
    }
  };
}
