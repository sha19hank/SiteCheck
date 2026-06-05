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

  const ai = data.ai_report;
  const find = (dim: string): SectionInsight | null =>
    ai.sectionInsights?.find((s: SectionInsight) => s.dimension === dim) ?? null;

  const report: PartialReport = {
    domain:            data.domain,
    url:               data.url,
    scores:            data.scores,
    consultantSummary: ai.consultantSummary,
    overallNarrative:  ai.overallNarrative,
    quickWins:         ai.quickWins,
    sectionInsights: {
      performance: find("performance"),
      trust:       find("trust"),
      clarity:     data.is_paid ? find("clarity")    : null,
      conversion:  data.is_paid ? find("conversion") : null,
    },
    isPaid:    data.is_paid,
    createdAt: data.created_at,
  };

  return NextResponse.json({
    report,
    auditId:     data.id,
    shareToken:  data.share_token,
    screenshots: data.screenshot_data ?? null,
  });
}
