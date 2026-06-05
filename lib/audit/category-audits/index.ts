import { ScrapedData, CategoryAudit, WebsiteType } from "@/types";
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

export function runCategoryAudit(websiteType: WebsiteType, data: ScrapedData): CategoryAudit {
  const runner = AUDIT_RUNNERS[websiteType] || runOtherAudit;
  return runner(data);
}
