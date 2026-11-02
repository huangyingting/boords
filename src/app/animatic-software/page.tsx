"use client";

import React from "react";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { PlayCircle, Volume2, Clock, ArrowRight } from "lucide-react";

export default function AnimaticSoftwarePage() {
  return (
    <MarketingShell>
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7] text-xs font-semibold text-[#121212] mb-4">
            <PlayCircle className="w-3.5 h-3.5 text-[#D97706]" />
            Animatic Software
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Turn storyboards into timed animatics in a single click
          </h1>
          <p className="text-lg text-[#5C5B57] mt-4">
            Test your pacing and story flow before shooting a single frame.
            Adjust per-frame durations, preview subtitles, and export timing
            packages for Premiere, Resolve, or After Effects.
          </p>
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="px-5 py-3 rounded-xl bg-[#121212] text-white text-sm font-semibold inline-flex items-center gap-2"
            >
              Try Animatic Player <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6">
            <Clock className="w-6 h-6 text-[#D97706] mb-3" />
            <h2 className="font-bold text-lg">Frame-Accurate Timing</h2>
            <p className="text-sm text-[#5C5B57] mt-2">
              Set exact seconds per frame and scrub through the interactive
              timeline player with real-time timecode display.
            </p>
          </div>
          <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6">
            <Volume2 className="w-6 h-6 text-[#D97706] mb-3" />
            <h2 className="font-bold text-lg">Voiceover & Action Subtitles</h2>
            <p className="text-sm text-[#5C5B57] mt-2">
              Preview voiceover dialogue and camera directions overlaid on each
              frame during playback.
            </p>
          </div>
          <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6">
            <PlayCircle className="w-6 h-6 text-[#D97706] mb-3" />
            <h2 className="font-bold text-lg">NLE Export Ready</h2>
            <p className="text-sm text-[#5C5B57] mt-2">
              Export timing sheets and XML/JSON packages ready for Adobe
              Premiere Pro, DaVinci Resolve, and After Effects.
            </p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
