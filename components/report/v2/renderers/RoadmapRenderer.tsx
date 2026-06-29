import { ReportSection } from "@/types";

export default function RoadmapRenderer({ section }: { section: ReportSection }) {
  const roadmapData = section.content as any;
  
  if (!roadmapData || (!roadmapData.thirtyDay && !roadmapData.ninetyDay)) return null;

  const renderPhase = (title: string, items: any[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-12 relative pl-6 border-l-2 border-slate-200 space-y-8">
        <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-brand-500 z-10 print:border-slate-800" />
        <h3 className="text-xl font-bold text-slate-900 mb-6 page-break-inside-avoid">{title}</h3>
        {items.map((item, index) => {
          const safeKey = item.id || `roadmap-${index}-${(item.title || "").substring(0, 15).replace(/\s+/g, '-')}`;
          return (
          <div key={safeKey} className="prose prose-slate max-w-none page-break-inside-avoid">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 px-2 py-0.5 rounded bg-slate-50">
                {item.effort} Effort
              </span>
              <h4 className="text-lg font-bold text-slate-900 m-0">{item.title}</h4>
            </div>
            
            <p className="text-slate-700 leading-relaxed mb-4">{item.description}</p>
            
            <div className="grid sm:grid-cols-2 gap-4 text-sm mt-4">
              <div>
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Target KPI</span>
                <span className="text-brand-700 font-medium">{item.kpi?.metric || "Conversion Rate"}</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Impact Level</span>
                <span className="text-slate-700 font-medium">{item.impact || "High"}</span>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="animate-fade-up">
      <div className="mb-12 page-break-inside-avoid">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">{section.title}</h2>
        {section.metadata?.reasoningSummary && (
          <p className="text-lg text-slate-700 leading-relaxed">{section.metadata.reasoningSummary}</p>
        )}
      </div>

      <div className="pl-2">
        {renderPhase("First 30 Days (Foundation)", roadmapData.thirtyDay)}
        {renderPhase("Next 60 Days (Acceleration)", roadmapData.ninetyDay)}
      </div>
    </div>
  );
}
