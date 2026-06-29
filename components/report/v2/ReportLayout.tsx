import StickyNav from "./StickyNav";
import { ReportSection } from "@/types";
import { ReactNode } from "react";

interface ReportLayoutProps {
  sections: ReportSection[];
  header: ReactNode;
  children: ReactNode;
}

export default function ReportLayout({ sections, header, children }: ReportLayoutProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col gap-12 lg:gap-16 scroll-smooth">
      <div id="header" className="scroll-mt-32">
        {header}
      </div>
      
      <div className="flex flex-col md:flex-row items-start gap-12 relative">
        <StickyNav sections={sections} />
        
        <div className="flex-1 min-w-0 w-full max-w-3xl flex flex-col gap-16 lg:gap-24">
          {children}
        </div>
      </div>
    </div>
  );
}
