// ─── Scoring dimensions ──────────────────────────────────────────────────────

export type ScoreDimension = "performance" | "trust" | "clarity" | "conversion";

export type SeverityLevel = "critical" | "high" | "medium" | "low" | "pass";

export type ScoreLabel = "Excellent" | "Good" | "Needs work" | "Poor";

// ─── Findings (Layer 2 output — deterministic, no AI) ────────────────────────

export type FindingCheck =
  // Performance
  | "lcp_slow" | "fcp_slow" | "cls_high" | "speed_index_slow"
  | "mobile_score_low" | "images_unoptimized" | "render_blocking_resources" | "missing_viewport"
  // Trust
  | "no_phone_number" | "no_email_address" | "no_testimonials"
  | "no_about_page" | "about_not_in_nav" | "no_privacy_policy"
  | "no_ssl" | "no_address" | "no_social_links"
  | "no_trust_badges" | "no_team_section" | "trust_sequencing_friction"
  // Clarity
  | "missing_h1" | "multiple_h1" | "missing_meta_description"
  | "meta_description_short" | "title_missing" | "title_too_long"
  | "poor_heading_structure" | "no_value_proposition" | "weak_value_proposition"
  | "nav_too_complex" | "footer_missing" | "wall_of_text" | "thin_content"
  // Conversion
  | "no_clear_cta_detected" | "cta_below_fold" | "cta_text_generic"
  | "multiple_competing_ctas" | "form_too_long" | "no_contact_form"
  | "no_pricing_info" | "no_social_proof_near_cta"
  // Passes (positive signals)
  | "ssl_active" | "fast_lcp" | "good_mobile_score"
  | "has_testimonials" | "has_phone" | "short_form"
  | "clear_cta" | "good_heading_structure" | "has_meta_description";

export interface Finding {
  check: FindingCheck;
  category: ScoreDimension;
  severity: SeverityLevel;
  detail?: string; // e.g. "4.8s", "Get in touch"
}

// ─── Scores ──────────────────────────────────────────────────────────────────

export interface DimensionScore {
  score: number; // 0–100
  label: ScoreLabel;
  findings: Finding[];
}

export interface AuditScores {
  overall: number;
  performance: DimensionScore;
  trust: DimensionScore;
  clarity: DimensionScore;
  conversion: DimensionScore;
}

// ─── Scraped data (Layer 1 output) ───────────────────────────────────────────

export interface ScrapedData {
  title: string | null;
  metaDescription: string | null;
  h1s: string[];
  h2s: string[];
  h3s: string[];
  hasPhone: boolean;
  phoneNumber: string | null;
  hasEmail: boolean;
  emailAddress: string | null;
  hasAddress: boolean;
  hasSocialLinks: boolean;
  socialLinks: string[];
  ctaTexts: string[];
  ctaCount: number;
  hasTestimonials: boolean;
  hasAboutPage: boolean;
  aboutInNav: boolean;
  hasPrivacyPolicy: boolean;
  hasContactForm: boolean;
  formFieldCount: number;
  hasPricing: boolean;
  hasTrustBadges: boolean;
  imageCount: number;
  hasFooter: boolean;
  navLinks: string[];
  internalLinks: number;
  bodyWordCount: number;
  hasViewport: boolean;
  pageType: PageType;
}

export type PageType =
  | "service_business"
  | "ecommerce"
  | "saas"
  | "portfolio"
  | "local_business"
  | "blog"
  | "unknown";

// ─── PageSpeed data ───────────────────────────────────────────────────────────

export interface PageSpeedData {
  performanceScore: number;         // 0–1 from Google
  mobileScore: number;              // 0–1 from Google
  lcp: number;                      // seconds
  fcp: number;                      // seconds
  cls: number;                      // score
  speedIndex: number;               // seconds
  ttfb: number;                     // seconds
  hasImages: boolean;
  imageOptimizationScore: number;   // 0–1
  renderBlockingResources: number;  // count
  passed: boolean;
}

// ─── AI report (Layer 3 output — Claude) ─────────────────────────────────────

