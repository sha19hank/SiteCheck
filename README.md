# SiteCheck — AI Website Growth Consultant

A production-ready SaaS application that gives non-technical business owners a plain-English website health and conversion audit in under 60 seconds.

---

## Quick start

### Prerequisites
- Node.js 18+
- Supabase project
- Anthropic API key
- Google PageSpeed API key (free, optional but recommended)
- Razorpay account (for payments)

### 1. Clone and install

```bash
git clone <your-repo>
cd sitecheck
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API (secret) |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `PAGESPEED_API_KEY` | console.cloud.google.com → PageSpeed Insights API |
| `RAZORPAY_KEY_ID` | Razorpay dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay dashboard → Settings → API Keys |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same as RAZORPAY_KEY_ID |
| `NEXT_PUBLIC_APP_URL` | Your production URL (e.g. https://sitecheck.ai) |
| `NEXT_PUBLIC_REPORT_PRICE_INR` | Price in INR (e.g. 499) |

### 3. Database setup

Run the migration in your Supabase SQL editor:

```
supabase/migrations/001_initial_schema.sql
```

Or use the Supabase CLI:
```bash
supabase db push
```

### 4. Add Geist font (production)

In `app/layout.tsx`, uncomment the font import:

```typescript
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
```

Then add the class names to the `<html>` tag:
```tsx
<html className={`${geistSans.variable} ${geistMono.variable}`}>
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment (Vercel)

### One-command deploy

```bash
vercel --prod
```

### Manual steps

1. Import GitHub repo to Vercel
2. Add all environment variables in Vercel dashboard
3. Set **Framework Preset**: Next.js
4. Set **Node.js Version**: 18.x or 20.x
5. Deploy

### Razorpay webhook

In Razorpay dashboard → Webhooks, add:
- **URL**: `https://yourdomain.com/api/payment/webhook`
- **Events**: `payment.captured`
- **Secret**: same as `RAZORPAY_KEY_SECRET`

### Supabase Auth

In Supabase dashboard → Authentication → URL Configuration:
- **Site URL**: `https://yourdomain.com`
- **Redirect URLs**: `https://yourdomain.com/auth/callback`

---

## Architecture overview

```
URL input → /scan page (UI)
         → POST /api/audit
              ├── Layer 1: Parallel data collection
              │   ├── fetchPageSpeed() → Google PageSpeed API
              │   └── scrapeUrl()     → Cheerio HTML parsing
              ├── Layer 2: Deterministic scoring
              │   └── calculateScores() → typed findings JSON
              ├── Layer 3: AI explanation
              │   └── generateAIReport() → Claude claude-haiku-4-5
              └── Persist → Supabase audits table
         → Redirect to /report/[shareToken]
```

**Anti-hallucination design**: Claude receives only typed findings from the deterministic engine. It cannot invent new issues — it can only explain what the scoring engine found.

---

## Project structure

```
sitecheck/
├── app/
│   ├── page.tsx              # Landing page
│   ├── scan/page.tsx         # Animated scanning screen
│   ├── report/[token]/       # Report display (core product)
│   ├── dashboard/            # Audit history (auth required)
│   ├── login/                # Magic link auth
│   ├── api/
│   │   ├── audit/            # POST (run audit) + GET (fetch report)
│   │   └── payment/          # create + webhook/verify
│   └── auth/callback/        # Supabase auth callback
├── components/
│   ├── landing/UrlInput.tsx  # URL input with validation
│   ├── layout/Navbar.tsx     # Global navigation
│   └── report/
│       ├── ScoreRing.tsx     # Animated SVG score ring
│       ├── ScoreBar.tsx      # Dimension score bars
│       ├── QuickWinCard.tsx  # Quick win display
│       ├── SectionInsightCard.tsx  # Expandable section cards
│       └── PaymentModal.tsx  # Razorpay unlock flow
├── lib/
│   ├── audit/
│   │   ├── scraper.ts        # Layer 1: HTML scraping (Cheerio)
│   │   ├── pagespeed.ts      # Layer 1: Google PageSpeed API
│   │   ├── scorer.ts         # Layer 2: Deterministic scoring
│   │   ├── ai-report.ts      # Layer 3: Claude AI explanations
│   │   └── index.ts          # Audit orchestrator
│   ├── supabase/
│   │   ├── client.ts         # Browser Supabase client
│   │   └── server.ts         # Server Supabase client
│   └── utils.ts              # Shared utilities
├── types/index.ts            # Complete TypeScript types
├── middleware.ts             # Auth protection + session refresh
└── supabase/migrations/      # Database schema
```

---

## Key design decisions

### Freemium gating
- **Free**: Overall score + Performance + Trust sections + share link
- **Paid (₹499)**: Clarity + Conversion sections + Quick Wins detail + PDF

### Caching
Audits for the same domain within 24 hours return the cached result, saving PageSpeed API calls and Claude API costs.

### Rate limiting
200 audits/hour global limit via Supabase query count. Upgrade to Redis (Upstash) for per-IP limiting at scale.

### Cost per audit (estimated)
- PageSpeed API: free (up to 25,000/day with key)
- Cheerio scrape: ~$0 (CPU cost only)
- Claude Haiku: ~$0.02–0.05 per audit
- **Total: ~$0.05 per audit**

---

## Post-MVP roadmap

| Feature | Effort | Impact |
|---|---|---|
| PDF export | 2 days | High (upsell) |
| Email drip (Resend) | 1 day | High (retention) |
| Before/after comparison | 2 days | High (retention) |
| Pro subscription (Razorpay) | 1 day | High (MRR) |
| Weekly monitoring alerts | 3 days | Medium |
| Screenshot visual analysis | 5 days | High (wow factor) |
| Agency white-label | 1 week | High (B2B revenue) |
| Industry-specific reports | 3 days | Medium |

---

## Support

Questions? hello@sitecheck.ai
