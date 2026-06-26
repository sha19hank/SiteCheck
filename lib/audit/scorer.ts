import type {
  ScrapedData, PageSpeedData, AuditScores,
  DimensionScore, CanonicalFinding, ScoreLabel, PageType,
} from "@/types";
import { calculateOverallScore } from "@/lib/utils";

// ─── Severity weights for score calculation ──────────────────────────────────
const SEVERITY_DEDUCTIONS: Record<string, number> = {
  critical: 40,
  high:     20,
  medium:    8,
  low:       2,
  pass:      0,
};

// ─── Performance scoring ─────────────────────────────────────────────────────
function scorePerformance(ps: PageSpeedData, scraped: ScrapedData): DimensionScore {
  const findings: CanonicalFinding[] = [];

  // Viewport
  if (!scraped.hasViewport) {
    findings.push({ id: "perf_no_viewport", title: "Missing Mobile Viewport", description: "No viewport meta tag was found. Site will not render correctly on mobile devices.", severity: "critical", category: "performance", priority: 95, evidence: [], source: "meta" });
  }

  // LCP
  if (ps.lcp > 4.0) {
    findings.push({ id: "perf_lcp_poor", title: "Poor Largest Contentful Paint (LCP)", description: "The largest visible element takes too long to load, causing users to bounce.", severity: scraped.pageType === "ecommerce" ? "critical" : "high", category: "performance", priority: 90, evidence: [`LCP: ${ps.lcp.toFixed(1)}s`], source: "pagespeed" });
  } else if (ps.lcp > 2.5) {
    findings.push({ id: "perf_lcp_needs_work", title: "LCP Needs Improvement", description: "The largest visible element loads slower than recommended.", severity: scraped.pageType === "ecommerce" ? "high" : "medium", category: "performance", priority: 70, evidence: [`LCP: ${ps.lcp.toFixed(1)}s`], source: "pagespeed" });
  } else {
    findings.push({ id: "perf_lcp_good", title: "Fast LCP", description: "The largest visible element loads quickly.", severity: "pass", category: "performance", priority: 10, evidence: [`LCP: ${ps.lcp.toFixed(1)}s`], source: "pagespeed" });
  }

  // FCP
  if (ps.fcp > 3.0) {
    findings.push({ id: "perf_fcp_poor", title: "Slow First Contentful Paint", description: "Users stare at a blank screen for too long.", severity: "high", category: "performance", priority: 80, evidence: [`FCP: ${ps.fcp.toFixed(1)}s`], source: "pagespeed" });
  } else if (ps.fcp > 1.8) {
    findings.push({ id: "perf_fcp_needs_work", title: "FCP Needs Improvement", description: "Initial screen rendering is slightly delayed.", severity: "medium", category: "performance", priority: 60, evidence: [`FCP: ${ps.fcp.toFixed(1)}s`], source: "pagespeed" });
  }

  // CLS
  if (ps.cls > 0.25) {
    findings.push({ id: "perf_cls_poor", title: "High Layout Shift", description: "Elements shift around as the page loads, frustrating users.", severity: "high", category: "performance", priority: 80, evidence: [`CLS: ${ps.cls.toFixed(2)}`], source: "pagespeed" });
  } else if (ps.cls > 0.1) {
    findings.push({ id: "perf_cls_needs_work", title: "Moderate Layout Shift", description: "Minor visual instability during load.", severity: "medium", category: "performance", priority: 50, evidence: [`CLS: ${ps.cls.toFixed(2)}`], source: "pagespeed" });
  }

  // Mobile score
  if (ps.mobileScore < 0.5) {
    findings.push({ id: "perf_mobile_poor", title: "Poor Mobile Performance", description: "Google rates this site very poorly on mobile devices.", severity: "critical", category: "performance", priority: 95, evidence: [`Mobile Score: ${Math.round(ps.mobileScore * 100)}/100`], source: "pagespeed" });
  } else if (ps.mobileScore < 0.75) {
    findings.push({ id: "perf_mobile_needs_work", title: "Suboptimal Mobile Performance", description: "Mobile speed could hurt SEO rankings.", severity: "high", category: "performance", priority: 75, evidence: [`Mobile Score: ${Math.round(ps.mobileScore * 100)}/100`], source: "pagespeed" });
  } else {
    findings.push({ id: "perf_mobile_good", title: "Good Mobile Performance", description: "Site is optimized for mobile speeds.", severity: "pass", category: "performance", priority: 10, evidence: [`Mobile Score: ${Math.round(ps.mobileScore * 100)}/100`], source: "pagespeed" });
  }

  // Image optimization
  if (ps.imageOptimizationScore < 0.5) {
    findings.push({ id: "perf_images_poor", title: "Unoptimized Images", description: "Images are large and slowing down the page.", severity: "high", category: "performance", priority: 85, evidence: [], source: "pagespeed" });
  } else if (ps.imageOptimizationScore < 0.8) {
    findings.push({ id: "perf_images_needs_work", title: "Images Need Optimization", description: "Some images could be compressed or converted to WebP.", severity: "medium", category: "performance", priority: 65, evidence: [], source: "pagespeed" });
  }

  // Render blocking
  if (ps.renderBlockingResources > 3) {
    findings.push({ id: "perf_render_blocking_high", title: "Too Many Render-Blocking Resources", description: "Scripts and styles are blocking the page from loading.", severity: "medium", category: "performance", priority: 60, evidence: [`${ps.renderBlockingResources} resources`], source: "pagespeed" });
  } else if (ps.renderBlockingResources > 1) {
    findings.push({ id: "perf_render_blocking_low", title: "Some Render-Blocking Resources", description: "Minor scripts blocking render.", severity: "low", category: "performance", priority: 30, evidence: [`${ps.renderBlockingResources} resources`], source: "pagespeed" });
  }

  const score = calculateDimensionScore("performance", findings, scraped.pageType);
  return { score, label: scoreLabel(score), findings };
}

