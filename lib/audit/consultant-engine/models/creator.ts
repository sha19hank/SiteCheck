import { KnowledgeModel } from "@/types";

export const creatorModel: KnowledgeModel = {
  type: "creator",
  description: "Personal brand, influencer, or content creator.",
  expectations: [
    {
      id: "creator_email_capture",
      category: "conversion",
      description: "Newsletter or email capture form",
      importance: "critical",
      weight: 1.0,
      evidenceRules: ["hasContactForm === true OR ctaTexts contains 'subscribe'"]
    },
    {
      id: "creator_social_links",
      category: "trust",
      description: "Links to active social media profiles",
      importance: "critical",
      weight: 1.0,
      evidenceRules: ["hasSocialLinks === true"]
    },
    {
      id: "creator_about",
      category: "clarity",
      description: "About page telling the creator's story",
      importance: "important",
      weight: 0.8,
      evidenceRules: ["hasAboutPage === true"]
    },
    {
      id: "creator_products",
      category: "monetization",
      description: "Links to products, courses, or services",
      importance: "optional",
      weight: 0.5,
      evidenceRules: ["navLinks contains 'store' or 'courses'"]
    }
  ],
  successMetrics: ["Email List Growth", "Subscriber Conversion Rate", "Content Engagement"],
  antiPatterns: [
    "No email capture visible",
    "Hidden personal identity",
    "Too many conflicting CTAs"
  ]
};
