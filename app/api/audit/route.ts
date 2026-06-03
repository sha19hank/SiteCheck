import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/audit";
import { createServiceClient } from "@/lib/supabase/server";
import { normalizeUrl, extractDomain } from "@/lib/utils";
import type { AuditResponse, PartialReport, AuditRecord, SectionInsight } from "@/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { url?: string; email?: string };
    const { url: rawUrl, email } = body;

    if (!rawUrl || typeof rawUrl !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const url = normalizeUrl(rawUrl);
    const domain = extractDomain(url);

    try { new URL(url); } catch {
      return NextResponse.json({ error: "Please enter a valid website URL" }, { status: 400 });
    }

    if (/localhost|127\.0\.0|192\.168\.|10\.\d|::1/.test(url)) {
      return NextResponse.json({ error: "Private URLs cannot be audited" }, { status: 400 });
    }

    let supabase: Awaited<ReturnType<typeof createServiceClient>> | null = null;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        supabase = await createServiceClient();
      }
    } catch (e) {
      console.warn("Supabase client init failed, running in memory-only mode");
    }

    // Cache check
    if (supabase) {
      try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: cached } = await supabase
          .from("audits")
          .select("*")
          .eq("domain", domain)
          .gte("created_at", oneDayAgo)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (cached) {
          const report = buildPartialReportFromRow(cached);
          return NextResponse.json({
            auditId: cached.id,
            shareToken: cached.share_token,
            partialReport: report,
            cached: true,
          });
        }
      } catch (cacheErr) {
        console.warn("Cache check failed, proceeding with fresh audit");
      }
    }

    // Run audit
    const record = await runAudit({ url });

    // Persist
    if (supabase) {
      // Email capture
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        try {
          await supabase.from("email_leads").upsert(
            { email, audit_id: record.id, source: "free_report_gate" },
            { onConflict: "email" }
          );
        } catch { /* non-fatal */ }
      }

      const { error: insertError } = await supabase.from("audits").insert({
        id:                record.id,
        url:               record.url,
        domain:            record.domain,
        share_token:       record.shareToken,
        is_public:         true,
        score_overall:     record.scores.overall,
        score_performance: record.scores.performance.score,
        score_trust:       record.scores.trust.score,
        score_clarity:     record.scores.clarity.score,
        score_conversion:  record.scores.conversion.score,
        scores:            record.scores,
        scraped_data:      record.scrapedData,
        pagespeed_data:    record.pageSpeedData,
        ai_report:         record.aiReport,
        screenshot_data:   record.screenshotData,
        is_paid:           false,
      });

      if (insertError) console.error("DB insert error:", insertError);
    }

    return NextResponse.json({
      auditId:       record.id,
      shareToken:    record.shareToken,
      partialReport: buildPartialReportFromRecord(record),
    } satisfies AuditResponse);

  } catch (err) {
    console.error("Audit error:", err);
    const message = err instanceof Error ? err.message : "Audit failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function findInsight(insights: SectionInsight[] | undefined, dim: string): SectionInsight | null {
  return insights?.find((s: SectionInsight) => s.dimension === dim) ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPartialReportFromRow(row: Record<string, any>): PartialReport {
  const scores = row.scores;
  const ai = row.ai_report;
  return {
    domain: row.domain,
    url:    row.url,
    scores,
    consultantSummary: ai.consultantSummary,
    overallNarrative:  ai.overallNarrative,
    quickWins:         ai.quickWins,
    sectionInsights: {
      performance: findInsight(ai.sectionInsights, "performance"),
      trust:       findInsight(ai.sectionInsights, "trust"),
      clarity:     row.is_paid ? findInsight(ai.sectionInsights, "clarity") : null,
      conversion:  row.is_paid ? findInsight(ai.sectionInsights, "conversion") : null,
    },
    isPaid:    row.is_paid,
    createdAt: row.created_at,
  };
}

function buildPartialReportFromRecord(record: AuditRecord): PartialReport {
  const ai = record.aiReport;
  return {
    domain: record.domain,
    url:    record.url,
    scores: record.scores,
    consultantSummary: ai.consultantSummary,
    overallNarrative:  ai.overallNarrative,
    quickWins:         ai.quickWins,
    sectionInsights: {
      performance: findInsight(ai.sectionInsights, "performance"),
      trust:       findInsight(ai.sectionInsights, "trust"),
      clarity:     null,
      conversion:  null,
    },
    isPaid:    false,
    createdAt: record.createdAt,
  };
}
