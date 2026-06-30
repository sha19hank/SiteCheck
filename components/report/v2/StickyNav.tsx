"use client";
import { useEffect, useState } from "react";
import { ReportSection } from "@/types";
import { REPORT_STRUCTURE } from "./utils/reportStructure";

interface StickyNavProps {
  sections: ReportSection[];
  isPaid?: boolean;
  isDeveloper?: boolean;
}

export default function StickyNav({ sections, isPaid = false, isDeveloper = false }: StickyNavProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(visibleEntries[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    const sectionElements = document.querySelectorAll("[data-section-id], [id^='section-']");
    sectionElements.forEach(el => observer.observe(el));

    // Also observe the header
    const headerEl = document.getElementById("header");
    if (headerEl) observer.observe(headerEl);

    return () => observer.disconnect();
  }, [sections]);

  const renderNavGroup = (items: { id: string, title: string }[], isLockedGroup: boolean = false, isPreviewGroup: boolean = false) => {
    return (
      <nav className="flex flex-col border-l border-slate-200">
        {items.map((item) => {
          const safeId = item.id === "header" ? "header" : `section-${item.id}`;
          const isActive = activeId === safeId || (item.id === "header" && activeId === "");
          
          let colorClass = "text-slate-500 hover:text-slate-900";
          let borderClass = "border-transparent";

          if (isActive && !isLockedGroup) {
            colorClass = "text-brand-900 font-medium";
            borderClass = "border-brand-600";
          } else if (isLockedGroup) {
            colorClass = "text-slate-400 cursor-not-allowed";
          }

          return (
            <a
              key={item.id}
              href={isLockedGroup ? "#upgrade-wall" : `#${safeId}`}
              className={`block -ml-px pl-4 py-1.5 text-sm border-l-2 transition-colors flex items-center justify-between ${colorClass} ${borderClass}`}
            >
              <span className="truncate">{item.title}</span>
              {isLockedGroup && (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 ml-2 shrink-0 opacity-50">
                  <path fillRule="evenodd" d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H5V7a3 3 0 015.73-1.066A1 1 0 1012.47 5.1A5.002 5.002 0 0010 2z" clipRule="evenodd"/>
                </svg>
              )}
              {isPreviewGroup && (
                <span className="text-[9px] font-bold uppercase tracking-widest text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded ml-2 shrink-0">
                  Preview
                </span>
              )}
            </a>
          );
        })}
      </nav>
    );
  };

  const freeItems = [
    { id: "header", title: "Overview" },
    ...REPORT_STRUCTURE.FREE
  ];

  const isLocked = !isPaid && !isDeveloper;
  const isPreview = !isPaid && isDeveloper;

  return (
    <div className="hidden md:block w-56 shrink-0 print:hidden">
      <div className="sticky top-24 space-y-6">
        <div>
          <h4 className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase pl-3 mb-2">Free Analysis</h4>
          {renderNavGroup(freeItems, false, false)}
        </div>
        
        <div>
          <h4 className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase pl-3 mb-2">Consultant Strategy</h4>
          {renderNavGroup(REPORT_STRUCTURE.PREMIUM, isLocked, isPreview)}
        </div>
      </div>
    </div>
  );
}
