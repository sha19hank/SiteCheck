"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
  auditId:  string;
  domain:   string;
  onSuccess: () => void;
  onClose:   () => void;
}

declare global {
  interface Window {
    Razorpay: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

export default function PaymentModal({ auditId, domain, onSuccess, onClose }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const price = process.env.NEXT_PUBLIC_REPORT_PRICE_INR ?? "499";

  async function handlePayment() {
    setLoading(true);
    setError("");

    try {
      // Create Razorpay order
      const res = await fetch("/api/payment/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ auditId }),
      });
      const data = await res.json() as {
        orderId: string; amount: number; currency: string;
        keyId: string; error?: string;
      };

      if (data.error) throw new Error(data.error);

      // Open Razorpay checkout
      const rzp = new window.Razorpay({
        key:      data.keyId,
        amount:   data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name:     "SiteCheck",
        description: `Full audit report — ${domain}`,
        theme:    { color: "#0d9488" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id:   string;
          razorpay_signature:  string;
        }) => {
          // Verify payment on our server
          const verifyRes = await fetch("/api/payment/webhook", {
            method:  "PUT",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              auditId,
            }),
          });
          const verifyData = await verifyRes.json() as { success?: boolean };
          if (verifyData.success) {
            onSuccess();
          } else {
            setError("Payment verification failed. Contact support.");
          }
          setLoading(false);
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-card-lg p-6 sm:p-8 animate-fade-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 btn-ghost p-1.5 rounded-full"
          aria-label="Close"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center mb-5 shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-surface-900 mb-2">Unlock your full report</h2>
        <p className="text-sm text-surface-500 leading-relaxed mb-6">
          Get your complete growth analysis for <strong className="text-surface-700">{domain}</strong> — including all 4 sections, Top 3 Quick Wins, and AI-powered consultant insights.
        </p>

        {/* What you get */}
        <div className="bg-surface-50 rounded-2xl p-4 mb-6 space-y-2.5">
          {[
            "All 4 analysis sections (Trust, Clarity, Conversion, Speed)",
            "Top 3 Quick Wins with exact how-to-fix instructions",
            "AI consultant summary personalised to your site",
            "PDF export for sharing with your team",
            "Permanent shareable link",
          ].map(item => (
            <div key={item} className="flex items-start gap-2.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-brand-500 shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm text-surface-700">{item}</span>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-sm text-rose-600 mb-4 p-3 bg-rose-50 rounded-xl">{error}</p>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className={cn("btn-primary w-full justify-center py-3.5 text-base", loading && "opacity-70")}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Opening payment…
            </span>
          ) : (
            `Unlock full report — ₹${price}`
          )}
        </button>

        <p className="text-center text-xs text-surface-400 mt-4">
          Secured by Razorpay &middot; One-time payment &middot; Instant access
        </p>
      </div>
    </div>
  );
}
