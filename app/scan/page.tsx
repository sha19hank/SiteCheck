"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { extractDomain } from "@/lib/utils";
import type { AuditResponse } from "@/types";

const STEPS = [
  { key: "validating",          label: "Validating your URL",                    icon: "🔗", duration: 800  },
  { key: "fetching_speed",      label: "Checking page speed on mobile",           icon: "⚡", duration: 4000 },
  { key: "scraping",            label: "Reading your page structure",             icon: "🔍", duration: 2000 },
  { key: "scoring",             label: "Calculating trust & conversion scores",   icon: "📊", duration: 1500 },
  { key: "generating_insights", label: "Writing your consultant report",          icon: "✨", duration: 6000 },
];

function ScanContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const url          = searchParams.get("url") ?? "";
  const domain       = extractDomain(url);

  const [currentStep, setCurrentStep]   = useState(0);
  const [completedSteps, setCompleted]  = useState<Set<number>>(new Set());
  const [error, setError]               = useState("");
  const [dots, setDots]                 = useState("");
  const hasFetched = useRef(false);

  // Animated dots for "loading" feel
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? "" : d + ".");
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Step advancement simulation (visual only — real audit runs in background)
  useEffect(() => {
    let stepIndex = 0;
    const advance = () => {
      if (stepIndex < STEPS.length - 1) {
        const delay = STEPS[stepIndex].duration;
        setTimeout(() => {
          setCompleted(prev => new Set(Array.from(prev).concat(stepIndex)));
          stepIndex++;
          setCurrentStep(stepIndex);
          advance();
        }, delay);
      }
    };
    advance();
  }, []);

  // Kick off actual audit
  useEffect(() => {
    if (!url || hasFetched.current) return;
    hasFetched.current = true;

    if (!url.startsWith("http")) {
      setError("Invalid URL. Please go back and try again.");
      return;
    }

    fetch("/api/audit", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ url }),
    })
      .then(res => res.json() as Promise<AuditResponse & { error?: string }>)
      .then(data => {
        if (data.error) throw new Error(data.error);
        // Mark all steps complete
        setCompleted(new Set([0, 1, 2, 3, 4]));
        setCurrentStep(STEPS.length);
        setTimeout(() => {
          router.push(`/report/${data.shareToken}`);
        }, 600);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      });
  }, [url, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-7 h-7 text-rose-500">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-surface-900 mb-2">Couldn&apos;t reach that site</h2>
          <p className="text-surface-500 text-sm mb-6">{error}</p>
          <a href="/" className="btn-primary">← Try a different URL</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Animated scanner icon */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow-brand">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" className="w-9 h-9">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-2xl border-2 border-brand-400 animate-ping opacity-20" />
          </div>

          <h1 className="text-2xl font-semibold text-surface-900 mb-2">
            Analysing <span className="text-brand-600">{domain}</span>
          </h1>
          <p className="text-surface-500 text-sm">
            Reading your site the way a potential customer does{dots}
          </p>
        </div>

        {/* Steps */}
        <div className="card p-6 space-y-4">
          {STEPS.map((step, i) => {
            const isComplete = completedSteps.has(i);
            const isCurrent  = currentStep === i && !isComplete;
            const isPending  = i > currentStep;

            return (
              <div key={step.key} className="flex items-center gap-4">
                {/* Status icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                  isComplete
                    ? "bg-brand-500"
                    : isCurrent
                    ? "bg-brand-50 border-2 border-brand-400"
                    : "bg-surface-100 border border-surface-200"
                }`}>
                  {isComplete ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  ) : isCurrent ? (
                    <svg className="animate-spin w-4 h-4 text-brand-600" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : (
                    <span className="text-base">{step.icon}</span>
                  )}
                </div>

                {/* Label */}
                <div className="flex-1">
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isComplete ? "text-surface-900" : isCurrent ? "text-brand-700" : "text-surface-400"
                  }`}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <div className="mt-1.5 h-1 bg-surface-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-400 rounded-full animate-pulse-slow" style={{ width: "60%" }} />
                    </div>
                  )}
                </div>

                {/* Status text */}
                <div className="shrink-0">
                  {isComplete && <span className="text-xs text-brand-600 font-medium">Done</span>}
                  {isCurrent  && <span className="text-xs text-surface-400">Running</span>}
                  {isPending  && <span className="text-xs text-surface-300">Waiting</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-surface-400 mt-6">
          This typically takes 20–40 seconds &middot; You can&apos;t rush quality 😄
        </p>
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ScanContent />
    </Suspense>
  );
}
