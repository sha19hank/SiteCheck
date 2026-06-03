import { Resend } from "resend";
import type { PartialReport } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.FROM_EMAIL ?? "SiteCheck <noreply@sitecheck.ai>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://sitecheck.ai";

// ─── Shared email styles ──────────────────────────────────────────────────────
const base = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>SiteCheck</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #f8fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #212d3a; }
  .wrapper { max-width: 560px; margin: 32px auto; padding: 0 16px 48px; }
  .card { background: #ffffff; border-radius: 16px; border: 1px solid #e4e9ed; overflow: hidden; }
  .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 28px 32px; }
  .logo { display: flex; align-items: center; gap: 10px; }
  .logo-icon { width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .logo-text { color: white; font-weight: 600; font-size: 15px; }
  .body { padding: 32px; }
  h1 { font-size: 22px; font-weight: 600; color: #131d27; margin-bottom: 12px; line-height: 1.3; }
  p { font-size: 15px; color: #4a5668; line-height: 1.6; margin-bottom: 16px; }
  .btn { display: inline-block; background: #0d9488; color: white !important; text-decoration: none; padding: 13px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 8px 0 24px; }
  .score-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
  .score-box { background: #f8fafb; border: 1px solid #e4e9ed; border-radius: 10px; padding: 14px 16px; }
  .score-label { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #697a88; font-weight: 600; margin-bottom: 4px; }
  .score-val { font-size: 24px; font-weight: 700; }
  .win-card { border: 1px solid #e4e9ed; border-radius: 10px; padding: 16px; margin-bottom: 12px; }
  .win-num { display: inline-block; width: 22px; height: 22px; background: #fef3c7; color: #92400e; border-radius: 50%; font-size: 11px; font-weight: 700; text-align: center; line-height: 22px; margin-bottom: 8px; }
  .win-title { font-size: 14px; font-weight: 600; color: #131d27; margin-bottom: 6px; }
  .win-fix { font-size: 13px; color: #697a88; background: #f8fafb; border-left: 3px solid #14b8a6; padding: 8px 12px; border-radius: 0 6px 6px 0; margin-top: 8px; }
  .divider { height: 1px; background: #e4e9ed; margin: 24px 0; }
  .footer { text-align: center; padding: 24px 32px; font-size: 12px; color: #9aaab7; }
  .footer a { color: #9aaab7; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7" stroke="white" stroke-width="2"/>
            <path d="M7 10l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="logo-text">SiteCheck</span>
      </div>
    </div>
    <div class="body">${content}</div>
  </div>
  <div class="footer">
    <p>SiteCheck &bull; AI Website Growth Consultant</p>
    <p style="margin-top:6px"><a href="${APP_URL}/privacy">Privacy</a> &bull; <a href="${APP_URL}/terms">Terms</a></p>
  </div>
</div>
</body>
</html>
`;

function scoreColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  return "#f43f5e";
}

// ─── Email 1: Free report delivery ────────────────────────────────────────────
export async function sendFreeReportEmail(
  to: string,
  report: PartialReport,
  shareToken: string
) {
  const reportUrl = `${APP_URL}/report/${shareToken}`;
  const overallColor = scoreColor(report.scores.overall);

  const html = base(`
    <h1>Your website report is ready</h1>
    <p>We've analysed <strong>${report.domain}</strong> across performance, trust, clarity and conversion. Here's what we found.</p>

    <div style="text-align:center; padding: 20px 0;">
      <div style="display:inline-block; width:80px; height:80px; border-radius:50%; border: 6px solid ${overallColor}; line-height:68px; font-size:28px; font-weight:700; color:${overallColor}">
        ${Math.round(report.scores.overall)}
      </div>
      <p style="margin-top:8px; font-size:13px; color:#697a88">Overall growth score</p>
    </div>

    <div class="score-grid">
      <div class="score-box">
        <div class="score-label">Performance</div>
        <div class="score-val" style="color:${scoreColor(report.scores.performance.score)}">${Math.round(report.scores.performance.score)}</div>
      </div>
      <div class="score-box">
        <div class="score-label">Trust</div>
        <div class="score-val" style="color:${scoreColor(report.scores.trust.score)}">${Math.round(report.scores.trust.score)}</div>
      </div>
    </div>

    <p style="font-size:14px; color:#354050; background:#f0fdf9; border:1px solid #99f6e0; border-radius:10px; padding:14px 16px;">
      ${report.consultantSummary}
    </p>

    <a href="${reportUrl}" class="btn">View your full report →</a>

    <div class="divider"></div>
    <p style="font-size:13px; color:#697a88;">
      Your free report includes your overall score and two analysis sections. 
      Unlock the full report — including Top 3 Quick Wins and all 4 sections — for ₹499.
    </p>
  `);

  await resend.emails.send({
    from:    FROM,
    to,
    subject: `Your SiteCheck report for ${report.domain} — score: ${Math.round(report.scores.overall)}/100`,
    html,
  });
}

// ─── Email 2: Full paid report ─────────────────────────────────────────────────
export async function sendPaidReportEmail(
  to: string,
  report: PartialReport,
  shareToken: string
) {
  const reportUrl = `${APP_URL}/report/${shareToken}`;

  const winsHtml = report.quickWins.slice(0, 3).map((win, i) => `
    <div class="win-card">
      <div class="win-num">${i + 1}</div>
      <div class="win-title">${win.title}</div>
      <p style="font-size:13px; color:#4a5668; margin:0 0 4px;">${win.whyItMatters}</p>
      <div class="win-fix"><strong>Fix:</strong> ${win.howToFix}</div>
    </div>
  `).join("");

  const html = base(`
    <h1>Your full report is unlocked 🎉</h1>
    <p>Thanks for unlocking the complete SiteCheck report for <strong>${report.domain}</strong>. Here are your top 3 quick wins to act on immediately.</p>

    ${winsHtml}

    <a href="${reportUrl}" class="btn">View complete report →</a>

    <div class="divider"></div>
    <p style="font-size:13px; color:#697a88;">
      You can share this report with your developer or team using the Share button in the report. 
      The link is permanent and works for anyone.
    </p>
  `);

  await resend.emails.send({
    from:    FROM,
    to,
    subject: `Your complete SiteCheck report + 3 quick wins for ${report.domain}`,
    html,
  });
}

// ─── Email 3: Re-engagement drip (Day 3) ─────────────────────────────────────
export async function sendReEngagementEmail(
  to: string,
  domain: string,
  shareToken: string,
  worstDimension: string
) {
  const reportUrl = `${APP_URL}/report/${shareToken}`;
  const auditUrl  = `${APP_URL}`;

  const dimensionAdvice: Record<string, { title: string; tip: string }> = {
    trust:       { title: "Visitors don't trust you yet", tip: "Add a visible phone number and 2–3 client testimonials to your homepage. These two changes alone can meaningfully increase enquiries." },
    conversion:  { title: "Visitors aren't taking action", tip: "Your CTA button likely uses generic text like 'Get in touch'. Try 'Book a free call' or 'Get your quote today' — specific beats generic every time." },
    clarity:     { title: "Your message isn't landing", tip: "Your H1 headline may not clearly state what you do. Visitors decide in under 5 seconds whether to stay — make your opening sentence count." },
    performance: { title: "Your site is too slow on mobile", tip: "Compress your hero image using Squoosh.app and export as WebP. This is the highest-ROI 20 minutes you can spend on your site." },
  };

  const advice = dimensionAdvice[worstDimension] ?? dimensionAdvice.trust;

  const html = base(`
    <h1>A quick note about ${domain}</h1>
    <p>We noticed from your recent SiteCheck audit that your biggest opportunity is in <strong>${worstDimension}</strong>.</p>

    <div style="background:#fffbeb; border:1px solid #fef3c7; border-radius:10px; padding:18px 20px; margin:20px 0;">
      <p style="font-weight:600; color:#92400e; margin-bottom:8px;">⚡ ${advice.title}</p>
      <p style="font-size:14px; color:#78350f; margin:0;">${advice.tip}</p>
    </div>

    <p>Have you had a chance to look at your full report? It includes exactly what to fix and how.</p>

    <a href="${reportUrl}" class="btn">Review your report →</a>

    <div class="divider"></div>
    <p style="font-size:13px; color:#697a88;">
      Or run a fresh audit on a different page: <a href="${auditUrl}" style="color:#0d9488">${auditUrl}</a>
    </p>
  `);

  await resend.emails.send({
    from:    FROM,
    to,
    subject: `One quick fix for ${domain} that could improve conversions`,
    html,
  });
}

// ─── Email 4: "Run another audit" (Day 7) ────────────────────────────────────
export async function sendRunAnotherAuditEmail(to: string, domain: string) {
  const html = base(`
    <h1>Have you fixed those issues yet?</h1>
    <p>It's been a week since you audited <strong>${domain}</strong>. If you've made changes, now is a great time to re-run the audit and see how your score has improved.</p>

    <p>Even fixing one of the quick wins can move your score significantly — and more importantly, can mean more enquiries and conversions.</p>

    <a href="${APP_URL}?url=${encodeURIComponent("https://" + domain)}" class="btn">Re-audit ${domain} →</a>

    <div class="divider"></div>
    <p style="font-size:13px; color:#697a88;">
      Made some changes? Before/after comparisons show you exactly how much each fix improved your score.
    </p>
  `);

  await resend.emails.send({
    from:    FROM,
    to,
    subject: `Time to see if ${domain} improved — re-audit now`,
    html,
  });
}

// ─── Send safely (never throw) ────────────────────────────────────────────────
export async function sendEmailSafe(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    console.error("Email send failed (non-fatal):", err);
  }
}
