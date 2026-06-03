import React from "react";
import {
  Document, Page, View, Text, StyleSheet, Font, renderToBuffer,
} from "@react-pdf/renderer";
import type { PartialReport } from "@/types";
import { scoreToLabel } from "@/lib/utils";

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e9ed",
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoBox: {
    width: 24, height: 24, backgroundColor: "#0d9488",
    borderRadius: 5,
  },
  logoText: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#131d27" },
  headerRight: { alignItems: "flex-end" },
  headerDomain: { fontSize: 11, color: "#697a88" },
  headerDate: { fontSize: 10, color: "#9aaab7", marginTop: 2 },

  // Score hero
  heroCard: {
    backgroundColor: "#f8fafb",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    flexDirection: "row",
    gap: 24,
    alignItems: "flex-start",
  },
  scoreCircle: {
    width: 72, height: 72,
    borderRadius: 36,
    borderWidth: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNum: { fontSize: 22, fontFamily: "Helvetica-Bold" },
  scoreLabel: { fontSize: 8, color: "#697a88", marginTop: 2 },
  heroRight: { flex: 1 },
  narrativeText: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#131d27", marginBottom: 8, lineHeight: 1.4 },
  summaryText: { fontSize: 11, color: "#4a5668", lineHeight: 1.6 },

  // Score bars
  dimensionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 },
  dimensionBox: {
    width: "47%",
    backgroundColor: "#f8fafb",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e4e9ed",
  },
  dimensionLabel: { fontSize: 9, color: "#697a88", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  dimensionScore: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  barBg: { height: 4, backgroundColor: "#e4e9ed", borderRadius: 2, marginTop: 4 },
  barFill: { height: 4, borderRadius: 2 },

  // Section headings
  sectionHeading: {
    fontSize: 14, fontFamily: "Helvetica-Bold", color: "#131d27",
    marginBottom: 14, marginTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e9ed",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionHeadingText: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#131d27" },

  // Quick wins
  winCard: {
    borderWidth: 1,
    borderColor: "#e4e9ed",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  winHeader: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 8 },
  winBadge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  winBadgeText: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#92400e" },
  winTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#131d27", flex: 1, lineHeight: 1.4 },
  winImpact: { fontSize: 11, color: "#4a5668", lineHeight: 1.5, marginBottom: 8 },
  winFix: {
    backgroundColor: "#f0fdf9",
    borderLeftWidth: 3,
    borderLeftColor: "#14b8a6",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 3,
  },
  winFixLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#697a88", textTransform: "uppercase", marginBottom: 3 },
  winFixText: { fontSize: 10, color: "#354050", lineHeight: 1.5 },

  // Section insight
  insightCard: {
    backgroundColor: "#f8fafb",
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e4e9ed",
  },
  insightDim: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#131d27", marginBottom: 4, textTransform: "capitalize" },
  insightSummary: { fontSize: 10, color: "#4a5668", lineHeight: 1.5, marginBottom: 8 },
  findingRow: { flexDirection: "row", gap: 6, alignItems: "flex-start", marginBottom: 4 },
  dot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 3, flexShrink: 0 },
  findingText: { fontSize: 10, color: "#4a5668", flex: 1, lineHeight: 1.4 },

  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e4e9ed",
    paddingTop: 10,
  },
  footerText: { fontSize: 9, color: "#9aaab7" },
});

function scoreCol(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  return "#f43f5e";
}

const DIMS = ["performance", "trust", "clarity", "conversion"] as const;

