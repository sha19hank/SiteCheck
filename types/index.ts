// ─── Scoring dimensions ──────────────────────────────────────────────────────

export type ScoreDimension = "performance" | "trust" | "clarity" | "conversion";

export type SeverityLevel = "critical" | "high" | "medium" | "low" | "pass";

export type ScoreLabel = "Excellent" | "Good" | "Needs work" | "Poor";

// ─── Findings (Layer 2 output — deterministic, no AI) ────────────────────────

// Types removed in favor of CanonicalFinding

export interface DimensionScore {
  score: number; // 0–100
  label: ScoreLabel;
  findings: CanonicalFinding[];
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

export interface CanonicalFinding {
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
  findings: CanonicalFinding[];
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
  valuePropositionRaw: string;
  valuePropositionNormalized: string;
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
  
  // Phase 5.2A additions
  id?: string;
  category?: string;
  priorityScore?: number;
  priorityTier?: "Tier 1: Do This Today" | "Tier 2: Do This Month" | "Tier 3: Do This Quarter" | "Tier 4: Backlog";
  effortV2?: "Trivial" | "Small" | "Medium" | "Large" | "Major";
  owner?: string;
  dependencies?: {
    prerequisites: string[];
    dependsOn: string[];
    blocks: string[];
  };
  confidence?: number;
  kpi?: KPIDefinition;
  isQuickWin?: boolean;
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
  relatedRecommendation?: string;
  recommendationId?: string;
}

// ─── Phase 5.2A: Consultant Intelligence Engine Types ──────────────────────

export interface BusinessContext {
  websiteType: WebsiteType;
  businessModel: string;
  targetAudience: string;
  primaryGoal: string;
  valueProposition: string;
  monetization: string;
  platformType: string;
  growthStage: "Pre-Launch" | "Early Stage" | "Growth" | "Scale" | "Enterprise" | "Unknown";
  visitorIntent: string;
  industryVertical: string;
  goToMarketMotion: "PLG" | "Sales-Led" | "Community-Led" | "Content-Led" | "Hybrid" | "Unknown";
  pricingStrategy: "Freemium" | "Free Trial" | "Subscription" | "Usage-Based" | "One-Time" | "Enterprise / Custom" | "Free / Open Source" | "Unknown";
  acquisitionModel: "Organic/SEO" | "Paid Ads" | "Referral/Word-of-Mouth" | "Direct/Brand" | "Partnership" | "Unknown";
  competitivePosition: "Market Leader" | "Challenger" | "Niche Player" | "New Entrant" | "Unknown";
  businessMaturity: "Idea Stage" | "MVP" | "Product-Market Fit" | "Scaling" | "Mature" | "Unknown";
  revenueModel: "Pre-Revenue" | "Early Revenue" | "Revenue-Optimized" | "Revenue-Mature" | "Unknown";
}

export type SignalImportance = "critical" | "important" | "helpful" | "optional" | "negative" | "forbidden";

export interface Expectation {
  id: string;
  category: "trust" | "conversion" | "clarity" | "performance" | "seo" | "ux" | "monetization" | "content";
  description: string;
  importance: SignalImportance;
  weight: number; // 0.0 - 1.0
  evidenceRules?: string[];
}

export interface KnowledgeModel {
  type: WebsiteType;
  description: string;
  expectations: Expectation[];
  successMetrics: string[];
  antiPatterns: string[];
}

export interface EvaluatedGap {
  id: string;
  title: string;
  description: string;
  importance: SignalImportance;
  businessReason: string;
  affectedArea: string;
  confidence: number;
  evidence: string[];
  type: "missing" | "weak" | "contradictory";
}

export interface ImpactScores {
  revenue: number;
  trust: number;
  conversion: number;
  seo: number;
  ux: number;
  growth: number;
  overall: number;
}

export interface KPIDefinition {
  metric: string;
  baseline: string;
  target: string;
  trackingTool: string;
  trackingMethod: string;
  expectedTimeline: string;
  owner: string;
}

export interface RecommendationConfidence {
  score: number; // 0-100 weighted
  level: "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
  supportingEvidenceCount: number;
  reasoningEngineCount: number;
}

export interface EvidenceChain {
  evidenceIds: string[];
  findingIds: string[];
  gapIds: string[];
  rootCauseIds: string[];
  relationshipGraphIds: string[];
  psychologyIds: string[];
  benchmarkIds: string[];
  revenueIds: string[];
  priorityIds: string[];
  
