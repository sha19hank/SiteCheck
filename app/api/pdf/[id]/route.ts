import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { PartialReport, SectionInsight } from "@/types";

export const maxDuration = 30;

export async function GET(
  req: NextRequest,
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

  if (!data.is_paid) {
    return NextResponse.json(
      { error: "PDF export is available for paid reports only" },
      { status: 403 }
    );
  }

  const ai = data.ai_report;
  const report: PartialReport = {
    domain:            data.domain,
    url:               data.url,
    scores:            data.scores,
    consultantSummary: ai.consultantSummary,
    overallNarrative:  ai.overallNarrative,
    quickWins:         ai.quickWins,
    sectionInsights: {
      performance: ai.sectionInsights?.find((s: SectionInsight) => s.dimension === "performance") ?? null,
      trust:       ai.sectionInsights?.find((s: SectionInsight) => s.dimension === "trust") ?? null,
      clarity:     ai.sectionInsights?.find((s: SectionInsight) => s.dimension === "clarity") ?? null,
      conversion:  ai.sectionInsights?.find((s: SectionInsight) => s.dimension === "conversion") ?? null,
    },
    isPaid:    true,
    createdAt: data.created_at,
  };

  try {
    const { generatePDFReport } = await import("@/lib/pdf/generator");
    const pdfBuffer = await generatePDFReport(report, data.share_token);

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="sitecheck-${data.domain}-report.pdf"`,
        "Content-Length":      pdfBuffer.length.toString(),
        "Cache-Control":       "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
