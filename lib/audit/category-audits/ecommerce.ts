import { ScrapedData, CategoryAudit, CanonicalFinding, CategoryRecommendation } from "@/types";
import { CHECK_SHIPPING_INFO, CHECK_RETURN_POLICY, CHECK_CART_VISIBILITY, CHECK_TESTIMONIALS } from "../check-registry";

export function runEcommerceAudit(data: ScrapedData): CategoryAudit {
  const findings: CanonicalFinding[] = [];
  const recommendations: CategoryRecommendation[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const auditSignals: Record<string, any> = {};

  let earnedPoints = 0;
  const maxPoints = 100;

  // Check 1: Shipping Info
  const shippingCheck = CHECK_SHIPPING_INFO(data);
  auditSignals.shippingInfoDetected = shippingCheck.passed;
  if (!shippingCheck.passed) {
    findings.push({
      id: "ecom_missing_shipping",
      title: "Shipping costs are completely hidden",
      description: "No shipping or delivery information was found. Unexpected shipping costs are the #1 cause of cart abandonment.",
      severity: "critical",
      category: "trust",
      priority: 95,
      evidence: shippingCheck.evidence,
      source: "navigation"
    });
    recommendations.push({
      title: "Display shipping thresholds globally",
      why_it_matters: "When shoppers know they get free shipping over $50, they will often add more items to their cart to reach the threshold.",
      how_to_fix: "Add a prominent banner at the very top of your site stating your shipping policy (e.g., 'Free shipping on all orders over $50').",
      impact: "high",
      effort: "low"
    });
    weaknesses.push("Missing shipping transparency");
  } else {
    earnedPoints += 30;
    strengths.push("Clear shipping policies");
  }

  // Check 2: Return Policy
  const returnCheck = CHECK_RETURN_POLICY(data);
  auditSignals.returnPolicyDetected = returnCheck.passed;
  if (!returnCheck.passed) {
    findings.push({
      id: "ecom_missing_return_policy",
      title: "No return policy found",
      description: "Shoppers are highly reluctant to buy physical goods from unknown stores without a clear return safety net.",
      severity: "high",
      category: "trust",
      priority: 90,
      evidence: returnCheck.evidence,
      source: "navigation"
    });
    recommendations.push({
      title: "Place your Return Policy near the 'Add to Cart' button",
      why_it_matters: "First-time buyers experience purchase anxiety. They need to know they won't be stuck with a bad product.",
      how_to_fix: "Add a micro-text link under your Add to Cart button that says '30-Day Hassle-Free Returns'.",
      impact: "high",
      effort: "low"
    });
    weaknesses.push("Missing return policy");
  } else {
    earnedPoints += 30;
    strengths.push("Return policy accessible");
  }

  // Check 3: Cart Visibility
  const cartCheck = CHECK_CART_VISIBILITY(data);
  auditSignals.cartDetected = cartCheck.passed;
  if (!cartCheck.passed) {
    findings.push({
      id: "ecom_missing_cart",
      title: "Shopping cart is hidden",
      description: "No 'Cart' or 'Checkout' link is visible in the navigation.",
      severity: "high",
      category: "conversion",
      priority: 85,
      evidence: cartCheck.evidence,
      source: "navigation"
    });
    recommendations.push({
      title: "Make the shopping cart globally persistent",
      why_it_matters: "Shoppers need to be able to access their cart from any page instantly.",
      how_to_fix: "Ensure a floating or fixed cart icon is always visible in the top right corner.",
      impact: "high",
      effort: "medium"
    });
    weaknesses.push("Cart friction");
  } else {
    earnedPoints += 20;
    strengths.push("Cart easily accessible");
  }

  // Check 4: Trust
  const trustCheck = CHECK_TESTIMONIALS(data);
  auditSignals.reviewsDetected = trustCheck.passed;
  if (!trustCheck.passed) {
    findings.push({
      id: "ecom_missing_reviews",
      title: "No product reviews detected",
      description: "No testimonials or reviews are visible on the page.",
      severity: "medium",
      category: "conversion",
      priority: 70,
      evidence: trustCheck.evidence,
      source: "page_structure"
    });
    recommendations.push({
      title: "Display product reviews directly under Add To Cart",
      why_it_matters: "Product reviews are the strongest driver of ecommerce conversion.",
      how_to_fix: "Install a reviews app (like Loox or Yotpo) and display star ratings near the product title.",
      impact: "high",
      effort: "medium"
    });
  } else {
    earnedPoints += 20;
    strengths.push("Product reviews visible");
  }

  const overallScore = Math.round((earnedPoints / maxPoints) * 100);
  let healthGrade = "F";
  if (overallScore >= 90) healthGrade = "A+";
  else if (overallScore >= 80) healthGrade = "A";
  else if (overallScore >= 70) healthGrade = "B";
  else if (overallScore >= 60) healthGrade = "C";
  else if (overallScore >= 50) healthGrade = "D";

  return {
    websiteType: "ecommerce",
    overallScore,
    categoryScores: {
      trust: (shippingCheck.passed ? 50 : 0) + (returnCheck.passed ? 50 : 0),
      conversion: (cartCheck.passed ? 50 : 0) + (trustCheck.passed ? 50 : 0),
      clarity: 100,
      performance: 100
    },
    findings,
    recommendations,
    strengths,
    weaknesses,
    healthGrade,
    auditSignals
  };
}
