import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import UrlInput from "@/components/landing/UrlInput";

export const metadata: Metadata = {
  title: "SiteCheck — Find out what's hurting your website's conversions",
};

const FEATURES = [
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
    ),
    title: "Plain English, not jargon",
    body: "We explain every finding in language your client's mum could understand. No LCP scores. No technical dumps.",
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
    ),
    title: "Conversion-first analysis",
    body: "Every insight is framed around what it means for your sales and enquiries — not your PageRank.",
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    ),
    title: "Top 3 quick wins",
    body: "Not 47 issues. A curated, prioritised list of the three changes most likely to move the needle for your business.",
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
    ),
    title: "Trust & clarity scores",
    body: "We measure what enterprise tools ignore: do visitors trust your site? Is your value proposition clear? Can they find your CTA?",
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
    ),
    title: "Shareable report links",
    body: "Every report gets a public link. Share it with your web developer, your team, or post it on social.",
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M13 10V3L4 14h7v7l9-11h-7z"/>
    ),
    title: "60-second analysis",
    body: "No sign-up, no waiting, no forms to fill. Paste your URL and your report is ready before you finish your coffee.",
  },
];

const STEPS = [
  { num: "01", title: "Paste your URL", body: "Type or paste your website address. That's it — no account needed." },
  { num: "02", title: "We analyse everything", body: "Our engine checks speed, trust signals, clarity, and conversion readiness in parallel." },
  { num: "03", title: "AI writes your report", body: "Claude AI translates technical findings into a consultant-quality growth report." },
  { num: "04", title: "Act on quick wins", body: "Your Top 3 Quick Wins tell you exactly what to fix first and how to do it." },
];

