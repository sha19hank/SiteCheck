# The Reasoning Engine

This document explains exactly how SiteCheck thinks. It details the reasoning philosophy, the deterministic pipeline, and why every stage exists. This is the definitive architecture paper for the AI Consultant.

## 1. Reasoning Philosophy

SiteCheck operates on a **Deterministic First, AI Second** philosophy. 
If we feed raw signals (e.g., "missing phone number") directly into an LLM and ask for a recommendation, the output is generic. A real consultant does not jump from "problem" to "fix." They follow a disciplined reasoning chain.

The Consultant Intelligence Engine introduces a multi-layer reasoning stack. Every recommendation in the final report has passed through all layers. Nothing is generated directly from raw signals.

## 2. Deterministic Architecture Pipeline

The master pipeline executes sequentially. Every stage exists to add context, filter noise, or calculate impact.

### Stage 1: Raw Signals
Scrapers extract normalized signals (text, tags, Lighthouse metrics) from the URL.

### Stage 2 & 3: Context Engine & Website Understanding
Before rules apply, the LLM classifies the website (e.g., SaaS, Ecommerce) and extracts the Business Profile (Audience, Goal, Monetization). 
*Why it exists:* A missing phone number is critical for a local dentist but irrelevant for a PLG SaaS.

### Stage 4: Context Resolution
Merges classification and business intelligence into a unified `BusinessContext` object. Resolves conflicts (e.g., if the LLM thinks it's a SaaS but the pricing suggests a one-time product sale).

### Stage 5 & 6: Knowledge Models & Expectation Setting
Loads the appropriate vertical-specific Knowledge Model (e.g., `SaaS Knowledge Model`). These models define what an *excellent* website of that type looks like (the "consultant's mental model"). The engine then adjusts expectation weights based on the `BusinessContext`.

### Stage 7 & 8: Gap Analysis
Deterministically maps raw signals against the established expectations. Deviations are flagged as Gaps, Strengths, or Surprises.

### Stage 9: Customer Journey Intelligence
Tags gaps by journey stage (Arrival → Orient → Interest → Trust → Evaluate → Decide → Convert) and identifies the primary leak point.
*Why it exists:* Customers experience a website chronologically. A brilliant pricing page is worthless if visitors bounce at "Orient."

### Stage 10: Cross-Page Reasoning
Evaluates coherence across the homepage, pricing, and about pages.
*Why it exists:* To detect broken promises. A CTA saying "Start Free" that leads to a required credit card form is a trust violation.

### Stage 11 & 12: Root Cause Intelligence & Relationship Graphs
Clusters isolated symptoms into root causes and maps CAUSES, BLOCKS, or CONFLICTS relationships between findings.
*Why it exists:* To avoid giving the user a checklist of 50 minor UI tweaks when the real issue is an "Unclear Value Proposition."

### Stage 13 & 14: Impact Assessment & Revenue Intelligence
Scores each gap across dimensions (Revenue, Trust, UX) and translates that into estimated dollar ranges or conversion impact.

### Stage 15 & 16: Validation & Message Consistency
Checks for contradictions (e.g., recommending a price increase when the site has zero trust signals).

### Stage 17 & 18: Confidence Scoring & Relevance Filters
Applies the "I don't know" rules. If confidence is too low, the finding is discarded.

### Stage 19: Prioritization
Ranks remaining findings by ROI and dependencies.

### Stage 20: Recommendation Generation
Translates the logical traces into actionable, evidence-backed prose.

### Stage 21, 22, & 23: Report Composition
A Topological Registry of Section Generators (e.g., Executive Summary, Roadmap) dynamically assembles the final report based on plan tier.

## 3. Extension Points & Future Extensibility

To add intelligence to this engine, you do not rewrite the orchestrator. You hook into the specific layer:
*   **New Signals:** Update the Scraper.
*   **New Business Types:** Add a new `KnowledgeModel`.
*   **New Reasoning Logic:** Create a new step in the `engines/` directory (e.g., an `AccessibilityEngine`) and insert it into the pipeline before Prioritization.
*   **New Presentation:** Add a new `ReportSection` plugin to the composer.

This pipeline is designed to be highly modular. By isolating context from evaluation, and evaluation from presentation, we ensure that adding new intelligence never breaks existing logic.
