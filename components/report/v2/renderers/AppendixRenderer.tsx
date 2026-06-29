import React from "react";
import { ReportSection } from "@/types";

export default function AppendixRenderer({ section }: { section: ReportSection }) {
  const content = section.content as any;
  if (!content) return null;

  return (
    <div className="animate-fade-up">
      <div className="mb-8 page-break-inside-avoid">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">{section.title}</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card p-6 border border-slate-200 bg-white page-break-inside-avoid">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Crawl Metadata</h3>
          <dl className="space-y-2">
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

        <div className="card p-6 border border-slate-200 bg-white page-break-inside-avoid">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Methodology & Confidence</h3>
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