// ─── Trust scoring ───────────────────────────────────────────────────────────
function scoreTrust(scraped: ScrapedData): DimensionScore {
  const findings: CanonicalFinding[] = [];

  findings.push({ id: "trust_ssl", title: "Active SSL Certificate", description: "Site is secure.", severity: "pass", category: "trust", priority: 10, evidence: [], source: "network" });

  if (!scraped.hasPhone) {
    if (scraped.pageType === "local_business" || scraped.pageType === "service_business") {
      findings.push({ id: "trust_no_phone", title: "Missing Phone Number", description: "Local and service businesses need visible phone numbers for trust.", severity: "high", category: "trust", priority: 80, evidence: [], source: "header/footer" });
    } else if (scraped.pageType === "ecommerce") {
      findings.push({ id: "trust_no_phone", title: "Missing Phone Number", description: "Phone numbers increase buyer trust on ecommerce stores.", severity: "medium", category: "trust", priority: 50, evidence: [], source: "header/footer" });
    } else {
      findings.push({ id: "trust_no_phone_pass", title: "Phone Number (Not required for this business type)", description: "SaaS/Blogs generally do not require public phone numbers.", severity: "pass", category: "trust", priority: 10, evidence: [], source: "business_logic" });
    }
  } else {
    findings.push({ id: "trust_has_phone", title: "Visible Phone Number", description: "Increases trust and contactability.", severity: "pass", category: "trust", priority: 10, evidence: [scraped.phoneNumber || ""], source: "header/footer" });
  }

  if (!scraped.hasEmail) {
    findings.push({ id: "trust_no_email", title: "Missing Email Address", description: "No direct email contact was found.", severity: "medium", category: "trust", priority: 60, evidence: [], source: "header/footer" });
  }

  if (!scraped.hasTestimonials) {
    if (scraped.pageType === "service_business" || scraped.pageType === "saas") {
      findings.push({ id: "trust_no_testimonials_critical", title: "Missing Social Proof", description: "No reviews or testimonials detected. Crucial for this business type.", severity: "high", category: "trust", priority: 85, evidence: [], source: "body" });
    } else {
      findings.push({ id: "trust_no_testimonials", title: "Missing Social Proof", description: "Reviews build buyer confidence.", severity: "medium", category: "trust", priority: 60, evidence: [], source: "body" });
    }
  } else {
    findings.push({ id: "trust_has_testimonials", title: "Social Proof Active", description: "Testimonials or reviews detected.", severity: "pass", category: "trust", priority: 10, evidence: [], source: "body" });
  }

  if (!scraped.hasAboutPage) {
    findings.push({ id: "trust_no_about", title: "Missing About Page", description: "Buyers want to know who is behind the business.", severity: "medium", category: "trust", priority: 50, evidence: [], source: "navigation" });
  } else if (!scraped.aboutInNav) {
    findings.push({ id: "trust_about_hidden", title: "About Page Hidden", description: "About page exists but is not easily found in navigation.", severity: "low", category: "trust", priority: 30, evidence: [], source: "navigation" });
  }

  if (!scraped.hasPrivacyPolicy) {
    findings.push({ id: "trust_no_privacy", title: "Missing Privacy Policy", description: "Required for legal compliance and trust.", severity: scraped.pageType === "ecommerce" ? "high" : "medium", category: "trust", priority: 70, evidence: [], source: "footer" });
  }

  if (!scraped.hasAddress) {
    if (scraped.pageType === "local_business") {
      findings.push({ id: "trust_no_address_critical", title: "Missing Physical Address", description: "Local businesses must display their address.", severity: "high", category: "trust", priority: 90, evidence: [], source: "footer" });
    } else if (scraped.pageType === "ecommerce" || scraped.pageType === "service_business") {
      findings.push({ id: "trust_no_address", title: "Missing Physical Address", description: "A real address increases credibility.", severity: "medium", category: "trust", priority: 50, evidence: [], source: "footer" });
    } else {
      findings.push({ id: "trust_no_address_pass", title: "Physical Address (Not required)", description: "Digital businesses do not strictly need addresses.", severity: "pass", category: "trust", priority: 10, evidence: [], source: "business_logic" });
    }
  }

  if (!scraped.hasSocialLinks) {
    findings.push({ id: "trust_no_socials", title: "Missing Social Media Links", description: "Social links prove the business is active.", severity: "low", category: "trust", priority: 30, evidence: [], source: "footer" });
  }

  if (!scraped.hasTrustBadges) {
    if (scraped.pageType === "ecommerce") {
      findings.push({ id: "trust_no_badges_critical", title: "Missing Secure Checkout Badges", description: "Buyers look for security icons before paying.", severity: "high", category: "trust", priority: 80, evidence: [], source: "body" });
    } else {
      findings.push({ id: "trust_no_badges", title: "Missing Trust Badges", description: "Trust icons (e.g., guarantees, secure logos) increase conversions.", severity: "low", category: "trust", priority: 20, evidence: [], source: "body" });
    }
  }

  const askingForCommitment = scraped.hasPricing || scraped.hasContactForm || scraped.ctaCount > 0;
  const hasTrustSignals = scraped.hasTestimonials || scraped.hasTrustBadges;
  if (askingForCommitment && !hasTrustSignals) {
    findings.push({ id: "trust_sequencing", title: "High Friction Sequencing", description: "Asking for conversion before proving value via trust signals.", severity: "high", category: "trust", priority: 85, evidence: ["CTAs found before any social proof"], source: "body" });
  }

  const score = calculateDimensionScore("trust", findings, scraped.pageType);
  return { score, label: scoreLabel(score), findings };
}

