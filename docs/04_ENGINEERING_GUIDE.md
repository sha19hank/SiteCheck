# Engineering Guide & Developer Handbook

This is the definitive developer handbook for SiteCheck. It contains all repository conventions, engineering standards, and the comprehensive recursive map of the codebase.

## 1. Engineering Principles

Every code contribution must adhere to these rules:

*   **Deterministic First, AI Second:** Never rely on Large Language Models (LLMs) for pure logic or observation. Data must be deterministically collected (scrapers, APIs) and scored using hardcoded algorithms. AI is only used for semantic context extraction.
*   **Evidence Before Recommendation:** The system cannot generate a recommendation without a corresponding array of `evidence`. We never guess.
*   **Confidence Before Narration:** Every engine must emit a `confidence` score. If confidence falls below the threshold, omit the section gracefully.
*   **Modular Engines:** Engines do not mutate upstream data; they consume context and return typed results.
*   **Validators Over Hallucinations:** Always validate the output of reasoning engines.
*   **Explainability:** Reasoning traces must be preserved in the pipeline execution logs so developers can trace exactly *why* something was generated.

## 2. Contribution & Coding Conventions

*   **Naming Conventions:** Files should be `kebab-case.ts`. Classes should be `PascalCase`. Interfaces should describe the noun (`ReportSection`), not prefix with `I`.
*   **Testing Philosophy:** All deterministic engines in `lib/audit/consultant-engine/engines/` must be pure functions where possible, making them heavily unit-testable without network mocks.
*   **AI Usage Rules:** AI should only be called in `lib/audit/website-understanding` and for final prose generation. Do not put LLM calls inside the deterministic scoring engines.
*   **Backward Compatibility:** Do not introduce breaking changes to the `ConsultantReport` schema while a frontend consumes it.

## 3. How to Extend the System

*   **New Website Category:** Add a knowledge model to `lib/audit/consultant-engine/models/`. Add raw extraction rules to `lib/audit/category-audits/`.
*   **New Reasoning Engine:** Add the logic to `lib/audit/consultant-engine/engines/` and register it in the master orchestrator (`index.ts`).
*   **New Report Section:** Add a generator plugin to `lib/audit/consultant-engine/report-composer/sections/` and register it in `registry.ts`.
*   **New Validation Rule:** Add to `lib/audit/consultant-engine/validators/`.

---

## 4. Complete Recursive Repository Tree

This map traverses the actual repository and documents every subsystem.

### `sitecheck/app/`
*Purpose: Next.js App Router for frontend UI and API endpoints.*

*   **`page.tsx`**
    *   Purpose: Entry point for the marketing homepage.
    *   Dependencies: `components/landing`.
    *   Consumers: Vercel routing.
*   **`scan/page.tsx`**
    *   Purpose: Loading screen animation during long-running audits.
*   **`report/[token]/page.tsx`**
    *   Purpose: Dynamically renders the Consultant Report.
    *   Dependencies: Supabase, `components/report`.
*   **`(dashboard)/page.tsx`**
    *   Purpose: Protected route showing the user's past audits.
*   **`api/audit/route.ts`**
    *   Purpose: The core API orchestration endpoint.
    *   Inputs: POST request with `{ url }`.
    *   Outputs: JSON response with a `shareToken`.
    *   Dependencies: `lib/audit/index.ts`, `lib/supabase/server.ts`.
*   **`api/payment/create/route.ts`**
    *   Purpose: Initializes Razorpay orders for premium unlock.
*   **`api/payment/webhook/route.ts`**
    *   Purpose: Securely listens for successful payments and updates DB.

### `sitecheck/components/`
*Purpose: Reusable React visual elements.*

*   **`landing/UrlInput.tsx`**
    *   Purpose: Captures user input on the homepage and redirects to `/scan`.
*   **`report/PaymentModal.tsx`**
    *   Purpose: Obfuscates premium content until Razorpay confirms payment.
*   **`ui/*`**
    *   Purpose: Standard reusable Tailwind primitives (buttons, modals, cards).

### `sitecheck/docs/`
*Purpose: The single source of truth for architectural knowledge.*

*   **`01_CORE_PRODUCT_VISION.md`**: Why are we building it?
*   **`02_SYSTEM_ARCHITECTURE.md`**: How does data flow?
*   **`03_REASONING_ENGINE.md`**: How does the AI think?
*   **`04_ENGINEERING_GUIDE.md`**: How do engineers work inside this repository?
*   **`05_ROADMAP.md`**: Where is the project going?
*   **`06_DEPLOYMENT.md`**: How is it shipped?

### `sitecheck/lib/audit/`
*Purpose: The core orchestrator and data collection layer.*

*   **`index.ts`**
    *   Purpose: The master orchestrator (`runAudit`).
    *   Inputs: Raw URL.
    *   Outputs: `PipelineExecution` object containing the final `ConsultantReport`.
    *   Dependencies: scrapers, website-understanding, consultant-engine.
*   **`scraper.ts`**
    *   Purpose: Extracts DOM structure and text.
    *   Dependencies: Cheerio.
