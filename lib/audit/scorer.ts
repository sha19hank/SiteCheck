import type {
  ScrapedData, PageSpeedData, AuditScores,
  DimensionScore, Finding, FindingCheck, ScoreLabel,
} from "@/types";
import { calculateOverallScore } from "@/lib/utils";

// ─── Severity weights for score calculation ──────────────────────────────────
const SEVERITY_DEDUCTIONS: Record<string, number> = {
  critical: 30,
  high:     18,
  medium:   10,
  low:       4,
  pass:       0,
};

// ─── Performance scoring ─────────────────────────────────────────────────────
function scorePerformance(ps: PageSpeedData): DimensionScore {
  const findings: Finding[] = [];

  // LCP: good <2.5s, needs improvement 2.5–4s, poor >4s
  if (ps.lcp > 4.0) {
    findings.push({ check: "lcp_slow", category: "performance", severity: "critical", detail: `${ps.lcp.toFixed(1)}s` });
  } else if (ps.lcp > 2.5) {
    findings.push({ check: "lcp_slow", category: "performance", severity: "high", detail: `${ps.lcp.toFixed(1)}s` });
  } else {
    findings.push({ check: "fast_lcp", category: "performance", severity: "pass", detail: `${ps.lcp.toFixed(1)}s` });
  }

  // FCP: good <1.8s, poor >3s
  if (ps.fcp > 3.0) {
    findings.push({ check: "fcp_slow", category: "performance", severity: "high", detail: `${ps.fcp.toFixed(1)}s` });
  } else if (ps.fcp > 1.8) {
    findings.push({ check: "fcp_slow", category: "performance", severity: "medium", detail: `${ps.fcp.toFixed(1)}s` });
  }

  // CLS: good <0.1, needs improvement 0.1–0.25, poor >0.25
  if (ps.cls > 0.25) {
    findings.push({ check: "cls_high", category: "performance", severity: "high", detail: ps.cls.toFixed(2) });
  } else if (ps.cls > 0.1) {
    findings.push({ check: "cls_high", category: "performance", severity: "medium", detail: ps.cls.toFixed(2) });
  }

  // Mobile score
  if (ps.mobileScore < 0.5) {
    findings.push({ check: "mobile_score_low", category: "performance", severity: "critical", detail: `${Math.round(ps.mobileScore * 100)}/100` });
  } else if (ps.mobileScore < 0.75) {
    findings.push({ check: "mobile_score_low", category: "performance", severity: "high", detail: `${Math.round(ps.mobileScore * 100)}/100` });
  } else {
    findings.push({ check: "good_mobile_score", category: "performance", severity: "pass", detail: `${Math.round(ps.mobileScore * 100)}/100` });
  }

  // Image optimisation
  if (ps.imageOptimizationScore < 0.5) {
    findings.push({ check: "images_unoptimized", category: "performance", severity: "high" });
  } else if (ps.imageOptimizationScore < 0.8) {
    findings.push({ check: "images_unoptimized", category: "performance", severity: "medium" });
  }

  // Render blocking resources
  if (ps.renderBlockingResources > 3) {
    findings.push({ check: "render_blocking_resources", category: "performance", severity: "medium", detail: `${ps.renderBlockingResources} resources` });
  } else if (ps.renderBlockingResources > 1) {
    findings.push({ check: "render_blocking_resources", category: "performance", severity: "low", detail: `${ps.renderBlockingResources} resources` });
  }

  const score = deductionsToScore(findings);
  return { score, label: scoreLabel(score), findings };
}

// ─── Trust scoring ───────────────────────────────────────────────────────────
function scoreTrust(scraped: ScrapedData): DimensionScore {
  const findings: Finding[] = [];

  // SSL
  // (Checked at the PageSpeed/fetch level — if we got data the SSL is fine)
  findings.push({ check: "ssl_active", category: "trust", severity: "pass" });

  // Phone number — critical for service businesses
  if (!scraped.hasPhone) {
    findings.push({ check: "no_phone_number", category: "trust", severity: "high" });
  } else {
    findings.push({ check: "has_phone", category: "trust", severity: "pass", detail: scraped.phoneNumber ?? undefined });
  }

  // Email
  if (!scraped.hasEmail) {
    findings.push({ check: "no_email_address", category: "trust", severity: "medium" });
  }

  // Testimonials — very high impact for conversions
  if (!scraped.hasTestimonials) {
    findings.push({ check: "no_testimonials", category: "trust", severity: "high" });
  } else {
    findings.push({ check: "has_testimonials", category: "trust", severity: "pass" });
  }

  // About page
  if (!scraped.hasAboutPage) {
    findings.push({ check: "no_about_page", category: "trust", severity: "medium" });
  } else if (!scraped.aboutInNav) {
    findings.push({ check: "about_not_in_nav", category: "trust", severity: "low" });
  }

  // Privacy policy
  if (!scraped.hasPrivacyPolicy) {
    findings.push({ check: "no_privacy_policy", category: "trust", severity: "medium" });
  }

  // Address (especially important for local businesses)
  if (!scraped.hasAddress) {
    findings.push({ check: "no_address", category: "trust", severity: "low" });
  }

  // Social links
  if (!scraped.hasSocialLinks) {
    findings.push({ check: "no_social_links", category: "trust", severity: "low" });
  }

  // Trust badges
  if (!scraped.hasTrustBadges) {
    findings.push({ check: "no_trust_badges", category: "trust", severity: "low" });
  }

  const score = deductionsToScore(findings);
  return { score, label: scoreLabel(score), findings };
}

