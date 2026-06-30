import React from "react";
import { ReportSection } from "@/types";

export default function AppendixRenderer({ section }: { section?: ReportSection }) {
  const content = section?.content as any;
  if (!content) {
    return (
      <div className="animate-fade-up">
        <div className="mb-10 page-break-inside-avoid">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Technical Appendix</h2>
          <div className="p-6 border border-dashed border-slate-300 bg-slate-50 rounded-xl text-slate-600 leading-relaxed">
            Technical appendix data is unavailable.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-10 page-break-inside-avoid">
        <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">{section?.title}</h2>
        <p className="text-lg text-slate-700 leading-relaxed">
          Supporting technical information about the crawl, confidence, and methodology.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
        <div className="page-break-inside-avoid">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Crawl Metadata</h3>
          <dl className="space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">HTML Length</dt>
              <dd className="font-medium text-slate-900">{content.crawlMetadata?.htmlLength || 0} bytes</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Page Errors</dt>
              <dd className="font-medium text-slate-900">{content.crawlMetadata?.pageErrors || 0}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Blocked Requests</dt>
              <dd className="font-medium text-slate-900">{content.crawlMetadata?.blockedRequests || 0}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">HTTP Status</dt>
              <dd className="font-medium text-slate-900">{content.crawlMetadata?.httpStatus || "N/A"}</dd>
            </div>
          </dl>
        </div>

        <div className="page-break-inside-avoid">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Methodology & Confidence</h3>
          <dl className="space-y-2">
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Scrape Quality</dt>
              <dd className="font-medium text-slate-900">{content.methodology?.scrapeQuality || "UNKNOWN"}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Classification Confidence</dt>
              <dd className="font-medium text-slate-900">{content.methodology?.classificationConfidence || "UNKNOWN"}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">AI Agreement</dt>
              <dd className="font-medium text-slate-900">{content.methodology?.aiAgreement ? "Yes" : "No"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
