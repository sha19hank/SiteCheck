import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { PartialReport, SectionInsight } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServiceClient();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

  let query = supabase.from("audits").select("*");
  if (isUuid) {
    query = query.eq("id", id);
  } else {
    query = query.eq("share_token", id);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const report: PartialReport = {
    domain: data.domain,
    url: data.url,
    scores: data.scores,
    consultantSummary: data.ai_report?.consultantSummary || "",
    overallNarrative: data.ai_report?.overallNarrative || "",
    quickWins: data.ai_report?.quickWins || [],
    sectionInsights: data.ai_report?.sectionInsights || {
      performance: null,
      trust: null,
      clarity: null,
      conversion: null,
    },
    isPaid: data.is_paid,
    createdAt: data.created_at,
    aiAvailable: data.ai_available,
    fallbackUsed: data.fallback_used,
    aiFailureReasonCode: data.ai_failure_reason_code,
    aiFailureReasonMessage: data.ai_failure_reason_message,
    auditConfidence: data.audit_confidence,
    scrapeDiagnostics: data.scrape_diagnostics,
  };

  const response: any = {
    report,
    auditId:     data.id,
    shareToken:  data.share_token,
    screenshots: data.screenshot_data ?? null,
  };

  if (process.env.NODE_ENV === "development") {
    response.debugData = {
      timing: data.execution_timing,
      aiFailures: data.ai_logs,
      classification: {
        websiteType: data.website_type,
        confidence: data.classification_confidence,
        categoryScores: data.classification_scores,
        reasoning: data.classification_reasoning,
      },
      categoryAudit: data.category_audit,
      websiteUnderstanding: data.website_understanding,
      growthReport: data.growth_report,
      aiAvailable: data.ai_available,
      fallbackUsed: data.fallback_used,
      aiFailureReasonCode: data.ai_failure_reason_code,
      aiFailureReasonMessage: data.ai_failure_reason_message,
      auditConfidence: data.audit_confidence,
      scrapeDiagnostics: data.scrape_diagnostics,
      classifierInputPreview: {
        title: data.scraped_data?.title || null,
        navLinks: data.scraped_data?.navLinks || [],
        ctas: data.scraped_data?.ctaTexts || [],
        structuredDataTypes: data.scraped_data?.structuredDataTypes || [],
      },
    };
  }

  return NextResponse.json(response);
}
