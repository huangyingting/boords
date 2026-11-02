"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import {
  Sparkles,
  Film,
  FileText,
  PlayCircle,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Layers,
  Wand2,
} from "lucide-react";

const FEATURE_TABS = [
  {
    id: "storyboard",
    label: "Storyboards",
    icon: Film,
    headline: "Build production-ready storyboards in minutes",
    description:
      "Drag-and-drop frames, switch between Grid and Shot List views, annotate directly on frames, and export clean PDFs or presentation links.",
    highlights: [
      "Customizable aspect ratios (16:9, 9:16, 1:1, 4:5, 2.39:1)",
      "Frame-by-frame Voiceover, Action, Camera & Production notes",
      "Instant switch between visual Storyboard and tabular Shot List",
      "Version control (v1, v2, v3) and custom workflow statuses",
    ],
  },
  {
    id: "agent",
    label: "Boords Agent AI",
    icon: Wand2,
    headline: "Character-consistent AI frames with @mention assets",
    description:
      "Reference @alex, @office, or @product directly in your frame prompts to keep characters, locations, and props consistent across every shot.",
    highlights: [
      "Tag @characters, @locations, and @props from your Asset Library",
      "Generate full storyboards from a single creative brief",
      "Choose Sketch, Color, or Cinematic visual styles",
      "Asset Playground for rapid visual exploration before boarding",
    ],
  },
  {
    id: "script",
    label: "AV Script Editor",
    icon: FileText,
    headline: "Write two-column AV scripts with live runtime estimation",
    description:
      "Structure scenes with side-by-side Audio/Voiceover and Visual columns, calculate spoken runtime automatically at 130 WPM, and convert to a storyboard in one click.",
    highlights: [
      "Two-column AV script table or Blank freeform script mode",
      "Real-time Total RT (mm:ss) and Audio word counter",
      "Configurable speaking pace (100 to 180 WPM)",
      "One-click '-> Storyboard' conversion from script scenes",
    ],
  },
  {
    id: "animatic",
    label: "Animatics & Review",
    icon: PlayCircle,
    headline: "Preview timing & gather frame-accurate client feedback",
    description:
      "Turn any storyboard into a timed animatic preview and share password-protected review links where clients can leave comments without needing an account.",
    highlights: [
      "Interactive Animatic player with configurable per-frame duration",
      "Password-protected public share links (/s/, /sc/, /ps/)",
      "Frame-level comment threads with resolution tracking",
      "Export to PDF, MP4 Animatic, Premiere/Resolve XML, After Effects & CSV",
    ],
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("storyboard");
  const currentFeature =
    FEATURE_TABS.find((t) => t.id === activeTab) || FEATURE_TABS[0];

  return (
    <MarketingShell>
      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E4DE] text-xs font-semibold text-[#121212] shadow-2xs mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Introducing Boords Agent — AI Storyboarding with @mention Assets</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#121212] leading-[1.08]">
            Pre-production for{" "}
            <span className="underline decoration-[#F4BD64] decoration-8 underline-offset-4">
              modern video teams
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#5C5B57] max-w-2xl mx-auto leading-relaxed">
            Boords brings your scripts, AI-assisted storyboards, animatics, and
            client feedback into one fast, collaborative workspace.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-[#121212] text-white font-semibold text-sm hover:bg-black/90 transition inline-flex items-center gap-2 shadow-sm"
            >
              Open Studio Workspace <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="px-6 py-3.5 rounded-xl bg-white border border-[#E5E4DE] text-[#121212] font-semibold text-sm hover:bg-[#F2F2EE] transition"
            >
              Redeem Invitation Code
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#5C5B57]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Invite-only workspace security
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Two-column AV Scripts & Storyboards
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Client review links & PDF export
            </span>
          </div>
        </div>

        {/* Interactive Workspace Preview Card */}
        <div className="max-w-6xl mx-auto mt-14 bg-white border border-[#E5E4DE] rounded-3xl shadow-sm overflow-hidden">
          <div className="border-b border-[#E5E4DE] bg-[#F2F2EE] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-medium text-[#5C5B57]">
                app.boords.com — Q4 Product Launch Commercial (v1 • In review)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {FEATURE_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition ${
                      active
                        ? "bg-[#121212] text-white"
                        : "bg-white text-[#5C5B57] hover:text-[#121212] border border-[#E5E4DE]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7] text-xs font-semibold text-[#121212]">
                <currentFeature.icon className="w-3.5 h-3.5 text-[#D97706]" />
                {currentFeature.label}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121212]">
                {currentFeature.headline}
              </h2>
              <p className="text-sm text-[#5C5B57] leading-relaxed">
                {currentFeature.description}
              </p>
              <ul className="space-y-2.5 pt-2">
                {currentFeature.highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-[#121212]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#D97706] mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7 bg-[#F6F6F0] border border-[#E5E4DE] rounded-2xl p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    frame: 1,
                    shot: "Wide Establishing Shot",
                    mention: "@alex @office",
                    vo: "Every great campaign starts with clarity before the cameras roll.",
                    duration: "4.0s",
                  },
                  {
                    frame: 2,
                    shot: "Medium Close-Up",
                    mention: "@alex @product",
                    vo: "With Boords Agent, your characters stay consistent from Frame 1 to wrap.",
                    duration: "3.5s",
                  },
                  {
                    frame: 3,
                    shot: "Over-the-Shoulder",
                    mention: "@sam @office",
                    vo: "Convert two-column AV scripts directly into visual boards.",
                    duration: "3.0s",
                  },
                  {
                    frame: 4,
                    shot: "Hero Product Shot",
                    mention: "@product",
                    vo: "Share password-protected animatics for instant client approval.",
                    duration: "4.0s",
                  },
                ].map((card) => (
                  <div
                    key={card.frame}
                    className="bg-white border border-[#E5E4DE] rounded-xl p-3.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span className="px-2 py-0.5 rounded bg-[#121212] text-white">
                        Frame {card.frame}
                      </span>
                      <span className="text-[#5C5B57]">{card.duration}</span>
                    </div>
                    <div className="aspect-video rounded-lg bg-[#F2F2EE] border border-[#E5E4DE] flex flex-col items-center justify-center p-3 text-center">
                      <Layers className="w-6 h-6 text-[#5C5B57] mb-1" />
                      <span className="text-xs font-semibold text-[#121212]">
                        {card.shot}
                      </span>
                      <span className="text-[11px] font-mono text-[#D97706] mt-0.5">
                        {card.mention}
                      </span>
                    </div>
                    <p className="mt-2.5 text-xs text-[#5C5B57] line-clamp-2">
                      <strong className="text-[#121212]">VO:</strong> {card.vo}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* End-to-End Workflow Grid */}
      <section className="py-16 px-6 bg-[#F2F2EE] border-y border-[#E5E4DE]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              Every stage of pre-production in one place
            </h2>
            <p className="text-sm text-[#5C5B57] mt-2">
              Replace scattered docs, slide decks, and email threads with a
              single structured workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link
              href="/script-editor"
              className="bg-white border border-[#E5E4DE] rounded-2xl p-6 hover:shadow-md transition group"
            >
              <FileText className="w-7 h-7 text-[#D97706] mb-4" />
              <h3 className="font-bold text-lg group-hover:underline">
                1. Write AV Scripts
              </h3>
              <p className="text-sm text-[#5C5B57] mt-2">
                Draft two-column Audio/Visual scripts with automatic WPM runtime
                calculation and scene numbering.
              </p>
            </Link>

            <Link
              href="/storyboard-software"
              className="bg-white border border-[#E5E4DE] rounded-2xl p-6 hover:shadow-md transition group"
            >
              <Film className="w-7 h-7 text-[#D97706] mb-4" />
              <h3 className="font-bold text-lg group-hover:underline">
                2. Build Storyboards
              </h3>
              <p className="text-sm text-[#5C5B57] mt-2">
                Generate consistent AI frames with @mentions, draw annotations,
                or upload reference frames.
              </p>
            </Link>

            <Link
              href="/animatic-software"
              className="bg-white border border-[#E5E4DE] rounded-2xl p-6 hover:shadow-md transition group"
            >
              <PlayCircle className="w-7 h-7 text-[#D97706] mb-4" />
              <h3 className="font-bold text-lg group-hover:underline">
                3. Preview Animatics
              </h3>
              <p className="text-sm text-[#5C5B57] mt-2">
                Play back timed frames with voiceover and action subtitles to
                validate pacing before production.
              </p>
            </Link>

            <Link
              href="/collaborate"
              className="bg-white border border-[#E5E4DE] rounded-2xl p-6 hover:shadow-md transition group"
            >
              <MessageSquare className="w-7 h-7 text-[#D97706] mb-4" />
              <h3 className="font-bold text-lg group-hover:underline">
                4. Review & Approve
              </h3>
              <p className="text-sm text-[#5C5B57] mt-2">
                Share password-protected links, collect frame comments, and
                track approval statuses across versions.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
