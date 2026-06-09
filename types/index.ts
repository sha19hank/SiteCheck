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
  structuredDataTypes: string[];
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

// ─── Classification (Phase 1) ───────────────────────────────────────────────────

export type WebsiteType =
  | "saas"
  | "ecommerce"
  | "agency"
  | "creator"
  | "blog"
  | "local_business"
  | "marketplace"
  | "nonprofit"
  | "community"
  | "portfolio"
  | "other"
  | "unknown";

export type CategoryScores = Record<WebsiteType, number>;

export interface ClassificationEvidence {
  signalType: "keyword" | "navigation" | "cta" | "structuredData" | "ai" | "businessModel";
  category: WebsiteType;
  source: string;
  matchedText: string;
  voteValue: number;
}

export interface VoteBreakdown {
  keyword: ClassificationEvidence[];
  navigation: ClassificationEvidence[];
  cta: ClassificationEvidence[];
  structuredData: ClassificationEvidence[];
  ai: ClassificationEvidence[];
  businessModel: ClassificationEvidence[];
}

export type AiStatus = 
  | "AI_AVAILABLE"
  | "AI_TIMEOUT"
  | "AI_RATE_LIMITED"
  | "AI_QUOTA_EXCEEDED"
  | "AI_DISABLED"
  | "AI_DISAGREEMENT"
  | "AI_ERROR";

export interface WebsiteClassification {
  websiteType: WebsiteType;
  platformType?: string;
  confidence: number;
  confidenceTier: "HIGH" | "MEDIUM" | "LOW"; // Phase 4 addition
  categoryScores: CategoryScores;
  reasoning: string[];
  evidence: ClassificationEvidence[];
  deterministicScore: number;
  aiAgreement: boolean;
  aiStatus: AiStatus;
  classificationSummary: string[];
  voteBreakdown: VoteBreakdown;
}

export interface CategoryFinding {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "pass";
  category: "trust" | "conversion" | "clarity" | "performance" | string;
  priority: number; // 1-100
  evidence: string[];
  source: string;
}

export interface CategoryRecommendation {
  title: string;
  why_it_matters: string;
  how_to_fix: string;
  impact: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
}

export interface CategoryAudit {
  websiteType: WebsiteType;
  overallScore: number;
  categoryScores: {
    trust: number;
    conversion: number;
    clarity: number;
    performance: number;
  };
  findings: CategoryFinding[];
  recommendations: CategoryRecommendation[];
  strengths: string[];
  weaknesses: string[];
  healthGrade: string; // A+, A, B, C, D, F
  auditSignals: Record<string, any>;
}

// ─── Phase 3: Website Understanding & Growth Intelligence ───────────────────

export interface ExecutionTiming {
  scrapingMs: number;
  pageSpeedMs: number;
  classificationMs: number;
  categoryAuditMs: number;
  websiteUnderstandingMs: number;
  growthEngineMs: number;
  totalMs: number;
}

export interface AIFailureLog {
  step: "website_understanding" | "growth_engine";
  status: "Success" | "Failed";
  fallbackUsed: boolean;
  errorReason?: string;
  rawResponse?: string;
  aiStatus?: AiStatus;
}

export interface WebsiteUnderstanding {
  proposedWebsiteType: WebsiteType;
  platformType: string;
  websiteType: WebsiteType;
  businessModel: string;
  primaryGoal: string;
  targetAudience: string;
  pagePurpose: string;
  monetizationModel: string;
  valueProposition: string;
  customerJourneyStage: string;
  confidence: number;
  evidence: string[];
}

export interface WebsiteUnderstandingResult {
  data: WebsiteUnderstanding;
  log: AIFailureLog;
}

export interface GrowthInsight {
  title: string;
  impact: "low" | "medium" | "high";
  confidence: number; // 0-1 scale
  detected: string;
  evidence: string[];
  findingContext?: string;      // "Why this recommendation exists" finding
  understandingContext?: string; // "Why this recommendation exists" understanding context
  whyItMatters: string;
  recommendedAction: string;
}

export interface GrowthReport {
  readinessScore: number;
  insights: GrowthInsight[];
}

export interface GrowthReportResult {
  data: GrowthReport;
  log: AIFailureLog;
}

// ─── Full audit record ────────────────────────────────────────────────────────

export interface ScrapeSnapshot {
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  h2Count: number;
  navLinkCount: number;
  ctaCount: number;
  structuredDataTypes: string[];
}

