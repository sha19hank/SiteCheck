import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import { ConsultantReport } from "@/types";

export const maxDuration = 60; // 60s max execution for Vercel

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServiceClient();

  let stage = "DATABASE";
  
  try {
    const { data, error } = await supabase
      .from("audits")
      .select("*")
      .or(`id.eq.${id},share_token.eq.${id}`)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, stage, reason: "Audit not found." }, 
        { status: 404 }
      );
    }

    const report: ConsultantReport = data.consultant_report;
    if (!report) {
      return NextResponse.json(
        { success: false, stage, reason: "Consultant report not generated yet." }, 
        { status: 400 }
      );
    }

    const isFree = !data.is_paid;
    
    stage = "PUPPETEER_LAUNCH";
    // Initialize Puppeteer
    const isLocal = process.env.NODE_ENV === "development";
    let browser;
    
    if (isLocal) {
      const puppeteerModule = await import("puppeteer");
      const localPuppeteer = puppeteerModule.default || puppeteerModule;
      browser = await localPuppeteer.launch({ headless: true });
    } else {
      const executablePath = await chromium.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar"
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

    stage = "PDF_GENERATION";
    const page = await browser.newPage();
    
    // Construct the absolute URL to the report page
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    const targetUrl = `${baseUrl}/report/${id}?print=true`;
    
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 45000 });
    
    // Wait an extra moment to ensure all rendering/animations finish
    await new Promise(r => setTimeout(r, 1500));

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" }
    });

    await browser.close();

    stage = "RESPONSE";
    
    // Sanitize filename to prevent path traversal or invalid characters
    const safeDomain = data.domain?.replace(/[^a-zA-Z0-9.-]/g, "_") || "website";
    const filename = `${safeDomain}-audit-report.pdf`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });

  } catch (error: any) {
    console.error("PDF Export failed at stage:", stage, error);
    return NextResponse.json(
      { success: false, stage, reason: error.message || "Unknown error occurred" }, 
      { status: 500 }
    );
  }
}
