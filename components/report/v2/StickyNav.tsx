"use client";
import { useEffect, useState } from "react";
import { ReportSection } from "@/types";

interface StickyNavProps {
  sections: ReportSection[];
}

export default function StickyNav({ sections }: StickyNavProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible section that is intersecting
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by top position to pick the one highest on screen if multiple
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(visibleEntries[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    const sectionElements = document.querySelectorAll("[data-section-id]");
    sectionElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [sections]);

  const navItems = [
    { id: "header", title: "Overview" }
  ];
  
  // Deduplicate sections by ID, ensuring robust keys
  const seenIds = new Set<string>();
  for (const s of sections) {
    if (!s || !s.id) continue;
    const safeId = `section-${s.id}`;
    if (!seenIds.has(safeId)) {
      seenIds.add(safeId);
      navItems.push({ id: safeId, title: s.title || "Section" });
    }
  }
  return (
    <div className="hidden md:block w-48 shrink-0 print:hidden">
      <div className="sticky top-24 space-y-4">
        <h4 className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase pl-3 mb-2">Contents</h4>
        <nav className="flex flex-col border-l border-slate-200">
        {navItems.map((item) => {
          const isActive = item.id === activeId || (item.id === "header" && activeId === "");
          
          let colorClass = "text-slate-500 hover:text-slate-900";
          let borderClass = "border-transparent";

          if (isActive) {
            colorClass = "text-brand-900 font-medium";
            borderClass = "border-brand-600";
          }

          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`block -ml-px pl-4 py-1.5 text-sm border-l-2 transition-colors ${colorClass} ${borderClass}`}
            >
              <span className="truncate">{item.title}</span>
            </a>
          );
        })}
        </nav>
      </div>
    </div>
  );
}
