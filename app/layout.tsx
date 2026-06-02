import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SiteCheck — AI Website Growth Consultant",
    template: "%s | SiteCheck",
  },
  description:
    "Paste your URL and get a plain-English report that tells you exactly what's hurting your website's conversions — and how to fix it. Free in 60 seconds.",
  keywords: [
    "website audit", "SEO audit", "conversion optimization",
    "website analysis", "website health check", "AI website consultant",
  ],
  authors: [{ name: "SiteCheck" }],
  creator: "SiteCheck",
  openGraph: {
    type: "website",
    title: "SiteCheck — AI Website Growth Consultant",
    description: "Find out what's hurting your website's conversions in 60 seconds.",
    siteName: "SiteCheck",
  },
  twitter: {
    card: "summary_large_image",
    title: "SiteCheck — AI Website Growth Consultant",
    description: "Find out what's hurting your website's conversions in 60 seconds.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://sitecheck.ai"),
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Razorpay Checkout SDK */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
        {/*
          PRODUCTION: Replace above with Geist font from Vercel:
          import { Geist, Geist_Mono } from "next/font/google";
          — or use next/font/local with downloaded font files.
          See app/fonts/README.txt for instructions.
        */}
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
