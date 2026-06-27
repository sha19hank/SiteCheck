import { KnowledgeModel } from "@/types";

export const ecommerceModel: KnowledgeModel = {
  type: "ecommerce",
  description: "Online store selling physical or digital goods.",
  expectations: [
    {
      id: "ecom_products",
      category: "conversion",
      description: "Products visible and purchasable",
      importance: "critical",
      weight: 1.0,
      evidenceRules: ["navLinks contains 'shop' or 'products'"]
    },
    {
      id: "ecom_trust_policies",
      category: "trust",
      description: "Clear return and privacy policies",
      importance: "critical",
      weight: 1.0,
      evidenceRules: ["hasPrivacyPolicy === true"]
    },
    {
      id: "ecom_reviews",
      category: "trust",
      description: "Product reviews",
      importance: "important",
      weight: 0.9,
      evidenceRules: ["hasTestimonials === true"]
    }
  ],
  successMetrics: ["Add to Cart Rate", "Checkout Completion Rate", "Average Order Value"],
  antiPatterns: [
    "Hidden shipping costs",
    "Missing return policy",
    "Lack of product reviews"
  ]
};
