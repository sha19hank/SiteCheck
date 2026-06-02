"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-50/80 backdrop-blur-md border-b border-surface-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
              <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="2"/>
              <path d="M7 10l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-surface-900 tracking-tight">SiteCheck</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/#how-it-works" className="btn-ghost text-xs">How it works</Link>
          <Link href="/#pricing" className="btn-ghost text-xs">Pricing</Link>
          <Link href="/dashboard" className="btn-ghost text-xs">Dashboard</Link>
          <div className="w-px h-4 bg-surface-200 mx-1" />
          <Link href="/" className="btn-primary text-xs px-4 py-2">
            Audit my website
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden btn-ghost p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            {menuOpen ? (
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-surface-200 px-4 py-4 flex flex-col gap-1">
          <Link href="/#how-it-works" className="btn-ghost justify-start text-sm" onClick={() => setMenuOpen(false)}>How it works</Link>
          <Link href="/#pricing"      className="btn-ghost justify-start text-sm" onClick={() => setMenuOpen(false)}>Pricing</Link>
          <Link href="/dashboard"     className="btn-ghost justify-start text-sm" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link href="/"              className="btn-primary justify-center mt-2" onClick={() => setMenuOpen(false)}>Audit my website</Link>
        </div>
      )}
    </header>
  );
}