// ─── Clarity scoring ─────────────────────────────────────────────────────────
function scoreClarity(scraped: ScrapedData): DimensionScore {
  const findings: Finding[] = [];

  // H1
  if (scraped.h1s.length === 0) {
    findings.push({ check: "missing_h1", category: "clarity", severity: "high" });
  } else if (scraped.h1s.length > 1) {
    findings.push({ check: "multiple_h1", category: "clarity", severity: "medium", detail: `${scraped.h1s.length} H1s found` });
  } else {
    findings.push({ check: "good_heading_structure", category: "clarity", severity: "pass" });
  }

  // Meta description
  if (!scraped.metaDescription) {
    findings.push({ check: "missing_meta_description", category: "clarity", severity: "medium" });
  } else if (scraped.metaDescription.length < 50) {
    findings.push({ check: "meta_description_short", category: "clarity", severity: "low", detail: `${scraped.metaDescription.length} chars` });
  } else {
    findings.push({ check: "has_meta_description", category: "clarity", severity: "pass" });
  }

  // Title tag
  if (!scraped.title) {
    findings.push({ check: "title_missing", category: "clarity", severity: "high" });
  } else if (scraped.title.length > 70) {
    findings.push({ check: "title_too_long", category: "clarity", severity: "low", detail: `${scraped.title.length} chars` });
  }

  // Heading hierarchy
  if (scraped.h2s.length === 0 && scraped.h3s.length > 0) {
    findings.push({ check: "poor_heading_structure", category: "clarity", severity: "low" });
  }

  // Value proposition (H1 should be meaningful, not just brand name)
  const h1 = scraped.h1s[0] || "";
  const seemsGeneric = h1.length < 10 || /^home|welcome|hello$/i.test(h1.trim());
  if (seemsGeneric && scraped.h1s.length > 0) {
    findings.push({ check: "no_value_proposition", category: "clarity", severity: "medium", detail: `"${h1}"` });
  }

  // Navigation complexity
  if (scraped.navLinks.length > 8) {
    findings.push({ check: "nav_too_complex", category: "clarity", severity: "low", detail: `${scraped.navLinks.length} nav items` });
  }

  // Footer
  if (!scraped.hasFooter) {
    findings.push({ check: "footer_missing", category: "clarity", severity: "low" });
  }

  const score = deductionsToScore(findings);
  return { score, label: scoreLabel(score), findings };
}

// ─── Conversion scoring ───────────────────────────────────────────────────────
function scoreConversion(scraped: ScrapedData): DimensionScore {
  const findings: Finding[] = [];

  // CTA presence
  if (scraped.ctaCount === 0) {
    findings.push({ check: "no_cta", category: "conversion", severity: "critical" });
  } else {
    // Check for generic CTA text
    const genericPhrases = ["click here", "learn more", "read more", "get in touch", "contact us", "submit"];
    const allGeneric = scraped.ctaTexts.every(t =>
      genericPhrases.some(g => t.toLowerCase().includes(g))
    );
    if (allGeneric && scraped.ctaCount > 0) {
      findings.push({ check: "cta_text_generic", category: "conversion", severity: "medium", detail: scraped.ctaTexts[0] });
    } else {
      findings.push({ check: "clear_cta", category: "conversion", severity: "pass", detail: scraped.ctaTexts[0] });
    }

    // Too many competing CTAs
    if (scraped.ctaCount > 5) {
      findings.push({ check: "multiple_competing_ctas", category: "conversion", severity: "medium", detail: `${scraped.ctaCount} CTAs found` });
    }
  }

  // Contact form
  if (!scraped.hasContactForm) {
    findings.push({ check: "no_contact_form", category: "conversion", severity: "high" });
  } else {
    // Long forms hurt conversions
    if (scraped.formFieldCount > 6) {
      findings.push({ check: "form_too_long", category: "conversion", severity: "medium", detail: `${scraped.formFieldCount} fields` });
    } else if (scraped.formFieldCount <= 4) {
      findings.push({ check: "short_form", category: "conversion", severity: "pass", detail: `${scraped.formFieldCount} fields` });
    }
  }

  // Pricing visibility
  if (!scraped.hasPricing && scraped.pageType !== "blog" && scraped.pageType !== "portfolio") {
    findings.push({ check: "no_pricing_info", category: "conversion", severity: "medium" });
  }

  // Social proof near CTA
  if (!scraped.hasTestimonials && scraped.ctaCount > 0) {
    findings.push({ check: "no_social_proof_near_cta", category: "conversion", severity: "medium" });
  }

  const score = deductionsToScore(findings);
  return { score, label: scoreLabel(score), findings };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function deductionsToScore(findings: Finding[]): number {
  const totalDeduction = findings.reduce((acc, f) => {
    if (f.severity === "pass") return acc;
    return acc + (SEVERITY_DEDUCTIONS[f.severity] ?? 0);
  }, 0);
  return Math.max(0, Math.min(100, 100 - totalDeduction));
}

function scoreLabel(score: number): ScoreLabel {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs work";
  return "Poor";
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function calculateScores(
  scraped: ScrapedData,
  pageSpeed: PageSpeedData
): AuditScores {
  const performance = scorePerformance(pageSpeed);
  const trust       = scoreTrust(scraped);
  const clarity     = scoreClarity(scraped);
  const conversion  = scoreConversion(scraped);

  const overall = calculateOverallScore({
    performance: performance.score,
    trust:       trust.score,
    clarity:     clarity.score,
    conversion:  conversion.score,
  });

  return { overall, performance, trust, clarity, conversion };
}
