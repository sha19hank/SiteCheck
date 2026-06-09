"use client";

import { useState } from "react";
import type { AuditScores } from "@/types";

interface DebugPanelProps {
  data: any;
  scores: AuditScores;
}

export default function DebugPanel({ data, scores }: DebugPanelProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [rawTab, setRawTab] = useState("classification");

  if (!data) return null;

  return (
    <div className="mt-16 border-t-4 border-rose-500 pt-8 bg-slate-50 p-6 rounded-xl shadow-inner font-mono text-xs text-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-rose-600 uppercase tracking-widest flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Developer Debug Panel
        </h2>
        <div className="flex gap-2">
          {["overview", "understanding", "category", "growth", "consultant", "scores", "raw"].map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 rounded uppercase font-bold tracking-wider transition-colors ${
                activeTab === t ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-2 gap-8">
            {/* TIMING */}
            <div className="bg-white p-4 rounded border border-slate-200">
              <h3 className="font-bold text-sm mb-3 border-b pb-2">Audit Timing</h3>
              {data.timing ? (
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Scraping:</span><span>{data.timing.scrapingMs}ms</span></div>
                  <div className="flex justify-between"><span>PageSpeed:</span><span>{data.timing.pageSpeedMs}ms</span></div>
                  <div className="flex justify-between"><span>Classification:</span><span>{data.timing.classificationMs}ms</span></div>
                  <div className="flex justify-between"><span>Category Audit:</span><span>{data.timing.categoryAuditMs}ms</span></div>
                  <div className="flex justify-between"><span>Website Understanding:</span><span>{data.timing.websiteUnderstandingMs}ms</span></div>
                  <div className="flex justify-between"><span>Growth Engine:</span><span>{data.timing.growthEngineMs}ms</span></div>
                  <div className="flex justify-between pt-2 border-t font-bold"><span>Total:</span><span>{data.timing.totalMs}ms</span></div>
                </div>
              ) : <p>No timing data.</p>}
            </div>

            {/* AI FAILURES */}
            <div className="bg-white p-4 rounded border border-slate-200">
              <h3 className="font-bold text-sm mb-3 border-b pb-2">AI Calls & Failures</h3>
              {data.aiFailures?.length ? (
                <div className="space-y-4">
                  {data.aiFailures.map((log: any, i: number) => (
                    <div key={i} className="text-xs">
                      <p className="font-bold uppercase text-slate-500 mb-1">{(log?.step ?? "unknown").replace('_', ' ')}</p>
                      <div className="flex justify-between"><span>Status:</span><span className={log.status === "Success" ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>{log.status}</span></div>
                      <div className="flex justify-between"><span>Fallback:</span><span>{log.fallbackUsed ? "Yes" : "No"}</span></div>
                      {log.errorReason && <div className="text-rose-500 mt-1">Reason: {log.errorReason}</div>}
                    </div>
                  ))}
                </div>
              ) : <p>No AI failure logs.</p>}
            </div>

            {/* CLASSIFICATION COMPETITION */}
            <div className="col-span-2 bg-white p-4 rounded border border-slate-200">
              <h3 className="font-bold text-sm mb-3 border-b pb-2">Classification Insights</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-slate-400 font-bold mb-1">Final Decision</div>
                  <div className="text-indigo-600 font-bold text-lg">{data.classification?.websiteType}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold mb-1">Platform Type</div>
                  <div className="text-slate-700 font-bold text-lg">{data.classification?.platformType || "N/A"}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold mb-1">Confidence</div>
                  <div className="font-medium text-lg">{data.classification?.confidence?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold mb-1">Deterministic Score</div>
                  <div className="font-medium">{data.classification?.deterministicScore}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold mb-1">AI Status</div>
                  <div className="font-medium uppercase">{data.classification?.aiStatus || (data.classification?.aiAgreement ? "AI_AGREEMENT" : "AI_DISAGREEMENT")}</div>
                </div>
              </div>
              
              {data.classification?.classificationSummary && data.classification.classificationSummary.length > 0 && (
                <div className="mt-4 border-t pt-4 bg-indigo-50/50 p-4 rounded-lg">
                  <h4 className="font-bold text-sm mb-2 text-indigo-900 uppercase">Classification Summary</h4>
                  <p className="text-xs text-slate-600 mb-2">Detected as <span className="font-bold">{data.classification.websiteType}</span> because:</p>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                    {data.classification.classificationSummary.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {data.classification?.voteBreakdown && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-bold text-sm mb-2 text-slate-600 uppercase">Vote Breakdown</h4>
                  <div className="space-y-4">
                    {["businessModel", "structuredData", "ai", "navigation", "cta", "keyword"].map((signalType) => {
                      const votes = data.classification?.voteBreakdown?.[signalType];
                      if (!votes || votes.length === 0) return null;
                      return (
                        <div key={signalType} className="bg-slate-50 p-2 rounded border border-slate-100">
                          <h5 className="font-bold text-slate-500 uppercase text-[10px] mb-2">{signalType}</h5>
                          <ul className="space-y-1">
                            {votes.map((v: any, i: number) => (
                              <li key={i} className="flex gap-2">
                                <span className="font-bold text-indigo-500 shrink-0 w-10">+{v.voteValue}</span>
                                <span className="font-bold shrink-0 w-24 text-slate-600">{v.category}</span>
                                <span className="text-slate-500 italic shrink-0 w-24">({v.source})</span>
                                <span className="flex-1 truncate" title={v.matchedText}>"{v.matchedText}"</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: UNDERSTANDING */}
        {activeTab === "understanding" && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded border border-slate-200">
              <h3 className="font-bold text-sm mb-3 border-b pb-2">Website Understanding</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-400 font-bold mb-1">Business Model</div>
                  <div className="text-sm font-medium">{data.websiteUnderstanding?.businessModel}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold mb-1">Primary Goal</div>
                  <div className="text-sm font-medium">{data.websiteUnderstanding?.primaryGoal}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold mb-1">Target Audience</div>
                  <div className="text-sm font-medium">{data.websiteUnderstanding?.targetAudience}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold mb-1">Monetization Model</div>
                  <div className="text-sm font-medium">{data.websiteUnderstanding?.monetizationModel}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-slate-400 font-bold mb-1">Value Proposition</div>
                  <div className="text-sm font-medium">{data.websiteUnderstanding?.valueProposition}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-slate-400 font-bold mb-1">Evidence</div>
                  <ul className="list-disc pl-4 mt-1 text-slate-600">
                    {data.websiteUnderstanding?.evidence?.map((e: string, i: number) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            {data.aiFailures?.find((l: any) => l.step === "website_understanding")?.rawResponse && (
              <div className="bg-slate-900 text-emerald-400 p-4 rounded overflow-auto max-h-96">
                <h3 className="font-bold text-white mb-2">Raw Model Response:</h3>
                <pre>{data.aiFailures.find((l: any) => l.step === "website_understanding").rawResponse}</pre>
              </div>
            )}
          </div>
        )}

        {/* TAB: CATEGORY */}
        {activeTab === "category" && (
          <div className="bg-white p-4 rounded border border-slate-200">
            <h3 className="font-bold text-sm mb-3 border-b pb-2">Category Audit Viewer</h3>
            <div className="mb-4">
              <span className="font-bold">Overall Score:</span> {data.categoryAudit?.overallScore}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-emerald-600 mb-2">Strengths</h4>
                <ul className="list-disc pl-4 space-y-1">
                  {data.categoryAudit?.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-rose-600 mb-2">Weaknesses</h4>
                <ul className="list-disc pl-4 space-y-1">
                  {data.categoryAudit?.weaknesses?.map((w: string, i: number) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-bold mb-2">Top Findings</h4>
              <div className="space-y-2">
                {data.categoryAudit?.findings?.map((f: any, i: number) => (
                  <div key={i} className="bg-slate-50 p-2 rounded border border-slate-100 flex gap-4">
                    <span className="font-bold text-indigo-500 w-24 shrink-0">[{f.category}]</span>
                    <span className={`font-bold w-16 shrink-0 ${f.severity === "high" || f.severity === "critical" ? "text-rose-500" : f.severity === "medium" ? "text-amber-500" : "text-emerald-500"}`}>{f.severity}</span>
                    <span className="flex-1">{f?.detail || f?.title || (f?.check && typeof f.check === "string" ? f.check.replace(/_/g, " ") : "Unknown check")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: GROWTH */}
        {activeTab === "growth" && (
          <div className="space-y-6">
            <div className="bg-indigo-50 p-4 rounded border border-indigo-200 mb-6">
              <span className="font-bold text-indigo-800 text-lg">Readiness Score: {data.growthReport?.readinessScore}/100</span>
            </div>

            {data.growthReport?.insights?.map((insight: any, i: number) => (
              <div key={i} className="bg-white p-5 rounded border border-slate-200 shadow-sm relative">
                <div className="absolute top-4 right-4 text-slate-400 font-bold uppercase">{insight.impact} impact</div>
                <h3 className="font-bold text-lg mb-4 text-indigo-900 pr-24">{insight.title}</h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Finding</span>
                    <p className="text-sm font-medium">{insight.findingContext || insight.detected}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Evidence</span>
                    <ul className="list-disc pl-4 text-sm text-slate-600 mt-1">
                      {insight.evidence?.map((e: string, j: number) => <li key={j}>{e}</li>)}
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Understanding Context</span>
                    <p className="text-sm text-slate-600 bg-amber-50 p-2 rounded border border-amber-100 italic">{insight.understandingContext || "Context inferred from business model."}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Why It Matters</span>
                    <p className="text-sm font-medium text-rose-700 bg-rose-50 p-2 rounded">{insight.whyItMatters}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Recommendation</span>
                    <p className="text-sm font-bold text-emerald-800 bg-emerald-50 p-2 rounded">{insight.recommendedAction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: SCORES */}
        {activeTab === "scores" && (
          <div className="space-y-6">
            {(["performance", "trust", "clarity", "conversion"] as const).map(dim => {
              const dimData = scores[dim];
              if (!dimData) return null;
              
              // Calculate deductions and bonuses manually for display
              // We assume base is 100, and deductions are based on findings
              let base = 100;
              let deductions: { check: string; detail?: string; severity: string }[] = [];
              let bonuses: { check: string; detail?: string; severity: string }[] = [];

              dimData.findings.forEach(f => {
                if (f.severity === "pass") bonuses.push(f);
                else deductions.push(f);
              });

              return (
                <div key={dim} className="bg-white p-4 rounded border border-slate-200">
                  <div className="flex items-center justify-between border-b pb-3 mb-3">
                    <h3 className="font-bold text-lg uppercase">{dim}</h3>
                    <span className="font-black text-2xl" style={{ color: `hsl(${dimData.score}, 80%, 45%)` }}>{Math.round(dimData.score)}</span>
                  </div>
                  <div className="text-sm text-slate-500 mb-2 font-bold uppercase">Base Score: 100</div>
                  
                  {deductions.length > 0 && (
                    <div className="mb-4">
                      <div className="text-rose-500 font-bold mb-1">Deductions</div>
                      <div className="space-y-1 pl-2 border-l-2 border-rose-200">
                        {deductions.map((d, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-rose-600 font-bold shrink-0">- pts</span>
                            <span className="text-slate-700">{typeof d?.check === "string" ? d.check.replace(/_/g, ' ') : "Unknown check"}</span>
                            {d.detail && <span className="text-slate-400">({d.detail})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {bonuses.length > 0 && (
                    <div>
                      <div className="text-emerald-500 font-bold mb-1">Bonuses / Passes</div>
                      <div className="space-y-1 pl-2 border-l-2 border-emerald-200">
                        {bonuses.map((b, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-emerald-600 font-bold shrink-0">+ pass</span>
                            <span className="text-slate-700">{typeof b?.check === "string" ? b.check.replace(/_/g, ' ') : "Unknown check"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t font-bold text-right text-sm">
                    Final Score: {Math.round(dimData.score)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB: RAW JSON */}
        {activeTab === "raw" && (
          <div className="bg-slate-900 p-4 rounded border border-slate-800 text-white">
            <div className="flex gap-2 mb-4 border-b border-slate-700 pb-4">
              {["classification", "websiteUnderstanding", "categoryAudit", "growthReport"].map(t => (
                <button
                  key={t}
                  onClick={() => setRawTab(t)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    rawTab === t ? "bg-indigo-500 text-white font-bold" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <pre className="text-[10px] overflow-auto max-h-[600px] text-emerald-400">
              {JSON.stringify(data[rawTab], null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
