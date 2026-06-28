# SiteCheck Roadmap

This document outlines the future milestones for SiteCheck. All future development must align with the core vision: SiteCheck is an **AI Website Growth Consultant**. We do not build generic business advice tools.

## Phase 1: Deep Website Intelligence (Current Focus)

*   **UX Intelligence:** Evaluate cognitive load, visual hierarchy, and CTA placement context.
*   **Accessibility Intelligence:** Map WCAG contrast and structural issues directly to bounce rate and conversion penalties.
*   **Design Intelligence:** Evaluate brand consistency, whitespace usage, and typography legibility using visual parsing (Puppeteer/Vision models).
*   **Copy Analysis:** Implement NLP to measure reading grade level, jargon density, and "You vs. We" ratio in hero sections.

## Phase 2: Interaction & Dynamic Understanding

*   **Interaction Quality:** Measure the friction of form fields, dropdowns, and interactive calculators.
*   **Dynamic Page Understanding:** Support SPA (Single Page Application) rendering and authenticated state scraping for complex SaaS sites.
*   **Journey Mapping:** Follow links across the site to build a true funnel map (e.g., Homepage → Pricing → Signup) and evaluate the coherence of that exact path.

## Phase 3: Engine Refinement

*   **Better Knowledge Models:** Introduce new vertical models (e.g., Nonprofit, Higher Ed).
*   **Enhanced Recommendation Quality:** Move from "Add testimonials" to "Add a testimonial specifically addressing pricing anxiety near your checkout button."
*   **Testing:** Introduce a comprehensive Vitest test suite for all deterministic reasoning engines.

## Phase 4: Production Release

*   **Frontend Migration:** Complete the migration of the UI to consume the V2 `ReportSection` schemas.
*   **Public Launch:** Remove beta flags, implement Razorpay webhook handlers for live transactions, and scale Supabase caching layers.
