# SiteCheck AI — Master Project Document

## 1. Project Overview
SiteCheck AI is an "AI Website Growth Consultant" SaaS designed for small businesses, agencies, Shopify stores, freelancers, and non-technical website owners. It scans websites and translates technical issues (e.g., LCP, CLS, missing tags) into business-focused, consultant-style growth reports. The core value proposition is explaining website problems in plain English rather than developer jargon.

## 2. Tech Stack Explanation
*   **Framework**: Next.js 15 (App Router)
*   **Language**: TypeScript
*   **UI/Styling**: React 19, Tailwind CSS, customized UI components
*   **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Magic Links)
*   **Payments**: Razorpay
*   **AI/LLM**: Google Gemini 2.5 Flash
*   **Data Collection**: Cheerio (HTML scraping), Puppeteer-core (Screenshots), Google PageSpeed Insights API
*   **PDF Generation**: `@react-pdf/renderer`
*   **Email**: Resend

## 3. Architecture Explanation
The application employs a **deterministic anti-hallucination architecture**. It strictly separates data gathering and scoring from AI text generation to prevent the AI from inventing technical issues.
*   **Layer 1 (Data Collection)**: Scrapes HTML and queries PageSpeed.
*   **Layer 2 (Deterministic Scoring)**: Applies rigid logic rules to calculate 0-100 scores across Performance, Trust, Clarity, and Conversion. Outputs typed JSON findings.
*   **Layer 3 (AI Explanation)**: Gemini translates the JSON findings into a personalized, consultant-style report with prioritized quick wins based on the specific industry/page type.

## 4. Folder Structure
```text
sitecheck/
├── app/                  # Next.js App Router (pages, api routes)
├── components/           # Reusable UI components (landing, layout, report)
├── docs/                 # Documentation (including this file)
├── lib/                  # Core business logic
│   ├── audit/            # Layers 1, 2, and 3 logic
│   ├── email/            # Resend integration
│   ├── pdf/              # PDF report generation
│   ├── screenshot/       # Puppeteer visual capture
│   └── supabase/         # DB clients (server/browser)
├── supabase/migrations/  # PostgreSQL schema definitions
└── types/                # Centralized TypeScript definitions
```

## 5. Frontend Architecture
Built with Next.js React Server Components and Client Components.
*   **Scanning Flow (`/scan`)**: Animated UI reflecting the backend progression.
*   **Report View (`/report/[token]`)**: Server-rendered dynamic page for SEO and sharing. Implements Progressive Disclosure—Premium sections (Clarity, Conversion) are visually blurred and gated by a `PaymentModal` component for non-paying users.
*   **Dashboard**: Protected route fetching user history from Supabase.

## 6. Backend Architecture & API Flow
Next.js API routes act as the backend. The primary endpoints are:
*   `POST /api/audit`: The core pipeline. Normalizes the URL, checks Supabase for cached results (< 24h old), runs the 3-layer pipeline in parallel where possible, stores results in Supabase as JSONB, and returns a `shareToken`.
*   `GET /api/audit/[token]`: Retrieves a report from Supabase. Respects the `isPaid` flag to omit premium insights on the server side before returning to the frontend.
*   `POST /api/payment/create`: Initializes a Razorpay order.
*   `POST /api/payment/webhook`: Listens for Razorpay `payment.captured`, updates the `is_paid` flag in Supabase, unlocking the full report.

## 7. Audit Pipeline Explanation
1.  **Parallel Fetching**: `fetchPageSpeed(url)` and `scrapeUrl(url)` run concurrently. Optional screenshot capture runs alongside.
2.  **Extraction Intelligence (`scraper.ts`)**: Scraper uses deep semantic detection (e.g. `[role="button"]`, viewport detection, checking up to 50 links for high-intent verbs like "buy" or "book", parsing image `src` for payment gateways) to dramatically reduce false positives on modern React/Tailwind sites.
3.  **Contextual Scoring (`scorer.ts`)**: Pure functions process the scraped data and PageSpeed metrics. Scoring is **business-aware** (e.g. missing an address is a `high` severity deduction for a local business, but a `pass` for a SaaS company). The mathematical severity spread (`critical=40, high=20...`) ensures business blockers dominate the score. Findings are pre-sorted by severity before reaching the AI.
4.  **AI Report (`ai-report.ts`)**: Formats the `AuditScores` into a strict prompt. The prompt includes "INDUSTRY CONTEXT" and enforces **psychological framing** (explaining *why* things matter for conversions). Gemini responds with a strictly typed JSON structure (summary, narrative, quick wins).
5.  **Database Persistence**: The entire payload is saved in Supabase for fast subsequent retrieval.

## 8. AI System Explanation
*   **Model**: Google `gemini-2.5-flash` via `@google/genai` SDK.
*   **Anti-Hallucination**: The prompt instructs the AI: *"Only explain issues in the findings JSON. NO hallucinations"*. The structure is enforced via `responseMimeType: "application/json"`.
*   **Consultant Tone & Psychology**: The AI is instructed to avoid repetitive phrasing, fear tactics, or technical jargon. It uses nuanced, conditional phrasing for uncertainty (e.g. "We couldn't clearly identify..."). It actively applies **Positive Reinforcement** to acknowledge strengths and build emotional trust. The consultant summary follows a BLUF (Bottom Line Up Front) structure, surfacing the single biggest bottleneck first.
*   **Communication & Trust Flow Analysis**: The AI explicitly critiques the H1 value proposition for generic buzzwords vs clear differentiation. It also evaluates "Trust Flow"—identifying friction if a site asks for money/contact before providing social proof. Content density (wall of text vs thin content) is passed to the AI to evaluate cognitive overload.
*   **Prioritization Engine**: The AI strictly relies on the severity-sorted findings list (Critical -> Pass). It generates exactly 3 quick wins, providing a `whyItMatters` rationale using behavioral psychology hooks.
*   **Fallback Mechanism**: If the Gemini API fails or returns invalid JSON, a hardcoded industry-aware fallback function (`fallbackAIReport`) guarantees the user still gets a high-quality, premium report without crashing.

