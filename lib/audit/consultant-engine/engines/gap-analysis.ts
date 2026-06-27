import { 
  KnowledgeModel, 
  ScrapedData, 
  EvaluatedGap, 
  CategoryAudit, 
  WebsiteUnderstanding, 
  WebsiteClassification, 
  PageSpeedData,
  ScrapeDiagnostics
} from "@/types";

export function analyzeGaps(
  model: KnowledgeModel,
  scrapedData: ScrapedData,
  categoryAudit: CategoryAudit,
  understanding: WebsiteUnderstanding,
  classification: WebsiteClassification,
  pageSpeed: PageSpeedData,
  diagnostics: ScrapeDiagnostics
): EvaluatedGap[] {
  const gaps: EvaluatedGap[] = [];

  // 1. Process existing Category Audit findings and enrich them
  // We classify existing findings mainly as "weak" implementations
  categoryAudit.findings.forEach(finding => {
    if (finding.severity === "pass") return;
    
    // Map existing finding to a Gap
    gaps.push({
      id: finding.id,
      title: finding.title,
      description: finding.description,
      importance: (finding.severity === "critical" || finding.severity === "high") ? "critical" : "important",
      businessReason: `Addressed via ${finding.category} best practices.`,
      affectedArea: finding.category,
      confidence: 0.9, // Base deterministic findings are usually high confidence
      evidence: finding.evidence || [],
      type: "weak" // Existing findings are usually weak executions of something present
    });
  });

  // 2. Evaluate Knowledge Model Expectations for "Missing" or "Contradictory" gaps
  model.expectations.forEach(exp => {
    // Simple deterministic rule engine
    let isSatisfied = false;
    let evidenceFound: string[] = [];
    
    // Fallback simple checks based on description keywords if rules aren't perfectly parseable
    if (exp.id.includes("pricing") && scrapedData.hasPricing) {
      isSatisfied = true;
      evidenceFound.push("Pricing section found");
    } else if (exp.id.includes("contact") && scrapedData.hasContactForm) {
      isSatisfied = true;
      evidenceFound.push("Contact form found");
    } else if (exp.id.includes("trust") && scrapedData.hasTrustBadges) {
      isSatisfied = true;
      evidenceFound.push("Trust badges found");
    } else if (exp.id.includes("testimonial") && scrapedData.hasTestimonials) {
      isSatisfied = true;
      evidenceFound.push("Testimonials found");
    } else if (exp.id.includes("about") && scrapedData.hasAboutPage) {
      isSatisfied = true;
      evidenceFound.push("About page found");
    }

    if (exp.importance === "forbidden" && isSatisfied) {
      // It's present, but it's forbidden -> Contradictory / Negative Gap
      gaps.push({
        id: `gap_${exp.id}`,
        title: `Forbidden Signal Detected: ${exp.description}`,
        description: `This signal is strongly discouraged for ${model.type} websites.`,
        importance: "critical",
        businessReason: `Contradicts the standard operating model for ${model.type}.`,
        affectedArea: exp.category,
        confidence: 0.8,
        evidence: evidenceFound,
        type: "contradictory"
      });
    } else if (exp.importance !== "forbidden" && !isSatisfied) {
      // It's expected, but missing -> Missing Gap
      gaps.push({
        id: `gap_${exp.id}`,
        title: `Missing: ${exp.description}`,
        description: `A core expectation for ${model.type} is missing.`,
        importance: exp.importance,
        businessReason: `Expected for a standard ${model.type} customer journey.`,
        affectedArea: exp.category,
        confidence: 0.8,
        evidence: [`Scraped data indicates missing ${exp.description}`],
        type: "missing"
      });
    }
  });

  // Deduplicate by ID
  const uniqueGaps = Array.from(new Map(gaps.map(g => [g.id, g])).values());

  return uniqueGaps;
}
