import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { auditId } = await req.json() as { auditId: string };
    if (!auditId) return NextResponse.json({ error: "auditId required" }, { status: 400 });

    const supabase = await createServiceClient();
    const { data: audit } = await supabase
      .from("audits")
      .select("id, domain, is_paid")
      .eq("id", auditId)
      .single();

    if (!audit) return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    if (audit.is_paid) return NextResponse.json({ error: "Already unlocked" }, { status: 400 });

    const amountPaise = parseInt(process.env.NEXT_PUBLIC_REPORT_PRICE_INR ?? "499") * 100;

    // Create Razorpay order via their REST API
    const razorpayKeyId     = process.env.RAZORPAY_KEY_ID!;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET!;

    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount:   amountPaise,
        currency: "INR",
        receipt:  `audit_${auditId.slice(0, 8)}`,
        notes:    { auditId, domain: audit.domain },
      }),
    });

    if (!orderRes.ok) {
      const err = await orderRes.text();
      console.error("Razorpay order error:", err);
      return NextResponse.json({ error: "Payment service error" }, { status: 500 });
    }

    const order = await orderRes.json() as { id: string };

    // Record pending payment
    await supabase.from("payments").insert({
      audit_id:     auditId,
      provider:     "razorpay",
      provider_id:  order.id,
      plan:         "report_unlock",
      amount_paise: amountPaise,
      status:       "pending",
    });

    return NextResponse.json({
      orderId:    order.id,
      amount:     amountPaise,
      currency:   "INR",
      keyId:      razorpayKeyId,
      auditId,
      domain:     audit.domain,
    });
  } catch (err) {
    console.error("Payment create error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
