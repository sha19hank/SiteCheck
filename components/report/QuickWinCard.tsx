import type { QuickWin } from "@/types";
import { effortBadge } from "@/lib/utils";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  performance: "bg-amber-50 text-amber-700 border-amber-200",
  trust:       "bg-brand-50  text-brand-700  border-brand-200",
  clarity:     "bg-purple-50 text-purple-700 border-purple-200",
  conversion:  "bg-emerald-50 text-emerald-700 border-emerald-200",
};

interface QuickWinCardProps {
  win:   QuickWin;
  rank:  number;
  delay?: number;
}

export default function QuickWinCard({ win, rank, delay = 0 }: QuickWinCardProps) {
  const effort = effortBadge(win.effortLevel);
  const catCls = CATEGORY_COLORS[win.category] ?? CATEGORY_COLORS.trust;

  return (
    <div
      className="card p-5 sm:p-6 animate-fade-up opacity-0-init print:break-inside-avoid"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start gap-4">
        {/* Rank badge */}
        <div className="shrink-0 w-8 h-8 rounded-full bg-amber-400/20 border border-amber-300/50 flex items-center justify-center">
          <span className="text-sm font-bold text-amber-700">{rank}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <h3 className="text-base font-semibold text-surface-900 leading-tight pr-2">
              {win.title}
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium border", catCls)}>
                {win.category}
              </span>
              <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", effort.color)}>
                {effort.label}
              </span>
            </div>
          </div>

          {/* Why it matters */}
          <div className="bg-surface-50/50 rounded-xl p-4 mb-3 border border-surface-100">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              Why it matters
            </p>
            <p className="text-sm text-surface-700 leading-relaxed">
              {win.whyItMatters}
            </p>
          </div>

          {/* How to fix */}
          <div className="bg-brand-50/40 border border-brand-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>
              How to fix it
            </p>
            <p className="text-sm text-surface-800 leading-relaxed">{win.howToFix}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
