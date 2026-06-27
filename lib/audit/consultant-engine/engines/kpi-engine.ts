import { BusinessContext, KPIDefinition } from "@/types";

export function getKPIForGap(affectedArea: string, context: BusinessContext): KPIDefinition {
  // Business-type specific KPIs
  if (context.websiteType === "saas") {
    if (affectedArea === "conversion") return { metric: "Trial Signup Rate", baseline: "Current %", target: "+15%", trackingTool: "GA4 / Mixpanel", trackingMethod: "Funnel Completion Event", expectedTimeline: "30 Days", owner: "Growth" };
    if (affectedArea === "trust") return { metric: "Activation Rate", baseline: "Current %", target: "+10%", trackingTool: "Mixpanel", trackingMethod: "Key Action Completed", expectedTimeline: "60 Days", owner: "Product" };
  } else if (context.websiteType === "creator") {
    if (affectedArea === "conversion") return { metric: "Newsletter Subscriber Growth", baseline: "Current Subs", target: "+20%", trackingTool: "ConvertKit / Mailchimp", trackingMethod: "Form Submissions", expectedTimeline: "30 Days", owner: "Creator" };
  } else if (context.websiteType === "ecommerce") {
    if (affectedArea === "conversion") return { metric: "Add to Cart Rate", baseline: "Current %", target: "+10%", trackingTool: "Shopify / GA4", trackingMethod: "Cart Events", expectedTimeline: "14 Days", owner: "Ecom Manager" };
    if (affectedArea === "trust") return { metric: "Checkout Completion", baseline: "Current %", target: "+5%", trackingTool: "Shopify", trackingMethod: "Checkout Funnel", expectedTimeline: "30 Days", owner: "Ecom Manager" };
  } else if (context.websiteType === "agency") {
    if (affectedArea === "conversion") return { metric: "Discovery Call Bookings", baseline: "Current calls/mo", target: "+30%", trackingTool: "Calendly", trackingMethod: "Meetings Scheduled", expectedTimeline: "30 Days", owner: "Sales" };
  }
  
  // Default fallback KPIs based on area
  if (affectedArea === "performance") return { metric: "LCP (Largest Contentful Paint)", baseline: "> 2.5s", target: "< 2.5s", trackingTool: "PageSpeed Insights", trackingMethod: "Core Web Vitals", expectedTimeline: "14 Days", owner: "Engineering" };
  if (affectedArea === "seo") return { metric: "Organic Traffic", baseline: "Current Visitors", target: "+10%", trackingTool: "Google Search Console", trackingMethod: "Clicks", expectedTimeline: "90 Days", owner: "SEO" };

  return { metric: "Bounce Rate", baseline: "Current %", target: "-10%", trackingTool: "GA4", trackingMethod: "Engagement Rate", expectedTimeline: "30 Days", owner: "Marketing" };
}
