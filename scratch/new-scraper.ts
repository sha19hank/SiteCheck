import * as cheerio from "cheerio";
import type { ScrapedData, PageType, ScrapeDiagnostics, ScrapeSnapshot } from "@/types";

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
  "[role='button']", "a[class*='bg-']", "button[class*='bg-']",
  "[data-testid*='cta']", "[data-cy*='cta']"
];
const SOCIAL_DOMAINS = [
  "twitter.com", "x.com", "linkedin.com", "facebook.com",
  "instagram.com", "youtube.com", "tiktok.com",
];
const PHONE_REGEX = /(\+?\d[\d\s\-().]{7,}\d)/g;
const EMAIL_REGEX = /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g;

async function getBrowser() {
  if (process.env.NODE_ENV === "production" || process.env.USE_CHROMIUM_MIN === "true") {
    const chromium = await import("@sparticuz/chromium-min");
    const puppeteer = await import("puppeteer-core");
    return puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: { width: 1280, height: 800 },
      executablePath: await chromium.default.executablePath(
        process.env.CHROMIUM_REMOTE_EXECUTABLE_PATH ||
        "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
      ),
      headless: true,
    });
  } else {
    const puppeteer = await import("puppeteer-core");
    return puppeteer.default.launch({
      executablePath:
        process.platform === "darwin"
          ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
          : process.platform === "win32"
          ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
          : "/usr/bin/google-chrome",
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
  }
}

export async function scrapeUrl(url: string): Promise<{ scrapedData: ScrapedData, scrapeDiagnostics: ScrapeDiagnostics }> {
  let html = "";
  let renderedHtml = "";
  let finalUrl = url;
  let httpStatus = 0;
  let redirectCount = 0;
  let pageErrors = 0;
  let blockedRequests = 0;
  let challengeDetected = false;
  let captchaDetected = false;
  let accessDeniedDetected = false;
  let failureReasonCode: ScrapeDiagnostics["failureReasonCode"] = null;
  const scrapeNotes: string[] = [];
  const extractionSources: Record<string, string> = {};
  const extractionCoverage: Record<string, boolean> = {};

  let browser;

  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    
    page.on("pageerror", (err) => { pageErrors++; });
    page.on("requestfailed", (req) => { pageErrors++; });

    // Block heavy resources
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (req.isNavigationRequest() && req.redirectChain().length > redirectCount) {
        redirectCount = req.redirectChain().length;
      }
      
      const type = req.resourceType();
      const urlString = req.url().toLowerCase();
      
      const blockAnalytics = urlString.includes('google-analytics') || urlString.includes('mixpanel') || urlString.includes('segment.com');
      
      if (["image", "media", "font"].includes(type) || blockAnalytics) {
        blockedRequests++;
        req.abort();
      } else {
        req.continue();
      }
    });

    const response = await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });
    
    if (response) {
      httpStatus = response.status();
      finalUrl = page.url();
      if (httpStatus === 403 || httpStatus === 401) accessDeniedDetected = true;
    }

    // Pass 1: Rendered DOM
    renderedHtml = await page.content();
    
    // Fallback: raw HTML from fetch if rendered is too small, though rendered should be fine.
    // Actually, let's just do a fetch as well to simulate Pass 1 if needed, or rely on page.content()
    try {
      const rawRes = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(5000) });
      html = await rawRes.text();
    } catch {
      html = renderedHtml; // Fallback to whatever puppeteer got
    }

    // Check challenges
    if (renderedHtml.includes('cf-browser-verification') || renderedHtml.includes('cloudflare')) {
      challengeDetected = true;
      scrapeNotes.push("Detected Cloudflare challenge");
    }
    if (renderedHtml.includes('g-recaptcha') || renderedHtml.includes('hcaptcha')) {
      captchaDetected = true;
      scrapeNotes.push("Detected CAPTCHA challenge");
    }

  } catch (err: any) {
    scrapeNotes.push(`Puppeteer failed: ${err.message}`);
    failureReasonCode = err.message.includes("timeout") ? "TIMEOUT" : "JS_RENDER_FAILED";
    
    // Fallback to fetch
    try {
      const rawRes = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(8000) });
      html = await rawRes.text();
      renderedHtml = html; // Assume rendered is same as raw
      httpStatus = rawRes.status;
    } catch (fetchErr: any) {
      scrapeNotes.push(`Fetch fallback also failed: ${fetchErr.message}`);
      failureReasonCode = "UNKNOWN";
    }
  } finally {
    if (browser) {
      try { await browser.close(); } catch {}
    }
  }

  // Determine what to parse
  const targetHtml = renderedHtml.length > 500 ? renderedHtml : html;
  if (!targetHtml) {
    failureReasonCode = "EMPTY_DOM";
  }

  const $ = cheerio.load(targetHtml);

  // Extract JSON-LD (Pass 4)
  const structuredDataTypes: string[] = [];
  $("script[type='application/ld+json']").each((_, el) => {
    try {
      const content = $(el).html() || "";
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        parsed.forEach(item => { if (item["@type"]) structuredDataTypes.push(item["@type"]); });
      } else if (parsed["@type"]) {
        structuredDataTypes.push(parsed["@type"]);
      }
    } catch { /* ignore parse errors */ }
  });
  
  if (structuredDataTypes.length > 0) {
    extractionSources["structuredData"] = "json_ld";
    extractionCoverage["structuredData"] = true;
    scrapeNotes.push("Structured data successfully extracted");
  } else {
    extractionCoverage["structuredData"] = false;
  }

  // Remove script/style noise for general parsing
  $("script, style, noscript, svg").remove();

  const bodyText = $("body").text().replace(/\s+/g, " ");
  const allText  = $.root().text().replace(/\s+/g, " ");

  // ── Headings ───────────────────────────────────────────────────────────────
  const h1s = $("h1").map((_, el) => $(el).text().trim()).get().filter(Boolean);
  const h2s = $("h2").map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 10);
  const h3s = $("h3").map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 10);
  
  extractionCoverage["headings"] = h1s.length > 0 || h2s.length > 0;
  extractionSources["headings"] = "rendered_dom";

  // ── Meta & Content Density ──────────────────────────────────────────────────
  const title          = $("title").first().text().trim() || null;
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() || null;
  const hasViewport    = $('meta[name="viewport"]').length > 0;
  const bodyWordCount  = bodyText.split(/\s+/).filter(w => w.length > 0).length;
  
  extractionCoverage["title"] = !!title;
  extractionCoverage["meta"] = !!metaDescription;
  extractionSources["title"] = "rendered_dom";
  extractionSources["meta"] = "rendered_dom";

  // ── Contact info ──────────────────────────────────────────────────────────
  const phoneMatches  = bodyText.match(PHONE_REGEX) || [];
  const hasPhone      = phoneMatches.length > 0;
  const phoneNumber   = phoneMatches[0] || null;

  const emailMatches  = allText.match(EMAIL_REGEX) || [];
  const filteredEmails = emailMatches.filter(e => !e.includes("example.com") && !e.includes("test@"));
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
    if (SOCIAL_DOMAINS.some(d => href.includes(d))) socialLinks.push(href);
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

  if (ctaElements.size === 0) {
    const HIGH_INTENT_VERBS = ["get started", "buy", "subscribe", "book", "contact", "sign up", "try", "join", "add to cart", "purchase"];
    $("a, button").slice(0, 50).each((_, el) => {
      const text = $(el).text().trim().toLowerCase();
      if (text && text.length < 40 && HIGH_INTENT_VERBS.some(v => text.includes(v))) {
        ctaElements.add($(el).text().trim());
      }
    });
  }

  const ctaTexts = Array.from(ctaElements).slice(0, 8);
  const ctaCount = ctaTexts.length;
  
  extractionCoverage["ctas"] = ctaCount > 0;
  extractionSources["ctas"] = "rendered_dom";
  
  if (ctaCount === 0) scrapeNotes.push("No CTA buttons detected");

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
    $("img[src*='stripe'], img[src*='paypal'], img[src*='norton'], img[src*='mcafee']").length > 0 ||
    $("img[alt*='secure'], img[alt*='guarantee'], img[alt*='trust']").length > 0 ||
    bodyText.toLowerCase().includes("certified") ||
    bodyText.toLowerCase().includes("accredited");

  // ── Images ───────────────────────────────────────────────────────────────
  const imageCount = $("img").length;

  // ── Footer ───────────────────────────────────────────────────────────────
  const hasFooter = $("footer").length > 0;

  // ── Navigation ───────────────────────────────────────────────────────────
  const navLinks = $("nav a, header a, [role='navigation'] a, .menu a")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(t => t.length > 0 && t.length < 30)
    .slice(0, 10);
    
  extractionCoverage["navLinks"] = navLinks.length > 0;
  extractionSources["navLinks"] = "rendered_dom";

  // ── Internal links ───────────────────────────────────────────────────────
  const internalLinks = $("a[href^='/'], a[href^='#']").length;

  // ── Page type inference ───────────────────────────────────────────────────
  const pageType = inferPageType({ bodyText, hasPricing, hasContactForm, ctaTexts, h1s });

  const scrapedData: ScrapedData = {
    title, metaDescription, h1s, h2s, h3s,
    hasPhone, phoneNumber, hasEmail, emailAddress,
    hasAddress, hasSocialLinks, socialLinks,
    ctaTexts, ctaCount, hasTestimonials, hasAboutPage, aboutInNav,
    hasPrivacyPolicy, hasContactForm, formFieldCount, hasPricing,
    hasTrustBadges, imageCount, hasFooter, navLinks,
    internalLinks, hasViewport, bodyWordCount, pageType,
    structuredDataTypes,
  };

  const htmlLength = html.length;
  const renderedHtmlLength = renderedHtml.length;
  if (renderedHtmlLength > htmlLength * 1.5) {
    scrapeNotes.push("Rendered DOM significantly larger than raw HTML");
  }
  
  if (redirectCount > 0) {
    scrapeNotes.push(`Redirected ${redirectCount} times`);
  }

  // Scrape Quality Scoring (Requirement 6)
  let dataCompleteness = 0;
  if (title || metaDescription) dataCompleteness += 20;
  if (h1s.length > 0 || h2s.length > 0) dataCompleteness += 15;
  if (navLinks.length > 0) dataCompleteness += 20;
  if (ctaCount > 0) dataCompleteness += 20;
  if (structuredDataTypes.length > 0) dataCompleteness += 15;
  if (internalLinks > 0) dataCompleteness += 5;
  if (bodyWordCount > 100) dataCompleteness += 5;

  let scrapeQuality: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  const scrapeSuccess = dataCompleteness > 0 || renderedHtmlLength > 500;
  
  if (scrapeSuccess) {
    if (dataCompleteness >= 75) scrapeQuality = "HIGH";
    else if (dataCompleteness >= 40) scrapeQuality = "MEDIUM";
  }

  if (accessDeniedDetected) failureReasonCode = "ACCESS_DENIED";
  else if (challengeDetected) failureReasonCode = "CLOUDFLARE_CHALLENGE";
  else if (captchaDetected) failureReasonCode = "CAPTCHA";

  const scrapeSnapshot: ScrapeSnapshot = {
    title,
    metaDescription,
    h1Count: h1s.length,
    h2Count: h2s.length,
    navLinkCount: navLinks.length,
    ctaCount,
    structuredDataTypes,
  };

  const scrapeDiagnostics: ScrapeDiagnostics = {
    htmlLength,
    renderedHtmlLength,
    dataCompleteness,
    scrapeSuccess,
    scrapeQuality,
    pageErrors,
    blockedRequests,
    challengeDetected,
    captchaDetected,
    accessDeniedDetected,
    bodyWordCount,
    navCount: navLinks.length,
    ctaCount,
    imageCount,
    failureReasonCode,
    httpStatus,
    finalUrl,
    redirectCount,
    scrapeNotes,
    scrapeSnapshot,
    extractionSources,
    extractionCoverage,
  };

  return { scrapedData, scrapeDiagnostics };
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
