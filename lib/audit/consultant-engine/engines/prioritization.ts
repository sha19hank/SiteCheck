import { RecommendationV2, PriorityMatrix } from "@/types";

export function prioritizeRecommendations(recommendations: RecommendationV2[]): PriorityMatrix {
  const immediateWins: RecommendationV2[] = [];
  const strategicProjects: RecommendationV2[] = [];
  const optionalImprovements: RecommendationV2[] = [];
  const deprioritize: RecommendationV2[] = [];

  // Sort by priority score descending
  const sorted = [...recommendations].sort((a, b) => b.priorityScore - a.priorityScore);

  sorted.forEach(rec => {
    if (rec.priorityTier === "Tier 1: Do This Today") {
      if (rec.effortV2 === "Trivial" || rec.effortV2 === "Small") {
        immediateWins.push(rec);
      } else {
        strategicProjects.push(rec);
      }
    } else if (rec.priorityTier === "Tier 2: Do This Month") {
      if (rec.effortV2 === "Large" || rec.effortV2 === "Major") {
        strategicProjects.push(rec);
      } else {
        optionalImprovements.push(rec);
      }
    } else if (rec.priorityTier === "Tier 3: Do This Quarter") {
      if (rec.effortV2 === "Trivial" || rec.effortV2 === "Small") {
        optionalImprovements.push(rec);
      } else {
        deprioritize.push(rec);
      }
    } else {
      deprioritize.push(rec);
    }
  });

  return {
    immediateWins,
    strategicProjects,
    optionalImprovements,
    deprioritize
  };
}
