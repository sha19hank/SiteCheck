import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import { ConsultantReport } from "@/types";

export const maxDuration = 60; // 60s max execution for Vercel

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { report, url }: { report: ConsultantReport; url: string } = body;

    if (!report || !url) {
      return NextResponse.json({ error: "Missing report or url" }, { status: 400 });
    }

    // Build a basic HTML string for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>SiteCheck Consultant Report - ${url}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h1 { color: #1e1b4b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            h2 { color: #312e81; margin-top: 30px; }
            h3 { color: #4338ca; margin-top: 20px; }
            .section { margin-bottom: 40px; }
            .metric { font-weight: bold; font-size: 1.2em; color: #10b981; }
            .limitations { background: #fef2f2; border-left: 4px solid #ef4444; padding: 10px 15px; margin: 20px 0; font-size: 0.9em; }
            .insight { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; margin-bottom: 15px; border-radius: 8px; }
            .insight-title { font-weight: bold; color: #0f172a; margin-bottom: 5px; }
            .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; margin-right: 10px; }
            .tag-high { background: #fee2e2; color: #991b1b; }
            .tag-medium { background: #fef3c7; color: #92400e; }
            .tag-low { background: #d1fae5; color: #065f46; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background: #f1f5f9; }
          </style>
        </head>
        <body>
          <h1>SiteCheck Growth Report</h1>
          <p><strong>Target URL:</strong> <a href="${url}">${url}</a></p>
          <p><strong>Health Score:</strong> <span class="metric">${report.websiteHealthScore}/100</span></p>

          <div class="limitations">
            <strong>Data Confidence:</strong> ${report.reportConfidence.level}<br/>
            ${report.auditLimitations.text}
          </div>

          <div class="section">
            <h2>Executive Summary</h2>
            <p>${report.executiveSummary}</p>
          </div>

          <div class="section">
            <h2>Priority Matrix</h2>
            <h3>Immediate Wins (High Impact, Low Effort)</h3>
            <ul>
              ${report.priorityMatrix.immediateWins.map(i => `<li><strong>${i.problem}</strong>: ${i.recommendedFix}</li>`).join('') || '<li>None</li>'}
            </ul>
            <h3>Strategic Projects (High Impact, High Effort)</h3>
            <ul>
              ${report.priorityMatrix.strategicProjects.map(i => `<li><strong>${i.problem}</strong>: ${i.recommendedFix}</li>`).join('') || '<li>None</li>'}
            </ul>
          </div>

          <div class="section">
            <h2>30-Day Action Plan</h2>
            ${report.thirtyDayActionPlan.map(week => `
              <h3>${week.week}: ${week.focus}</h3>
              <ul>
                ${week.tasks.map(t => `<li>${t}</li>`).join('')}
              </ul>
            `).join('')}
          </div>

          <div class="section">
            <h2>Evidence Ledger</h2>
            <table>
              <tr>
                <th>Finding</th>
                <th>Source</th>
                <th>Impact</th>
              </tr>
              ${report.evidenceLedger.map(ev => `
                <tr>
                  <td>${ev.finding}</td>
                  <td>${ev.source}</td>
                  <td>${ev.impact}</td>
                </tr>
              `).join('')}
            </table>
          </div>

        </body>
      </html>
    `;

    // Initialize Puppeteer
    const isLocal = process.env.NODE_ENV === "development";
    let browser;
    
    if (isLocal) {
      // Local dev uses standard puppeteer (requires chrome installed)
      const localPuppeteer = require("puppeteer");
      browser = await localPuppeteer.launch({ headless: "new" });
    } else {
      // Production uses serverless chromium
      const executablePath = await chromium.executablePath(
        `https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar`
      );
      browser = await puppeteer.launch({
        // @ts-ignore
        args: chromium.args,
        // @ts-ignore
        defaultViewport: chromium.defaultViewport,
        executablePath,
        // @ts-ignore
        headless: chromium.headless,
      });
    }

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" }
    });

    await browser.close();

    // Return the PDF buffer
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="sitecheck-report.pdf"`,
      },
    });

  } catch (error: any) {
    console.error("PDF Export failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
