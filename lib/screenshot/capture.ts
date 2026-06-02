import type { ScreenshotData } from "@/types";

// Dynamic import to avoid bundling issues
async function getBrowser() {
  // In production (Vercel), use @sparticuz/chromium-min
  // In development, use locally installed Chrome/Chromium
  if (process.env.NODE_ENV === "production" || process.env.USE_CHROMIUM_MIN === "true") {
    const chromium = await import("@sparticuz/chromium-min");
    const puppeteer = await import("puppeteer-core");

    return puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: { width: 1280, height: 800 },
      executablePath: await chromium.default.executablePath(
        process.env.CHROMIUM_REMOTE_EXECUTABLE_PATH ||
        "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
      ),
      headless: true,
    });
  } else {
    // Local dev — requires Chrome installed
    const puppeteer = await import("puppeteer-core");
    return puppeteer.default.launch({
      executablePath:
        process.platform === "darwin"
          ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
          : process.platform === "win32"
          ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
          : "/usr/bin/google-chrome",
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
  }
}

export async function captureScreenshots(url: string): Promise<ScreenshotData> {
  const timeout = 20000;
  let browser;

  try {
    browser = await getBrowser();
    const page = await browser.newPage();

    // Block heavy resources for speed
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (["media", "font"].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // ── Desktop screenshot ─────────────────────────────────────────────────
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "networkidle2", timeout });

    // Wait a touch for animations
    await new Promise(r => setTimeout(r, 800));

    const desktopBuffer = await page.screenshot({
      type: "jpeg",
      quality: 80,
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    }) as Buffer;

    // ── CTA analysis on desktop ────────────────────────────────────────────
    const ctaAnalysis = await page.evaluate(() => {
      const viewportH = window.innerHeight;
      const ctaSelectors = [
        "a.btn", "a.button", ".btn-primary", ".cta", "[class*='cta']",
        "button[type='submit']", "a[href*='contact']", "a[href*='book']",
        "a[href*='get-started']", "a[href*='signup']",
      ];

      let ctaAboveFold = false;
      let ctaText = "";
      let ctaVisible = false;

      for (const sel of ctaSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          const rect = el.getBoundingClientRect();
          ctaText = (el as HTMLElement).innerText?.trim() || "";
          ctaVisible = rect.width > 0 && rect.height > 0;
          ctaAboveFold = rect.top < viewportH && rect.bottom > 0;
          if (ctaAboveFold) break;
        }
      }

      // Check hero section
      const hero = document.querySelector("section, .hero, [class*='hero'], header + *");
      const heroRect = hero?.getBoundingClientRect();
      const hasHeroImage = !!document.querySelector(
        "section img, .hero img, [class*='hero'] img, header img"
      );

      // Nav height
      const nav = document.querySelector("nav, header");
      const navHeight = nav ? nav.getBoundingClientRect().height : 0;

      return {
        ctaAboveFold,
        ctaText,
        ctaVisible,
        hasHeroImage,
        navHeight: Math.round(navHeight),
        heroHeight: heroRect ? Math.round(heroRect.height) : 0,
        pageHeight: document.body.scrollHeight,
        viewportHeight: viewportH,
      };
    });

    // ── Mobile screenshot ──────────────────────────────────────────────────
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: timeout / 2 });
    await new Promise(r => setTimeout(r, 500));

    const mobileBuffer = await page.screenshot({
      type: "jpeg",
      quality: 75,
      clip: { x: 0, y: 0, width: 390, height: 844 },
    }) as Buffer;

    // Mobile CTA check
    const mobileCta = await page.evaluate(() => {
      const ctaSelectors = ["a.btn", "button[type='submit']", ".cta", "[class*='cta']"];
      for (const sel of ctaSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          const rect = el.getBoundingClientRect();
          return rect.top < window.innerHeight;
        }
      }
      return false;
    });

    await browser.close();
    browser = null;

    return {
      desktopScreenshot:  `data:image/jpeg;base64,${desktopBuffer.toString("base64")}`,
      mobileScreenshot:   `data:image/jpeg;base64,${mobileBuffer.toString("base64")}`,
      ctaAboveFold:       ctaAnalysis.ctaAboveFold,
      ctaAboveFoldMobile: mobileCta,
      ctaText:            ctaAnalysis.ctaText,
      hasHeroImage:       ctaAnalysis.hasHeroImage,
      navHeight:          ctaAnalysis.navHeight,
      heroHeight:         ctaAnalysis.heroHeight,
      pageHeight:         ctaAnalysis.pageHeight,
      capturedAt:         new Date().toISOString(),
      captureSuccess:     true,
    };

  } catch (err) {
    console.error("Screenshot capture failed:", err);
    if (browser) {
      try { await browser.close(); } catch { /* ignore */ }
    }
    return {
      desktopScreenshot:  null,
      mobileScreenshot:   null,
      ctaAboveFold:       null,
      ctaAboveFoldMobile: null,
      ctaText:            null,
      hasHeroImage:       null,
      navHeight:          null,
      heroHeight:         null,
      pageHeight:         null,
      capturedAt:         new Date().toISOString(),
      captureSuccess:     false,
    };
  }
}
