import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ScoreLabel, SeverityLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scoreToLabel(score: number): ScoreLabel {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs work";
  return "Poor";
}

export function scoreToColor(score: number): string {
  if (score >= 80) return "emerald";
  if (score >= 60) return "amber";
  if (score >= 40) return "amber";
  return "rose";
}

export function scoreToHex(score: number): string {
  if (score >= 80) return "#10b981";  // emerald-500
  if (score >= 60) return "#f59e0b";  // amber-500
  if (score >= 40) return "#f59e0b";  // amber-500
  return "#f43f5e";                   // rose-500
}

export function severityToColor(severity: SeverityLevel): string {
  switch (severity) {
    case "critical": return "#f43f5e";
    case "high":     return "#f59e0b";
    case "medium":   return "#f59e0b";
    case "low":      return "#697a88";
    case "pass":     return "#10b981";
    default:         return "#697a88";
  }
}

export function extractDomain(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function normalizeUrl(raw: string): string {
  let url = raw.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  return url;
}

export function formatScore(score: number): string {
  return Math.round(score).toString();
}

export function calculateOverallScore(scores: {
  performance: number;
  trust: number;
  clarity: number;
  conversion: number;
}): number {
  // Weighted composite — trust and clarity matter most for non-tech businesses
  return Math.round(
    scores.performance * 0.15 +
    scores.trust       * 0.30 +
    scores.clarity     * 0.30 +
    scores.conversion  * 0.25
  );
}

export function generateShareToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 10; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function effortBadge(effort: "easy" | "medium" | "involved") {
  switch (effort) {
    case "easy":     return { label: "30 min fix", color: "bg-emerald-50 text-emerald-700" };
    case "medium":   return { label: "Half day",   color: "bg-amber-50 text-amber-700" };
    case "involved": return { label: "1–2 days",   color: "bg-surface-100 text-surface-600" };
  }
}
