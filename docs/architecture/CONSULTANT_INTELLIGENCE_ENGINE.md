# SiteCheck — Consultant Intelligence Engine
## Complete Architecture Document

> **Version:** 3.0 (Final Consolidated)
> **Status:** Implementation-Ready
> **Architecture Freeze Date:** 2026-06-27
> **Scope:** Intelligence layer only — no backend/frontend/database redesign

---

# Table of Contents

**Foundation**
1. [Executive Overview](#1-executive-overview)
2. [Master Pipeline](#2-master-pipeline)

**Core Reasoning**
3. [Part 1 — Consultant Thinking Framework](#part-1--consultant-thinking-framework)
4. [Part 2 — Context Engine](#part-2--context-engine)
5. [Part 3 — Business Intelligence Engine](#part-3--business-intelligence-engine)
6. [Part 4 — Website-Type Knowledge Models](#part-4--website-type-knowledge-models)

**Analysis Engines**
7. [Part 5 — Customer Journey Intelligence](#part-5--customer-journey-intelligence)
8. [Part 6 — Cross-Page Reasoning Engine](#part-6--cross-page-reasoning-engine)
9. [Part 7 — Root Cause Intelligence](#part-7--root-cause-intelligence)
10. [Part 8 — Relationship Graph](#part-8--relationship-graph)

**Scoring & Prioritization**
11. [Part 9 — Business Impact Engine](#part-9--business-impact-engine)
12. [Part 10 — Revenue Intelligence](#part-10--revenue-intelligence)
13. [Part 11 — Benchmark Intelligence](#part-11--benchmark-intelligence)
14. [Part 12 — Confidence Framework](#part-12--confidence-framework)
15. [Part 13 — Message Consistency & Contradiction Detection](#part-13--message-consistency--contradiction-detection)
16. [Part 14 — Prioritization Framework](#part-14--prioritization-framework)

**Recommendation & Output**
17. [Part 15 — Recommendation Intelligence](#part-15--recommendation-intelligence)
18. [Part 16 — Opportunity Discovery Engine](#part-16--opportunity-discovery-engine)
19. [Part 17 — Behavioural Psychology Layer](#part-17--behavioural-psychology-layer)
20. [Part 18 — KPI Measurement Framework](#part-18--kpi-measurement-framework)

**Report Generation**
21. [Part 19 — Report Depth Resolver](#part-19--report-depth-resolver)
22. [Part 20 — Premium Report Intelligence](#part-20--premium-report-intelligence)
23. [Part 21 — Consultant Personality & Narrative](#part-21--consultant-personality--narrative)

**Operations**
24. [Edge Cases & Failure Modes](#edge-cases--failure-modes)
25. [Implementation Guidance](#implementation-guidance)
26. [Future Extensibility](#future-extensibility)
27. [Phase Mapping](#phase-mapping)

---

# 1. Executive Overview

## The Core Problem

SiteCheck detects signals but does not interpret them. The current pipeline is:

```
Signal Detected → Generic Recommendation
```

A real consultant operates completely differently:

```
Understand the Business → Understand the Visitor → Set Expectations →
Evaluate Evidence Against Expectations → Assess Business Impact →
Prioritize by ROI → Recommend with Context → Build a Roadmap
```

The difference is **contextual reasoning**. A "missing phone number" is a critical finding for a local dentist and completely irrelevant for GitHub. The same raw signal produces opposite recommendations depending on context.

## Architectural Principle

The Consultant Intelligence Engine introduces a **multi-layer reasoning stack** between raw data and final output. Every recommendation in the final report has passed through all layers. Nothing is generated directly from raw signals.

---

# 2. Master Pipeline

This is the canonical implementation pipeline. Every module is listed in execution order.

```
┌──────────────────────────────────────────────────────────────────┐
│                        RAW SIGNALS                               │
│  Scraper output, PageSpeed metrics, structured data              │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 1: CLASSIFY                                               │
│  What type of website is this?                                   │
│  Output: websiteType                                             │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 2: UNDERSTAND                                             │
│  Business model, audience, goals, monetization                   │
│  Output: businessModel, targetAudience, primaryGoal, etc.        │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 3: BUSINESS INTELLIGENCE                                  │
│  Go-to-market motion, pricing strategy, acquisition model,       │
│  competitive position, business maturity, revenue sophistication │
│  Output: 6 new BusinessContext dimensions                        │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 4: RESOLVE CONTEXT                                        │
│  Merge classification + understanding + business intelligence    │
│  into unified BusinessContext object                             │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 5: LOAD KNOWLEDGE MODEL                                   │
│  Retrieve expectations for this website type                     │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 6: SET EXPECTATIONS                                       │
│  Adjust Knowledge Model weights using BusinessContext            │
│  Output: ExpectationSet                                          │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 7: DETECT & EVALUATE                                      │
│  Map raw signals to expectations                                 │
│  Output: EvaluationResult[] (MET / UNMET / EXCEEDED / etc.)      │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 8: GAP ANALYSIS                                           │
│  Expected vs Detected → Gaps, Strengths, Surprises               │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 9: CUSTOMER JOURNEY INTELLIGENCE                          │
│  Tag gaps by journey stage, compute stage health scores,         │
│  identify primary leak point                                     │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 10: CROSS-PAGE REASONING                                  │
│  Evaluate consistency across homepage, pricing, about, blog      │
│  Detect page-to-page contradictions and coherence gaps           │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 11: ROOT CAUSE INTELLIGENCE                               │
│  Detect root causes behind clustered symptoms                    │
│  Restructure finding hierarchy                                   │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 12: RELATIONSHIP GRAPH                                    │
│  Map CAUSES, BLOCKS, ENABLES, AMPLIFIES, CONFLICTS              │
│  between findings                                                │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 13: IMPACT ASSESSMENT                                     │
│  Score each gap across 6 dimensions (Revenue, Trust, Conversion, │
│  SEO, UX, Growth) weighted by BusinessContext                    │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 14: REVENUE INTELLIGENCE                                  │
│  Translate impact scores into estimated dollar ranges            │
│  Compute revenue leakage per journey stage                       │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 15: BENCHMARK INTELLIGENCE                                │
│  Contextualize scores against type/stage benchmarks              │
│  Compute percentile positioning                                  │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 16: MESSAGE CONSISTENCY CHECK                             │
│  Detect contradictions across hero, CTAs, pricing, navigation    │
│  Flag severity levels                                            │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 17: CONFIDENCE SCORING                                    │
│  Compute 5-dimension confidence per finding                      │
│  Apply "I don't know" rules                                      │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 18: RELEVANCE FILTER                                      │
│  Discard irrelevant findings. Collect discarded items            │
│  into "What We Intentionally Did NOT Recommend" list             │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 19: PRIORITIZE                                            │
│  Rank by ROI. Assign tiers. Apply growth stage caps.             │
│  Sequence by dependency graph.                                   │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 20: GENERATE RECOMMENDATIONS                              │
│  Create context-aware recommendations with full structure        │
│  + Opportunity Discovery + Psychology Annotations + KPI defs     │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 21: REPORT DEPTH RESOLVER                                 │
│  Determine report complexity: Minimal / Standard / Complex       │
│  Adjust section count, depth, and recommendation caps            │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 22: BUILD ROADMAP                                         │
│  30-Day Action Plan + 90-Day Roadmap                             │
│  Sequenced by dependency and priority                            │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 23: SYNTHESIZE NARRATIVE                                  │
│  Executive summary, section insights, consultant prose           │
│  Apply Consultant Personality rules                              │
│  Generate Premium WOW Sections                                   │
│  Include "What We Did NOT Recommend"                             │
└──────────────────────┬───────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  STAGE 24: OUTPUT                                                │
│  Consultant Report → Premium Report → PDF Export                 │
└──────────────────────────────────────────────────────────────────┘
```

---

# Part 1 — Consultant Thinking Framework

A consultant does not jump from "problem" to "fix." They follow a disciplined reasoning chain. SiteCheck must replicate this chain deterministically.

## Stage Definitions

### Stage 1: Raw Signals
**Input:** Scraper data, PageSpeed metrics, structured data
**Output:** Normalized signal inventory

Every piece of scraped data becomes a typed signal:

| Signal Category | Examples |
|---|---|
| Navigation | Nav links, menu structure, footer links |
| Hero | H1 text, hero image, hero CTA |
| Trust | Testimonials, logos, badges, reviews, case studies |
| Conversion | CTAs, forms, pricing, free trial buttons |
| Content | Headings, paragraphs, blog presence, documentation |
| Technical | Meta tags, schema markup, OpenGraph, favicon |
| Performance | LCP, CLS, TTFB, image optimization |
| Contact | Email, phone, address, social links, chat widget |
| Monetization | Pricing page, payment integrations, subscription indicators |
| Brand | Logo, consistent colors, typography, imagery quality |

### Stage 2: Classify
**Input:** Raw signals
**Output:** `websiteType` (SaaS | Creator | Ecommerce | Agency | Marketplace | Portfolio | Community | LocalBusiness | Blog | Nonprofit | Other)

Already implemented. No changes needed.

### Stage 3: Understand
**Input:** Raw signals + classification
**Output:** Business Profile object

Already implemented. Produces: businessModel, targetAudience, primaryGoal, valueProposition, monetizationModel, platformType, customerJourneyStage.

### Stage 4: Resolve Context
**Input:** Classification + Understanding + Business Intelligence
**Output:** `BusinessContext` — a single unified object

```
BusinessContext = {
  websiteType:        "SaaS"
  businessModel:      "B2B Subscription"
  targetAudience:     "Engineering Teams"
  primaryGoal:        "Convert visitors to free trial signups"
  valueProposition:   "Collaborative code review platform"
  monetization:       "Freemium → Paid Plans"
  platformType:       "Developer Platform"
  growthStage:        "Growth"
  visitorIntent:      "Evaluate Tool"
  industryVertical:   "Developer Tools"
  // Business Intelligence dimensions (Part 3):
  goToMarketMotion:   "PLG"
  pricingStrategy:    "Freemium"
  acquisitionModel:   "Organic/SEO"
  competitivePosition:"Challenger"
  businessMaturity:   "Product-Market Fit"
  revenueModel:       "Early Revenue"
}
```

**Growth Stage Inference Rules:**

| Signal | Inferred Stage |
|---|---|
| No pricing page, minimal content, "coming soon" language | Pre-Launch |
| Pricing page exists, few testimonials, basic content | Early Stage |
| Multiple testimonials, blog, docs, case studies | Growth |
| Enterprise page, large logo bar, compliance badges | Scale |
| Government/education pricing, SOC2, ISO badges | Enterprise |

**Visitor Intent Inference Rules:**

| Website Type | Primary Visitor Intent |
|---|---|
| SaaS | Evaluate software, compare alternatives, start trial |
| Creator | Consume content, learn, subscribe, purchase course |
| Ecommerce | Find product, compare prices, purchase |
| Agency | Evaluate capabilities, see portfolio, request proposal |
| Marketplace | Browse listings, compare options, transact |
| Portfolio | View work, assess skills, contact for hire |
| LocalBusiness | Find location, check hours, call, book appointment |
| Blog | Read content, subscribe, share |
| Community | Join discussions, find resources, connect with peers |
| Nonprofit | Learn about mission, donate, volunteer |

## Context Resolution Rules

When the classifier says `SaaS` but the understanding says `monetization: "Ad-Supported"`:

```
IF websiteType conflicts with monetizationModel:
  → Trust the classification for UI expectations
  → Trust the understanding for business impact calculations
  → Flag contextConflict = true
  → Reduce confidence on monetization-related recommendations by 30%
```

When the scraper data is incomplete:

```
IF scrapeQuality < 0.5:
  → Mark all context dimensions as "inferred" not "confirmed"
  → Reduce confidence on all recommendations by 40%
  → Add explicit disclaimer in report
```

## Context Influence Map

```
                    ┌─────────────┐
                    │ Website Type │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
     ┌────────────┐ ┌───────────┐ ┌──────────┐
     │ Knowledge  │ │ Relevance │ │ Expected │
     │ Model      │ │ Weights   │ │ Visitor  │
     │ Selection  │ │           │ │ Journey  │
     └────────────┘ └───────────┘ └──────────┘

                    ┌──────────────┐
                    │ Business     │
                    │ Model        │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
     ┌────────────┐ ┌───────────┐ ┌──────────┐
     │ Revenue    │ │ Impact    │ │ Priority │
     │ Impact     │ │ Dimension │ │ Weight   │
     │ Calc       │ │ Weights   │ │ Tuning   │
     └────────────┘ └───────────┘ └──────────┘

                    ┌──────────────┐
                    │ Growth       │
                    │ Stage        │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
     ┌────────────┐ ┌───────────┐ ┌──────────┐
     │ Roadmap    │ │ Quick Win │ │ Ambition │
     │ Horizon    │ │ vs Long   │ │ Level    │
     │            │ │ Term Mix  │ │          │
     └────────────┘ └───────────┘ └──────────┘
```

---

# Part 2 — Context Engine

## Purpose

The Context Engine resolves ambiguity before any recommendation is generated. It answers: **"Who is this business, and what does success look like for them?"**

## Context Dimensions

### Dimension 1: Website Type
Already classified. One of: SaaS, Creator, Ecommerce, Agency, Marketplace, Portfolio, Community, LocalBusiness, Blog, Nonprofit, Other.

### Dimension 2: Business Model

| Business Model | Description | Revenue Driver |
|---|---|---|
| B2B Subscription | Sells software/services to businesses monthly/annually | MRR growth, churn reduction |
| B2C Subscription | Sells to consumers on subscription | User acquisition, engagement |
| B2B Services | Sells project-based services to businesses | Lead generation, proposal conversion |
| B2C Services | Sells services to consumers (tutoring, consulting) | Booking rate, repeat business |
| Product Sales | Sells physical or digital products | AOV, conversion rate, repeat purchase |
| Marketplace Commission | Connects buyers/sellers, takes a cut | Listing volume, GMV |
| Ad-Supported | Monetizes through advertising | Traffic volume, engagement |
| Freemium | Free tier → paid upgrade | Free-to-paid conversion rate |
| Donation | Relies on donations/grants | Donor acquisition, retention |
| Lead Generation | Generates leads for offline conversion | Form submissions, call volume |
| Content Monetization | Sells courses, memberships, downloads | Email list, conversion rate |

### Dimension 3: Target Audience

| Audience Type | Expectations | Trust Signals They Value |
|---|---|---|
| Enterprise Buyers | Professional, compliant, stable | SOC2, case studies, SLAs |
| SMB Owners | Simple, affordable, fast | Testimonials, pricing clarity, quick setup |
| Developers | Technical, documented, fast | GitHub stars, API docs, performance |
| Consumers | Easy, visual, trustworthy | Reviews, return policy, social proof |
| Creative Professionals | Beautiful, inspiring, portfolio-quality | Design quality, client logos, awards |
| Students/Educators | Affordable, educational, accessible | Free tiers, educational discounts |
| Local Customers | Nearby, available, contactable | Address, phone, hours, Google reviews |

### Dimension 4: Growth Stage

| Stage | Characteristics | Priority Focus |
|---|---|---|
| Pre-Launch | Coming soon, waitlist, minimal content | Email capture, messaging validation |
| Early Stage | Live product, few customers, basic site | First conversions, trust building |
| Growth | Traction, expanding, investing in marketing | Conversion optimization, scaling |
| Scale | Established, large customer base | Efficiency, enterprise, retention |
| Enterprise | Mature, complex buying process | Compliance, integration, process |

### Dimension 5: Visitor Intent

Inferred from website type + business model. Determines what "success" means for a single page visit.

| Visitor Intent | Success Metric |
|---|---|
| Evaluate Tool | Started trial or requested demo |
| Purchase Product | Added to cart or completed purchase |
| Consume Content | Read article, subscribed to newsletter |
| Hire/Contract | Submitted inquiry or viewed portfolio |
| Find Information | Found answer (location, hours, specs) |
| Join Community | Created account, joined discussion |
| Support Cause | Made donation, signed up to volunteer |

---

# Part 3 — Business Intelligence Engine

## Purpose

The Context Engine resolves *website type*. The Business Intelligence Engine resolves *business strategy*. A freemium developer tool and an enterprise compliance platform are both "SaaS" but need radically different websites.

## Business Profile Dimensions

### Dimension 1: Go-to-Market Motion

| Motion | Detection Signals | Website Implications |
|---|---|---|
| Product-Led Growth (PLG) | Free trial CTA, self-serve signup, no "Contact Sales", public pricing | Website IS the sales team. CTA clarity and onboarding are everything. |
| Sales-Led | "Request Demo", "Contact Sales", "Talk to an Expert", no public pricing | Website is a lead qualifier. Form optimization and credibility matter most. |
| Community-Led | Discord/Slack links, forums, open-source references, contributor pages | Website is an entry point. Community health signals and documentation matter. |
| Content-Led | Heavy blog, resource library, webinars, ebooks, SEO-optimized pages | Website is a content hub. SEO, email capture, and content quality dominate. |
| Hybrid | Mix of the above signals | Identify primary motion, apply secondary at 50% weight. |

**Detection Rules:**
```
IF "Start Free Trial" OR "Sign Up Free" detected AND public pricing exists
  → PLG
IF "Request Demo" OR "Contact Sales" OR "Book a Call" detected AND no public pricing
  → Sales-Led
IF Discord/Slack invite OR "Open Source" OR "Community" nav link prominent
  → Community-Led
IF blog has 20+ articles OR resource library exists OR "Webinar" detected
  → Content-Led
IF multiple signals from different motions
  → Hybrid (pick dominant by signal count)
```

### Dimension 2: Pricing Strategy

| Strategy | Detection Signals | Implications |
|---|---|---|
| Freemium | "Free plan", "Free forever", tier with $0 | Conversion optimization focuses on free-to-paid upgrade |
| Free Trial | "Start free trial", "14-day trial", "No credit card" | Conversion focuses on trial-to-paid, time pressure |
| Subscription | Monthly/annual pricing, "/mo" or "/year" | Focus on plan comparison, value communication |
| Usage-Based | "Pay as you go", "per API call", "per seat" | Focus on calculator/estimator, predictability messaging |
| One-Time | "$X one-time", "lifetime access", "buy now" | Focus on value justification, urgency, guarantees |
| Enterprise / Custom | "Contact for pricing", "Custom plan", "Enterprise" | Focus on credibility, security, compliance, ROI proof |
| Free / Open Source | No pricing, "MIT License", "Free and open" | Focus on documentation, community, sponsorship/support tiers |

### Dimension 3: Acquisition Model

| Model | Signals | Impact on Recommendations |
|---|---|---|
| Organic/SEO | Blog, content depth, keyword-rich headings | Prioritize SEO recommendations higher |
| Paid Ads | UTM parameters, landing page patterns, minimal nav | Prioritize conversion rate optimization |
| Referral/Word-of-Mouth | "Refer a friend", "Invite team", share mechanisms | Prioritize shareability and viral mechanics |
| Direct/Brand | Strong brand presence, minimal SEO investment | Prioritize brand consistency and trust |
| Partnership | Integration pages, "Partners", app store presence | Prioritize integration ecosystem messaging |

### Dimension 4: Competitive Position

| Position | Signals | Implications |
|---|---|---|
| Market Leader | "Used by X million", enterprise logos, press mentions | Recommendations focus on defending position, enterprise features |
| Challenger | Comparison pages, "vs [Competitor]", "Switch from" | Recommendations focus on differentiation messaging |
| Niche Player | Very specific audience language, specialized features | Recommendations focus on niche authority and depth |
| New Entrant | Few testimonials, "Just launched", minimal social proof | Recommendations focus on trust building and first customers |

**Detection heuristic:**
```
IF customer count > 10,000 OR enterprise logos ≥ 5 OR press mentions ≥ 3
  → Market Leader
IF comparison pages exist OR "vs" OR "alternative to" in content
  → Challenger
IF audience language is highly specific AND feature set is narrow
  → Niche Player
IF testimonials < 3 AND no usage metrics AND growthStage = "Early"
  → New Entrant
```

### Dimension 5: Business Maturity

| Maturity | Signals | Recommendation Style |
|---|---|---|
| Idea Stage | Coming soon, waitlist, concept language | "Validate your messaging before building features" |
| MVP | Basic site, minimal trust signals, early product | "Focus on your first 10 customers, not optimization" |
| Product-Market Fit | Growing testimonials, clear value prop, recurring users | "Now is the time to invest in conversion optimization" |
| Scaling | Hiring page, multiple products, enterprise tier | "Systematize your growth engine, reduce friction at scale" |
| Mature | Large team page, compliance, global presence | "Optimize for efficiency and defend market position" |

### Dimension 6: Revenue Model Sophistication

| Level | Signals | Impact |
|---|---|---|
| Pre-Revenue | No pricing, no payment integration, "free beta" | Don't recommend revenue optimization. Focus on value validation. |
| Early Revenue | Simple pricing, basic payment, few plans | Recommend pricing page improvements, plan clarity |
| Revenue-Optimized | Annual/monthly toggle, enterprise tier, usage calculator | Recommend advanced CRO: social proof near pricing, FAQ, guarantees |
| Revenue-Mature | Multiple products, add-ons, marketplace | Recommend cross-sell optimization, expansion revenue |

## Interaction with Existing Architecture

The Business Intelligence Engine feeds into the Context Engine. The resolved `BusinessContext` object gains six new fields. Downstream, these fields influence:

- **Knowledge Model weighting:** A PLG SaaS loads SaaS Knowledge Model but doubles the weight on self-serve conversion expectations
- **Impact scoring:** Revenue impact calculations adjust based on pricing strategy and revenue model sophistication
- **Recommendation language:** "You should add a demo booking form" vs "Your self-serve trial should be accessible without signup friction"
- **Prioritization:** Pre-revenue companies get different tier caps than scaling companies

## Edge Cases

| Edge Case | Handling |
|---|---|
| Open-source project with enterprise tier | Primary: Community-Led. Apply Enterprise pricing expectations at 50% weight. |
| Agency website that also sells a SaaS product | Flag as hybrid. Generate separate recommendation sets for each business line. |
| Marketplace with no pricing visible (takes commission) | Detect marketplace type. Don't penalize for "missing pricing page." |

---

# Part 4 — Website-Type Knowledge Models

Each Knowledge Model defines what an **excellent** website of that type looks like. These are the "consultant's mental model" made explicit.

## Model Structure

```
KnowledgeModel = {
  type:               WebsiteType
  description:        string
  expectations: {
    homepage:         Expectation[]
    navigation:       Expectation[]
    trustSignals:     Expectation[]
    conversionFlow:   Expectation[]
    content:          Expectation[]
    seo:              Expectation[]
    performance:      Expectation[]
    ux:               Expectation[]
    monetization:     Expectation[]
    contact:          Expectation[]
  }
  successMetrics:     Metric[]
  antiPatterns:       AntiPattern[]
  visitorJourney:     JourneyStage[]
  growthPriorities:   Priority[]
}
```

Each expectation has:
```
Expectation = {
  id:          "trust_testimonials"
  category:    "trust"
  description: "Customer testimonials or reviews"
  importance:  "critical" | "important" | "helpful" | "optional"
  weight:      0.0 – 1.0  (adjusted by BusinessContext)
}
```

## Knowledge Model: SaaS

### Homepage Expectations
| ID | Expectation | Importance |
|---|---|---|
| `saas_hero_value_prop` | Clear value proposition in hero (not a tagline, an outcome) | Critical |
| `saas_hero_cta` | Primary CTA above the fold (Start Free Trial / Get Started / Book Demo) | Critical |
| `saas_social_proof_above_fold` | Customer logos or "Trusted by X companies" near hero | Important |
| `saas_feature_overview` | 3-5 key features/benefits with icons or screenshots | Important |
| `saas_product_screenshot` | At least one product screenshot or demo video | Important |
| `saas_secondary_cta` | Secondary CTA after features section | Helpful |
| `saas_testimonial_section` | Customer testimonials with names, photos, companies | Important |
| `saas_final_cta` | Bottom-of-page CTA reinforcing the primary action | Helpful |

### Navigation Expectations
| ID | Expectation | Importance |
|---|---|---|
| `saas_nav_features` | "Features" or "Product" link | Critical |
| `saas_nav_pricing` | "Pricing" link | Critical |
| `saas_nav_login` | Login / Sign In link | Critical |
| `saas_nav_signup` | Sign Up / Get Started CTA (visually distinct) | Critical |
| `saas_nav_about` | About / Company link | Helpful |
| `saas_nav_blog` | Blog / Resources link | Helpful |
| `saas_nav_docs` | Documentation / Help link (for developer tools) | Important (conditional) |

### Trust Signals
| ID | Expectation | Importance |
|---|---|---|
| `saas_trust_logos` | Customer/partner logos | Important |
| `saas_trust_testimonials` | Named testimonials with role, company | Important |
| `saas_trust_case_studies` | At least one case study link | Helpful |
| `saas_trust_metrics` | Usage metrics ("10,000+ teams", "1M+ users") | Important |
| `saas_trust_security` | Security page or badges (SOC2, GDPR, encryption) | Important (Critical for Enterprise) |
| `saas_trust_uptime` | Uptime guarantee or status page link | Helpful |

### Conversion Flow
| ID | Expectation | Importance |
|---|---|---|
| `saas_conversion_free_trial` | Free trial or freemium available without credit card | Critical |
| `saas_conversion_pricing_page` | Clear pricing page with plan comparison | Critical |
| `saas_conversion_demo` | Demo request option (for enterprise-focused SaaS) | Important (conditional) |
| `saas_conversion_onboarding_hint` | Setup steps or "Get started in 3 steps" messaging | Helpful |
| `saas_conversion_annual_discount` | Annual plan discount visible | Helpful |

### Performance Expectations
| ID | Expectation | Threshold | Importance |
|---|---|---|---|
| `saas_perf_lcp` | LCP under 2.5s | 2500ms | Critical |
| `saas_perf_cls` | CLS under 0.1 | 0.1 | Important |
| `saas_perf_ttfb` | TTFB under 800ms | 800ms | Important |
| `saas_perf_score` | PageSpeed score ≥ 70 | 70 | Important |

### Anti-Patterns
| Anti-Pattern | Why It Hurts |
|---|---|
| No pricing page | Visitors cannot self-qualify; they leave |
| "Contact us for pricing" without self-serve option | Adds friction, loses SMB customers |
| Generic hero ("Welcome to our platform") | Fails to communicate value, increases bounce |
| No product screenshots | Visitors cannot visualize the product |
| Login button but no Sign Up CTA | Missing conversion opportunity |
| Only enterprise-focused with no free tier | Loses bottom-up adoption |

### Growth Priorities (ordered)
1. Conversion rate optimization (CTA clarity, pricing page)
2. Trust building (testimonials, case studies, security)
3. Content marketing (blog, SEO, thought leadership)
4. Performance optimization (speed, mobile)
5. Retention features (onboarding, help center)

---

## Knowledge Model: Creator

### Homepage Expectations
| ID | Expectation | Importance |
|---|---|---|
| `creator_hero_identity` | Clear personal brand (name, photo, tagline) | Critical |
| `creator_hero_what_i_do` | One sentence explaining what the creator does and for whom | Critical |
| `creator_email_capture` | Email signup / newsletter CTA above the fold | Critical |
| `creator_content_showcase` | Recent content (videos, articles, episodes) | Important |
| `creator_social_links` | Links to YouTube, Twitter, Instagram, etc. | Important |
| `creator_about_story` | Personal story or "About" section | Important |
| `creator_product_promotion` | Course, book, or product featured | Helpful |

### Trust Signals
| ID | Expectation | Importance |
|---|---|---|
| `creator_trust_follower_count` | Social proof via follower/subscriber counts | Important |
| `creator_trust_media_features` | "As seen in" media logos | Helpful |
| `creator_trust_testimonials` | Student/reader testimonials | Important (if selling products) |
| `creator_trust_credentials` | Bio, qualifications, experience | Helpful |

### Anti-Patterns
| Anti-Pattern | Why It Hurts |
|---|---|
| No email capture on homepage | Losing the highest-value conversion |
| Hidden personal identity | Creators ARE the brand; anonymity kills trust |
| No content on homepage | Visitors can't sample the creator's value |
| Too many CTAs competing | Dilutes the one action that matters (email signup) |

### Growth Priorities (ordered)
1. Email list growth (the creator's most valuable asset)
2. Content consistency and discoverability
3. Audience trust and personal brand
4. Product/course monetization
5. SEO and organic reach

---

## Knowledge Model: Ecommerce

### Homepage Expectations
| ID | Expectation | Importance |
|---|---|---|
| `ecom_hero_promotion` | Featured products, seasonal deals, or hero banner | Critical |
| `ecom_categories` | Product category navigation | Critical |
| `ecom_search` | Search bar prominently placed | Critical |
| `ecom_featured_products` | Product cards with images, prices, ratings | Critical |
| `ecom_trust_bar` | Free shipping, returns, payment methods | Important |

### Trust Signals
| ID | Expectation | Importance |
|---|---|---|
| `ecom_trust_reviews` | Product reviews with ratings | Critical |
| `ecom_trust_payment_badges` | Visa, Mastercard, PayPal, etc. | Important |
| `ecom_trust_return_policy` | Clear return/refund policy | Critical |
| `ecom_trust_shipping_info` | Shipping times and costs visible | Important |
| `ecom_trust_contact` | Contact info (phone, email, chat) | Important |
| `ecom_trust_secure_checkout` | SSL, secure checkout messaging | Important |

### Growth Priorities (ordered)
1. Conversion rate optimization (checkout friction, cart abandonment)
2. Trust signals (reviews, return policy, payment security)
3. Product discoverability (search, categories, filtering)
4. Average order value (upselling, bundles, free shipping threshold)
5. Retention (email marketing, loyalty programs)

---

## Knowledge Model: Agency

### Homepage Expectations
| ID | Expectation | Importance |
|---|---|---|
| `agency_hero_expertise` | Clear statement of expertise and who they serve | Critical |
| `agency_portfolio` | Case studies or portfolio showcasing work | Critical |
| `agency_services` | List of services with descriptions | Critical |
| `agency_client_logos` | Logos of notable clients | Important |
| `agency_team` | Team photos and bios | Helpful |
| `agency_cta_contact` | "Get in Touch" or "Request a Proposal" CTA | Critical |

### Trust Signals
| ID | Expectation | Importance |
|---|---|---|
| `agency_trust_case_studies` | Detailed case studies with results | Critical |
| `agency_trust_client_testimonials` | Client testimonials with names, companies | Critical |
| `agency_trust_awards` | Industry awards or certifications | Helpful |
| `agency_trust_process` | Described working process / methodology | Important |

### Growth Priorities (ordered)
1. Portfolio quality and case study depth
2. Lead generation (contact form optimization, lead magnets)
3. Thought leadership (blog, speaking, content)
4. Referral and repeat business
5. SEO for service keywords

---

## Knowledge Model: Marketplace

### Homepage Expectations
| ID | Expectation | Importance |
|---|---|---|
| `mkt_hero_browse` | Prominent search or browse entry point | Critical |
| `mkt_categories` | Category taxonomy visible | Critical |
| `mkt_featured_listings` | Featured/popular listings | Important |
| `mkt_seller_cta` | "Become a Seller" or equivalent | Important |
| `mkt_value_prop` | Clear two-sided value proposition | Important |

### Growth Priorities (ordered)
1. Liquidity (enough supply and demand)
2. Trust and safety
3. Search and discovery
4. Conversion optimization
5. Seller acquisition and retention

---

## Knowledge Model: Local Business

### Homepage Expectations
| ID | Expectation | Importance |
|---|---|---|
| `local_hero_service` | Clear statement of what the business does | Critical |
| `local_location` | Address prominently displayed | Critical |
| `local_phone` | Phone number prominently displayed (click-to-call on mobile) | Critical |
| `local_hours` | Business hours | Critical |
| `local_map` | Embedded Google Map or directions | Important |
| `local_booking` | Online appointment/reservation booking | Important |
| `local_photos` | Photos of location, team, or work | Important |

### Trust Signals
| ID | Expectation | Importance |
|---|---|---|
| `local_trust_google_reviews` | Google reviews or link to Google Business | Critical |
| `local_trust_testimonials` | Customer testimonials | Important |
| `local_trust_licenses` | Professional licenses or certifications | Important (conditional) |
| `local_trust_years` | Years in business | Helpful |
| `local_trust_insurance` | Insurance or bonding (for contractors) | Helpful (conditional) |

### Growth Priorities (ordered)
1. Local SEO (Google Business, local keywords, NAP consistency)
2. Contact accessibility (phone, booking, directions)
3. Reviews and reputation
4. Mobile optimization (most local searches are mobile)
5. Referrals and repeat business

---

## Knowledge Model: Portfolio

### Homepage Expectations
| ID | Expectation | Importance |
|---|---|---|
| `portfolio_hero_identity` | Name, role, one-line description | Critical |
| `portfolio_work_samples` | Work samples / project showcase | Critical |
| `portfolio_skills` | Skills or technologies listed | Important |
| `portfolio_contact` | Contact form or email | Critical |
| `portfolio_resume` | Resume/CV or experience section | Helpful |

### Growth Priorities (ordered)
1. Work quality and presentation
2. Contact accessibility
3. Personal brand and credibility
4. SEO for "[skill] + [location]" keywords
5. Networking (social links, GitHub, LinkedIn)

---

## Knowledge Model: Blog

### Homepage Expectations
| ID | Expectation | Importance |
|---|---|---|
| `blog_hero_latest` | Latest or featured articles | Critical |
| `blog_categories` | Content categories or topics | Important |
| `blog_search` | Search functionality | Helpful |
| `blog_email_signup` | Newsletter/email subscription | Critical |
| `blog_author_info` | Author bio and photo | Important |
| `blog_social_share` | Social sharing buttons on articles | Helpful |

### Growth Priorities (ordered)
1. Content quality and SEO
2. Email list growth
3. Reader engagement and retention
4. Monetization (ads, sponsorships, products)
5. Social distribution

---

## Knowledge Model: Community

### Homepage Expectations
| ID | Expectation | Importance |
|---|---|---|
| `community_value_prop` | Why join this community? | Critical |
| `community_join_cta` | Join / Sign Up CTA | Critical |
| `community_preview` | Preview of discussions or member content | Important |
| `community_member_count` | "X members" or activity stats | Important |
| `community_rules` | Community guidelines | Helpful |

### Growth Priorities (ordered)
1. Member acquisition
2. Engagement and retention
3. Content quality and moderation
4. Network effects and referrals
5. Monetization (if applicable)

---

## Knowledge Model: Nonprofit

### Homepage Expectations
| ID | Expectation | Importance |
|---|---|---|
| `nonprofit_mission` | Clear mission statement | Critical |
| `nonprofit_impact` | Impact numbers or stories | Critical |
| `nonprofit_donate_cta` | Prominent "Donate" button | Critical |
| `nonprofit_programs` | Programs or initiatives described | Important |
| `nonprofit_volunteer` | Volunteer opportunities | Helpful |
| `nonprofit_transparency` | Annual report, financials, or ratings | Important |

### Growth Priorities (ordered)
1. Donor acquisition and conversion
2. Storytelling and impact communication
3. Trust and transparency
4. Volunteer recruitment
5. Email list and recurring giving

---

# Part 5 — Customer Journey Intelligence

## Purpose

The V2 architecture evaluates dimensions (Performance, Trust, Clarity, Conversion) independently. But customers don't experience a website in dimensions. They experience it as a *journey*. A brilliant pricing page is worthless if visitors bounce before reaching it.

## Universal Journey Framework

```
┌────────────┐
│  ARRIVAL   │  Visitor lands on the page
│            │  Metric: Bounce rate proxy (time-to-interaction signals)
└─────┬──────┘
      ▼
┌────────────┐
│  ORIENT    │  Visitor understands what this is
│            │  Metric: Value proposition clarity, H1 quality
└─────┬──────┘
      ▼
┌────────────┐
│  INTEREST  │  Visitor wants to learn more
│            │  Metric: Content depth, feature communication
└─────┬──────┘
      ▼
┌────────────┐
│  TRUST     │  Visitor believes this is credible
│            │  Metric: Social proof, testimonials, security signals
└─────┬──────┘
      ▼
┌────────────┐
│  EVALUATE  │  Visitor compares options / assesses fit
│            │  Metric: Pricing clarity, comparison content, FAQ
└─────┬──────┘
      ▼
┌────────────┐
│  DECIDE    │  Visitor commits to taking action
│            │  Metric: CTA clarity, friction reduction, urgency
└─────┬──────┘
      ▼
┌────────────┐
│  CONVERT   │  Visitor completes the desired action
│            │  Metric: Form completion, signup flow, checkout
└─────┬──────┘
      ▼
┌────────────┐
│  VALIDATE  │  Visitor confirms they made the right choice
│            │  Metric: Confirmation messaging, onboarding hints
└────────────┘
```

### Stage Health Assessment

| Stage | Healthy Signals | Leak Signals |
|---|---|---|
| ARRIVAL | Fast LCP, no CLS, clear hero | Slow load, layout shift, confusing above-fold |
| ORIENT | Clear value prop, specific H1, audience identified | Vague tagline ("Welcome", "The Future of X"), no audience indication |
| INTEREST | Feature descriptions, screenshots, use cases | No content below fold, no product explanation |
| TRUST | Testimonials, logos, reviews, case studies, security | No social proof, anonymous site, no credibility markers |
| EVALUATE | Pricing page, comparison, FAQ, documentation | No pricing, no way to self-evaluate, "Contact us" only |
| DECIDE | Clear primary CTA, reduced friction, urgency elements | Competing CTAs, unclear next step, no urgency |
| CONVERT | Simple form, guest checkout, social login, progress indicators | Long forms, required account creation, surprise costs |
| VALIDATE | Confirmation page, next steps, onboarding preview | No feedback after action, dead-end thank you page |

### Journey Score

```
JourneyScore per stage = (healthySignals detected / healthySignals expected) × 100

Overall JourneyScore = weighted average of all stage scores
  Where weight decreases for later stages (earlier leaks are more damaging)

  Weights: ARRIVAL=1.0, ORIENT=0.95, INTEREST=0.85, TRUST=0.80,
           EVALUATE=0.70, DECIDE=0.65, CONVERT=0.60, VALIDATE=0.50
```

### Leak Detection

```
The "Weakest Stage" is the stage with the lowest JourneyScore.
This is the PRIMARY LEAK POINT.

Report output:
  "Your website's primary customer leak occurs at the [TRUST] stage.
   Visitors who understand your product cannot find evidence that
   other businesses trust you. Without this validation, they leave
   before ever evaluating your pricing."
```

### Type-Specific Journey Overrides

| Website Type | Journey Modification |
|---|---|
| SaaS | Full 8-stage journey. EVALUATE weighted highest (pricing is critical). |
| Ecommerce | EVALUATE splits into BROWSE → COMPARE → ADD-TO-CART. CONVERT = checkout. |
| Creator | Journey is shorter: ARRIVE → ORIENT → INTEREST → SUBSCRIBE. Trust is built over time via content, not a single visit. |
| Local Business | Journey is very short: ARRIVE → ORIENT → CONTACT. Trust via reviews. |
| Agency | EVALUATE = portfolio review. CONVERT = inquiry form. |
| Portfolio | ORIENT → INTEREST (view work) → CONVERT (contact). Only 3 meaningful stages. |

### Interaction with Pipeline

- Journey Intelligence runs after Gap Analysis (Stage 9 of pipeline)
- Each gap is tagged with its journey stage
- Gaps at earlier journey stages get higher priority multiplier
- The Premium Report gains a "Customer Journey Analysis" section with visual funnel

---

# Part 6 — Cross-Page Reasoning Engine

## Purpose

The system must not only analyze individual pages but reason about **coherence across pages**. A homepage that promises "Simple pricing" but links to a 47-row comparison table is a contradiction. A CTA that says "Start Free" but leads to a page requiring a credit card is a trust violation.

## Input

All scraped pages: homepage, pricing page, about page, features page, blog index, contact page, and any others captured by the scraper.

## Coherence Dimensions

### Dimension 1: Promise-Delivery Consistency

Does the homepage promise match what other pages deliver?

| Check | Example Violation |
|---|---|
| Hero promise → Pricing page | "Simple pricing" → Complex 5-tier comparison table |
| "Free trial" CTA → Signup page | CTA says "Free" → Signup requires credit card |
| "Built for startups" → Pricing | Startup messaging → Pricing starts at $500/mo |
| "Self-serve" positioning → Contact page | PLG messaging → Only path is "Contact Sales" |

### Dimension 2: Messaging Alignment

Is the value proposition consistent across pages?

| Check | Example Violation |
|---|---|
| Homepage H1 → About page | Homepage: "Project management" → About: "HR platform" |
| Homepage audience → Pricing audience | Homepage: "For developers" → Pricing: "Enterprise IT" |
| CTA text → CTA destination | "Start Free Trial" → Lands on demo booking form |

### Dimension 3: Navigation-Content Alignment

Do navigation labels match destination content?

| Check | Example Violation |
|---|---|
| Nav "Pricing" → No pricing on page | Nav links to pricing but page says "Contact for pricing" |
| Nav "Blog" → Empty or placeholder | Blog link exists but only has 1-2 placeholder posts |
| Nav "Documentation" → Broken or empty | Docs link leads to 404 or empty wiki |

## Output

```
CrossPageFinding = {
  type:        "promise_delivery" | "messaging_alignment" | "nav_content"
  severity:    "critical" | "high" | "medium" | "low"
  sourcePage:  string    // Where the promise/claim was made
  targetPage:  string    // Where the violation was observed
  description: string    // Human-readable explanation
  impact:      string    // Business impact of this inconsistency
}
```

## Severity Rules

| Severity | Criteria |
|---|---|
| Critical | CTA leads to contradictory experience (breaks trust at conversion point) |
| High | Homepage promise conflicts with pricing or product reality |
| Medium | Messaging drift between pages (different positioning language) |
| Low | Minor inconsistencies (tone shift, different terminology) |

## Report Output Example

```
"CROSS-PAGE INCONSISTENCY DETECTED

Your homepage positions your product as 'Built for growing startups'
with a prominent 'Start Free Trial' button. However, your pricing
page starts at $299/month with no free tier visible.

This creates a trust violation: visitors who self-identified as
startups (because your messaging told them to) arrive at a pricing
page that doesn't serve them. This mismatch likely causes significant
drop-off at the EVALUATE stage of your customer journey.

Recommendation: Either adjust your homepage positioning to match
your pricing (target mid-market instead of startups), or introduce
a free or low-cost tier that delivers on the startup promise."
```

---

# Part 7 — Root Cause Intelligence

## Purpose

Problems cluster around root causes. A confusing value proposition causes weak CTAs, unclear pricing language, generic testimonials, and unfocused content — all downstream symptoms of one root issue. A $500 consultant identifies root causes. A $50 tool lists symptoms.

## Known Root Cause Patterns

### Pattern 1: Unclear Value Proposition (Root)

```
Unclear Value Proposition
  ├─→ Weak hero messaging (vague tagline)
  ├─→ Generic CTA text ("Learn More", "Get Started" without context)
  ├─→ Feature-focused instead of outcome-focused content
  ├─→ Visitors can't self-qualify → high bounce
  ├─→ Pricing page feels disconnected from value → low conversion
  └─→ Testimonials feel generic (not tied to specific outcomes)
```

**Detection:** IF ≥3 of these symptoms are detected AND value proposition is scored LOW → flag as root cause

### Pattern 2: Missing Trust Foundation (Root)

```
Missing Trust Foundation
  ├─→ No testimonials → visitors can't validate
  ├─→ No customer logos → no authority by association
  ├─→ No case studies → no proof of results
  ├─→ No security badges → enterprise buyers blocked
  ├─→ Pricing page has high perceived risk → low conversion
  └─→ CTA conversion is low despite clear messaging
```

**Detection:** IF trust score < 40 AND conversion score > 50 AND clarity score > 50 → trust is the bottleneck

### Pattern 3: Conversion Friction Overload (Root)

```
Excessive Conversion Friction
  ├─→ CTA leads to long signup form
  ├─→ Required credit card for trial
  ├─→ No guest checkout (ecommerce)
  ├─→ Multiple steps before value delivery
  ├─→ "Contact Sales" as only path (for PLG audience)
  └─→ Visitors interested but abandoning at conversion point
```

**Detection:** IF trust score > 60 AND clarity score > 60 AND conversion score < 40 → friction is the root cause

### Pattern 4: Audience-Message Mismatch (Root)

```
Wrong Audience Targeting
  ├─→ Technical language for non-technical audience (or vice versa)
  ├─→ Enterprise positioning but SMB pricing
  ├─→ Consumer design but B2B offering
  ├─→ Content topics don't match visitor intent
  └─→ High traffic but low conversion (wrong people arriving)
```

**Detection:** IF detected audience signals conflict with detected content signals

### Pattern 5: Performance-Driven Abandonment (Root)

```
Poor Technical Performance
  ├─→ Slow LCP → visitors leave before seeing content
  ├─→ CLS → accidental clicks, frustration
  ├─→ Heavy page weight → mobile users bounce
  ├─→ All downstream metrics depressed
  └─→ Trust, clarity, and conversion all appear weak
       but the real issue is visitors never stayed long enough to engage
```

**Detection:** IF performance score < 40 AND all other dimensions are also low → performance may be masking true quality

## Root Cause Detection Algorithm

```
1. Collect all gaps from Gap Analysis
2. For each known Root Cause Pattern:
   a. Count how many of its symptoms appear in the gaps
   b. IF symptomMatchCount ≥ pattern.threshold:
      → Flag this root cause as DETECTED
      → Tag all matching gaps as SYMPTOMS of this root cause
3. IF a root cause is detected:
   → Promote root cause to Tier 1 priority
   → Demote individual symptoms by one tier
   → Present in report as causal chain
4. IF no root cause pattern matches:
   → Treat gaps as independent (default behavior)
```

## Edge Cases

| Edge Case | Handling |
|---|---|
| Multiple root causes detected | Present the one with the highest symptom count first. Note secondary root cause. |
| Symptoms match multiple root causes | Attribute to the root cause with higher overall match. Note ambiguity in confidence. |
| No root cause detected | Present findings independently. Not every site has a root cause problem. |

---

# Part 8 — Relationship Graph

## Purpose

Findings have lateral relationships. Fixing one issue can amplify or unlock the impact of another fix. Ignoring these relationships produces a report that feels like a disconnected checklist.

## Relationship Types

| Type | Definition | Example |
|---|---|---|
| **CAUSES** | A directly causes B | Slow performance → high bounce rate |
| **AMPLIFIES** | A makes B worse | Missing trust + weak CTA = compounding conversion loss |
| **BLOCKS** | A must be fixed before B matters | No pricing page → pricing CTA optimization is pointless |
| **ENABLES** | Fixing A unlocks the value of fixing B | Clear value prop → testimonials become more effective |
| **CONFLICTS** | Fixing A may worsen B | Adding urgency messaging may reduce trust perception |

## Graph Construction

```
FOR each pair of recommendations (A, B):
  CHECK against known relationship rules:

  CAUSES rules:
    - performance_slow CAUSES high_bounce
    - unclear_value_prop CAUSES weak_cta
    - no_pricing CAUSES evaluation_failure

  BLOCKS rules:
    - IF A = "add pricing page" AND B = "optimize pricing page layout"
      → A BLOCKS B
    - IF A = "clarify value proposition" AND B = "improve CTA copy"
      → A ENABLES B

  AMPLIFIES rules:
    - IF A.category = "trust" AND B.category = "conversion"
      → A AMPLIFIES B (trust issues make conversion issues worse)

  CONFLICTS rules:
    - IF A suggests "add urgency" AND B suggests "build long-term trust"
      → Potential CONFLICT (note trade-off)
```

## Impact on Prioritization

- If A **BLOCKS** B → A must be scheduled before B. B gets a dependency penalty.
- If A **ENABLES** B → Schedule together for compounding value.
- If A and B **CONFLICT** → Present the trade-off explicitly. Let the business decide.

---

# Part 9 — Business Impact Engine

## Impact Scoring Model

Every gap is scored across six dimensions, each weighted by BusinessContext.

### Dimension Definitions

| Dimension | Definition | Example |
|---|---|---|
| Revenue Impact | How directly does this affect money? | Missing pricing page blocks purchase decisions |
| Trust Impact | Does this make visitors doubt credibility? | No testimonials reduces perceived reliability |
| Conversion Impact | Does this prevent the desired action? | Broken CTA prevents trial signups |
| SEO Impact | Does this hurt discoverability? | Missing meta descriptions reduce click-through |
| UX Impact | Does this frustrate or confuse visitors? | High CLS causes accidental clicks |
| Growth Impact | Does this limit future scaling? | No blog limits organic acquisition |

### Dimension Weights by Website Type

| Dimension | SaaS | Creator | Ecom | Agency | Local | Portfolio |
|---|---|---|---|---|---|---|
| Revenue | 0.25 | 0.15 | 0.30 | 0.20 | 0.15 | 0.10 |
| Trust | 0.20 | 0.20 | 0.25 | 0.30 | 0.25 | 0.15 |
| Conversion | 0.25 | 0.25 | 0.25 | 0.20 | 0.20 | 0.20 |
| SEO | 0.10 | 0.15 | 0.10 | 0.10 | 0.25 | 0.15 |
| UX | 0.10 | 0.10 | 0.05 | 0.10 | 0.10 | 0.25 |
| Growth | 0.10 | 0.15 | 0.05 | 0.10 | 0.05 | 0.15 |

### Impact Score Calculation

```
For each gap G:
  rawScore(dimension) = severityOfGap(G, dimension)  // 0-10
  weightedScore = rawScore × dimensionWeight[websiteType]

overallImpact = sum(weightedScore for all dimensions) × 10  // normalized to 0-100
```

### Severity Heuristics

| Gap Severity | Score | Criteria |
|---|---|---|
| Critical | 9-10 | Core expectation entirely missing. E.g., SaaS with no CTA |
| High | 7-8 | Important expectation missing or seriously flawed |
| Medium | 4-6 | Expectation partially met or below standard |
| Low | 2-3 | Minor issue, nice-to-have improvement |
| Informational | 0-1 | Observation only, no action needed |

## Effort Estimation Model

| Effort Level | Hours | Typical Owner | Examples |
|---|---|---|---|
| Trivial | < 1h | Anyone | Fix a typo, add alt text, update meta description |
| Small | 1-4h | Developer/Designer | Add testimonial section, fix CTA text, add logo bar |
| Medium | 1-3 days | Developer | Add pricing page, implement contact form, fix performance |
| Large | 1-2 weeks | Team | Redesign homepage, build case study template, add blog |
| Major | 1+ months | Team | Rebuild conversion funnel, rebrand, new content strategy |

## ROI Score

```
ROI = (Impact Score × Confidence) / Effort Score

Where:
  Impact Score:  0-100
  Confidence:    0.0-1.0
  Effort Score:  1 (Trivial) to 10 (Major)
```

---

# Part 10 — Revenue Intelligence

## Purpose

Business owners don't think in "trust scores." They think in dollars. Translating findings into estimated revenue impact makes the report 10x more valuable.

## Important Constraint

SiteCheck does NOT have access to actual traffic data, revenue, or analytics. All estimates must be:
- Expressed as **ranges**, never point estimates
- Labeled as **estimates based on industry benchmarks**
- Accompanied by **confidence levels**
- Qualified with **assumptions stated explicitly**

## Traffic Proxy

| Signal | Traffic Estimate |
|---|---|
| No ranking signals, minimal social presence | Tier 1: < 1K monthly visitors |
| Some social presence, blog exists, basic SEO | Tier 2: 1K–10K monthly visitors |
| Active blog, strong SEO signals, multiple social channels | Tier 3: 10K–100K monthly visitors |
| Enterprise customer logos, press coverage, marketplace | Tier 4: 100K+ monthly visitors |

## Conversion Rate Benchmarks

| Website Type | Industry Avg Conversion Rate | Top Quartile |
|---|---|---|
| SaaS (trial signup) | 2-5% | 7-10% |
| Ecommerce (purchase) | 1-3% | 4-6% |
| Agency (inquiry) | 3-7% | 8-15% |
| Creator (email signup) | 2-5% | 6-12% |
| Local Business (call/book) | 5-10% | 12-20% |

## Revenue Impact Formula

```
FOR each high-impact recommendation:
  estimatedTraffic = trafficTier.midpoint
  currentConversionEstimate = industryAvg for websiteType
  expectedImprovement = recommendation.expectedImprovementRange
  averageValue = estimated from pricingStrategy (or industry avg)

  monthlyImpact = estimatedTraffic × currentConversion × expectedImprovement × averageValue

  Express as range:
    lowEstimate  = conservative assumptions
    highEstimate = optimistic assumptions
```

## Revenue Leakage Model

```
FOR each journey stage with score < 60:
  leakPercentage = (60 - stageScore) / 100
  leakedVisitors = estimatedTraffic × leakPercentage
  leakedRevenue  = leakedVisitors × conversionRate × averageValue

Report: "We estimate your TRUST stage leak costs approximately
$X–$Y per month in lost conversions."
```

---

# Part 11 — Benchmark Intelligence

## Purpose

When a report says "your trust score is 45/100," the business owner asks: "Is that bad? Compared to what?" Without benchmarks, scores are meaningless numbers.

## Benchmark Ranges by Website Type

| Dimension | SaaS | Creator | Ecom | Agency | Local | Portfolio |
|---|---|---|---|---|---|---|
| Performance | 65–85 | 60–80 | 55–75 | 70–90 | 50–70 | 70–90 |
| Trust | 60–80 | 50–70 | 65–85 | 70–90 | 55–75 | 40–60 |
| Clarity | 55–75 | 60–80 | 50–70 | 60–80 | 45–65 | 55–75 |
| Conversion | 50–70 | 45–65 | 60–80 | 50–70 | 40–60 | 35–55 |

## Growth Stage Benchmarks

| Stage | Expected Overall Score Range |
|---|---|
| Pre-Launch | 25–45 (low is normal) |
| Early Stage | 35–55 |
| Growth | 50–75 |
| Scale | 65–85 |
| Enterprise | 75–95 |

## Percentile Positioning

```
IF score ≥ typeRange.high → "Top 25% for [websiteType]"
IF score within typeRange  → "Average for [websiteType]"
IF score ≤ typeRange.low  → "Below average for [websiteType]"
```

## Benchmark Confidence

All benchmarks must carry a disclaimer:

```
"Benchmarks are based on SiteCheck's analysis of typical [websiteType]
websites and industry research. They represent general expectations,
not statistically validated sample sets. Use as directional guidance."
```

---

# Part 12 — Confidence Framework

## Confidence Dimensions

| Dimension | Definition | Measurement |
|---|---|---|
| Evidence Quality | How strong is the supporting evidence? | Direct detection > Inference > Assumption |
| Data Completeness | How much of the page did we successfully scrape? | scrapeQuality score (0-1) |
| Classification Certainty | How confident are we in the website type? | classificationConfidence (0-1) |
| Signal Corroboration | Do multiple signals agree? | Number of supporting signals |
| Understanding Depth | How well did we understand the business? | Count of resolved vs "Unknown" fields |

## Composite Confidence Score

```
Confidence = (
  evidenceQuality     × 0.30 +
  dataCompleteness    × 0.20 +
  classificationCert  × 0.20 +
  signalCorroboration × 0.15 +
  understandingDepth  × 0.15
)
```

## Confidence Thresholds

| Level | Score | Behavior |
|---|---|---|
| HIGH | ≥ 0.75 | Present recommendation with full confidence |
| MEDIUM | 0.50 – 0.74 | Present recommendation with caveat |
| LOW | 0.30 – 0.49 | Present as "potential issue" with explanation of uncertainty |
| INSUFFICIENT | < 0.30 | DO NOT recommend. Say: "We could not reliably assess [X] due to [reason]." |

## Evidence Quality Scale

| Level | Description | Examples |
|---|---|---|
| Direct (1.0) | Signal was directly detected in the HTML/DOM | Pricing page link found in navigation |
| Inferred (0.6) | Signal was reasonably inferred from other data | No pricing link found → inferred missing pricing page |
| Assumed (0.3) | Signal is assumed based on website type norms | SaaS should have docs → assumed missing if not found |
| Unknown (0.0) | Cannot determine | Page failed to load, JS-rendered content not captured |

## When SiteCheck Should Say "I Don't Know"

| Situation | Response |
|---|---|
| scrapeQuality < 0.4 | "Our analysis may be incomplete because we could not fully load this website." |
| classificationConfidence < 0.5 | "We are not fully confident in our understanding of this website's type." |
| More than 3 Understanding fields are "Unknown" | "We could not fully understand this business. Some recommendations are based on general best practices." |
| Contradictory signals detected | "We detected conflicting signals. Our recommendations account for this ambiguity." |

## False Positive Prevention

| Common False Positive | Prevention Rule |
|---|---|
| "Missing testimonials" on a pre-launch site | IF growthStage = "Pre-Launch" → demote to "future consideration" |
| "Missing pricing" on a free tool | IF monetization = "Free/Open Source" → suppress |
| "Missing phone number" on a SaaS | IF websiteType = "SaaS" → relevanceWeight = 0 → suppress |
| "Poor CTA" when CTA is intentionally minimal | IF websiteType = "Portfolio" AND cta is "Contact me" → accept as valid |
| "Missing blog" on an ecommerce site | IF websiteType = "Ecommerce" → demote to "optional growth channel" |

---

# Part 13 — Message Consistency & Contradiction Detection

## Purpose

Beyond cross-page structural coherence (Part 6), this system detects **semantic contradictions** in the website's messaging — promises that conflict with reality, CTAs that mislead, and positioning that doesn't match pricing.

## Contradiction Types

| Type | Description | Severity |
|---|---|---|
| **CTA-Destination Mismatch** | CTA text promises X, destination delivers Y | Critical |
| **Price-Position Mismatch** | "Built for startups" but pricing starts at $500/mo | High |
| **Audience-Language Mismatch** | Claims "simple" but uses dense technical jargon | High |
| **Feature-Reality Gap** | Nav lists "Documentation" but docs page is empty/404 | Medium |
| **Claim-Evidence Gap** | "Trusted by thousands" but only 2 testimonials visible | Medium |
| **Motion-Funnel Mismatch** | PLG messaging ("Start Free") but sales-led funnel (demo only) | Critical |
| **Tone Inconsistency** | Homepage is casual/friendly, pricing page is corporate/formal | Low |

## Detection Rules

```
FOR each CTA detected:
  IF cta.text contains "Free" AND destination requires credit card
    → FLAG: CTA-Destination Mismatch (Critical)
  IF cta.text contains "Start" AND destination is a contact/demo form
    → FLAG: Motion-Funnel Mismatch (Critical)

FOR hero messaging:
  IF hero contains "startup" OR "small business" OR "indie"
    AND pricing.lowestTier > $100/mo
    → FLAG: Price-Position Mismatch (High)

FOR claim validation:
  IF page contains "trusted by [N]" OR "[N] customers"
    AND detected testimonials < 3 AND detected logos < 3
    → FLAG: Claim-Evidence Gap (Medium)
```

## Report Presentation

Contradictions are surfaced as a dedicated section in the consultant report:

```
"MESSAGING CONTRADICTION DETECTED

Your homepage CTA says 'Start Your Free Trial' but the signup page
requires a credit card to proceed. This is one of the highest-trust
violations a website can make — you promised 'free' and immediately
asked for payment information.

Impact: Visitors who clicked with the expectation of a free,
no-commitment trial will abandon at the signup page. This creates
both lost conversions AND negative brand perception.

Severity: Critical
Fix: Either remove the credit card requirement from trial signup,
or change the CTA to 'Start Your Trial' (without 'Free')."
```

---

# Part 14 — Prioritization Framework

## Priority Tiers

```
┌─────────────────────────────────────────────────────┐
│ TIER 1: DO THIS TODAY                                │
│ Impact: High-Critical  |  Effort: Trivial-Small      │
│ ROI: Highest  |  Quick wins                          │
├─────────────────────────────────────────────────────┤
│ TIER 2: DO THIS MONTH                                │
│ Impact: High-Critical  |  Effort: Medium              │
│ ROI: High  |  Strategic improvements                 │
├─────────────────────────────────────────────────────┤
│ TIER 3: DO THIS QUARTER                              │
│ Impact: Medium-High  |  Effort: Large                 │
│ ROI: Moderate  |  Strategic projects                 │
├─────────────────────────────────────────────────────┤
│ TIER 4: BACKLOG                                      │
│ Impact: Low-Medium  |  ROI: Low                       │
│ Future considerations                                │
└─────────────────────────────────────────────────────┘
```

## Priority Score Formula

```
PriorityScore = (ImpactScore × ConfidenceMultiplier × RelevanceWeight)
                / (EffortScore + DependencyPenalty)
                + QuickWinBonus

Where:
  ImpactScore:          0-100 (from Impact Engine)
  ConfidenceMultiplier: 0.5-1.0 (LOW=0.5, MED=0.75, HIGH=1.0)
  RelevanceWeight:      0.0-1.0 (from Knowledge Model)
  EffortScore:          1-10 (Trivial=1 ... Major=10)
  DependencyPenalty:    0 or 2 (if blocked by another task)
  QuickWinBonus:        +15 if effort is Trivial AND impact ≥ Medium
```

## Tier Assignment

```
IF PriorityScore ≥ 70  → Tier 1 (Today)
ELSE IF ≥ 45           → Tier 2 (This Month)
ELSE IF ≥ 20           → Tier 3 (This Quarter)
ELSE                   → Tier 4 (Backlog)
```

## Sequencing Rules

1. **Dependencies first.** If B depends on A, A comes first.
2. **Quick wins first.** Within same dependency level, lower effort first.
3. **Higher confidence first.** Given equal effort and impact, prefer stronger evidence.

## Growth Stage Override

| Growth Stage | Tier 1 Max | Tier 2 Max | Focus |
|---|---|---|---|
| Pre-Launch | 3 | 3 | Don't overwhelm. Focus on messaging. |
| Early Stage | 5 | 5 | Focus on first conversions and trust. |
| Growth | 7 | 10 | Full optimization slate. |
| Scale | 5 | 7 | Focus on efficiency. |

If more items qualify than the max, demote lowest-scoring to the next tier.

---

# Part 15 — Recommendation Intelligence

## Recommendation Structure

Every recommendation MUST follow this structure:

```
Recommendation = {
  observation: {
    signalDetected:    string
    signalExpected:    string
    status:            "gap" | "weakness" | "anti-pattern"
  }
  businessContext: {
    whyItMatters:      string    // Business reasoning, not technical
    whoItAffects:      string    // "Enterprise buyers evaluating your tool"
    metricAffected:    string    // "Visitor-to-trial conversion rate"
  }
  impact: {
    revenueImpact:     "none" | "low" | "medium" | "high" | "critical"
    trustImpact:       "none" | "low" | "medium" | "high" | "critical"
    conversionImpact:  "none" | "low" | "medium" | "high" | "critical"
    seoImpact:         "none" | "low" | "medium" | "high" | "critical"
    uxImpact:          "none" | "low" | "medium" | "high" | "critical"
    overallImpact:     number   // 0-100
  }
  action: {
    title:             string
    description:       string
    implementationSteps: string[]
    suggestedCopy:     string?
    effort:            "trivial" | "small" | "medium" | "large" | "major"
    timeEstimate:      string
    owner:             "developer" | "designer" | "marketer" | "business"
  }
  confidence: {
    level:             "high" | "medium" | "low"
    evidence:          string[]
    assumptions:       string[]
    limitations:       string[]
  }
  expectedOutcome: {
    description:       string
    timeToImpact:      string
    successMetric:     string
  }
  priority: {
    score:             number
    tier:              "critical" | "high" | "medium" | "low" | "optional"
    quickWin:          boolean
    roadmapPhase:      "immediate" | "month1" | "quarter1" | "backlog"
  }
  // NEW: KPI Measurement (Part 18)
  measurement: {
    metric:            string
    baseline:          string
    target:            string
    trackingTool:      string
    trackingMethod:    string
    expectedTimeline:  string
    owner:             string
  }
  // NEW: Psychology annotation (Part 17)
  psychologyPrinciple: string?   // "Social Proof", "Risk Reversal", etc.
  // NEW: Journey stage (Part 5)
  journeyStage:        string?   // "TRUST", "EVALUATE", etc.
  // NEW: Relationship refs (Part 8)
  blocks:              string[]  // IDs of recommendations this blocks
  enabledBy:           string[]  // IDs of recommendations that enable this
}
```

## Context-Aware Recommendation Rules

### Relevance Matrix

| Recommendation | SaaS | Creator | Ecom | Agency | Mkt | Local | Portfolio | Blog | Community | Nonprofit |
|---|---|---|---|---|---|---|---|---|---|---|
| Add pricing page | ★★★ | ★ | ★★ | ★ | ★ | ○ | ○ | ○ | ○ | ○ |
| Add phone number | ○ | ○ | ★ | ★★ | ○ | ★★★ | ★ | ○ | ○ | ★ |
| Add testimonials | ★★ | ★★ | ★★★ | ★★★ | ★★ | ★★★ | ★ | ○ | ★ | ★★ |
| Email capture | ★★ | ★★★ | ★ | ★ | ★ | ○ | ○ | ★★★ | ★★ | ★★ |
| Product screenshots | ★★★ | ○ | ★★★ | ○ | ★★ | ○ | ○ | ○ | ○ | ○ |
| Case studies | ★★ | ○ | ○ | ★★★ | ○ | ○ | ★ | ○ | ○ | ★★ |
| Free trial CTA | ★★★ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ★ | ○ |
| Donate button | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ★★★ |
| Portfolio section | ○ | ○ | ○ | ★★★ | ○ | ○ | ★★★ | ○ | ○ | ○ |
| Business hours | ○ | ○ | ○ | ○ | ○ | ★★★ | ○ | ○ | ○ | ○ |

Legend: ★★★ = Critical, ★★ = Important, ★ = Helpful, ○ = Irrelevant

**If a recommendation scores ○ for the detected website type, it MUST NOT be generated.**

### Growth Stage Adjustment

| Growth Stage | Recommendation Style |
|---|---|
| Pre-Launch | Focus on messaging clarity and email capture. Do NOT recommend advanced optimization. |
| Early Stage | Focus on trust building and first conversions. Do NOT recommend enterprise features. |
| Growth | Full optimization: conversion, trust, content, performance. |
| Scale | Focus on efficiency, retention, and enterprise readiness. |

### Intentional Non-Recommendation

| Situation | Action |
|---|---|
| Signal is irrelevant to website type | Collect for "What We Did NOT Recommend" section |
| Signal is relevant but low-impact for this growth stage | Mention as "future consideration" |
| Signal is ambiguous (could be intentional design choice) | Note as observation, not recommendation |
| Confidence is below 0.3 | Suppress recommendation, note in debug |
| Signal contradicts another signal | Acknowledge conflict, reduce confidence |

---

# Part 16 — Opportunity Discovery Engine

## Purpose

The best consultants don't only fix problems — they discover *opportunities*. Problem-fixing has diminishing returns. Opportunity discovery has compounding returns.

## Opportunity Categories

### Category 1: Asset Leverage

| Detected Asset | Unlocked Opportunity |
|---|---|
| Blog with 20+ articles | → Create an ebook lead magnet compiling best posts |
| Active blog + no email capture | → Newsletter with existing content = recurring audience |
| Strong SEO rankings | → Create targeted landing pages to capture intent |
| YouTube channel linked | → Embed videos as social proof / product demos |
| Testimonials exist but buried | → Surface them on homepage + pricing page |
| Documentation exists | → Content marketing from docs (SEO value) |
| Team page with experts | → Thought leadership / speaking opportunities |

### Category 2: Missing Revenue

| Current State | Opportunity |
|---|---|
| Free tool, no paid tier | → Introduce premium tier for power users |
| Single product | → Bundle, add-on, or complementary product |
| No annual pricing | → Annual discount (improves cash flow, reduces churn) |
| No referral program | → Referral incentives for existing customers |
| High traffic, no email capture | → Newsletter → nurture → convert |

### Category 3: Competitive Gaps

```
IF websiteType = "SaaS" AND no comparison page detected:
  → Opportunity: "Create a '[You] vs [Competitor]' page.
     These pages rank highly for buyer-intent keywords."
```

### Category 4: Growth Channels

| Current Channels Detected | Untapped Channels |
|---|---|
| Only organic search | → Community building, partnerships |
| Only direct traffic | → SEO investment opportunity |
| No social presence | → Platform-specific content strategy |
| No integrations page | → App marketplace/integration listings |

## Opportunity Scoring

```
OpportunityScore = (
  potentialImpact × 0.35 +
  feasibility     × 0.25 +
  assetReadiness  × 0.25 +
  timeToValue     × 0.15
)
```

| Score | Label |
|---|---|
| ≥ 75 | "High-Value Opportunity — Strongly Recommended" |
| 50–74 | "Growth Opportunity — Worth Exploring" |
| 25–49 | "Future Opportunity — Consider When Ready" |
| < 25 | Suppress (too speculative) |

---

# Part 17 — Behavioural Psychology Layer

## Purpose

Websites convert (or fail to convert) because of human psychology. This layer explains *why* signals matter psychologically.

## The 8 Conversion Psychology Principles

| Principle | Definition | Website Signals |
|---|---|---|
| **Trust** | "Can I believe this is legitimate?" | SSL, testimonials, logos, contact info, security badges |
| **Authority** | "Are they credible experts?" | Credentials, media mentions, case studies, thought leadership |
| **Social Proof** | "Do other people use/approve this?" | User counts, reviews, testimonials, logo bars |
| **Clarity** | "Do I understand what this is?" | Clear H1, benefit-focused copy, simple navigation |
| **Cognitive Load** | "Is this easy to process?" | Clean design, visual hierarchy, scannable content |
| **Risk Reversal** | "What if I make the wrong choice?" | Guarantees, free trials, no-CC signup, return policies |
| **Urgency/Scarcity** | "Should I act now?" | Limited offers, countdown timers, stock indicators |
| **Reciprocity** | "They gave me value first" | Free tools, free content, lead magnets, freemium |

## Psychology Audit

```
FOR each PsychologyPrinciple:
  signals = detectSignals(principle, scrapedData)
  IF signals.count ≥ principle.threshold:
    status = "Addressed"
  ELSE IF signals.count > 0:
    status = "Partially Addressed"
  ELSE:
    status = "Not Addressed"
```

## Cognitive Load Assessment

```
Cognitive Load Score = f(
  numberOfCTAs,
  textDensity,
  navigationDepth,
  visualComplexity,
  competingActions
)
```

## Decision Friction Score

```
DecisionFrictionScore = countOf(
  requiredFields,
  mandatoryAccountCreation,
  hiddenPricing,
  requiredCreditCard,
  longProcessSteps,
  noGuarantee
)
```

## Interaction with Architecture

- Psychology tags are added to existing recommendations
- The Journey Intelligence layer gains psychology annotations per stage
- The Premium Report gains a "Conversion Psychology Audit" section

---

# Part 18 — KPI Measurement Framework

## Purpose

Every recommendation must tell the user HOW to measure whether the change worked. Without this, the user implements changes and has no idea if they succeeded. This is what separates a report from a consulting engagement.

## KPI Structure

Every recommendation gains a `measurement` field:

```
measurement = {
  metric:           "Trial signup rate"
  baseline:         "Measure current rate before implementing changes"
  target:           "15-25% improvement within 30 days"
  trackingTool:     "Google Analytics 4"
  trackingMethod:   "Set up a GA4 conversion event on your signup confirmation page"
  expectedTimeline: "Results visible within 2-4 weeks"
  owner:            "Marketing / Developer"
}
```

## KPI Templates by Recommendation Type

| Recommendation Category | Primary Metric | Tracking Tool | Method |
|---|---|---|---|
| Trust signal additions | Bounce rate on homepage | GA4 | Compare bounce rate before/after |
| CTA improvements | Click-through rate on CTA | GA4 Events | Track button click events |
| Pricing page changes | Pricing page → signup conversion | GA4 Funnel | Set up conversion funnel |
| Performance fixes | Core Web Vitals scores | PageSpeed Insights | Run before/after comparison |
| SEO improvements | Organic traffic + keyword rankings | Search Console | Monitor weekly for 60 days |
| Email capture additions | Email signup rate | Email platform (Mailchimp, etc.) | Track new subscribers per week |
| Testimonial additions | Time on page, scroll depth | GA4 | Compare engagement metrics |
| Content additions | Page views, session duration | GA4 | Monitor for 30 days |

## Report Integration

KPIs appear in two places:

1. **Per recommendation:** Each recommendation card shows its success metric
2. **30-Day Action Plan:** Each weekly task includes "How to verify this worked"

## Example Output

```
"SUCCESS MEASUREMENT

After adding customer testimonials to your homepage:
  Metric to track:  Homepage bounce rate
  Current baseline: Measure before making changes
  Target:           10-20% reduction in bounce rate
  How to track:     Google Analytics → Behavior → Site Content → Landing Pages
  Timeline:         Allow 2-3 weeks of traffic for meaningful comparison
  Owner:            Marketing team"
```

---

# Part 19 — Report Depth Resolver

## Purpose

A single-page portfolio and a 200-page enterprise SaaS should not receive the same report depth. The portfolio owner gets overwhelmed. The enterprise team gets a report that feels shallow.

## Complexity Classification

| Complexity | Signals | Report Adaptation |
|---|---|---|
| **Minimal** | Single page, < 5 nav links, portfolio or blog | Shorter report, 3-5 sections, simpler language, max 5 recommendations |
| **Standard** | 5-15 pages, clear structure, standard website | Full report, standard depth, 8-15 recommendations |
| **Complex** | 15+ pages, multiple products, enterprise features | Deeper report, section-level analysis, executive summary first, 12-20 recommendations |

## Adaptation Rules

### Section Count

| Complexity | Free Report Sections | Premium Report Sections |
|---|---|---|
| Minimal | 3-4 | 5-6 |
| Standard | 5-6 | 8-10 |
| Complex | 6-8 | 10-12 |

### Explanation Length

| Complexity | Insight Depth | Language Level |
|---|---|---|
| Minimal | 1-2 sentences per insight | Simple, practical |
| Standard | 2-3 sentences per insight | Professional, clear |
| Complex | 3-5 sentences per insight | Strategic, detailed |

### Recommendation Caps

| Complexity | Max Tier 1 | Max Total |
|---|---|---|
| Minimal | 2 | 5 |
| Standard | 5 | 12 |
| Complex | 7 | 20 |

## Detection

```
IF pageCount ≤ 1 AND navLinks < 5
  → Minimal
ELSE IF pageCount ≤ 15 AND products ≤ 1
  → Standard
ELSE
  → Complex
```

---

# Part 20 — Premium Report Intelligence

## Section Generation Framework

Each premium report section has defined inputs, logic, output structure, and quality gates.

### Section: Executive Summary

**Inputs:** Top 5 recommendations, overall scores, business context, key strengths
**Structure:**
```
1. "[Domain] is a [websiteType] targeting [audience] with [valueProposition]."
2. "Overall website health is [score]/100, which is [label] for a [websiteType] at [growthStage] stage."
3. "The strongest aspect is [topDimension] at [score], driven by [evidence]."
4. "The most significant opportunity is [topRecommendation.title]."
5. "This report identifies [N] prioritized improvements expected to improve [primaryMetric] by [range]."
```
**Quality Gate:** Requires classificationConfidence ≥ 0.5 and 3+ resolved understanding fields.

### Section: Business Risks

**Inputs:** Gaps with impact ≥ 70, anti-pattern matches
**Rules:** Top 5 risks sorted by severity. Each includes risk title, business reasoning, metric threatened, severity, and mitigation.

### Section: Growth Opportunities

**Inputs:** Quick wins + strengths to amplify + growth priority alignment
**Rules:** Top 5 opportunities ranked by expected ROI.

### Section: 30-Day Action Plan

**Inputs:** Tier 1 + Tier 2 recommendations
```
Week 1: Tier 1 items with effort = "Trivial" or "Small" (quick wins)
Week 2: Tier 1 items with effort = "Medium"
Week 3: Top Tier 2 items by priority score
Week 4: Remaining Tier 2 items + measurement setup
```

### Section: 90-Day Roadmap

```
Month 1: Tier 1 + Top Tier 2 (foundation fixes)
Month 2: Remaining Tier 2 + Top Tier 3 (strategic improvements)
Month 3: Remaining Tier 3 + Measurement + Iteration
```

### Section: Task Breakdown by Role

```
Developer Tasks:  WHERE owner = "developer" SORTED BY priority
Designer Tasks:   WHERE owner = "designer" SORTED BY priority
Marketing Tasks:  WHERE owner = "marketer" SORTED BY priority
Business Tasks:   WHERE owner = "business" SORTED BY priority
```

### Section: "Your Website in 60 Seconds" (Premium WOW)

A brutally honest first-impression assessment. What does a visitor experience in the first 60 seconds?

```
Second 0-3:   [LCP assessment]
Second 3-10:  [H1 assessment]
Second 10-20: [Social proof check]
Second 20-40: [CTA assessment]
Second 40-60: [Overall verdict]

Verdict: [STRONG/ADEQUATE/WEAK] first impression.
Your biggest 60-second risk: [specific issue]
```

### Section: Growth Bottleneck Analysis (Premium WOW)

Identifies the single biggest constraint on growth. One bottleneck with a causal explanation.

```
"YOUR #1 GROWTH BOTTLENECK
[Root cause or weakest journey stage]
This single issue is responsible for approximately [X]% of your total conversion loss.
If you fix nothing else from this report, fix this."
```

### Section: "If I Were Your Growth Advisor" (Premium WOW)

A 90-day personal growth strategy written as a consultant narrative, not a task list.

### Section: Messaging Audit (Premium WOW)

Line-by-line analysis of H1, value proposition, and CTAs with specific rewrite suggestions and rationale.

### Section: Competitive Positioning Map (Premium WOW)

2×2 matrix (Trust vs Conversion) showing where the business sits relative to benchmarks with strategic interpretation.

### Section: "What We Intentionally Did NOT Recommend" (Premium)

This section builds massive trust by proving the system understands the business.

**Inputs:** Items discarded by the Relevance Filter with reasoning

**Rules:**
```
FOR each discarded finding:
  IF finding.relevanceWeight = 0 AND finding would normally be "important":
    → Include in this section with explanation

LIMIT to top 5 most interesting non-recommendations
```

**Example Output:**
```
"WHAT WE CHOSE NOT TO RECOMMEND

• Missing phone number — Irrelevant. SaaS platforms don't
  convert via phone calls. Your visitors expect self-serve.

• No physical address — Irrelevant. Your audience evaluates
  software, not office locations.

• No blog — While a blog would help long-term SEO, at your
  pre-launch stage, your priority is messaging and first
  customers, not content marketing. Revisit in 6 months.

• No chatbot — We considered recommending live chat, but at
  your traffic level (estimated < 1K monthly visitors), the
  cost of maintaining chat support likely outweighs the benefit.
  Revisit when you reach 5K+ monthly visitors."
```

**Why this matters:** When a user sees that the system deliberately *chose* not to recommend something obvious (and explained why), they trust every recommendation that IS included. This is the difference between an intelligent advisor and a dumb checklist.

---

# Part 21 — Consultant Personality & Narrative

## Narrative Principles

### Principle 1: Lead with the Business, Not the Finding

```
BAD:  "Your website is missing testimonials."
GOOD: "Your target audience—enterprise engineering managers—requires third-party
       validation before entering a procurement cycle. Without visible customer
       testimonials or case studies, you're asking them to take a risk they're
       trained to avoid."
```

### Principle 2: Quantify When Possible

```
BAD:  "This will improve your conversion rate."
GOOD: "Based on industry benchmarks for B2B SaaS, adding visible customer logos
       and testimonials typically improves visitor-to-trial conversion by 15-30%."
```

### Principle 3: Acknowledge Strengths

```
"Your performance scores are excellent (92/100), placing you well above the
 industry average. This is a genuine competitive advantage."
```

### Principle 4: Connect the Dots

```
"Your CTA says 'Get Started' but your pricing page requires a sales call.
 This creates a jarring disconnect—your homepage promises self-service, but
 your funnel delivers enterprise sales friction."
```

## Personality Principles

### Adapt Tone to Business Maturity

| Business Maturity | Tone | Example |
|---|---|---|
| Pre-Launch / Idea | Encouraging, focused, gentle | "Your site is still early, so focus on messaging clarity. Everything else can wait." |
| Early Stage | Supportive, practical, prioritized | "You're building something real. Here are the 3 changes that will get you your first customers." |
| Growth | Direct, data-driven, strategic | "Your trust gap costs you an estimated $2K-5K/month. Here's the fix sequence." |
| Scale / Enterprise | Executive, metrics-focused, precise | "Conversion optimization at your traffic level has material P&L impact." |

### Lead with Strengths, Then Gaps

```
1. "Here's what you're doing well..." (genuine, specific)
2. "Here's where the biggest opportunity is..." (framed as opportunity, not failure)
3. "Here's exactly what to do about it..." (actionable, sequenced)
```

### Limit Overwhelm

| Growth Stage | Max Tier 1 Recommendations | Max Total Recommendations |
|---|---|---|
| Pre-Launch | 2 | 5 |
| Early Stage | 3 | 8 |
| Growth | 5 | 15 |
| Scale | 5 | 12 |

### Provide Escape Hatches

```
"We recommend adding customer testimonials. However, if you are
pre-launch and don't have customers yet, consider using beta tester
feedback, advisor endorsements, or founder credibility signals instead."
```

### Challenge Assumptions (Gently)

```
"OBSERVATION: Your website positions as 'The #1 [Category] Platform'
but has fewer than 5 visible customers. Bold claims without supporting
evidence can damage trust rather than build it."
```

### Celebrate Excellence

```
"STANDOUT: Your performance score of 94/100 places you in the top
5% of SaaS websites we've analyzed. This is a genuine competitive
advantage. Protect this asset as you grow."
```

## Narrative Voice Guidelines

| Aspect | Rule |
|---|---|
| Person | Second person ("Your website", "Your visitors") |
| Tense | Present tense for findings, future tense for recommendations |
| Jargon | Avoid technical jargon unless the audience is technical |
| Length | Short paragraphs (2-3 sentences max). Scannable. |
| Specificity | Always reference the actual detected evidence |
| Hedging | Use "likely", "typically", "based on benchmarks" for estimates |
| Empathy | Acknowledge that building a website is hard. Never condescend. |

## Tone Calibration by Website Type

| Website Type | Tone Adjustment |
|---|---|
| SaaS | Professional, metrics-oriented, strategic |
| Creator | Supportive, personal, growth-focused |
| Ecommerce | Transactional, conversion-focused, competitive |
| Agency | Peer-level, credibility-focused |
| Local Business | Practical, simple, actionable |
| Portfolio | Encouraging, career-focused |
| Nonprofit | Mission-aligned, impact-focused, resource-conscious |

## AI Prompt Strategy

For sections requiring AI narrative, the prompt to the AI model is structured as:

```
You are a senior growth consultant writing a website audit report.

CONTEXT:
- Website: [domain]
- Type: [websiteType]
- Business Model: [businessModel]
- Target Audience: [targetAudience]
- Growth Stage: [growthStage]

FINDINGS:
[Structured JSON of relevant findings, gaps, and strengths]

INSTRUCTIONS:
- Write as a consultant addressing the website owner directly
- Reference specific evidence from the findings
- Explain business impact, not just technical issues
- Be specific to this website type and audience
- Do NOT use generic advice
- Do NOT make up data not present in the findings
- Acknowledge uncertainties where confidence is low
- Keep paragraphs short and scannable
```

The AI is given **pre-analyzed, contextual data**, not raw signals. The reasoning has already happened. The AI's job is purely narrative synthesis.

---

# Edge Cases & Failure Modes

## Edge Cases

| Edge Case | Handling Strategy |
|---|---|
| **Multi-type website** (SaaS + Marketplace) | Use primary classification. Apply secondary type's Knowledge Model at 50% weight. Note in report. |
| **Pre-launch / Coming Soon** | Detect via keywords. Switch to Pre-Launch model. Limit recommendations to messaging, email capture, and positioning. |
| **Single-page website** | Reduce expectations. Many navigation and content expectations become irrelevant. Focus on hero, CTA, and trust. |
| **Non-English website** | Flag in confidence. Reduce understanding depth score. Apply same structural analysis but caveat text-based recommendations. |
| **Website behind login** | Scraper gets login page only. Set scrapeQuality very low. Generate minimal report with disclaimer. |
| **Extremely large website** | Scraper captures homepage only. Note limitation. |
| **Parked domain / Under construction** | Detect pattern. Return: "This domain does not appear to have an active website." |

## Failure Modes

| Failure Mode | Detection | Mitigation |
|---|---|---|
| **Misclassification** | Low classification confidence + understanding conflicts | Increase uncertainty. Add disclaimer. |
| **Scraper missed JS content** | Low content density despite rich site | Note in confidence. Suggest manual verification. |
| **AI hallucination in narrative** | AI invents data not in findings | Constrain AI prompt to ONLY reference provided findings JSON. Post-process to verify claims. |
| **Contradictory recommendations** | Two recommendations that conflict | Run conflict detection pass. Keep higher-priority one, note trade-off. |
| **Empty premium sections** | Not enough data | Quality gate: If section has < 2 substantive points, replace with honest message. NEVER generate filler. |
| **Over-recommendation** | Too many minor issues | Hard cap via Growth Stage Override and Report Depth Resolver. |

---

# Implementation Guidance

This architecture is designed to be implemented as a transformation of the existing `consultant-engine/index.ts` pipeline.

1. **Create `knowledge-models/`** with one file per website type (Part 4).
2. **Create `context-resolver`** module (Part 2 + Part 3).
3. **Create `expectation-engine`** — loads Knowledge Model, adjusts by BusinessContext.
4. **Create `gap-analyzer`** — compares signals vs expectations → Gaps, Strengths, Surprises.
5. **Create `journey-analyzer`** — tags gaps by journey stage, scores stage health (Part 5).
6. **Create `cross-page-analyzer`** — evaluates page-to-page coherence (Part 6).
7. **Create `root-cause-detector`** — matches symptom clusters to root cause patterns (Part 7).
8. **Create `relationship-mapper`** — builds CAUSES/BLOCKS/ENABLES graph (Part 8).
9. **Create `impact-scorer`** — scores gaps across 6 dimensions (Part 9).
10. **Create `revenue-estimator`** — translates impact to dollar ranges (Part 10).
11. **Create `benchmark-scorer`** — contextualizes scores against type/stage benchmarks (Part 11).
12. **Create `confidence-calculator`** — computes composite confidence (Part 12).
13. **Create `contradiction-detector`** — finds messaging inconsistencies (Part 13).
14. **Create `relevance-filter`** — filters irrelevant findings, collects non-recommendations (Part 15).
15. **Create `prioritizer`** — applies Priority Score formula, assigns tiers (Part 14).
16. **Create `recommendation-generator`** — produces full contextual recommendations (Part 15).
17. **Create `opportunity-finder`** — discovers growth opportunities (Part 16).
18. **Create `psychology-annotator`** — adds psychology tags to recommendations (Part 17).
19. **Create `kpi-generator`** — adds measurement definitions (Part 18).
20. **Create `depth-resolver`** — determines report complexity level (Part 19).
21. **Modify existing AI prompt** to receive pre-analyzed contextual data (Part 21).

The new pipeline wraps around (does not replace) the existing scoring and report generation. It provides richer, contextual inputs to the same output structures.

---

# Future Extensibility

## Extension Points

### New Website Types

To add a new type (e.g., "Government", "Education"):
1. Add a new Knowledge Model (Part 4)
2. Add a row to the Relevance Matrix (Part 15)
3. Add dimension weights to the Impact Engine (Part 9)
4. No changes to the reasoning pipeline itself

### New Signal Sources

To add a new data source (e.g., accessibility checker, SEO crawler):
1. Normalize output into typed signals (Stage 1)
2. Add corresponding expectations to relevant Knowledge Models
3. The rest of the pipeline handles it automatically

### Competitor Comparison

```
Input: Competitor URLs
Process: Run same pipeline on competitors
Output: Comparative gap analysis
```

Requires NO pipeline changes — just running the same analysis on multiple URLs and adding a comparison layer.

### Audit History / Progress Tracking

```
Input: Previous audit results for same domain
Process: Diff current gaps against previous gaps
Output: Progress report with improvement metrics
```

Requires storing previous audit snapshots (already supported by database).

### Analytics Integration (GA4, Search Console, Hotjar, Stripe)

```
Input: Real analytics data
Process: Replace estimated impact with actual metrics
Output: Data-driven recommendations with real numbers
```

### A/B Testing Recommendations

```
FOR each Tier 1 recommendation with confidence = "medium":
  Generate A/B test hypothesis
  Suggest control vs variant
  Define success metric
  Estimate required sample size
```

## Versioning Strategy

Knowledge Models should be versioned:
```
KnowledgeModel.version = "3.0"
KnowledgeModel.lastUpdated = "2026-06"
```

---

# Phase Mapping

## Already Complete (Phases 0-4)

| Module | Status |
|---|---|
| Website Scraping | ✅ Production |
| JavaScript Rendering | ✅ Production |
| PageSpeed Integration | ✅ Production |
| Website Classification | ✅ Production |
| Website Understanding | ✅ Production |
| Category Audits | ✅ Production |
| AI Report Generation | ✅ Production |
| Consultant Report | ✅ Production |
| Premium Report | ✅ Production |
| PDF Export | ✅ Production |
| Dashboard | ✅ Production |
| Authentication | ✅ Production |
| Payments | ✅ Production |
| Report Sharing | ✅ Production |

## Phase 5.1 — Core Intelligence (Build First)

| Module | Part | Priority |
|---|---|---|
| Context Resolver | Part 2 | P0 |
| Business Intelligence Engine | Part 3 | P0 |
| Knowledge Models (all 10 types) | Part 4 | P0 |
| Expectation Engine | Part 1 (Stage 6) | P0 |
| Gap Analyzer | Part 1 (Stage 8) | P0 |
| Impact Scorer | Part 9 | P0 |
| Confidence Calculator | Part 12 | P0 |
| Relevance Filter | Part 15 | P0 |
| Prioritizer | Part 14 | P0 |
| Recommendation Generator | Part 15 | P0 |

## Phase 5.2 — Analysis Depth (Build Second)

| Module | Part | Priority |
|---|---|---|
| Customer Journey Intelligence | Part 5 | P1 |
| Root Cause Intelligence | Part 7 | P1 |
| Relationship Graph | Part 8 | P1 |
| Cross-Page Reasoning | Part 6 | P1 |
| Message Consistency Detector | Part 13 | P1 |
| Benchmark Intelligence | Part 11 | P1 |

## Phase 5.3 — Premium Intelligence (Build Third)

| Module | Part | Priority |
|---|---|---|
| Revenue Intelligence | Part 10 | P2 |
| Opportunity Discovery | Part 16 | P2 |
| Psychology Layer | Part 17 | P2 |
| KPI Measurement Framework | Part 18 | P2 |
| Report Depth Resolver | Part 19 | P2 |
| Premium WOW Sections | Part 20 | P2 |
| Consultant Personality | Part 21 | P2 |
| "What We Did NOT Recommend" | Part 20 | P2 |

## Phase 6+ — Future

| Module | Priority |
|---|---|
| Competitor Comparison | P3 |
| Audit History / Progress Tracking | P3 |
| Analytics Integration (GA4, Search Console) | P3 |
| A/B Testing Recommendations | P4 |
| Multi-language Support | P4 |

---

> **End of Architecture Document**
>
> This document is the single source of truth for the Consultant Intelligence Engine. It combines the V2 base architecture, the Product Intelligence Addendum, and the final architecture review into one consolidated reference. An implementing engineer or AI should be able to build the entire system from this document without inventing additional reasoning logic.
