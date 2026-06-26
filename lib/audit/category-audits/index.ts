import { ScrapedData, CategoryAudit, WebsiteType, AuditScores } from "@/types";
import { runSaaSAudit } from "./saas";
import { runEcommerceAudit } from "./ecommerce";
import { runAgencyAudit } from "./agency";
import { runCreatorAudit } from "./creator";
import { runLocalBusinessAudit } from "./local-business";
import { runBlogAudit } from "./blog";
import { runMarketplaceAudit } from "./marketplace";
import { runPortfolioAudit } from "./portfolio";
import { runCommunityAudit } from "./community";
import { runOtherAudit } from "./other";

const AUDIT_RUNNERS: Record<WebsiteType, (data: ScrapedData) => CategoryAudit> = {
  saas: runSaaSAudit,
  ecommerce: runEcommerceAudit,
  agency: runAgencyAudit,
  creator: runCreatorAudit,
  local_business: runLocalBusinessAudit,
  blog: runBlogAudit,
  marketplace: runMarketplaceAudit,
  portfolio: runPortfolioAudit,
  community: runCommunityAudit,
  nonprofit: runOtherAudit,
  other: runOtherAudit,
  unknown: runOtherAudit
};

export function runCategoryAudit(websiteType: WebsiteType, data: ScrapedData, scores: AuditScores): CategoryAudit {
  const runner = AUDIT_RUNNERS[websiteType] || runOtherAudit;
  const audit = runner(data);

  // ── Merge Base Findings ──────────────────────────────────────────────────
  const baseFindings = [
    ...scores.performance.findings,
    ...scores.trust.findings,
    ...scores.clarity.findings,
    ...scores.conversion.findings
  ];

  audit.findings = [...audit.findings, ...baseFindings];

  // ── Source of Truth ──────────────────────────────────────────────────────
  // The CategoryAudit overallScore should be aligned with the deterministic scores.
  // We use the calculated scores from scorer.ts as the definitive source.
  audit.overallScore = scores.overall;
  audit.categoryScores = {
    performance: scores.performance.score,
    trust: scores.trust.score,
    clarity: scores.clarity.score,
    conversion: scores.conversion.score
  };

  return audit;
}