## 9. Database Schema Explanation
Hosted on Supabase (PostgreSQL).
*   **`user_profiles`**: Linked to `auth.users`. Tracks `plan` (free, pro) and audit quotas.
*   **`audits`**: The core table. Stores metadata (`domain`, `is_public`, `share_token`) and large `jsonb` payloads (`scores`, `scraped_data`, `ai_report`). This flattens the schema, preventing complex joins.
*   **`payments`**: Tracks Razorpay transaction IDs and statuses.
*   **`email_leads`**: Captures emails submitted on the home page for marketing drips.

## 10. Authentication Flow

*   **Provider**: Supabase Auth (Magic Links).
*   **Trigger**: `signInWithOtp()` is called in `app/login/page.tsx`.
*   **Callback**: Handled via Server Action / API Route (`app/auth/callback/route.ts`). Next.js exchanges the URL code for a secure session and redirects to `/dashboard`.
*   **Database Trigger (`on_auth_user_created`)**: When a user is successfully created in `auth.users`, a Postgres trigger fires to automatically insert a corresponding row into `public.user_profiles`.

### 10.1 Discovered Issues & Fixes
*   **Missing `search_path` Vulnerability (Fixed)**: 
    *   **Symptom**: `signInWithOtp()` failed with "Database error saving new user".
    *   **Root Cause**: Supabase Auth (GoTrue) executes user creation transactions with a heavily restricted `search_path` that excludes `public`. The custom trigger function `handle_new_user()` originally lacked an explicit `search_path` and used an unqualified table name (`insert into user_profiles`). PostgREST failed to find the table, crashing the transaction.
    *   **Fix Applied**: The function was redefined to explicitly `set search_path = public` and schema-qualify `public.user_profiles` according to Supabase security best practices.
*   Supabase Magic Links (passwordless authentication).
*   Next.js Middleware (`middleware.ts`) protects routes like `/dashboard` and manages session tokens.
*   Callback handled at `/auth/callback`.

## 11. Payment Flow
*   Freemium model: Free reports include Performance + Trust.
*   Users click "Unlock" -> `PaymentModal.tsx` opens.
*   Calls `/api/payment/create` -> Initializes Razorpay script on frontend.
*   User pays -> Razorpay Webhook hits `/api/payment/webhook`.
*   Webhook verifies signature, updates `audits.is_paid = true`.
*   Frontend polls or refreshes to display unblurred sections.

## 12. Environment Variables
Stored in `.env.local`:
*   `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
*   `SUPABASE_SERVICE_ROLE_KEY`
*   `GEMINI_API_KEY`
*   `PAGESPEED_API_KEY`
*   `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`
*   `NEXT_PUBLIC_APP_URL`
*   `RESEND_API_KEY`
*   `ENABLE_SCREENSHOTS` (Warning: keep false locally and on Vercel unless timeout/size limits are addressed)

## 13. Deployment Setup
*   **Platform**: Vercel (Next.js preset).
*   **Database**: Supabase.
*   **Critical Env Vars**: All above must be set in Vercel settings.
*   **Build command**: `npm run build`

## 14. Third-Party Services
*   **Vercel**: Hosting & Serverless Execution.
*   **Supabase**: Database & Auth.
*   **Google Gemini**: AI generation.
*   **Google PageSpeed**: Performance metrics.
*   **Razorpay**: Payments.
*   **Resend**: Transactional/marketing emails.

## 15. Current Implementation Status
*   **Core Audit Pipeline**: ✅ Completed
*   **Frontend UI & Animations**: ✅ Completed
*   **AI Integration**: ✅ Completed
*   **Database Schema**: ✅ Completed
*   **Local Dev Environment**: ⚠️ Requires Supabase configuration and API keys to fully function.

## 16. Feature List
*   Instant website scraping & PageSpeed analysis.
*   Deterministic scoring engine.
*   AI-generated consultant summaries & quick wins.
*   Visual gating of premium features.
*   Payment integration.
*   Report history dashboard.

## 17. Development Roadmap (Post-MVP)
*   [ ] PDF Export system integration.
*   [ ] Resend Email drip campaigns setup.
*   [ ] Before/After comparison logic.
*   [ ] Weekly monitoring alerts.
*   [ ] Screenshot visual analysis scaling.

## 18. Known Issues
*   **Scraping SPA Sites**: Single Page Applications might return empty bodies to Cheerio, resulting in false negatives for SEO/CTA checks.
*   **Vercel Function Size Limit**: If `puppeteer-core` is enabled, the 50MB serverless limit on Vercel could be breached.

## 19. Debugging Notes
*   If `/api/audit` hangs, check the Vercel logs for PageSpeed or Gemini timeouts.
*   If Razorpay webhooks fail, ensure `RAZORPAY_KEY_SECRET` is exactly matching the webhook signature secret in the Razorpay dashboard.

## 20. Deployment Notes
*   **ENABLE_SCREENSHOTS**: Should ideally be set to `false` on initial Vercel deployment to avoid timeout/OOM issues until a dedicated background queue is implemented.

## 21. Cost Optimization Notes
*   Reports for the same domain are cached for 24 hours. This cuts Gemini and PageSpeed API calls drastically.
*   Cheerio is used instead of Puppeteer for text extraction to save massive compute costs.

## 22. Future Architectural Decisions
*   *(Append future architectural shifts, database migrations, or library replacements here)*
