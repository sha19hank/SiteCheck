import { ScrapedData } from "@/types";

export interface CheckResult {
  passed: boolean;
  evidence: string[];
}

// ─── SaaS Checks ─────────────────────────────────────────────────────────────

export function CHECK_PRICING_PAGE(data: ScrapedData): CheckResult {
  const evidence: string[] = [];
  let passed = false;
  
  if (data.hasPricing) {
    passed = true;
    evidence.push("Pricing indicator found in page structure.");
  }
  const pricingNav = data.navLinks.find(l => l?.toLowerCase().includes("pricing"));
  if (pricingNav) {
    passed = true;
    evidence.push(`Pricing keyword detected in navigation: "${pricingNav}"`);
  }
  
  if (!passed) {
    evidence.push("No pricing keyword detected in navigation");
    evidence.push("No pricing page link detected");
  }
  return { passed, evidence };
}

export function CHECK_FREE_TRIAL(data: ScrapedData): CheckResult {
  const evidence: string[] = [];
  const trialCTA = data.ctaTexts.find(c => c?.toLowerCase().includes("free trial") || c?.toLowerCase().includes("start free"));
  
  if (trialCTA) {
    evidence.push(`Free trial CTA detected: "${trialCTA}"`);
    return { passed: true, evidence };
  }
  
  evidence.push("No 'Free Trial' or 'Start Free' CTA detected");
  return { passed: false, evidence };
}

export function CHECK_DEMO_BOOKING(data: ScrapedData): CheckResult {
  const evidence: string[] = [];
  const demoCTA = data.ctaTexts.find(c => c?.toLowerCase().includes("demo") || c?.toLowerCase().includes("book"));
  
  if (demoCTA) {
    evidence.push(`Demo booking CTA detected: "${demoCTA}"`);
    return { passed: true, evidence };
  }
  
  evidence.push("No demo booking CTA detected");
  return { passed: false, evidence };
}

// ─── Ecommerce Checks ────────────────────────────────────────────────────────

export function CHECK_SHIPPING_INFO(data: ScrapedData): CheckResult {
  const evidence: string[] = [];
  const shippingLink = data.navLinks.find(l => l?.toLowerCase().includes("shipping") || l?.toLowerCase().includes("delivery"));
  
  if (shippingLink) {
    evidence.push(`Shipping info linked in navigation: "${shippingLink}"`);
    return { passed: true, evidence };
  }
  
  evidence.push("No shipping or delivery links detected in navigation");
  return { passed: false, evidence };
}

export function CHECK_RETURN_POLICY(data: ScrapedData): CheckResult {
  const evidence: string[] = [];
  const returnLink = data.navLinks.find(l => l?.toLowerCase().includes("return") || l?.toLowerCase().includes("refund"));
  
  if (returnLink) {
    evidence.push(`Return policy linked in navigation: "${returnLink}"`);
    return { passed: true, evidence };
  }
  
  evidence.push("No return or refund policy links detected in navigation");
  return { passed: false, evidence };
}

export function CHECK_CART_VISIBILITY(data: ScrapedData): CheckResult {
  const evidence: string[] = [];
  const cartLink = data.navLinks.find(l => l?.toLowerCase().includes("cart") || l?.toLowerCase().includes("bag") || l?.toLowerCase().includes("basket"));
  
  if (cartLink) {
    evidence.push(`Cart/bag keyword detected in navigation: "${cartLink}"`);
    return { passed: true, evidence };
  }
  
  evidence.push("No cart or bag links detected in navigation");
  return { passed: false, evidence };
}

// ─── General Checks ──────────────────────────────────────────────────────────

export function CHECK_NEWSLETTER(data: ScrapedData): CheckResult {
  const evidence: string[] = [];
  const newsletterCTA = data.ctaTexts.find(c => c?.toLowerCase().includes("newsletter") || c?.toLowerCase().includes("subscribe"));
  
  if (newsletterCTA) {
    evidence.push(`Newsletter/subscribe CTA detected: "${newsletterCTA}"`);
    return { passed: true, evidence };
  }
  
  evidence.push("No newsletter or subscribe CTA detected");
  return { passed: false, evidence };
}

export function CHECK_CASE_STUDIES(data: ScrapedData): CheckResult {
  const evidence: string[] = [];
  const caseStudyLink = data.navLinks.find(l => l?.toLowerCase().includes("case stud") || l?.toLowerCase().includes("work") || l?.toLowerCase().includes("portfolio"));
  
  if (caseStudyLink) {
    evidence.push(`Case study or portfolio link detected in navigation: "${caseStudyLink}"`);
    return { passed: true, evidence };
  }
  
  evidence.push("No case study or portfolio links detected");
  return { passed: false, evidence };
}

export function CHECK_TESTIMONIALS(data: ScrapedData): CheckResult {
  const evidence: string[] = [];
  if (data.hasTestimonials) {
    evidence.push("Testimonials or reviews structure detected on page");
    return { passed: true, evidence };
  }
  
  evidence.push("No testimonials or reviews detected");
  return { passed: false, evidence };
}

export function CHECK_LOCAL_CONTACT(data: ScrapedData): CheckResult {
  const evidence: string[] = [];
  let passed = false;
  if (data.hasPhone) {
    passed = true;
    evidence.push(`Phone number detected: ${data.phoneNumber}`);
  }
  if (data.hasAddress) {
    passed = true;
    evidence.push("Physical address structure detected");
  }
  
  if (!passed) {
    evidence.push("No phone number or physical address detected");
  }
  return { passed, evidence };
}

export function CHECK_SOCIAL_LINKS(data: ScrapedData): CheckResult {
  const evidence: string[] = [];
  if (data.hasSocialLinks && data.socialLinks.length > 0) {
    evidence.push(`${data.socialLinks.length} social media links detected`);
    return { passed: true, evidence };
  }
  
  evidence.push("No social media links detected");
  return { passed: false, evidence };
}
