import { KnowledgeModel } from "@/types";

export const saasModel: KnowledgeModel = {
  type: "saas",
  description: "B2B or B2C Software as a Service.",
  expectations: [
    {
      id: "saas_pricing",
      category: "conversion",
      description: "Pricing page or clear pricing section",
      importance: "critical",
      weight: 1.0,
      evidenceRules: ["hasPricing === true"]
    },
    {
      id: "saas_cta_primary",
      category: "conversion",
      description: "Clear primary CTA for trial or demo",
      importance: "critical",
      weight: 1.0,
      evidenceRules: ["ctaCount > 0"]
    },
    {
      id: "saas_trust_logos",
      category: "trust",
      description: "Customer or partner logos",
      importance: "important",
      weight: 0.8,
      evidenceRules: ["hasTrustBadges === true"]
    },
    {
      id: "saas_testimonials",
      category: "trust",
      description: "Customer testimonials",
      importance: "important",
      weight: 0.9,
      evidenceRules: ["hasTestimonials === true"]
    },
    {
      id: "saas_nav_about",
      category: "clarity",
      description: "About us or Company page",
      importance: "optional",
      weight: 0.4,
      evidenceRules: ["hasAboutPage === true"]
    },
    {
      id: "saas_no_phone_only",
      category: "conversion",
      description: "Only way to convert is a phone number (Forbidden for PLG SaaS)",
      importance: "forbidden",
      weight: 1.0,
      evidenceRules: ["hasPhone === true", "ctaCount === 0"]
    }
  ],
  successMetrics: ["Visitor-to-Trial Conversion", "Demo Requests", "MRR Growth"],
  antiPatterns: [
    "No pricing page visible",
    "Generic hero messaging without specific value",
    "Missing social proof"
  ]
};