export interface ScrapeDiagnostics {
  htmlLength: number;
  renderedHtmlLength: number;
  dataCompleteness: number; // 0-100
  scrapeSuccess: boolean;
  scrapeQuality: "HIGH" | "MEDIUM" | "LOW";
  pageErrors: number;
  blockedRequests: number;
  challengeDetected: boolean;
  captchaDetected: boolean;
  accessDeniedDetected: boolean;
  bodyWordCount: number;
  navCount: number;
  ctaCount: number;
  imageCount: number;
  failureReasonCode: "TIMEOUT" | "ACCESS_DENIED" | "CAPTCHA" | "CLOUDFLARE_CHALLENGE" | "JS_RENDER_FAILED" | "EMPTY_DOM" | "UNKNOWN" | null;
  httpStatus: number;
  finalUrl: string;
  redirectCount: number;
  scrapeNotes: string[];
  scrapeSnapshot: ScrapeSnapshot;
  extractionSources: Record<string, string>;
  extractionCoverage: Record<string, boolean>;
}

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
  aiReport: AIReport; // Legacy side-by-side
  classification: WebsiteClassification | null;
  categoryAudit: CategoryAudit | null;
  websiteUnderstanding: WebsiteUnderstanding | null;
  growthReport: GrowthReport | null;
  consultantReport: ConsultantReport | null; // Phase 4 addition
  executionTiming?: ExecutionTiming;
  aiLogs?: AIFailureLog[];
  
  // Phase 0: Transparency & Diagnostics
  aiAvailable?: boolean;
  fallbackUsed?: boolean;
  aiFailureReasonCode?: "QUOTA_EXCEEDED" | "RATE_LIMITED" | "SERVICE_UNAVAILABLE" | "INVALID_API_KEY" | "TIMEOUT" | "UNKNOWN" | null;
  aiFailureReasonMessage?: string | null;
  auditConfidence?: "HIGH" | "MEDIUM" | "LOW";
  scrapeDiagnostics?: ScrapeDiagnostics;

  screenshotData: ScreenshotData | null;
  isPaid: boolean;
  paymentId: string | null;
  createdAt: string;
}

// ─── Phase 4: Consultant Report ──────────────────────────────────────────────

export interface ActionableInsight {
  problem: string;
  evidence: string[];
  whyItMatters: string;
  businessImpact: string;
  recommendedFix: string;
  priority: "High" | "Medium" | "Low";
  effort: "High" | "Medium" | "Low";
  expectedOutcome: string;
}

export interface SectionAnalysis {
  score: number;
  findings: string[];
  whyItMatters: string;
  businessImpact: string;
  recommendedActions: string[];
}

export interface CompetitivePositioning {
  strengths: string[];
  missingIndustryStandards: string[];
  potentialDisadvantages: string[];
}

export interface ActionPlanWeek {
  week: string; // e.g., "Week 1", "Week 2"
  focus: string;
  tasks: string[];
}

export interface PriorityMatrix {
  immediateWins: ActionableInsight[]; // High Impact / Low Effort
  strategicProjects: ActionableInsight[]; // High Impact / High Effort
  optionalImprovements: ActionableInsight[]; // Low Impact / Low Effort
  deprioritize: ActionableInsight[]; // Low Impact / High Effort
}

export interface EvidenceItem {
  finding: string;
  source: string;
  impact: string;
}

export interface ConsultantReport {
  // Report Meta
  reportConfidence: { level: "HIGH" | "MEDIUM" | "LOW"; explanation: string };
  auditLimitations: { text: string; aiAvailable: boolean; scrapeQuality: string; classificationConfidence: string };
  
  // Free Tier
  executiveSummary: string;
  websiteHealthScore: number;
  topQuickWins: ActionableInsight[]; // Max 3
  performanceAnalysis: SectionAnalysis;
  trustAnalysis: SectionAnalysis;
  
  // Premium Tier
  conversionAnalysis: SectionAnalysis;
  growthOpportunities: ActionableInsight[];
  competitivePositioning: CompetitivePositioning;
  priorityMatrix: PriorityMatrix;
  thirtyDayActionPlan: ActionPlanWeek[];
  ninetyDayRoadmap: ActionPlanWeek[];
  evidenceLedger: EvidenceItem[];
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
  consultantReport?: ConsultantReport | null; // Phase 4 addition
  isPaid: boolean;
  createdAt: string;
  // Phase 0 metrics
  aiAvailable?: boolean;
  fallbackUsed?: boolean;
  aiFailureReasonCode?: string | null;
  aiFailureReasonMessage?: string | null;
  auditConfidence?: "HIGH" | "MEDIUM" | "LOW";
  scrapeDiagnostics?: ScrapeDiagnostics;
  classifierInputPreview?: {
    title: string | null;
    navLinks: string[];
    ctas: string[];
    structuredDataTypes: string[];
  };
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
