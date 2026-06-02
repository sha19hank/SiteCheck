"use client";
import { useState } from "react";
import type { ScreenshotData } from "@/types";

interface ScreenshotPanelProps {
  screenshots: ScreenshotData;
}

export default function ScreenshotPanel({ screenshots }: ScreenshotPanelProps) {
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const src = view === "desktop" ? screenshots.desktopScreenshot : screenshots.mobileScreenshot;

  if (!screenshots.captureSuccess || !src) return null;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-surface-100">
        <div>
          <p className="text-sm font-semibold text-surface-900">Visual preview</p>
          <p className="text-xs text-surface-500 mt-0.5">How your site appeared at time of audit</p>
        </div>
        <div className="flex items-center gap-1 bg-surface-100 rounded-lg p-1">
          <button
            onClick={() => setView("desktop")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
              view === "desktop"
                ? "bg-white text-surface-900 shadow-sm"
                : "text-surface-500 hover:text-surface-700"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd"/>
              </svg>
              Desktop
            </span>
          </button>
          <button
            onClick={() => setView("mobile")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
              view === "mobile"
                ? "bg-white text-surface-900 shadow-sm"
                : "text-surface-500 hover:text-surface-700"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
              </svg>
              Mobile
            </span>
          </button>
        </div>
      </div>

      <div className={`relative overflow-hidden bg-surface-100 ${
        view === "mobile" ? "flex justify-center py-4" : ""
      }`}>
        {/* Visual analysis overlays */}
        {view === "desktop" && screenshots.ctaAboveFold !== null && (
          <div className={`absolute top-2 left-2 z-10 text-xs px-2 py-1 rounded-md font-medium ${
            screenshots.ctaAboveFold
              ? "bg-emerald-500 text-white"
              : "bg-amber-500 text-white"
          }`}>
            CTA {screenshots.ctaAboveFold ? "✓ visible" : "✗ below fold"}
          </div>
        )}

        {view === "mobile" && screenshots.ctaAboveFoldMobile !== null && (
          <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-10 text-xs px-2 py-1 rounded-md font-medium whitespace-nowrap ${
            screenshots.ctaAboveFoldMobile
              ? "bg-emerald-500 text-white"
              : "bg-amber-500 text-white"
          }`}>
            CTA {screenshots.ctaAboveFoldMobile ? "✓ visible on mobile" : "✗ below fold on mobile"}
          </div>
        )}

        <img
          src={src}
          alt={`${view} screenshot`}
          className={`${
            view === "desktop"
              ? "w-full h-auto max-h-72 object-cover object-top"
              : "h-64 w-auto rounded-xl shadow-card-md border border-surface-200"
          }`}
        />
      </div>

      {/* Context bar */}
      {(screenshots.ctaText || screenshots.hasHeroImage !== null) && (
        <div className="flex flex-wrap gap-3 px-4 py-3 bg-surface-50 border-t border-surface-100">
          {screenshots.ctaText && (
            <span className="text-xs text-surface-500">
              CTA text: <strong className="text-surface-700">&ldquo;{screenshots.ctaText}&rdquo;</strong>
            </span>
          )}
          {screenshots.hasHeroImage !== null && (
            <span className="text-xs text-surface-500">
              Hero image: <strong className={screenshots.hasHeroImage ? "text-emerald-700" : "text-amber-700"}>
                {screenshots.hasHeroImage ? "present" : "none detected"}
              </strong>
            </span>
          )}
          {screenshots.navHeight !== null && (
            <span className="text-xs text-surface-500">
              Nav height: <strong className="text-surface-700">{screenshots.navHeight}px</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
