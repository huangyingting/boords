"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Menu,
  X,
  Film,
  FileText,
  PlayCircle,
  Users,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F6F0] text-[#121212] flex flex-col">
      <header className="sticky top-0 z-40 bg-[#F6F6F0]/90 backdrop-blur border-b border-[#E5E4DE]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-bold text-xl tracking-tight"
            >
              <span className="w-8 h-8 rounded-lg bg-[#121212] text-[#F6F6F0] flex items-center justify-center font-serif text-lg">
                B
              </span>
              <span>Boords</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#121212]">
              <div
                className="relative"
                onMouseEnter={() => setFeaturesDropdownOpen(true)}
                onMouseLeave={() => setFeaturesDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setFeaturesDropdownOpen((v) => !v)}
                  className="inline-flex items-center gap-1 py-2 hover:text-[#5C5B57] transition"
                >
                  Features <ChevronDown className="w-4 h-4" />
                </button>
                {featuresDropdownOpen && (
                  <div className="absolute left-0 top-full w-72 bg-white border border-[#E5E4DE] rounded-2xl shadow-lg p-3 grid gap-1">
                    <Link
                      href="/storyboard-software"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F6F6F0] transition"
                    >
                      <Film className="w-5 h-5 mt-0.5 text-[#D97706]" />
                      <div>
                        <div className="font-semibold text-sm">
                          Storyboard Software
                        </div>
                        <div className="text-xs text-[#5C5B57]">
                          AI character consistency & drag-and-drop boards
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/script-editor"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F6F6F0] transition"
                    >
                      <FileText className="w-5 h-5 mt-0.5 text-[#D97706]" />
                      <div>
                        <div className="font-semibold text-sm">
                          Script Editor
                        </div>
                        <div className="text-xs text-[#5C5B57]">
                          Two-column AV scripts with live WPM runtime
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/animatic-software"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F6F6F0] transition"
                    >
                      <PlayCircle className="w-5 h-5 mt-0.5 text-[#D97706]" />
                      <div>
                        <div className="font-semibold text-sm">
                          Animatic Software
                        </div>
                        <div className="text-xs text-[#5C5B57]">
                          One-click timed animatics with voiceover
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/collaborate"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F6F6F0] transition"
                    >
                      <Users className="w-5 h-5 mt-0.5 text-[#D97706]" />
                      <div>
                        <div className="font-semibold text-sm">
                          Collaboration & Review
                        </div>
                        <div className="text-xs text-[#5C5B57]">
                          Password-protected links, comments & approvals
                        </div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/pricing"
                className="hover:text-[#5C5B57] transition"
              >
                Pricing
              </Link>
              <Link
                href="/customers"
                className="hover:text-[#5C5B57] transition"
              >
                Customers
              </Link>
              <Link
                href="/storyboard-templates"
                className="hover:text-[#5C5B57] transition"
              >
                Templates
              </Link>
              <Link
                href="/tools/script-timer"
                className="hover:text-[#5C5B57] transition"
              >
                Script Timer
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-sm font-medium text-[#121212] hover:bg-[#E5E4DE]/60 transition"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-[#121212] text-white text-sm font-medium hover:bg-black/90 transition inline-flex items-center gap-1.5"
            >
              Redeem Invite <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <button
            type="button"
            aria-label="Toggle Menu"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-xl border border-[#E5E4DE] bg-white"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E5E4DE] px-6 py-4 space-y-3">
            <Link
              href="/storyboard-software"
              className="block py-1.5 text-sm font-medium"
            >
              Storyboard Software
            </Link>
            <Link
              href="/script-editor"
              className="block py-1.5 text-sm font-medium"
            >
              Script Editor
            </Link>
            <Link
              href="/animatic-software"
              className="block py-1.5 text-sm font-medium"
            >
              Animatic Software
            </Link>
            <Link
              href="/collaborate"
              className="block py-1.5 text-sm font-medium"
            >
              Collaboration
            </Link>
            <Link href="/pricing" className="block py-1.5 text-sm font-medium">
              Pricing
            </Link>
            <Link
              href="/customers"
              className="block py-1.5 text-sm font-medium"
            >
              Customers
            </Link>
            <div className="pt-3 border-t border-[#E5E4DE] flex gap-3">
              <Link
                href="/login"
                className="flex-1 text-center py-2 rounded-xl border border-[#E5E4DE] text-sm font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="flex-1 text-center py-2 rounded-xl bg-[#121212] text-white text-sm font-medium"
              >
                Redeem Invite
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-[#121212] text-[#F6F6F0] py-16 px-6 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 font-bold text-xl">
              <span className="w-8 h-8 rounded-lg bg-[#F4BD64] text-[#121212] flex items-center justify-center font-serif text-lg">
                B
              </span>
              <span>Boords</span>
            </div>
            <p className="text-sm text-[#A8A69E] mt-3 max-w-sm">
              Pre-production software for modern video teams. Write AV scripts,
              generate consistent AI storyboards, preview animatics, and win
              client sign-off in half the time.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-[#F4BD64]">
              <Sparkles className="w-4 h-4" />
              <span>Trusted by 500,000+ creatives, directors & producers</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A8A69E] mb-3">
              Product
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/storyboard-software" className="hover:underline">
                  Storyboard Software
                </Link>
              </li>
              <li>
                <Link href="/script-editor" className="hover:underline">
                  Script Editor
                </Link>
              </li>
              <li>
                <Link href="/animatic-software" className="hover:underline">
                  Animatic Maker
                </Link>
              </li>
              <li>
                <Link href="/collaborate" className="hover:underline">
                  Client Review & Share
                </Link>
              </li>
              <li>
                <Link href="/storyboard-templates" className="hover:underline">
                  Storyboard Templates
                </Link>
              </li>
              <li>
                <Link href="/tools/script-timer" className="hover:underline">
                  Free Voiceover Script Timer
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A8A69E] mb-3">
              Plans & Stories
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pricing" className="hover:underline">
                  Pricing & Plans
                </Link>
              </li>
              <li>
                <Link href="/customers" className="hover:underline">
                  Customer Stories
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:underline">
                  Studio Workspace
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A8A69E] mb-3">
              Workspace Access
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:underline">
                  Sign in to Workspace
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:underline">
                  Redeem Invite Code
                </Link>
              </li>
              <li>
                <Link href="/setup" className="hover:underline">
                  Initial Owner Setup
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A8A69E]">
          <span>© {new Date().getFullYear()} Boords. All rights reserved.</span>
          <span className="flex items-center gap-1.5 mt-2 sm:mt-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Invite-Only RBAC & Audit Logging Active
          </span>
        </div>
      </footer>
    </div>
  );
}
