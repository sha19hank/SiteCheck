# SiteCheck

SiteCheck is an AI-powered Website Growth Consultant. It analyzes business websites, understands their purpose and audience, and provides deterministic, evidence-backed recommendations to improve usability, trust, and conversion.

## Product Vision

SiteCheck is **NOT** a generic business consultant. It is an **AI Website Growth Consultant.**
We don't tell businesses how to price their products or run their sales teams. We tell them exactly what is causing friction on their website, why visitors are leaving, and how to fix it.

Everything we recommend is backed by data.

## Features

- **Semantic Website Understanding:** Uses AI to identify the website's business model, target audience, and primary goals.
- **Deterministic Evaluation:** Maps raw scraped signals against vertical-specific knowledge models (e.g., SaaS vs Ecommerce expectations).
- **Customer Journey Intelligence:** Identifies where the primary leak exists in the visitor journey (Arrival → Orient → Interest → Trust → Evaluate → Decide → Convert).
- **Root Cause Analysis:** Groups isolated symptoms into underlying structural flaws.
- **Cross-Page Coherence:** Detects broken promises and messaging drift between the homepage, pricing, and about pages.

## Example Workflow

1. User submits `https://example.com`.
2. SiteCheck concurrently scrapes HTML and fetches Google PageSpeed metrics.
3. The LLM classifies the site (e.g., "B2B SaaS targeting HR professionals").
4. The Consultant Engine loads the "SaaS Knowledge Model".
5. The Engine deterministically compares the scraped signals against expectations (e.g., "Missing clear pricing CTA").
6. The Engine traces symptoms to root causes and calculates revenue impact.
7. The Report Composer structures the findings into a consultant-grade report.

## High-Level Architecture

SiteCheck operates on a strict **Deterministic First, AI Second** philosophy. AI is only used to extract semantic context or generate human-readable prose. All evaluation logic, impact scoring, and recommendation generation happen in deterministic TypeScript engines.

- **Frontend:** Next.js App Router, React Server Components.
- **Backend:** Next.js API Routes.
- **Database & Auth:** Supabase (PostgreSQL).
- **AI:** Google Gemini.

## Installation & Development Setup

1. Clone the repository.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and populate keys (Supabase, Gemini, PageSpeed, Razorpay).
4. Apply database migrations: `supabase db push`.
5. Start the server: `npm run dev`.

## Documentation Index

For exhaustive documentation on how SiteCheck works and how to contribute, refer to the `/docs` directory:

1. [Core Product Vision](./docs/01_CORE_PRODUCT_VISION.md) — Why are we building it?
2. [System Architecture](./docs/02_SYSTEM_ARCHITECTURE.md) — How does data flow?
3. [Reasoning Engine](./docs/03_REASONING_ENGINE.md) — How does the AI think?
4. [Engineering Guide](./docs/04_ENGINEERING_GUIDE.md) — How do engineers work here?
5. [Roadmap](./docs/05_ROADMAP.md) — Where is the project going?
6. [Deployment](./docs/06_DEPLOYMENT.md) — How is it shipped?

## Contribution

Please read the [Engineering Guide](./docs/04_ENGINEERING_GUIDE.md) before submitting pull requests. All new rules or metrics must be deterministic and include validation steps to prevent hallucinations.

## License

[MIT License Placeholder]