// ─── Clarity scoring ─────────────────────────────────────────────────────────
function scoreClarity(scraped: ScrapedData): DimensionScore {
  const findings: CanonicalFinding[] = [];

  if (scraped.h1s.length === 0) {
    findings.push({ id: "clarity_no_h1", title: "Missing Primary Heading (H1)", description: "Page lacks a main headline, confusing users and search engines.", severity: "medium", category: "clarity", priority: 70, evidence: [], source: "html" });
  } else if (scraped.h1s.length > 1) {
    findings.push({ id: "clarity_multiple_h1", title: "Multiple H1s", description: "Generally a single H1 is preferred for clarity.", severity: "low", category: "clarity", priority: 20, evidence: [`Found ${scraped.h1s.length} H1s`], source: "html" });
  } else {
    findings.push({ id: "clarity_good_h1", title: "Clear Primary Heading", description: "Exactly one H1 found.", severity: "pass", category: "clarity", priority: 10, evidence: [scraped.h1s[0]], source: "html" });
  }

  if (!scraped.metaDescription) {
    findings.push({ id: "clarity_no_meta", title: "Missing Meta Description", description: "Search results will show random text.", severity: "medium", category: "clarity", priority: 60, evidence: [], source: "meta" });
  } else if (scraped.metaDescription.length < 50) {
    findings.push({ id: "clarity_short_meta", title: "Short Meta Description", description: "Description is too brief to be compelling.", severity: "low", category: "clarity", priority: 40, evidence: [scraped.metaDescription], source: "meta" });
  } else {
    findings.push({ id: "clarity_good_meta", title: "Good Meta Description", description: "Optimized for search engine click-throughs.", severity: "pass", category: "clarity", priority: 10, evidence: [scraped.metaDescription], source: "meta" });
  }

  if (!scraped.title) {
    findings.push({ id: "clarity_no_title", title: "Missing Page Title", description: "Vital for SEO and browser tabs.", severity: "high", category: "clarity", priority: 90, evidence: [], source: "meta" });
  } else if (scraped.title.length > 70) {
    findings.push({ id: "clarity_long_title", title: "Title Tag Too Long", description: "Will be truncated in search results.", severity: "low", category: "clarity", priority: 30, evidence: [scraped.title], source: "meta" });
  }

  if (scraped.h2s.length === 0 && scraped.h3s.length > 0) {
    findings.push({ id: "clarity_poor_hierarchy", title: "Poor Heading Hierarchy", description: "H3s used without H2s, breaking logical document flow.", severity: "low", category: "clarity", priority: 40, evidence: [], source: "html" });
  }

  const h1 = scraped.h1s[0] || "";
  const h1Trimmed = h1.trim();
  const seemsGeneric = h1Trimmed.length < 10 || /^home|welcome|hello$/i.test(h1Trimmed);
  const seemsWeak = h1Trimmed.split(" ").length <= 2;

  if (seemsGeneric && scraped.h1s.length > 0) {
    findings.push({ id: "clarity_generic_vp", title: "Missing Value Proposition", description: "The headline does not explain what the business actually does.", severity: "high", category: "clarity", priority: 90, evidence: [`"${h1Trimmed}"`], source: "h1" });
  } else if (seemsWeak && scraped.h1s.length > 0) {
    findings.push({ id: "clarity_weak_vp", title: "Weak Value Proposition", description: "The headline is very short and may lack context.", severity: "medium", category: "clarity", priority: 70, evidence: [`"${h1Trimmed}"`], source: "h1" });
  }

  if (scraped.bodyWordCount > 800 && scraped.h2s.length === 0 && scraped.h3s.length === 0) {
    findings.push({ id: "clarity_wall_of_text", title: "Wall of Text", description: "High word count with no subheadings makes reading difficult.", severity: "high", category: "clarity", priority: 80, evidence: [`${scraped.bodyWordCount} words without headings`], source: "body" });
  } else if (scraped.bodyWordCount < 50 && scraped.pageType !== "portfolio") {
    findings.push({ id: "clarity_thin_content", title: "Thin Content", description: "Not enough copy to explain the offering or rank in SEO.", severity: "medium", category: "clarity", priority: 60, evidence: [`Only ${scraped.bodyWordCount} words`], source: "body" });
  }

  if (scraped.navLinks.length > 8) {
    findings.push({ id: "clarity_complex_nav", title: "Complex Navigation", description: "Too many links overwhelm visitors.", severity: "low", category: "clarity", priority: 40, evidence: [`${scraped.navLinks.length} items`], source: "navigation" });
  }

  if (!scraped.hasFooter) {
    findings.push({ id: "clarity_no_footer", title: "Missing Footer", description: "Users expect secondary links and legal info at the bottom.", severity: "low", category: "clarity", priority: 30, evidence: [], source: "html" });
  }

  const score = calculateDimensionScore("clarity", findings, scraped.pageType);
  return { score, label: scoreLabel(score), findings };
}

