import React from "react";
import { REPORT_STRUCTURE } from "./utils/reportStructure";

interface PremiumUpgradeWallProps {
  onUnlock: () => void;
  price?: string;
}

export default function PremiumUpgradeWall({ onUnlock, price = "499" }: PremiumUpgradeWallProps) {
  return (
    <div className="mt-16 print:hidden animate-fade-up">
      {/* Visual Teaser of Premium Content */}
      <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm pointer-events-none select-none">
        {/* Faux Header */}
        <div className="border-b border-slate-100 p-8 pb-12 relative overflow-hidden bg-slate-50/50">
          <div className="h-8 w-64 bg-slate-200 rounded animate-pulse mb-6" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-11/12 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
        
        {/* Faux Cards */}
        <div className="p-8 space-y-6">
          <div className="h-32 w-full bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-32 w-full bg-slate-100 rounded-xl animate-pulse opacity-50" />
          <div className="h-32 w-full bg-slate-100 rounded-xl animate-pulse opacity-25" />
        </div>

        {/* Gradient Overlay for Blur Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/80 to-white backdrop-blur-[2px]" />
      </div>

      {/* Actual CTA Box */}
      <div className="relative -mt-40 z-10 mx-auto max-w-2xl px-4">
        <div className="card p-8 sm:p-10 border-brand-200 bg-gradient-to-br from-brand-50/90 via-white to-white shadow-xl shadow-brand-500/10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-48 h-48 text-brand-900">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-brand-500/20 mb-6">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Stop guessing. Start growing.</h3>
            <p className="text-base text-slate-600 mb-8 max-w-lg leading-relaxed">
              Unlock your complete consultant report to see the exact, prioritized changes needed to fix your conversion blockers and capture lost revenue.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700 font-medium mb-8 text-left w-full max-w-md mx-auto">
              {REPORT_STRUCTURE.PREMIUM.map((section) => (
                <div key={section.id} className="flex items-center gap-2">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-emerald-500 shrink-0"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  {section.title}
                </div>
              ))}
            </div>
            
            <button onClick={onUnlock} className="btn-primary w-full sm:w-auto px-10 h-14 text-base shadow-xl shadow-brand-500/20 hover:-translate-y-0.5 transition-all">
              Unlock full strategy — ₹{price}
            </button>
            <p className="text-xs text-slate-400 mt-4 font-medium uppercase tracking-wider">One-time investment • Lifetime access</p>
          </div>
        </div>
      </div>
    </div>
  );
}
