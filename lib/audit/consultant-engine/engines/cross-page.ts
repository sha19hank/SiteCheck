import { ScrapedData, BusinessContext, WebsiteUnderstanding, CrossPageFinding, IntelligenceEngineResult } from "@/types";

interface CoherenceRule {
  id: string;
  type: "promise_delivery" | "messaging_alignment" | "nav_content";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  impact: string;
  sourcePage: string;
  targetPage: string;
  threshold: number;
  evaluate: (data: ScrapedData, context: BusinessContext, understanding: WebsiteUnderstanding) => { score: number; evidence: string[] };
}

export function evaluateWebsiteCoherence(
  data: ScrapedData,
  context: BusinessContext,
  understanding: WebsiteUnderstanding
): IntelligenceEngineResult<CrossPageFinding[]> {
  const startTime = performance.now();
  const findings: CrossPageFinding[] = [];
  const engineEvidence: string[] = [];
  
  const rules: CoherenceRule[] = [
    {
      id: "cta_destination_mismatch",
      type: "promise_delivery",
      severity: "critical",
      description: "CTA promises a free/no-commitment action, but the funnel requires payment or high friction.",
      impact: "Creates immediate trust violation at the point of conversion, leading to high abandonment rates.",
      sourcePage: "Homepage",
      targetPage: "Conversion Flow",
      threshold: 1.5,
      evaluate: (d, c, u) => {
        let score = 0;
        const ev: string[] = [];
        
        const hasFreeCTA = d.ctaTexts.some(cta => cta.toLowerCase().includes("free"));
        if (hasFreeCTA) {
          score += 0.8;
          ev.push("Detected 'Free' in primary CTA text.");
        }
        
        // This is a proxy since we don't scrape the signup page explicitly yet,
        // but we can infer from the pricing strategy and business context.
        if (c.pricingStrategy === "Subscription" || c.pricingStrategy === "Enterprise / Custom") {
          score += 0.5;
          ev.push(`Pricing strategy is ${c.pricingStrategy}, which typically requires payment info upfront.`);
        }
        
        if (c.pricingStrategy === "Free Trial" && d.hasPricing && !d.hasTrustBadges) {
          score += 0.3;
          ev.push("Free Trial pricing detected but no trust/security badges found (increases perceived risk of CC requirement).");
        }

        return { score, evidence: ev };
      }
    },
    {
      id: "price_position_mismatch",
      type: "promise_delivery",
      severity: "high",
      description: "Positioning claims 'affordable/for startups', but pricing is enterprise/expensive.",
      impact: "Attracts the wrong audience who will bounce upon seeing pricing, ruining acquisition efficiency.",
      sourcePage: "Homepage Hero",
      targetPage: "Pricing",
      threshold: 1.2,
      evaluate: (d, c, u) => {
        let score = 0;
        const ev: string[] = [];
        const targetsSMB = u.targetAudience.toLowerCase().includes("startup") || 
                           u.targetAudience.toLowerCase().includes("small business") ||
                           u.targetAudience.toLowerCase().includes("creator") ||
                           d.h1s.some(h1 => h1.toLowerCase().includes("startup") || h1.toLowerCase().includes("small business"));
                           
        if (targetsSMB) {
          score += 0.7;
          ev.push("Target audience or H1 explicitly targets startups or small businesses.");
        }
        
        if (c.pricingStrategy === "Enterprise / Custom" || c.goToMarketMotion === "Sales-Led") {
          score += 0.8;
          ev.push(`Business motion is ${c.goToMarketMotion} or pricing is ${c.pricingStrategy}.`);
        }
        
        return { score, evidence: ev };
      }
    },
    {
      id: "motion_funnel_mismatch",
      type: "promise_delivery",
      severity: "critical",
      description: "Product-Led Growth (PLG) messaging but Sales-Led funnel.",
      impact: "Visitors who want to try the product self-serve are forced into a demo pipeline, causing severe drop-off.",
      sourcePage: "Homepage",
      targetPage: "Contact/Demo",
      threshold: 1.5,
      evaluate: (d, c, u) => {
        let score = 0;
        const ev: string[] = [];
        
        const hasStartSelfServeCTA = d.ctaTexts.some(cta => cta.toLowerCase().includes("start") || cta.toLowerCase().includes("try"));
        if (hasStartSelfServeCTA) {
          score += 0.6;
          ev.push("Detected self-serve intent in CTAs ('Start', 'Try').");
        }
        
        if (c.goToMarketMotion === "Sales-Led") {
          score += 0.5;
          ev.push("GTM Motion is classified as Sales-Led.");
        }
        
        if (d.ctaTexts.some(cta => cta.toLowerCase().includes("demo") || cta.toLowerCase().includes("contact sales"))) {
          score += 0.6;
          ev.push("Detected competing 'Demo' or 'Contact Sales' CTAs.");
        }
        
        return { score, evidence: ev };
      }
    },
    {
      id: "nav_content_mismatch_pricing",
      type: "nav_content",
      severity: "medium",
      description: "Navigation implies transparent pricing, but no pricing page or info exists.",
      impact: "Violates visitor expectations and prevents self-qualification.",
      sourcePage: "Navigation",
      targetPage: "Pricing",
      threshold: 1.0,
      evaluate: (d, c, u) => {
        let score = 0;
        const ev: string[] = [];
        
        const navHasPricing = d.navLinks.some(n => n.toLowerCase().includes("pricing") || n.toLowerCase().includes("plans"));
        if (navHasPricing) {
          score += 0.6;
          ev.push("Navigation contains 'Pricing' or 'Plans'.");
        }
        
        if (!d.hasPricing) {
          score += 0.6;
          ev.push("No explicit pricing section or data was detected on the main pages.");
        }
        
        return { score, evidence: ev };
      }
    }
  ];

  for (const rule of rules) {
    const result = rule.evaluate(data, context, understanding);
    if (result.score >= rule.threshold) {
      findings.push({
        type: rule.type,
        severity: rule.severity,
        sourcePage: rule.sourcePage,
        targetPage: rule.targetPage,
        description: rule.description,
        impact: rule.impact
      });
      engineEvidence.push(`[Coherence] Rule '${rule.id}' triggered with score ${result.score.toFixed(2)}. Evidence: ${result.evidence.join(" ")}`);
    }
  }

  let overallConfidence = 0.8;
  if (understanding.confidence < 0.6) {
    overallConfidence = 0.5;
    engineEvidence.push("Reduced coherence confidence due to low WebsiteUnderstanding confidence.");
  }

  const endTime = performance.now();
  
  return {
    data: findings,
    confidence: overallConfidence,
    evidence: engineEvidence,
    engineMetadata: {
      engineName: "CrossPageCoherenceEngine",
      version: "1.1.0",
      executionTimeMs: Math.round(endTime - startTime),
      confidence: overallConfidence,
      evidenceProcessed: rules.length
    },
    debugMetadata: {
      rulesEvaluated: rules.length,
      findingsCount: findings.length
    }
  };
}
