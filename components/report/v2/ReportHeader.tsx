import { AuditRecord, PartialReport } from "@/types";
import { formatDate } from "@/lib/utils";
import ScoreRing from "../ScoreRing";
import { useMemo } from "react";

export default function ReportHeader({ report }: { report: PartialReport }) {
  // We need to safely extract fields since report is a PartialReport and might not have all ConsultantReport fields typed on it if we aren't careful, but we know ConsultantReport is injected.
  const consultantReport = report.consultantReport;
  const executionTiming = (report as any).executionTiming;
  
  const scanDuration = executionTiming?.totalMs 
    ? `${(executionTiming.totalMs / 1000).toFixed(1)}s` 
    : "Unknown";

  const websiteType = consultantReport?.businessContext?.websiteType || (report as any).classification?.websiteType || "Website";
  const auditConfidence = consultantReport?.confidenceV2?.overallConfidence 
    ? (consultantReport.confidenceV2.overallConfidence >= 0.8 ? "HIGH" : consultantReport.confidenceV2.overallConfidence >= 0.5 ? "MEDIUM" : "LOW")
    : report.auditConfidence || "UNKNOWN";

  return (
    <div className="animate-fade-up pb-8 border-b border-slate-200">
      <div className="flex flex-col sm:flex-row gap-8 items-start justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {websiteType} Audit
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-600 flex items-center gap-1.5">
              {report.isPaid ? "Premium Consultant Report" : "Free Preview Report"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {report.domain}
          </h1>
        </div>
        
        <div className="flex items-center gap-5 shrink-0">
          <div className="text-right">
            <span className="block text-2xl font-bold text-slate-900">{report.scores.overall}/100</span>
            <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Growth Score</span>
          </div>
          <ScoreRing score={report.scores.overall} size={56} strokeWidth={4} animate />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-12 gap-y-4 pt-6">
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-1.5">Date</p>
          <p className="text-sm text-slate-700">{formatDate(report.createdAt)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-1.5">Duration</p>
          <p className="text-sm text-slate-700">{scanDuration}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-1.5">Confidence</p>
          <p className="text-sm text-slate-700 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${auditConfidence === 'HIGH' ? 'bg-emerald-500' : auditConfidence === 'MEDIUM' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
            {auditConfidence}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-1.5">Methodology</p>
          <p className="text-sm text-slate-700">Live Scrape + Causal AI</p>
        </div>
      </div>
    </div>
  );
}
