Download Geist font files from:
https://vercel.com/font

Place these files in this directory:
- GeistVF.woff
- GeistMonoVF.woff

These are referenced in app/layout.tsx using next/font/local.

Alternative: Replace the localFont imports in layout.tsx with:

import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
