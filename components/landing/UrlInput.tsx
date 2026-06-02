"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn, normalizeUrl } from "@/lib/utils";

interface UrlInputProps {
  size?: "hero" | "compact";
  placeholder?: string;
}

export default function UrlInput({
  size = "hero",
  placeholder = "yourwebsite.com",
}: UrlInputProps) {
  const [url, setUrl]       = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const router  = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function validate(raw: string): string {
    if (!raw.trim()) return "Please enter your website URL";
    try {
      const u = new URL(normalizeUrl(raw.trim()));
      if (!["http:", "https:"].includes(u.protocol)) return "Please use a valid http or https URL";
      if (/localhost|127\.0\.0|192\.168/.test(u.hostname)) return "Please enter a public website URL";
      return "";
    } catch {
      return "Please enter a valid website URL (e.g. yoursite.com)";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate(url);
    if (err) { setError(err); inputRef.current?.focus(); return; }
    setError("");
    setLoading(true);
    const encoded = encodeURIComponent(normalizeUrl(url.trim()));
    router.push(`/scan?url=${encoded}`);
  }

  const isHero = size === "hero";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={cn(
        "flex gap-2",
        isHero ? "flex-col sm:flex-row" : "flex-row"
      )}>
        <div className="relative flex-1">
          {/* Globe icon */}
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={e => { setUrl(e.target.value); if (error) setError(""); }}
            placeholder={placeholder}
            className={cn(
              "input pl-10",
              isHero && "py-3.5 text-base",
              error && "ring-2 ring-rose-500 border-transparent"
            )}
            autoComplete="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "btn-primary shrink-0",
            isHero && "py-3.5 px-7 text-base",
            "relative overflow-hidden"
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Analysing…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Audit my website
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-rose-600 flex items-center gap-1.5">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </form>
  );
}
