import { EvaluatedGap, BusinessContext, ImpactScores } from "@/types";

export interface ScoredGap extends EvaluatedGap {
  impactScores: ImpactScores;
  effortV2: "Trivial" | "Small" | "Medium" | "Large" | "Major";
  priorityScore: number;
  owner: string;
}

export function scoreImpact(
  gaps: EvaluatedGap[],
  context: BusinessContext
): ScoredGap[] {
  return gaps.map(gap => {
    // Initialize base scores
    const impactScores: ImpactScores = {
      revenue: 0,
      trust: 0,
      conversion: 0,
      seo: 0,
      ux: 0,
      growth: 0,
      overall: 0
    };

    let effortV2: ScoredGap["effortV2"] = "Medium";
    let owner = "Marketing";

    // 1. Domain mapping
    if (gap.affectedArea === "conversion" || gap.title.toLowerCase().includes("pricing") || gap.title.toLowerCase().includes("cta")) {
      impactScores.conversion = 9;
      impactScores.revenue = 8;
      owner = "Marketing / Product";
    }
    
    if (gap.affectedArea === "trust" || gap.title.toLowerCase().includes("testimonial") || gap.title.toLowerCase().includes("logo")) {
      impactScores.trust = 9;
      impactScores.conversion = 6;
      owner = "Marketing";
    }

    if (gap.affectedArea === "performance") {
      impactScores.seo = 8;
      impactScores.ux = 7;
      owner = "Engineering";
      effortV2 = "Large";
    }
    
    if (gap.affectedArea === "clarity") {
      impactScores.ux = 9;
      impactScores.conversion = 7;
      owner = "Design / Copywriting";
    }

    // 2. Adjust based on Importance
    let priorityMultiplier = 1.0;
    if (gap.importance === "critical") priorityMultiplier = 1.5;
    if (gap.importance === "important") priorityMultiplier = 1.2;
    if (gap.importance === "optional") priorityMultiplier = 0.5;
    if (gap.importance === "forbidden") {
      priorityMultiplier = 1.5;
      impactScores.growth = 9; // High penalty for forbidden practices
    }

    // 3. Adjust based on Context
    if (context.growthStage === "Enterprise" && gap.affectedArea === "trust") {
      impactScores.trust += 2; // Trust is critical for enterprise
    }
    if (context.websiteType === "ecommerce" && gap.affectedArea === "conversion") {
      impactScores.revenue += 3; // Conversion directly = revenue for ecom
    }

    // 4. Calculate Overall Priority Score (0-100 scale)
    const baseScore = (impactScores.revenue * 2) + impactScores.conversion + impactScores.trust + impactScores.ux + impactScores.seo + impactScores.growth;
    let priorityScore = Math.min(100, Math.round(baseScore * priorityMultiplier));

    // Effort mapping based on type
    if (gap.type === "missing" && owner === "Engineering") effortV2 = "Major";
    if (gap.type === "weak" && owner === "Marketing") effortV2 = "Small";

    impactScores.overall = priorityScore;

    return {
      ...gap,
      impactScores,
      effortV2,
      priorityScore,
      owner
    };
  });
}