// ─── Conversion scoring ───────────────────────────────────────────────────────
function scoreConversion(scraped: ScrapedData): DimensionScore {
  const findings: CanonicalFinding[] = [];

  if (scraped.ctaCount === 0) {
    if (scraped.pageType === "blog") {
      findings.push({ id: "conv_no_cta_blog", title: "No Clear Call-to-Action", description: "Missing an obvious next step for the reader.", severity: "medium", category: "conversion", priority: 70, evidence: [], source: "body" });
    } else {
      findings.push({ id: "conv_no_cta", title: "No Clear Call-to-Action", description: "Users do not know how to buy, sign up, or contact.", severity: "critical", category: "conversion", priority: 95, evidence: [], source: "body" });
    }
  } else {
    const genericPhrases = ["click here", "learn more", "read more", "get in touch", "contact us", "submit"];
    const allGeneric = scraped.ctaTexts.every(t =>
      genericPhrases.some(g => t.toLowerCase().includes(g))
    );
    if (allGeneric && scraped.ctaCount > 0) {
      findings.push({ id: "conv_generic_cta", title: "Generic CTA Text", description: "CTAs lack specific intent or benefit.", severity: "medium", category: "conversion", priority: 75, evidence: [scraped.ctaTexts[0]], source: "buttons" });
    } else {
      findings.push({ id: "conv_good_cta", title: "Specific CTA Detected", description: "CTAs communicate a clear action.", severity: "pass", category: "conversion", priority: 10, evidence: [scraped.ctaTexts[0]], source: "buttons" });
    }

    if (scraped.ctaCount > 5) {
      findings.push({ id: "conv_too_many_ctas", title: "Multiple Competing CTAs", description: "Too many distinct actions cause decision paralysis.", severity: "medium", category: "conversion", priority: 60, evidence: [`${scraped.ctaCount} distinct CTAs`], source: "buttons" });
    }
  }

  if (!scraped.hasContactForm) {
    if (scraped.pageType === "ecommerce" || scraped.pageType === "saas") {
      findings.push({ id: "conv_no_form_pass", title: "Contact Form (Optional)", description: "E-commerce/SaaS prioritize checkout/signup over forms.", severity: "pass", category: "conversion", priority: 10, evidence: [], source: "business_logic" });
    } else {
      findings.push({ id: "conv_no_form", title: "Missing Contact Form", description: "Service businesses need forms to capture leads easily.", severity: "high", category: "conversion", priority: 80, evidence: [], source: "body" });
    }
  } else {
    if (scraped.formFieldCount > 6) {
      findings.push({ id: "conv_long_form", title: "Form Too Long", description: "Long forms severely decrease conversion rates.", severity: "medium", category: "conversion", priority: 70, evidence: [`${scraped.formFieldCount} fields`], source: "forms" });
    } else if (scraped.formFieldCount <= 4) {
      findings.push({ id: "conv_short_form", title: "Low-Friction Form", description: "Short forms maximize lead capture.", severity: "pass", category: "conversion", priority: 10, evidence: [`${scraped.formFieldCount} fields`], source: "forms" });
    }
  }

  if (!scraped.hasPricing && scraped.pageType !== "blog" && scraped.pageType !== "portfolio") {
    findings.push({ id: "conv_no_pricing", title: "Missing Pricing Info", description: "B2B and consumers expect transparent pricing.", severity: "medium", category: "conversion", priority: 65, evidence: [], source: "navigation" });
  }

  if (!scraped.hasTestimonials && scraped.ctaCount > 0) {
    findings.push({ id: "conv_no_proof_near_cta", title: "No Social Proof Near CTA", description: "Missing trust reinforcement at the point of conversion.", severity: "medium", category: "conversion", priority: 55, evidence: [], source: "body" });
  }

  const score = calculateDimensionScore("conversion", findings, scraped.pageType);
  return { score, label: scoreLabel(score), findings };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sortFindings(findings: CanonicalFinding[]): CanonicalFinding[] {
  const severityOrder: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
    pass: 0
  };
  return findings.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
}

