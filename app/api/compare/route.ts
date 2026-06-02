import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { ComparisonResult } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain    = searchParams.get("domain");
  const currentId = searchParams.get("current");
  const prevId    = searchParams.get("previous");

  if (!domain && !currentId) {
    return NextResponse.json({ error: "domain or current audit id required" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // If specific IDs provided
  if (currentId && prevId) {
    const [{ data: current }, { data: previous }] = await Promise.all([
      supabase.from("audits").select("id,domain,score_overall,score_performance,score_trust,score_clarity,score_conversion,created_at").eq("id", currentId).single(),
      supabase.from("audits").select("id,domain,score_overall,score_performance,score_trust,score_clarity,score_conversion,created_at").eq("id", prevId).single(),
    ]);

    if (!current || !previous) {
      return NextResponse.json({ error: "One or both audits not found" }, { status: 404 });
    }

    return NextResponse.json({ comparison: buildComparison(current, previous) });
  }

  // Find last two audits for the domain
  const { data: audits } = await supabase
    .from("audits")
    .select("id,domain,score_overall,score_performance,score_trust,score_clarity,score_conversion,created_at,share_token")
    .eq("domain", domain!)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!audits || audits.length < 2) {
    return NextResponse.json({
      comparison:  null,
      auditCount:  audits?.length ?? 0,
      message:     audits && audits.length === 1
        ? "Only one audit found — run another audit after making changes to compare"
        : "No audits found for this domain",
      recentAudits: audits?.map(a => ({
        id: a.id, shareToken: a.share_token, date: a.created_at,
        overall: a.score_overall,
      })) ?? [],
    });
  }

  const current  = audits[0];
  const previous = audits[1];

  return NextResponse.json({
    comparison:  buildComparison(current, previous),
    recentAudits: audits.slice(0, 5).map(a => ({
      id: a.id, shareToken: a.share_token, date: a.created_at,
      overall: a.score_overall,
    })),
  });
}

type AuditRow = {
  id: string;
  domain: string;
  score_overall: number;
  score_performance: number;
  score_trust: number;
  score_clarity: number;
  score_conversion: number;
  created_at: string;
};

function buildComparison(current: AuditRow, previous: AuditRow): ComparisonResult {
  const delta = {
    overall:     current.score_overall     - previous.score_overall,
    performance: current.score_performance - previous.score_performance,
    trust:       current.score_trust       - previous.score_trust,
    clarity:     current.score_clarity     - previous.score_clarity,
    conversion:  current.score_conversion  - previous.score_conversion,
  };

  const dims = ["performance", "trust", "clarity", "conversion"] as const;
  const improved  = dims.filter(d => delta[d] > 2);
  const declined  = dims.filter(d => delta[d] < -2);
  const unchanged = dims.filter(d => Math.abs(delta[d]) <= 2);

  return {
    previousAuditId: previous.id,
    currentAuditId:  current.id,
    previousDate:    previous.created_at,
    currentDate:     current.created_at,
    domain:          current.domain,
    scoreDelta:      delta,
    improved,
    declined,
    unchanged,
    previousScores: {
      overall:     previous.score_overall,
      performance: previous.score_performance,
      trust:       previous.score_trust,
      clarity:     previous.score_clarity,
      conversion:  previous.score_conversion,
    },
    currentScores: {
      overall:     current.score_overall,
      performance: current.score_performance,
      trust:       current.score_trust,
      clarity:     current.score_clarity,
      conversion:  current.score_conversion,
    },
  };
}