  // Object references for lightweight UI access
  references: {
    gaps?: any[];
    rootCauses?: any[];
    relationships?: any[];
    psychology?: any[];
    benchmarks?: any[];
    revenue?: any[];
  };
}

export interface RecommendationV2 extends ActionableInsight {
  id: string;
  
  // Consultant Expansion Fields
  whatIsWrong: string;
  whyItExists: string;
  whyItMatters: string;
  businessImpact: string;
  rootCauseDescription?: string;
  recommendedSolution: string;
  whyAppropriate: string;
  
  dependencies: {
    prerequisites: string[];
    dependsOn: string[];
    blocks: string[];
  };
  recommendedOrder: number; // Execution sequence
  owner: string; // Marketing, Engineering, Design, etc.
  estimatedEffort: "Very Low" | "Low" | "Medium" | "High" | "Very High";
  estimatedTime: string; // e.g. "15-30 minutes", "Under 2 hours", "Multiple weeks"
  kpi: KPIDefinition;
  expectedOutcome: string;
  
  // New Confidence & Tracing
  consultantConfidence: RecommendationConfidence;
  evidenceChain: EvidenceChain;
  
  // Original / Backwards Compat fields
  priorityScore: number;
  priorityTier: "Tier 1: Do This Today" | "Tier 2: Do This Month" | "Tier 3: Do This Quarter" | "Tier 4: Backlog";
  isQuickWin: boolean;
  
  // Phase 5.2B Reasoning Trace Additions (legacy but preserved for now if needed, though replaced mostly by references)
  rootCauseId?: string;
  psychologyPrinciple?: PsychologyAnnotation;
  revenueImpact?: RevenueImpact;
  journeyStage?: string;
  benchmarkContext?: BenchmarkContext;

  // Phase 5.2C-B Cross References
  relatedMetrics?: string[];
  relatedSections?: string[];
  relatedFindings?: string[];
}

export interface EngineMetadata {
  engineName: string;
  version: string;
  executionTimeMs: number;
  confidence: number;
  evidenceProcessed: number;
}

export interface IntelligenceEngineResult<T> {
  data: T;
  confidence: number;
  evidence: string[];
  engineMetadata: EngineMetadata;
  debugMetadata?: Record<string, any>;
}

export interface CrossPageFinding {
  type: "promise_delivery" | "messaging_alignment" | "nav_content";
  severity: "critical" | "high" | "medium" | "low";
  sourcePage: string;
  targetPage: string;
  description: string;
  impact: string;
}

export interface RootCause {
  id: string;
  title: string;
  description: string;
  affectedGapIds: string[];
  evidence: string[];
}

export interface RelationshipEdge {
  sourceId: string;
  targetId: string;
  type: "CAUSES" | "ENABLES" | "BLOCKS" | "AMPLIFIES" | "DEPENDS_ON" | "CONFLICTS_WITH";
  confidence: number;
}

export interface Opportunity {
  category: "Asset Leverage" | "Missing Revenue" | "Competitive Gaps" | "Growth Channels";
  title: string;
  description: string;
  opportunityScore: number; // 0-100
  evidence: string[];
}

export interface BenchmarkContext {
  actualScore: number;
  industryAverage: number | string; // Numeric score or "Moderate"
  topQuartile: number | string;
  difference: string; // "One maturity level below expectation"
  primaryReasonForDifference: string;
  suggestedTargetScore: number | string;
  
  // Legacy / Compat
  overallScorePercentile: "Top 25%" | "Average" | "Below average" | "Unknown";
  expectedScoreRange: [number, number];
  comparisonMessage: string;
}

export interface PsychologyAnnotation {
  principle: "Trust" | "Authority" | "Social Proof" | "Clarity" | "Cognitive Load" | "Risk Reversal" | "Urgency/Scarcity" | "Reciprocity";
  severity: "High" | "Medium" | "Low";
  confidence: number;
  evidence: string[];
  metricAffected: string;
  suggestedImprovement: string;
}

export interface RevenueImpact {
  estimateLow: number;
  estimateHigh: number;
  trafficAssumption: string;
  conversionAssumption: string;
  averageValueAssumption: string;
  formulaUsed: string;
  confidence: number;
  assumptionReasoning: string;
  