const TESTIMONIALS = [
  {
    quote: "I finally understand what's wrong with my website. Every other tool gave me a wall of numbers. This gave me a plan.",
    name: "Sarah K.",
    role: "Freelance designer",
  },
  {
    quote: "Sent the report to my developer with the quick wins highlighted. We fixed all three in an afternoon. Enquiries are up.",
    name: "James M.",
    role: "Founder, local law firm",
  },
  {
    quote: "I use SiteCheck before every client presentation. It takes 60 seconds and makes me look like a genius.",
    name: "Priya T.",
    role: "Digital agency owner",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-slow" />
            AI-powered website growth consultant
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-surface-900 leading-[1.1] tracking-tight mb-6 animate-fade-up">
            Your website is{" "}
            <span className="text-gradient">losing customers.</span>
            <br />
            Find out why.
          </h1>

          <p className="text-lg sm:text-xl text-surface-500 leading-relaxed max-w-2xl mx-auto mb-10 animate-fade-up stagger-1">
            Paste your URL and get a plain-English report that tells you exactly
            what&rsquo;s hurting your conversions — and what to fix first.
            Free, in under 60 seconds.
          </p>

          {/* URL Input */}
          <div className="max-w-xl mx-auto animate-fade-up stagger-2">
            <UrlInput size="hero" />
            <p className="mt-3 text-xs text-surface-400">
              No sign-up required &middot; Free partial report &middot; Trusted by 2,400+ websites
            </p>
          </div>
        </div>

        {/* Social proof bar */}
        <div className="max-w-4xl mx-auto mt-16 animate-fade-up stagger-3">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-surface-400">
            {["Used by freelancers, agencies & Shopify stores",
              "2,400+ websites analysed",
              "No account required",
              "Reports in under 60 seconds",
            ].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-brand-500">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-white border-y border-surface-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="label-sm mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-surface-900 tracking-tight">
              From URL to action plan in 60 seconds
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-surface-200 -translate-x-4 z-0" />
                )}
                <div className="relative z-10">
                  <div className="text-3xl font-bold text-brand-100 mb-3 leading-none">{step.num}</div>
                  <h3 className="font-semibold text-surface-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-surface-500 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="label-sm mb-3">Why SiteCheck</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-surface-900 tracking-tight">
              Built for business owners,
              <br className="hidden sm:block" /> not developers
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(feature => (
              <div key={feature.title} className="card p-6 hover:shadow-card-md transition-shadow duration-200">
                <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-brand-600">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="font-semibold text-surface-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Before / After ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-surface-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="label-sm mb-3 text-surface-500">The difference</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
              Insights that actually make sense
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Bad */}
            <div className="bg-rose-950/40 border border-rose-800/40 rounded-2xl p-6">
              <p className="text-xs font-semibold text-rose-400 uppercase tracking-widest mb-4">Other tools</p>
              <div className="space-y-3">
                {[
                  "Largest Contentful Paint: 5.1s",
                  "Cumulative Layout Shift: 0.31",
                  "Time to First Byte: 820ms",
                  "Render-blocking resources: 4",
                ].map(item => (
                  <div key={item} className="flex items-start gap-2 text-sm text-rose-200/70">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 mt-0.5 text-rose-500">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Good */}
            <div className="bg-brand-950/40 border border-brand-700/40 rounded-2xl p-6">
              <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-4">SiteCheck AI</p>
              <div className="space-y-4">
                <div className="text-sm text-brand-100/90 leading-relaxed">
                  🔥 <strong className="text-white">Your homepage loads slowly on mobile</strong> — which is where 65% of your visitors arrive. Most people leave within 3 seconds if nothing appears.
                </div>
                <div className="text-sm text-surface-400 bg-surface-800/40 rounded-lg p-3 leading-relaxed">
                  <strong className="text-surface-200">How to fix it:</strong> Run your hero image through Squoosh.app and export as WebP at 80% quality. Typically cuts load time by 2–3 seconds at no cost.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="label-sm mb-3">From users</p>
            <h2 className="text-3xl font-semibold text-surface-900 tracking-tight">
              Used by people who just want results
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card p-6">
                <div className="flex mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-400">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-surface-600 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-medium text-surface-900">{t.name}</p>
                  <p className="text-xs text-surface-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4 sm:px-6 bg-white border-t border-surface-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="label-sm mb-3">Pricing</p>
            <h2 className="text-3xl font-semibold text-surface-900 tracking-tight">Simple, honest pricing</h2>
            <p className="text-surface-500 mt-3">No subscription required to get started</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {/* Free */}
            <div className="card p-7">
              <p className="label-sm mb-2">Free</p>
              <div className="text-3xl font-bold text-surface-900 mb-1">₹0</div>
              <p className="text-sm text-surface-500 mb-6">No credit card needed</p>
              <ul className="space-y-2.5 mb-8">
                {["Overall growth score", "Performance & trust preview", "2 report sections", "Shareable report link"].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-surface-700">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-brand-500 shrink-0">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/" className="btn-secondary w-full justify-center">Get free report</Link>
            </div>

            {/* Full report */}
            <div className="card p-7 border-brand-300 ring-1 ring-brand-200 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Most popular</span>
              </div>
              <p className="label-sm mb-2 text-brand-600">Full report</p>
              <div className="text-3xl font-bold text-surface-900 mb-1">₹499</div>
              <p className="text-sm text-surface-500 mb-6">One-time per report</p>
              <ul className="space-y-2.5 mb-8">
                {[
                  "Everything in Free",
                  "All 4 report sections",
                  "Top 3 AI quick wins",
                  "Clarity & conversion scores",
                  "PDF export",
                  "30-day report access",
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-surface-700">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-brand-500 shrink-0">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/" className="btn-primary w-full justify-center">Start free audit</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-surface-900 tracking-tight mb-4">
            Stop guessing why visitors leave
          </h2>
          <p className="text-surface-500 mb-10 text-lg">
            Your report is free, ready in 60 seconds, and written in plain English.
          </p>
          <UrlInput size="hero" />
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-surface-200 py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5">
                <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="2"/>
                <path d="M7 10l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-surface-900">SiteCheck</span>
          </div>
          <p className="text-xs text-surface-400">
            © {new Date().getFullYear()} SiteCheck. Built for non-technical business owners.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-surface-400 hover:text-surface-700 transition-colors">Privacy</Link>
            <Link href="/terms"   className="text-xs text-surface-400 hover:text-surface-700 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
