import { EvaluatedGap, PsychologyAnnotation, IntelligenceEngineResult } from "@/types";

export function annotatePsychology(gaps: EvaluatedGap[]): IntelligenceEngineResult<Map<string, PsychologyAnnotation>> {
  const startTime = performance.now();
  const annotations = new Map<string, PsychologyAnnotation>();
  const engineEvidence: string[] = [];

  for (const gap of gaps) {
    let principle: PsychologyAnnotation["principle"] | null = null;
    const evidence: string[] = [];
    let metricAffected = "";

    let suggestedImprovement = "";
    
    // Assign severity based on gap importance
    let severity: "High" | "Medium" | "Low" = "Medium";
    if (gap.importance === "critical" || gap.importance === "important") severity = "High";
    if (gap.importance === "optional") severity = "Low";

    if (gap.affectedArea === "trust") {
      if (gap.title.toLowerCase().includes("testimonial") || gap.title.toLowerCase().includes("review")) {
        principle = "Social Proof";
        evidence.push(`Finding mentions testimonials/reviews: ${gap.title}`);
        metricAffected = "Visitor-to-Lead Conversion Rate";
        suggestedImprovement = "Embed customer voices near high-friction conversion points.";
      } else {
        principle = "Trust";
        evidence.push(`Finding classified under trust area: ${gap.title}`);
        metricAffected = "Bounce Rate at Evaluate Stage";
        suggestedImprovement = "Increase transparency and authoritative signals.";
      }
    } else if (gap.affectedArea === "conversion") {
      if (gap.title.toLowerCase().includes("guarantee") || gap.title.toLowerCase().includes("refund")) {
        principle = "Risk Reversal";
        evidence.push(`Finding relates to guarantees or risk: ${gap.title}`);
        metricAffected = "Checkout/Signup Completion Rate";
        suggestedImprovement = "Explicitly shoulder the risk by offering strong guarantees.";
      } else if (gap.title.toLowerCase().includes("friction") || gap.title.toLowerCase().includes("form")) {
        principle = "Cognitive Load";
        evidence.push(`Finding relates to form complexity or friction: ${gap.title}`);
        metricAffected = "Form Abandonment Rate";
        suggestedImprovement = "Reduce choices and simplify the interface to lower cognitive friction.";
      } else {
        principle = "Clarity";
        evidence.push(`Finding classified under conversion friction: ${gap.title}`);
        metricAffected = "CTA Click-Through Rate";
        suggestedImprovement = "Make the primary action and value exchange completely unambiguous.";
      }
    } else if (gap.affectedArea === "clarity") {
      principle = "Clarity";
      evidence.push(`Finding classified under clarity area: ${gap.title}`);
      metricAffected = "Time on Page / Engagement";
      suggestedImprovement = "Simplify messaging to align with visitor mental models.";
    }

    if (principle) {
      annotations.set(gap.id, {
        principle,
        severity,
        confidence: 0.85,
        evidence,
        metricAffected,
        suggestedImprovement
      });
      engineEvidence.push(`Annotated gap '${gap.id}' with Psychology Principle: ${principle}`);
    }
  }

  const endTime = performance.now();

  return {
    data: annotations,
    confidence: 0.9,
    evidence: engineEvidence,
    engineMetadata: {
      engineName: "PsychologyEngine",
      version: "1.1.0",
      executionTimeMs: Math.round(endTime - startTime),
      confidence: 0.9,
      evidenceProcessed: gaps.length
    },
    debugMetadata: {
      annotatedCount: annotations.size
    }
  };
}