  // Backwards compat
  trafficTier: "Tier 1: < 1K" | "Tier 2: 1K-10K" | "Tier 3: 10K-100K" | "Tier 4: 100K+";
}

export interface ConfidenceV2 {
  findingConfidence: number;
  recommendationConfidence: number;
  sectionConfidence: number;
  overallConfidence: number;
  evidenceQuality: number;
  dataCompleteness: number;
  classificationCertainty: number;
}

export interface NotRecommendedItem {
  feature: string;
  reason: string;
}

export type ReportDepth = "MINIMAL" | "STANDARD" | "COMPREHENSIVE";

export interface ReportDepthConfig {
  level: ReportDepth;
  maxRecommendations: number;
  maxRoadmapTasks: number;
  evidenceVerbosity: "low" | "medium" | "high";
  includeAppendix: boolean;
  opportunityCount: number;
}

export interface PipelineExecution {
  totalExecutionTime: number;
  engineExecutionOrder: string[];
  slowestEngine: { name: string; time: number };
  totalEvidenceProcessed: number;
  totalRecommendationsGenerated: number;
  recommendationsRemovedByValidator: number;
  recommendationsDowngraded: number;
  opportunitiesGenerated: number;
  rootCausesDetected: number;
  validationWarnings: string[];
  validatorModifications: Array<{
    recommendationId: string;
    action: "removed" | "downgraded";
    reason: string;
    validatorName: string;
    originalConfidence: number;
    newConfidence: number;
    failingEvidence: string[];
  }>;
}

export interface ConsultantReport {
  // Report Meta
  reportConfidence: { level: "HIGH" | "MEDIUM" | "LOW"; explanation: string; metrics: { evidenceCoverage: number; understandingCompleteness: number; scrapeQuality: string; classificationConfidence: number } };
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
  
  // Phase 5.2A Intelligence Outputs (Optional for backwards compatibility)
  businessContext?: BusinessContext;
  confidenceV2?: ConfidenceV2;
  reportDepth?: ReportDepthConfig | ReportDepth;
  notRecommendedItems?: NotRecommendedItem[];
  evaluatedGaps?: EvaluatedGap[];
  
  // Phase 5.2C Debug Traces
  pipelineExecution?: PipelineExecution;
  reasoningTraces?: {
    crossPageFindings?: CrossPageFinding[];
    rootCauses?: RootCause[];
    relationshipGraph?: RelationshipEdge[];
    opportunities?: Opportunity[];
    benchmarkContext?: BenchmarkContext;
    psychologyAnnotations?: Record<string, PsychologyAnnotation>;
    revenueImpacts?: Record<string, RevenueImpact>;
  };

  // Phase 5.2C-B Report Composer Output
  reportSections?: ReportSection[];
}

// ─── Phase 5.2C-B Report Composer Types ───────────────────────────────────────

export type SectionRenderType = "text" | "metrics" | "timeline" | "cards" | "roadmap" | "comparison" | "table";

export interface ReportSection {
  id: string;
  type: SectionRenderType;
  title: string;
  content: any; // Can be a string, array of objects, etc. depending on renderType
  metadata: {
    confidence: number;
    evidenceCount: number;
    generatedFrom: string[];
    reasoningSummary: string;
  };
}

export interface CompositionContext {
  reportDepth: ReportDepthConfig;
  businessContext: BusinessContext;
  diagnostics: ScrapeDiagnostics;
  pageSpeed: PageSpeedData;
  scrapedData: ScrapedData;
  classification: WebsiteClassification;
  gaps: EvaluatedGap[];
  recommendations: RecommendationV2[];
  scores: AuditScores;
  evidenceLedger: EvidenceItem[];
  priorityMatrix: PriorityMatrix;
  reasoningTraces: {
    rootCauses: RootCause[];
    crossPageFindings: CrossPageFinding[];
    opportunities: Opportunity[];
    relationshipGraph: RelationshipEdge[];
    benchmarkContext: BenchmarkContext;
    psychologyAnnotations: Record<string, PsychologyAnnotation>;
    revenueImpacts: Record<string, RevenueImpact>;
  };
}

export interface SectionDefinition {
  id: string;
  name: string;
  priority: number;
  requiredPlan: "free" | "report_unlock" | "enterprise";
  applicableWebsiteTypes: WebsiteType[] | "ALL";
  minReportDepth: "BASIC" | "STANDARD" | "COMPREHENSIVE";
  dependencies?: string[];
  optionalDependencies?: string[];
  generate: (context: CompositionContext) => ReportSection | null;
}

export interface AuditMetricSummary {
  id: string;
  title: string;
  currentValue: string | number;
  expectedRange: string | number;
  verdict: "STRONG" | "ADEQUATE" | "NEEDS_WORK" | "CRITICAL";
  whyItMatters: string;
  visibility: "free" | "premium" | "enterprise";
  confidence: number;
  relatedRecommendationIds?: string[];
  relatedRootCauseIds?: string[];
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export type PlanType = "free" | "pro";

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
