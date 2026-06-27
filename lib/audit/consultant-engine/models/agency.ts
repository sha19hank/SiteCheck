import { KnowledgeModel } from "@/types";

export const agencyModel: KnowledgeModel = {
  type: "agency",
  description: "Service-based business or consultancy.",
  expectations: [
    {
      id: "agency_portfolio",
      category: "trust",
      description: "Case studies or portfolio of past work",
      importance: "critical",
      weight: 1.0,
      evidenceRules: ["navLinks contains 'work' or 'case studies' or 'portfolio'"]
    },
    {
      id: "agency_contact",
      category: "conversion",
      description: "Clear contact form or booking link",
      importance: "critical",
      weight: 1.0,
      evidenceRules: ["hasContactForm === true"]
    },
    {
      id: "agency_testimonials",
      category: "trust",
      description: "Client testimonials and logos",
      importance: "important",
      weight: 0.9,
      evidenceRules: ["hasTestimonials === true", "hasTrustBadges === true"]
    },
    {
      id: "agency_pricing",
      category: "monetization",
      description: "Public pricing",
      importance: "optional", // Agencies often don't have public pricing
      weight: 0.3,
      evidenceRules: ["hasPricing === true"]
    }
  ],
  successMetrics: ["Qualified Lead Volume", "Discovery Call Booking Rate"],
  antiPatterns: [
    "No proof of past work",
    "Vague service descriptions",
    "Friction in the contact process"
  ]
};