// Task 4: Implement Category-Specific Ceiling Scores
function calculateDimensionScore(dimension: string, findings: CanonicalFinding[], websiteType: PageType): number {
  const totalDeduction = findings.reduce((acc, f) => {
    if (f.severity === "pass") return acc;
    return acc + (SEVERITY_DEDUCTIONS[f.severity] ?? 0);
  }, 0);
  
  let rawScore = Math.max(0, 100 - totalDeduction);
  
  // Apply Ceilings
  let ceiling = 100;
  const wt = String(websiteType);
  if (wt === "saas") ceiling = 95;
  if (wt === "ecommerce") ceiling = 95;
  if (wt === "agency" || wt === "service_business") ceiling = 96;

  // Exceptional evidence rule
  const hasExceptionalEvidence = findings.filter(f => f.severity === "pass" && (f.id.includes("testimonials") || f.id.includes("case_study"))).length > 1;
  
  if (rawScore > ceiling && !hasExceptionalEvidence) {
    rawScore = ceiling;
  }
  
  return rawScore;
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
  const performance = scorePerformance(pageSpeed, scraped);
  const trust       = scoreTrust(scraped);
  const clarity     = scoreClarity(scraped);
  const conversion  = scoreConversion(scraped);

  performance.findings = sortFindings(performance.findings);
  trust.findings = sortFindings(trust.findings);
  clarity.findings = sortFindings(clarity.findings);
  conversion.findings = sortFindings(conversion.findings);

  const overall = calculateOverallScore({
    performance: performance.score,
    trust:       trust.score,
    clarity:     clarity.score,
    conversion:  conversion.score,
  });

  return { overall, performance, trust, clarity, conversion };
}
