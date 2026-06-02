# SiteCheck — Full Deployment Guide

## Pre-flight checklist

- [ ] Node.js 18+ installed locally
- [ ] Supabase project created
- [ ] Anthropic API key
- [ ] Google PageSpeed Insights API key (free)
- [ ] Razorpay account
- [ ] Resend account (email)
- [ ] Vercel account

---

## 1. Supabase setup

1. Create project at supabase.com
2. SQL Editor → paste `supabase/migrations/001_initial_schema.sql` → Run
3. Authentication → URL Configuration:
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: `https://yourdomain.com/auth/callback`
4. Settings → API → copy URL, anon key, service_role key

---

## 2. Google PageSpeed API

1. console.cloud.google.com → Enable "PageSpeed Insights API"
2. Create Credentials → API Key
3. Free quota: 25,000 requests/day

---

## 3. Razorpay

1. Sign up at razorpay.com → Settings → API Keys → Generate
2. Webhooks → Add:
   - URL: `https://yourdomain.com/api/payment/webhook`
   - Secret: your RAZORPAY_KEY_SECRET
   - Events: `payment.captured`
3. Complete KYC before going live

---

## 4. Resend (email)

1. resend.com → Add your domain → verify DNS
2. API Keys → Create Key
3. FROM_EMAIL: `SiteCheck <noreply@yourdomain.com>`
4. Free: 3,000 emails/month

---

## 5. Vercel deployment

```bash
# CLI method
npm install -g vercel
vercel login
vercel --prod
```

Or import from GitHub at vercel.com.

### All environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
PAGESPEED_API_KEY=AIza...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_REPORT_PRICE_INR=499
RESEND_API_KEY=re_...
FROM_EMAIL=SiteCheck <noreply@yourdomain.com>
ENABLE_SCREENSHOTS=false
```

---

## 6. Screenshots (optional)

Screenshots are disabled by default (`ENABLE_SCREENSHOTS=false`).

To enable:
- Requires Vercel Pro plan
- Set `ENABLE_SCREENSHOTS=true`
- Or replace `lib/screenshot/capture.ts` with a screenshot API service (ScreenshotOne, Urlbox)

---

## 7. Add Geist font

In `app/layout.tsx`, add:

```typescript
import { Geist, Geist_Mono } from "next/font/google";
const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
// Add to <html className={`${geistSans.variable} ${geistMono.variable}`}>
```

---

## 8. Post-deployment checklist

- [ ] Homepage loads, URL input works
- [ ] Audit runs end-to-end (try with a real URL)
- [ ] Free report shows 2 sections locked
- [ ] Share link works without login
- [ ] Payment modal opens (test mode)
- [ ] After payment: full report unlocks
- [ ] PDF downloads for paid reports
- [ ] Dashboard shows audit history (requires login)
- [ ] Mobile layout looks correct

---

## 9. Troubleshooting

| Issue | Fix |
|---|---|
| Audit fails | Check ANTHROPIC_API_KEY and Vercel function logs |
| Payment not unlocking | Verify webhook URL and RAZORPAY_KEY_SECRET match |
| RLS errors | Use createServiceClient() in API routes |
| PDF fails | Only works for is_paid=true audits |
| Screenshots broken | Set ENABLE_SCREENSHOTS=false |

---

## 10. Cost estimates

| Audits/day | Claude cost/month | Total infra/month |
|---|---|---|
| 100 | ~$3 | ~$5 |
| 500 | ~$15 | ~$25 |
| 2000 | ~$60 | ~$80 |

At ₹499 per unlock, 10% conversion, 500 audits/day = **~₹750,000/month gross**.
