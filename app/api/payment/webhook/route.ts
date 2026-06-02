import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import crypto from "crypto";
import type { SectionInsight } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body      = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";
    const secret    = process.env.RAZORPAY_KEY_SECRET!;

    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body) as {
      event: string;
      payload: {
        payment: { entity: { id: string; order_id: string; notes?: { auditId?: string } } };
      };
    };

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const auditId = payment.notes?.auditId;
      if (!auditId) return NextResponse.json({ ok: true });

      const supabase = await createServiceClient();

      await supabase.from("audits").update({ is_paid: true }).eq("id", auditId);
      await supabase.from("payments")
        .update({ status: "paid", provider_id: payment.id })
        .eq("provider_id", payment.order_id);

      // Send paid report email if we have an email lead
      const { data: audit } = await supabase
        .from("audits")
        .select("domain, share_token, ai_report, scores")
        .eq("id", auditId)
        .single();

      const { data: lead } = await supabase
        .from("email_leads")
        .select("email")
        .eq("audit_id", auditId)
        .single();

      if (audit && lead?.email) {
        const { sendPaidReportEmail, sendEmailSafe } = await import("@/lib/email/sender");
        const ai = audit.ai_report;
        await sendEmailSafe(() =>
          sendPaidReportEmail(lead.email, {
            domain: audit.domain,
            url: "",
            scores: audit.scores,
            consultantSummary: ai.consultantSummary,
            overallNarrative: ai.overallNarrative,
            quickWins: ai.quickWins,
            sectionInsights: {
              performance: ai.sectionInsights?.find((s: SectionInsight) => s.dimension === "performance") ?? null,
              trust: ai.sectionInsights?.find((s: SectionInsight) => s.dimension === "trust") ?? null,
              clarity: ai.sectionInsights?.find((s: SectionInsight) => s.dimension === "clarity") ?? null,
              conversion: ai.sectionInsights?.find((s: SectionInsight) => s.dimension === "conversion") ?? null,
            },
            isPaid: true,
            createdAt: new Date().toISOString(),
          }, audit.share_token)
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

// Client-side payment verification
export async function PUT(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, auditId }
      = await req.json() as {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
          auditId: string;
        };

    const secret   = process.env.RAZORPAY_KEY_SECRET!;
    const body     = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 401 });
    }

    const supabase = await createServiceClient();
    await supabase.from("audits").update({ is_paid: true }).eq("id", auditId);
    await supabase.from("payments")
      .update({ status: "paid", provider_id: razorpay_payment_id })
      .eq("provider_id", razorpay_order_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Payment verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