export interface QuickWin {
  title: string;
  whyItMatters: string;          // 2-3 sentence psychological/business explanation
  howToFix: string;              // Specific actionable instruction
  category: ScoreDimension;
  effortLevel: "easy" | "medium" | "involved";
}

export interface SectionInsight {
  dimension: ScoreDimension;
  summary: string;               // 2–3 sentence consultant paragraph
  keyFinding: string;            // Single most important takeaway
  positives: string[];           // What's working
  improvements: string[];        // What needs work (plain English)
}

export interface AIReport {
  consultantSummary: string;     // Opening paragraph, 3–4 sentences
  quickWins: QuickWin[];         // Always exactly 3
  sectionInsights: SectionInsight[];
  overallNarrative: string;      // 1 sentence headline
  generatedAt: string;           // ISO timestamp
}

// ─── Full audit record ────────────────────────────────────────────────────────

export interface AuditRecord {
  id: string;
  userId: string | null;
  url: string;
  domain: string;
  shareToken: string;
  isPublic: boolean;
  scores: AuditScores;
  scrapedData: ScrapedData;
  pageSpeedData: PageSpeedData;
  aiReport: AIReport;
  screenshotData: ScreenshotData | null;
  isPaid: boolean;
  paymentId: string | null;
  createdAt: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export type PlanType = "free" | "report_unlock" | "pro";

export interface PaymentRecord {
  id: string;
  userId: string | null;
  auditId: string | null;
  provider: "razorpay";
  providerId: string;
  plan: PlanType;
  amountPaise: number;
  status: "pending" | "paid" | "failed";
  createdAt: string;
}

// ─── User profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  plan: PlanType;
  auditsThisMonth: number;
  createdAt: string;
}

// ─── API request/response shapes ─────────────────────────────────────────────

export interface AuditRequest {
  url: string;
  email?: string;
}

export interface AuditResponse {
  auditId: string;
  shareToken: string;
  partialReport: PartialReport;
}

export interface PartialReport {
  domain: string;
  url: string;
  scores: AuditScores;
  consultantSummary: string;
  overallNarrative: string;
  quickWins: QuickWin[];       // Always returned (core value)
  sectionInsights: {
    // Free: performance + trust previews only
    performance: SectionInsight | null;
    trust: SectionInsight | null;
    // Paid: clarity + conversion full
    clarity: SectionInsight | null;
    conversion: SectionInsight | null;
  };
  isPaid: boolean;
  createdAt: string;
}

// ─── Screenshot data ──────────────────────────────────────────────────────────

export interface ScreenshotData {
  desktopScreenshot:  string | null; // base64 data URI
  mobileScreenshot:   string | null;
  ctaAboveFold:       boolean | null;
  ctaAboveFoldMobile: boolean | null;
  ctaText:            string | null;
  hasHeroImage:       boolean | null;
  navHeight:          number | null;
  heroHeight:         number | null;
  pageHeight:         number | null;
  capturedAt:         string;
  captureSuccess:     boolean;
}

// ─── Before/after comparison ──────────────────────────────────────────────────

export interface ScoreDelta {
  overall:     number;
  performance: number;
  trust:       number;
  clarity:     number;
  conversion:  number;
}

export interface ComparisonResult {
  previousAuditId: string;
  currentAuditId:  string;
  previousDate:    string;
  currentDate:     string;
  domain:          string;
  scoreDelta:      ScoreDelta;
  improved:        string[];  // dimension names that improved
  declined:        string[];  // dimension names that got worse
  unchanged:       string[];
  previousScores:  { overall: number; performance: number; trust: number; clarity: number; conversion: number };
  currentScores:   { overall: number; performance: number; trust: number; clarity: number; conversion: number };
}

// ─── UI state ─────────────────────────────────────────────────────────────────

export type ScanStep =
  | "validating"
  | "fetching_speed"
  | "scraping"
  | "scoring"
  | "generating_insights"
  | "complete";

export interface ScanProgress {
  step: ScanStep;
  stepIndex: number;
  totalSteps: number;
  message: string;
}
