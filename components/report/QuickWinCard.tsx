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
      className="card p-5 sm:p-6 animate-fade-up opacity-0-init"
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

          {/* Business impact */}
          <p className="text-sm text-surface-600 leading-relaxed mb-4">
            {win.businessImpact}
          </p>

          {/* How to fix */}
          <div className="bg-surface-50 border-l-2 border-brand-400 rounded-r-lg px-4 py-3">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">How to fix it</p>
            <p className="text-sm text-surface-700 leading-relaxed">{win.howToFix}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
