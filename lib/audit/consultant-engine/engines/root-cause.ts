import { EvaluatedGap, RelationshipEdge, RootCause, IntelligenceEngineResult } from "@/types";

export function inferRootCauses(
  gaps: EvaluatedGap[],
  edges: RelationshipEdge[]
): IntelligenceEngineResult<RootCause[]> {
  const startTime = performance.now();
  const rootCauses: RootCause[] = [];
  const engineEvidence: string[] = [];
  
  // We only care about edges that imply causality or blocking
  const causalEdges = edges.filter(e => 
    e.type === "CAUSES" || e.type === "BLOCKS" || e.type === "ENABLES"
  );

  // Build adjacency list for out-degrees (source -> targets) and in-degrees
  const outGraph: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};

  // Initialize
  gaps.forEach(g => {
    outGraph[g.id] = [];
    inDegree[g.id] = 0;
  });

  // Populate
  causalEdges.forEach(e => {
    if (!outGraph[e.sourceId]) outGraph[e.sourceId] = [];
    if (inDegree[e.targetId] === undefined) inDegree[e.targetId] = 0;
    
    outGraph[e.sourceId].push(e.targetId);
    inDegree[e.targetId]++;
  });

  // Find root nodes (in-degree 0) that have multiple downstream effects (out-degree >= 1)
  // To be a meaningful root cause, it should ideally affect multiple things, or be a critical blocker.
  const rootNodeIds = gaps
    .map(g => g.id)
    .filter(id => inDegree[id] === 0 && outGraph[id].length > 0);

  // Helper to find all descendants of a node (BFS)
  const getDescendants = (startId: string): string[] => {
    const visited = new Set<string>();
    const queue = [startId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const neighbor of outGraph[current] || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return Array.from(visited);
  };

  for (const rootId of rootNodeIds) {
    const rootGap = gaps.find(g => g.id === rootId);
    if (!rootGap) continue;

    const descendants = getDescendants(rootId);
    
    // Only promote to Root Cause if it has cascading effects
    if (descendants.length > 0) {
      // Map descendant IDs back to titles for evidence
      const descendantTitles = descendants
        .map(dId => gaps.find(g => g.id === dId)?.title)
        .filter(Boolean) as string[];

      rootCauses.push({
        id: `root_${rootId}`,
        title: `Root Cause: ${rootGap.title}`,
        description: `The core issue is ${rootGap.title.toLowerCase()}, which cascades into multiple downstream symptoms.`,
        affectedGapIds: descendants,
        evidence: [
          `Detected as a root node in the dependency graph with 0 prerequisites.`,
          `Causes ${descendants.length} downstream issues: ${descendantTitles.join(", ")}.`
        ]
      });

      engineEvidence.push(`Inferred '${rootGap.title}' as a root cause affecting ${descendants.length} symptoms.`);
    }
  }

  // If no clear multi-symptom root causes found, fallback to checking if any single critical gap is acting as a massive blocker
  if (rootCauses.length === 0) {
    const criticalBlockers = causalEdges.filter(e => e.type === "BLOCKS" && e.confidence > 0.9);
    for (const blocker of criticalBlockers) {
      const rootGap = gaps.find(g => g.id === blocker.sourceId);
      if (rootGap && !rootCauses.find(r => r.id === `root_${rootGap.id}`)) {
        rootCauses.push({
          id: `root_${rootGap.id}`,
          title: `Primary Blocker: ${rootGap.title}`,
          description: `This issue must be resolved before other optimizations can be effective.`,
          affectedGapIds: [blocker.targetId],
          evidence: [`Acts as a critical blocker for downstream optimizations.`]
        });
        engineEvidence.push(`Identified '${rootGap.title}' as a primary blocker.`);
      }
    }
  }

  const overallConfidence = rootCauses.length > 0 ? 0.85 : 1.0; // 1.0 if no root causes (perfectly independent gaps)

  const endTime = performance.now();

  return {
    data: rootCauses,
    confidence: overallConfidence,
    evidence: engineEvidence,
    engineMetadata: {
      engineName: "RootCauseEngine",
      version: "1.1.0",
      executionTimeMs: Math.round(endTime - startTime),
      confidence: overallConfidence,
      evidenceProcessed: edges.length
    },
    debugMetadata: {
      graphNodes: gaps.length,
      causalEdges: causalEdges.length,
      rootCauseCount: rootCauses.length
    }
  };
}