// ─── PDF Document ─────────────────────────────────────────────────────────────
function ReportDocument({ report, shareToken }: { report: PartialReport; shareToken: string }) {
  const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://sitecheck.ai"}/report/${shareToken}`;
  const dateStr   = new Date(report.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return React.createElement(Document, {
    title: `SiteCheck Report — ${report.domain}`,
    author: "SiteCheck AI",
  },
    // ── Page 1: Overview + Quick Wins ────────────────────────────────────────
    React.createElement(Page, { size: "A4", style: S.page },

      // Header
      React.createElement(View, { style: S.header },
        React.createElement(View, { style: S.logoRow },
          React.createElement(View, { style: S.logoBox }),
          React.createElement(Text, { style: S.logoText }, "SiteCheck")
        ),
        React.createElement(View, { style: S.headerRight },
          React.createElement(Text, { style: S.headerDomain }, report.domain),
          React.createElement(Text, { style: S.headerDate }, dateStr),
        )
      ),

      // Score hero
      React.createElement(View, { style: S.heroCard },
        React.createElement(View, { style: [S.scoreCircle, { borderColor: scoreCol(report.scores.overall) }] as ReturnType<typeof StyleSheet.create>[string][] },
          React.createElement(Text, { style: [S.scoreNum, { color: scoreCol(report.scores.overall) }] as ReturnType<typeof StyleSheet.create>[string][] },
            `${Math.round(report.scores.overall)}`
          ),
          React.createElement(Text, { style: S.scoreLabel }, "/100"),
        ),
        React.createElement(View, { style: S.heroRight },
          React.createElement(Text, { style: S.narrativeText }, report.overallNarrative || `Growth report — ${report.domain}`),
          React.createElement(Text, { style: S.summaryText }, report.consultantSummary),
        )
      ),

      // Dimension scores
      React.createElement(View, { style: S.dimensionGrid },
        ...DIMS.map(dim =>
          React.createElement(View, { key: dim, style: S.dimensionBox },
            React.createElement(Text, { style: S.dimensionLabel }, dim),
            React.createElement(Text, { style: [S.dimensionScore, { color: scoreCol(report.scores[dim].score) }] as ReturnType<typeof StyleSheet.create>[string][] },
              `${Math.round(report.scores[dim].score)}`
            ),
            React.createElement(Text, { style: { fontSize: 9, color: scoreCol(report.scores[dim].score) } },
              scoreToLabel(report.scores[dim].score)
            ),
            React.createElement(View, { style: S.barBg },
              React.createElement(View, { style: [S.barFill, { width: `${report.scores[dim].score}%`, backgroundColor: scoreCol(report.scores[dim].score) }] as ReturnType<typeof StyleSheet.create>[string][] })
            )
          )
        )
      ),

      // Quick wins
      React.createElement(View, { style: S.sectionHeading },
        React.createElement(Text, { style: S.sectionHeadingText }, "⚡ Top 3 Quick Wins")
      ),
      ...report.quickWins.slice(0, 3).map((win, i) =>
        React.createElement(View, { key: i, style: S.winCard },
          React.createElement(View, { style: S.winHeader },
            React.createElement(View, { style: S.winBadge },
              React.createElement(Text, { style: S.winBadgeText }, `${i + 1}`)
            ),
            React.createElement(Text, { style: S.winTitle }, win.title)
          ),
          React.createElement(Text, { style: S.winImpact }, win.whyItMatters),
          React.createElement(View, { style: S.winFix },
            React.createElement(Text, { style: S.winFixLabel }, "How to fix it"),
            React.createElement(Text, { style: S.winFixText }, win.howToFix),
          )
        )
      ),

      // Footer
      React.createElement(View, { style: S.footer, fixed: true },
        React.createElement(Text, { style: S.footerText }, `SiteCheck AI — ${report.domain}`),
        React.createElement(Text, { style: S.footerText }, reportUrl),
      )
    ),

    // ── Page 2: Detailed analysis ────────────────────────────────────────────
    React.createElement(Page, { size: "A4", style: S.page },

      React.createElement(View, { style: S.header },
        React.createElement(View, { style: S.logoRow },
          React.createElement(View, { style: S.logoBox }),
          React.createElement(Text, { style: S.logoText }, "SiteCheck")
        ),
        React.createElement(Text, { style: S.headerDomain }, "Detailed Analysis")
      ),

      React.createElement(View, { style: S.sectionHeading },
        React.createElement(Text, { style: S.sectionHeadingText }, "Dimension Analysis")
      ),

      ...(DIMS.map(dim => {
        const insight = report.sectionInsights[dim];
        const score   = report.scores[dim];
        if (!insight) {
          return React.createElement(View, { key: dim, style: [S.insightCard, { opacity: 0.5 }] as ReturnType<typeof StyleSheet.create>[string][] },
            React.createElement(Text, { style: S.insightDim }, `${dim} — unlock full report`),
          );
        }
        const issues  = score.findings.filter(f => f.severity !== "pass");
        const passing = score.findings.filter(f => f.severity === "pass");
        return React.createElement(View, { key: dim, style: S.insightCard },
          React.createElement(Text, { style: [S.insightDim, { color: scoreCol(score.score) }] as ReturnType<typeof StyleSheet.create>[string][] },
            `${dim.charAt(0).toUpperCase() + dim.slice(1)} — ${Math.round(score.score)}/100 — ${scoreToLabel(score.score)}`
          ),
          React.createElement(Text, { style: S.insightSummary }, insight.summary),
          ...issues.slice(0, 4).map((f, i) =>
            React.createElement(View, { key: i, style: S.findingRow },
              React.createElement(View, { style: [S.dot, { backgroundColor: f.severity === "critical" ? "#f43f5e" : "#f59e0b" }] as ReturnType<typeof StyleSheet.create>[string][] }),
              React.createElement(Text, { style: S.findingText }, insight.improvements[i] ?? f.check.replace(/_/g, " "))
            )
          ),
          ...passing.slice(0, 2).map((f, i) =>
            React.createElement(View, { key: `p${i}`, style: S.findingRow },
              React.createElement(View, { style: [S.dot, { backgroundColor: "#10b981" }] as ReturnType<typeof StyleSheet.create>[string][] }),
              React.createElement(Text, { style: S.findingText }, insight.positives[i] ?? f.check.replace(/_/g, " "))
            )
          )
        );
      })),

      React.createElement(View, { style: S.footer, fixed: true },
        React.createElement(Text, { style: S.footerText }, "Generated by SiteCheck AI — sitecheck.ai"),
        React.createElement(Text, { style: S.footerText }, `${dateStr}`),
      )
    )
  );
}

export async function generatePDFReport(report: PartialReport, shareToken: string): Promise<Buffer> {
  const element = React.createElement(ReportDocument, { report, shareToken });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return renderToBuffer(element as any);
}
