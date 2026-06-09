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
    let userId: string | null = null;

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        supabase = await createServiceClient();
      }
      
      // Fetch authenticated user context for linking the audit
      const { createClient } = await import("@/lib/supabase/server");
      const userClient = await createClient();
      const { data: { session } } = await userClient.auth.getSession();
      userId = session?.user?.id || null;
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
    console.error(">>> [DEBUG] Starting runAudit for:", url);
    const record = await runAudit({ url });
    console.error(">>> [DEBUG] Generated audit token:", record.shareToken);

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

      console.error(">>> [DEBUG] Attempting Supabase insert for audit:", record.id);
      
      // --- Temporary Schema Validation ---
      const { data: schemaCheckData, error: schemaCheckError } = await supabase.from('audits').select('*').limit(1);
      if (!schemaCheckError) {
        const availableColumns = schemaCheckData && schemaCheckData.length > 0 
            ? Object.keys(schemaCheckData[0]) 
            : [];
        const expectedColumns = [
          'id', 'user_id', 'url', 'domain', 'share_token', 'is_public', 
          'score_overall', 'score_performance', 'score_trust', 'score_clarity', 'score_conversion', 
          'scores', 'scraped_data', 'pagespeed_data', 'ai_report', 'is_paid', 'payment_id', 
          'created_at', 'website_type', 'classification_confidence', 'classification_scores', 
          'classification_reasoning', 'category_audit', 'website_understanding', 'growth_report',
          'execution_timing', 'ai_logs'
        ];
        if (availableColumns.length > 0) {
          const missingColumns = expectedColumns.filter(c => !availableColumns.includes(c));
          if (missingColumns.length > 0) {
            console.warn(`⚠️ [SCHEMA WARNING] The following expected columns are missing in the Supabase schema cache: ${missingColumns.join(', ')}`);
            console.warn(`If you recently ran a migration, execute: NOTIFY pgrst, 'reload schema' in the SQL editor.`);
          }
        }
      } else {
        console.warn(`⚠️ [SCHEMA WARNING] Could not verify schema: ${schemaCheckError.message}`);
      }
      // -----------------------------------
      
      const insertPayload = {
        id:                        record.id,
        user_id:                   userId,
        url:                       record.url,
        domain:                    record.domain,
        share_token:               record.shareToken,
        is_public:                 true,
        score_overall:             record.scores.overall,
        score_performance:         record.scores.performance.score,
        score_trust:               record.scores.trust.score,
        score_clarity:             record.scores.clarity.score,
        score_conversion:          record.scores.conversion.score,
        scores:                    record.scores,
        scraped_data:              record.scrapedData,
        pagespeed_data:            record.pageSpeedData,
        ai_report:                 record.aiReport,
        website_type:              record.classification?.websiteType ?? "unknown",
        classification_confidence: record.classification?.confidence ?? 0,
        classification_scores:     record.classification?.categoryScores ?? null,
        classification_reasoning:  record.classification ? {
          evidence: record.classification.evidence,
          deterministicScore: record.classification.deterministicScore,
          aiAgreement: record.classification.aiAgreement,
          voteBreakdown: record.classification.voteBreakdown
        } : null,
        category_audit:            record.categoryAudit ?? null,
        website_understanding:     record.websiteUnderstanding ?? null,
        growth_report:             record.growthReport ?? null,
        execution_timing:          record.executionTiming ?? null,
        ai_logs:                   record.aiLogs ?? null,
        ai_available:              record.aiAvailable ?? null,
        fallback_used:             record.fallbackUsed ?? null,
        ai_failure_reason_code:    record.aiFailureReasonCode ?? null,
        ai_failure_reason_message: record.aiFailureReasonMessage ?? null,
        audit_confidence:          record.auditConfidence ?? null,
        scrape_diagnostics:        record.scrapeDiagnostics ?? null,
        consultant_report:         record.consultantReport ?? null,
        is_paid:                   false,
      };

      console.error(">>> [DEBUG] Insert Payload Keys:", Object.keys(insertPayload));

      const { data: insertData, error: insertError } = await supabase
        .from("audits")
        .insert(insertPayload)
        .select();

      console.error(">>> [DEBUG] Supabase Insert Result Data:", insertData);
      console.error(">>> [DEBUG] Supabase Insert Error:", insertError);

      if (insertError) {
        throw new Error(`DB Insert Failed: ${insertError.message}`);
      }
    }

    console.error(">>> [DEBUG] Returning success to client with token:", record.shareToken);

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
  // ... skipping down to PartialReport builders ...
function buildPartialReportFromRow(row: Record<string, any>): PartialReport {
  const scores = row.scores;
  const ai = row.ai_report;
  return {
    domain: row.domain,
    url:    row.url,
    scores,
    consultantSummary: ai?.consultantSummary || "",
    overallNarrative:  ai?.overallNarrative || "",
    quickWins:         ai?.quickWins || [],
    sectionInsights: {
      performance: findInsight(ai?.sectionInsights, "performance"),
      trust:       findInsight(ai?.sectionInsights, "trust"),
      clarity:     row.is_paid ? findInsight(ai?.sectionInsights, "clarity") : null,
      conversion:  row.is_paid ? findInsight(ai?.sectionInsights, "conversion") : null,
    },
    consultantReport: row.consultant_report,
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
    consultantSummary: ai?.consultantSummary || "",
    overallNarrative:  ai?.overallNarrative || "",
    quickWins:         ai?.quickWins || [],
    sectionInsights: {
      performance: findInsight(ai?.sectionInsights, "performance"),
      trust:       findInsight(ai?.sectionInsights, "trust"),
      clarity:     null,
      conversion:  null,
    },
    consultantReport: record.consultantReport,
    isPaid:    false,
    createdAt: record.createdAt,
  };
}
