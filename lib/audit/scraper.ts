import * as cheerio from "cheerio";
import type { ScrapedData, PageType } from "@/types";

const TRUST_KEYWORDS = [
  "testimonial", "review", "stars", "rated", "customer", "client",
  "said about", "what our", "feedback", "5 star", "★", "⭐",
];
const CTA_SELECTORS = [
  "a[href*='contact']", "a[href*='book']", "a[href*='get-started']",
  "a[href*='signup']", "a[href*='sign-up']", "a[href*='free']",
  "a[href*='demo']", "a[href*='trial']", "button[type='submit']",
  ".cta", "#cta", "[class*='cta']", "[id*='cta']",
  "a.btn", "a.button", "button.btn", ".btn-primary", ".button-primary",
];
const SOCIAL_DOMAINS = [
  "twitter.com", "x.com", "linkedin.com", "facebook.com",
  "instagram.com", "youtube.com", "tiktok.com",
];
const PHONE_REGEX = /(\+?\d[\d\s\-().]{7,}\d)/g;
const EMAIL_REGEX = /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g;

export async function scrapeUrl(url: string): Promise<ScrapedData> {
  let html = "";

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SiteCheckBot/1.0; +https://sitecheck.ai)",
        "Accept": "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
    });
    html = await res.text();
  } catch {
    throw new Error(`Could not reach ${url} — make sure the URL is correct and the site is live.`);
  }

  const $ = cheerio.load(html);

  // Remove script/style noise
  $("script, style, noscript, svg").remove();

  const bodyText = $("body").text().replace(/\s+/g, " ");
  const allText  = $.root().text().replace(/\s+/g, " ");

  // ── Headings ───────────────────────────────────────────────────────────────
  const h1s = $("h1").map((_, el) => $(el).text().trim()).get().filter(Boolean);
  const h2s = $("h2").map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 10);
  const h3s = $("h3").map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 10);

  // ── Meta ──────────────────────────────────────────────────────────────────
  const title          = $("title").first().text().trim() || null;
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() || null;

  // ── Contact info ──────────────────────────────────────────────────────────
  const phoneMatches  = bodyText.match(PHONE_REGEX) || [];
  const hasPhone      = phoneMatches.length > 0;
  const phoneNumber   = phoneMatches[0] || null;

  const emailMatches  = allText.match(EMAIL_REGEX) || [];
  // Filter out common non-contact emails
  const filteredEmails = emailMatches.filter(
    e => !e.includes("example.com") && !e.includes("test@")
  );
  const hasEmail      = filteredEmails.length > 0;
  const emailAddress  = filteredEmails[0] || null;

  // ── Address ───────────────────────────────────────────────────────────────
  const hasAddress =
    $('[itemtype*="PostalAddress"]').length > 0 ||
    $('[class*="address"]').length > 0 ||
    /\d+\s+\w+\s+(street|st|avenue|ave|road|rd|lane|ln|drive|dr|blvd|way)/i.test(bodyText);

  // ── Social links ──────────────────────────────────────────────────────────
  const socialLinks: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (SOCIAL_DOMAINS.some(d => href.includes(d))) {
      socialLinks.push(href);
    }
  });
  const hasSocialLinks = socialLinks.length > 0;

  // ── CTAs ──────────────────────────────────────────────────────────────────
  const ctaElements = new Set<string>();
  CTA_SELECTORS.forEach(sel => {
    $(sel).each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 60) ctaElements.add(text);
    });
  });
  const ctaTexts = Array.from(ctaElements).slice(0, 8);
  const ctaCount = ctaTexts.length;

  // ── Testimonials ─────────────────────────────────────────────────────────
  const hasTestimonials =
    TRUST_KEYWORDS.some(kw => bodyText.toLowerCase().includes(kw)) ||
    $('[itemtype*="Review"]').length > 0 ||
    $('[class*="testimonial"]').length > 0 ||
    $('[class*="review"]').length > 0;

  // ── About page ────────────────────────────────────────────────────────────
  const aboutInNav = $("nav a, header a").toArray().some(el => {
    const text = $(el).text().toLowerCase();
    const href = ($(el).attr("href") || "").toLowerCase();
    return text.includes("about") || href.includes("about");
  });
  const hasAboutPage =
    aboutInNav ||
    $("a[href*='about']").length > 0 ||
    bodyText.toLowerCase().includes("about us");

  // ── Privacy policy ───────────────────────────────────────────────────────
  const hasPrivacyPolicy =
    $("a[href*='privacy']").length > 0 ||
    bodyText.toLowerCase().includes("privacy policy");

  // ── Contact form ─────────────────────────────────────────────────────────
  const forms = $("form");
  const hasContactForm = forms.length > 0;
  const formFieldCount = Math.max(
    ...forms.toArray().map(f =>
      $(f).find("input:not([type=hidden]):not([type=submit]), textarea, select").length
    ),
    0
  );

  // ── Pricing ───────────────────────────────────────────────────────────────
  const hasPricing =
    $("[class*='pric']").length > 0 ||
    /\$[\d,]+|\₹[\d,]+|per month|\/mo|pricing/i.test(bodyText);

  // ── Trust badges ─────────────────────────────────────────────────────────
  const hasTrustBadges =
    $("[class*='badge'], [class*='trust'], [class*='certif'], [class*='award']").length > 0 ||
    bodyText.toLowerCase().includes("certified") ||
    bodyText.toLowerCase().includes("accredited");

  // ── Images ───────────────────────────────────────────────────────────────
  const imageCount = $("img").length;

  // ── Footer ───────────────────────────────────────────────────────────────
  const hasFooter = $("footer").length > 0;

  // ── Navigation ───────────────────────────────────────────────────────────
  const navLinks = $("nav a, header a")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(t => t.length > 0 && t.length < 30)
    .slice(0, 10);

  // ── Internal links ───────────────────────────────────────────────────────
  const internalLinks = $("a[href^='/'], a[href^='#']").length;

  // ── Page type inference ───────────────────────────────────────────────────
  const pageType = inferPageType({ bodyText, hasPricing, hasContactForm, ctaTexts, h1s });

  return {
    title, metaDescription, h1s, h2s, h3s,
    hasPhone, phoneNumber, hasEmail, emailAddress,
    hasAddress, hasSocialLinks, socialLinks,
    ctaTexts, ctaCount, hasTestimonials, hasAboutPage, aboutInNav,
    hasPrivacyPolicy, hasContactForm, formFieldCount, hasPricing,
    hasTrustBadges, imageCount, hasFooter, navLinks,
    internalLinks, pageType,
  };
}

function inferPageType(data: {
  bodyText: string;
  hasPricing: boolean;
  hasContactForm: boolean;
  ctaTexts: string[];
  h1s: string[];
}): PageType {
  const { bodyText, hasPricing, ctaTexts } = data;
  const lower = bodyText.toLowerCase();
  const ctaLower = ctaTexts.map(t => t.toLowerCase()).join(" ");

  if (/add to cart|buy now|shop|checkout|shopify/i.test(lower + ctaLower)) return "ecommerce";
  if (/saas|software|dashboard|free trial|sign up|subscription/i.test(lower + ctaLower) && hasPricing) return "saas";
  if (/portfolio|case study|my work|projects|hire me/i.test(lower)) return "portfolio";
  if (/restaurant|menu|reservation|café|cafe|dine/i.test(lower)) return "local_business";
  if (/blog|article|post|newsletter/i.test(lower) && !hasPricing) return "blog";
  if (/service|consult|agency|studio|freelance|coach/i.test(lower)) return "service_business";
  return "unknown";
}
