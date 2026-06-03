import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <h1 className="text-2xl font-semibold text-surface-900 mb-2">Terms of Service</h1>
        <p className="text-surface-500 text-sm mb-8">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>

        <div className="space-y-6 text-sm text-surface-600 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-surface-900 mb-2">Acceptance</h2>
            <p>By using SiteCheck, you agree to these terms. If you don&rsquo;t agree, please don&rsquo;t use the service.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-surface-900 mb-2">What SiteCheck provides</h2>
            <p>SiteCheck provides automated website analysis and AI-generated recommendations. Our reports are informational — they represent our best automated analysis of publicly available website data. We do not guarantee specific business outcomes from following our recommendations.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-surface-900 mb-2">Acceptable use</h2>
            <p>You may only submit URLs for websites you own or have permission to analyse. You may not use SiteCheck to scrape competitor intelligence at scale, attempt to reverse-engineer our scoring algorithms, or submit URLs for malicious purposes.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-surface-900 mb-2">Payments and refunds</h2>
            <p>Report unlock purchases are one-time payments. If you are not satisfied with your full report, contact us within 7 days for a full refund — no questions asked.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-surface-900 mb-2">Liability</h2>
            <p>SiteCheck is provided &ldquo;as is&rdquo;. We are not liable for any business decisions made based on our reports. Our maximum liability is limited to the amount you paid for the report in question.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-surface-900 mb-2">Contact</h2>
            <p>Questions? <a href="mailto:support@sitecheck.ai" className="text-brand-600 hover:underline">support@sitecheck.ai</a></p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-surface-200">
          <Link href="/" className="text-sm text-brand-600 hover:text-brand-700">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
