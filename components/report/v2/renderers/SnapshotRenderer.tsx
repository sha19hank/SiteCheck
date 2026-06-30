import { AuditMetricSummary } from "@/types";
import { groupMetrics } from "../utils/metric-grouping";
import { cn } from "@/lib/utils";

export default function SnapshotRenderer({ metrics }: { metrics?: AuditMetricSummary[] }) {
  if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
    return (
      <div className="animate-fade-up">
        <div className="mb-10 page-break-inside-avoid">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Website Health Snapshot</h2>
          <div className="p-6 border border-dashed border-slate-300 bg-slate-50 rounded-xl text-slate-600 leading-relaxed">
            No metrics were successfully captured for this website.
          </div>
        </div>
      </div>
    );
  }

  const groups = groupMetrics(metrics);

  return (
    <div className="space-y-10 sm:space-y-12 animate-fade-up">
      <div className="mb-10 page-break-inside-avoid">
        <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Website Health Snapshot</h2>
        <p className="text-lg text-slate-700 leading-relaxed">
          Key performance and structural metrics extracted during the audit.
        </p>
      </div>

      {groups.map((group, gIdx) => (
        <div key={group.title || gIdx} className="space-y-5 sm:space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100 page-break-inside-avoid">{group.title}</h3>
          <div className="space-y-6 sm:space-y-8">
            {group.metrics.map((m, mIdx) => (
              <div key={m.id || mIdx} id={`metric-${m.id}`} className="flex flex-col sm:flex-row gap-2 sm:gap-10 page-break-inside-avoid">
                <div className="w-full sm:w-1/3 shrink-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      m.verdict === 'STRONG' || m.verdict === 'ADEQUATE' ? 'bg-emerald-500' :
                      m.verdict === 'NEEDS_WORK' ? 'bg-amber-500' :
                      'bg-rose-500'
                    )}></span>
                    <h4 className="font-semibold text-slate-900 leading-tight">{m.title}</h4>
                  </div>
                  <div className="pl-5">
                    <div className="text-xl font-bold text-slate-900 mb-0.5">{m.currentValue}</div>
                    {m.expectedRange && (
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Benchmark: {m.expectedRange}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 pt-1 sm:pt-0">
                  <p className="text-sm text-slate-700 leading-relaxed max-w-2xl m-0">{m.whyItMatters}</p>
                  
                  {m.relatedRecommendationIds && m.relatedRecommendationIds.length > 0 && (
                    <div className="mt-2 print:hidden">
                      <a href={`#rec-${m.relatedRecommendationIds[0]}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline underline-offset-4">
                        → See related recommendation
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
