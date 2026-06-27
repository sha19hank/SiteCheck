import { EvaluatedGap, PsychologyAnnotation, IntelligenceEngineResult } from "@/types";

export function annotatePsychology(gaps: EvaluatedGap[]): IntelligenceEngineResult<Map<string, PsychologyAnnotation>> {
  const annotations = new Map<string, PsychologyAnnotation>();
  const engineEvidence: string[] = [];

  for (const gap of gaps) {
    let principle: PsychologyAnnotation["principle"] | null = null;
    const evidence: string[] = [];
    let metricAffected = "";

    if (gap.affectedArea === "trust") {
      if (gap.title.toLowerCase().includes("testimonial") || gap.title.toLowerCase().includes("review")) {
        principle = "Social Proof";
        evidence.push(`Finding mentions testimonials/reviews: ${gap.title}`);
        metricAffected = "Visitor-to-Lead Conversion Rate";
      } else {
        principle = "Trust";
        evidence.push(`Finding classified under trust area: ${gap.title}`);
        metricAffected = "Bounce Rate at Evaluate Stage";
      }
    } else if (gap.affectedArea === "conversion") {
      if (gap.title.toLowerCase().includes("guarantee") || gap.title.toLowerCase().includes("refund")) {
        principle = "Risk Reversal";
        evidence.push(`Finding relates to guarantees or risk: ${gap.title}`);
        metricAffected = "Checkout/Signup Completion Rate";
      } else if (gap.title.toLowerCase().includes("friction") || gap.title.toLowerCase().includes("form")) {
        principle = "Cognitive Load";
        evidence.push(`Finding relates to form complexity or friction: ${gap.title}`);
        metricAffected = "Form Abandonment Rate";
      } else {
        principle = "Clarity";
        evidence.push(`Finding classified under conversion friction: ${gap.title}`);
        metricAffected = "CTA Click-Through Rate";
      }
    } else if (gap.affectedArea === "clarity") {
      principle = "Clarity";
      evidence.push(`Finding classified under clarity area: ${gap.title}`);
      metricAffected = "Time on Page / Engagement";
    }

    if (principle) {
      annotations.set(gap.id, {
        principle,
        evidence,
        metricAffected
      });
      engineEvidence.push(`Annotated gap '${gap.id}' with Psychology Principle: ${principle}`);
    }
  }

  return {
    data: annotations,
    confidence: 0.9,
    evidence: engineEvidence,
    debugMetadata: {
      annotatedCount: annotations.size
    }
  };
}
