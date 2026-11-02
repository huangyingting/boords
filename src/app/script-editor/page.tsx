"use client";

import React from "react";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { FileText, Clock, ArrowRight, Columns } from "lucide-react";

export default function ScriptEditorMarketingPage() {
  return (
    <MarketingShell>
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7] text-xs font-semibold text-[#121212] mb-4">
            <FileText className="w-3.5 h-3.5 text-[#D97706]" />
            AV Script Editor
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Write two-column AV scripts that turn into storyboards in one click
          </h1>
          <p className="text-lg text-[#5C5B57] mt-4">
            Draft side-by-side Audio/Voiceover and Visual scenes, track exact
            spoken runtime at 130 WPM, and convert your script directly into a
            storyboard.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="px-5 py-3 rounded-xl bg-[#121212] text-white text-sm font-semibold inline-flex items-center gap-2"
            >
              Open Script Editor <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6">
            <Columns className="w-6 h-6 text-[#D97706] mb-3" />
            <h2 className="font-bold text-lg">Two-Column AV Table & Blank Mode</h2>
            <p className="text-sm text-[#5C5B57] mt-2">
              Start with a structured SCENE | AUDIO / VOICEOVER | VISUAL table
              or write freeform treatments in Blank Script mode.
            </p>
          </div>
          <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6">
            <Clock className="w-6 h-6 text-[#D97706] mb-3" />
            <h2 className="font-bold text-lg">Live WPM Runtime Calculator</h2>
            <p className="text-sm text-[#5C5B57] mt-2">
              Automatically calculates Total RT (mm:ss) and Audio Word Count
              based on your configurable speaking rate (default 130 WPM).
            </p>
          </div>
          <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6">
            <ArrowRight className="w-6 h-6 text-[#D97706] mb-3" />
            <h2 className="font-bold text-lg">One-Click -&gt; Storyboard</h2>
            <p className="text-sm text-[#5C5B57] mt-2">
              Convert every script scene into timed storyboard frames with
              pre-populated Voiceover and Action fields.
            </p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
