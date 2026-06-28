# System Architecture Guide

This document exclusively explains the system flow, data flow, architecture diagrams, pipeline stages, and interaction between modules for the SiteCheck repository.

## High-Level Data Flow

```mermaid
graph TD
    A[Frontend Client] -->|POST /api/audit| B(Next.js API Route)
    B --> C{Cache Check (Supabase)}
    C -->|Cached| D[Return Cached Report]
    C -->|Not Cached| E[Run Audit Pipeline]
    
    E --> F[1. Data Collection Scrapers]
    F --> G[2. Intelligence / Knowledge Models]
    G --> H[3. Consultant Engine]
    H --> I[4. Report Composer]
    I --> J[Save to DB & Return]
```

## System Knowledge Graph (The Audit Lifecycle)

This section describes the complete, stage-by-stage lifecycle of a single website audit.

### 1. Trigger
*   **Input**: User enters a URL in the UI.
*   **Action**: `POST /api/audit`
*   **Files**: `app/api/audit/route.ts`

### 2. Scraping & Data Collection
*   **Input**: Normalized URL.
*   **Action**: Concurrently fetches HTML and queries Google PageSpeed Insights.
*   **Output**: `RawScrapedData`, `PageSpeedData`
*   **Dependencies**: Cheerio, Google PSI API.
*   **Files**: `lib/audit/scraper.ts`, `lib/audit/pagespeed.ts`

### 3. Website Understanding
*   **Input**: `RawScrapedData` (HTML text, meta tags).
*   **Action**: Calls Gemini to semantically classify the website.
*   **Output**: `WebsiteUnderstanding` (Business Model, Audience).
*   **Dependencies**: `@google/genai`
*   **Files**: `lib/audit/website-understanding/index.ts`

### 4. Knowledge Models
*   **Input**: `WebsiteUnderstanding.businessModel`
*   **Action**: Loads the appropriate vertical-specific context block (e.g., SaaS expectations vs Ecommerce expectations).
*   **Output**: `BusinessContext`
*   **Files**: `lib/audit/consultant-engine/models/*`

### 5. Consultant Engine (Deterministic Reasoning)
*   **Input**: `RawScrapedData`, `PageSpeedData`, `BusinessContext`
*   **Action**: A sequential chain of TypeScript engines evaluates the data against the knowledge models to find gaps, root causes, opportunities, and calculate revenue impact.
*   **Output**: `ReasoningTraces` (A massive object containing all logical deductions).
*   **Files**: `lib/audit/consultant-engine/engines/*`

### 6. Validators
*   **Input**: `ReasoningTraces`
*   **Action**: Checks for logical contradictions and ensures sufficient evidence exists for the claims made. Drops low-confidence data.
*   **Output**: Validated `ReasoningTraces`
*   **Files**: `lib/audit/consultant-engine/validators/*`

### 7. Report Composer
*   **Input**: Validated `ReasoningTraces`, User `Plan` (Free/Pro).
*   **Action**: Passes the traces into a Topological Registry of Section Generators (e.g., Executive Summary, Roadmap). Generators format the logic into renderable structures.
*   **Output**: `ConsultantReport` (Array of `ReportSection` objects).
*   **Files**: `lib/audit/consultant-engine/report-composer/*`

### 8. Database Persistence
*   **Input**: `ConsultantReport`
*   **Action**: Saves the complete JSONB payload to PostgreSQL for caching and dashboard history.
*   **Output**: `shareToken`
*   **Dependencies**: Supabase.
*   **Files**: `app/api/audit/route.ts`

### 9. Frontend Rendering
*   **Input**: `shareToken`
*   **Action**: `GET /api/audit/[token]` retrieves the report. React components iterate over the `ReportSection` array to visually render metrics, timelines, and grids.
*   **Dependencies**: Next.js App Router, Tailwind CSS.
*   **Files**: `app/report/[token]/page.tsx`
