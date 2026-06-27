import { WebsiteType, KnowledgeModel } from "@/types";
import { saasModel } from "./saas";
import { creatorModel } from "./creator";
import { agencyModel } from "./agency";
import { ecommerceModel } from "./ecommerce";

// Generic fallback model
const genericModel: KnowledgeModel = {
  type: "unknown",
  description: "Generic baseline expectations for any website.",
  expectations: [
    { id: "gen_h1", category: "clarity", description: "Clear H1 heading", importance: "critical", weight: 1.0 },
    { id: "gen_mobile", category: "ux", description: "Mobile responsive viewport", importance: "critical", weight: 1.0 },
    { id: "gen_contact", category: "trust", description: "Contact information or form", importance: "important", weight: 0.8 },
  ],
  successMetrics: ["Bounce Rate", "Time on Site"],
  antiPatterns: ["No H1", "Broken mobile layout"]
};

export function getKnowledgeModel(type: WebsiteType): KnowledgeModel {
  switch (type) {
    case "saas": return saasModel;
    case "creator": return creatorModel;
    case "agency": return agencyModel;
    case "ecommerce": return ecommerceModel;
    default: return genericModel;
  }
}
