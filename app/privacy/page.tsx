import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-20 prose prose-sm prose-surface">
        <h1 className="text-2xl font-semibold text-surface-900 mb-2">Privacy Policy</h1>
        <p className="text-surface-500 text-sm mb-8">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>

        <div className="space-y-6 text-sm text-surface-600 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-surface-900 mb-2">What we collect</h2>
            <p>When you submit a URL for analysis, we fetch and analyse that website&rsquo;s publicly accessible HTML and performance data. We do not store the full HTML of any website. We store the structured analysis results (scores, findings) and the AI-generated report in our database.</p>
            <p className="mt-2">If you provide your email address, we store it to send you your report and relevant follow-up emails. You can unsubscribe at any time.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-surface-900 mb-2">How we use your data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To generate and display your website audit report</li>
              <li>To email you your report (if requested)</li>
              <li>To improve our analysis models and scoring engine</li>
              <li>To prevent abuse and enforce rate limits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-surface-900 mb-2">Third-party services</h2>
            <p>We use Google PageSpeed Insights API to collect performance data about submitted URLs. We use Anthropic&rsquo;s Claude API to generate plain-English explanations. We use Supabase for database storage. We use Razorpay for payment processing.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-surface-900 mb-2">Report sharing</h2>
            <p>Reports are publicly accessible via their share link by default. You can treat your share link as a private URL — only people with the link can view the report. We do not index reports in search engines.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-surface-900 mb-2">Your rights</h2>
            <p>You can request deletion of your data at any time by emailing us. We will remove all reports and personal data associated with your account within 30 days.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-surface-900 mb-2">Contact</h2>
            <p>Questions? Email us at <a href="mailto:privacy@sitecheck.ai" className="text-brand-600 hover:underline">privacy@sitecheck.ai</a></p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-surface-200">
          <Link href="/" className="text-sm text-brand-600 hover:text-brand-700">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