*   **`pagespeed.ts`**
    *   Purpose: Fetches Core Web Vitals.
    *   Dependencies: Google PSI API.
*   **`ai-report.ts` & `classifier.ts` & `scorer.ts`**
    *   Purpose: Legacy/utility wrappers for the V1 AI scoring logic (pending deprecation/refactor).

### `sitecheck/lib/audit/website-understanding/`
*Purpose: LLM context extraction layer.*

*   **`index.ts`**
    *   Purpose: Semantic classification of the website.
    *   Inputs: `RawScrapedData`.
    *   Outputs: `WebsiteUnderstanding` (Audience, Model).
    *   Dependencies: `@google/genai`.

### `sitecheck/lib/audit/category-audits/`
*Purpose: Vertical-specific rules for evaluating raw signals.*

*   **`agency.ts`, `blog.ts`, `community.ts`, `creator.ts`, `ecommerce.ts`, `local-business.ts`, `marketplace.ts`, `portfolio.ts`, `saas.ts`, `other.ts`**
    *   Purpose: Hardcoded extraction rules specific to each industry type (e.g., checking for cart icons in `ecommerce.ts`).

### `sitecheck/lib/audit/consultant-engine/`
*Purpose: The Brain. Converts raw data into business intelligence.*

*   **`index.ts`**
    *   Purpose: Chains the reasoning engines in sequence.
*   **`core/context-resolver.ts`**
    *   Purpose: Merges the LLM classification with actual scraped data to establish the final `BusinessContext`.

### `sitecheck/lib/audit/consultant-engine/models/`
*Purpose: Baseline expectations.*

*   **`saas.ts`, `ecommerce.ts`, `creator.ts`, `agency.ts`**
    *   Purpose: Defines the "perfect" mental model for what should exist on these sites (e.g., pricing page, clear hero).

### `sitecheck/lib/audit/consultant-engine/engines/`
*Purpose: Deterministic intelligence blocks.*

*   **`gap-analysis.ts`**: Finds deviations between expectations and signals.
*   **`root-cause.ts`**: Clusters gaps into structural flaws.
*   **`opportunities.ts`**: Finds high-leverage growth actions.
*   **`revenue-impact.ts`**: Translates gaps into dollar estimations.
*   **`psychology.ts`**: Analyzes cognitive friction.
*   **`cross-page.ts`**: Evaluates coherence between different pages.
*   **`benchmark.ts`**: Compares metrics against industry standards.
*   **`confidence-engine.ts`**: Calculates conviction level for claims.
*   **`depth-resolver.ts`**: Determines how long/complex the report should be based on data quality.
*   **`impact-engine.ts`**: Scores severity.
*   **`kpi-engine.ts`**: Establishes metrics for the user to track.
*   **`not-recommended-engine.ts`**: Explicitly states what actions the user should NOT take.
*   **`prioritization.ts`**: Ranks fixes by ROI.
*   **`relationship-graph.ts`**: Maps dependencies (e.g., "Fixing X enables Y").

### `sitecheck/lib/audit/consultant-engine/validators/`
*Purpose: Anti-hallucination layer.*

*   **`consistency-validator.ts`**: Drops contradictory recommendations.
*   **`completeness-validator.ts`**: Ensures sufficient evidence exists to generate a block of text.

### `sitecheck/lib/audit/consultant-engine/report-composer/`
*Purpose: Formats logical traces into visual JSON blocks.*

*   **`registry.ts`**
    *   Purpose: Sorts generator plugins topologically based on dependencies.
*   **`sections/`** (The UI generator plugins)
    *   `60-second-read.ts`
    *   `advanced-diagnostics.ts`
    *   `audit-snapshot.ts`
    *   `competitive-benchmark.ts`
    *   `executive-summary.ts`
    *   `growth-bottlenecks.ts`
    *   `messaging-audit.ts`
    *   `opportunity-discovery.ts`
    *   `roadmap.ts`
    *   `root-cause-analysis.ts`

### `sitecheck/lib/email/`
*   **`sender.ts`**: Uses Resend to send report notifications.

### `sitecheck/lib/pdf/`
*   **`generator.ts`**: Converts JSON report to PDF using `@react-pdf/renderer`.

### `sitecheck/lib/screenshot/`
*   **`capture.ts`**: Uses Puppeteer-core to capture visual representations of the site.

### `sitecheck/lib/supabase/`
*Purpose: Database connectivity.*

*   **`client.ts`**: Browser-side Auth/DB connections.
*   **`server.ts`**: Server-side secure DB queries.

### `sitecheck/supabase/migrations/`
*Purpose: PostgreSQL schemas.*

*   **`001_initial_schema.sql`**: The single source of truth for the DB schema, including RLS policies and Auth triggers.

### `sitecheck/types/`
*Purpose: System-wide typing.*

*   **`index.ts`**: Contains all critical interfaces (`ConsultantReport`, `ReportSection`, `PipelineExecution`). Consumers: Entire codebase.
