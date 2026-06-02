import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { PartialReport, SectionInsight } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .or(`id.eq.${id},share_token.eq.${id}`)
    .single();

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
