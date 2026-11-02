"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Clock, ArrowRight, RotateCcw, Sparkles } from "lucide-react";

const SAMPLE_SCRIPTS = [
  {
    label: "30s Product Commercial",
    text: "Meet Boords: the modern pre-production workspace built for fast-moving creative studios. From your first two-column AV script to character-consistent AI storyboards and client review links, Boords keeps your entire production team aligned from concept to wrap.",
  },
  {
    label: "60s Explainer Intro",
    text: "Every great video starts with a clear plan. Traditional storyboarding takes days of manual sketching, scattered spreadsheets, and endless email threads. With Boords Agent, you can reference @characters and @locations directly in your script, generate cohesive visual frames in seconds, preview timing with interactive animatics, and get frame-accurate sign-off from stakeholders in one place.",
  },
];

export default function ScriptTimerToolPage() {
  const [text, setText] = useState(SAMPLE_SCRIPTS[0].text);
  const [wpm, setWpm] = useState(130);

  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const chars = text.length;
  const sentences = text.trim()
    ? text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
    : 0;
  const totalSeconds = Math.round((words / Math.max(60, wpm)) * 60);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const formattedTime = `${mins}:${secs.toString().padStart(2, "0")}`;
  const estFrames = Math.max(1, Math.ceil(totalSeconds / 3));

  return (
    <MarketingShell>
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#F4BD64] text-xs font-bold text-[#121212] mb-4">
            <Clock className="w-3.5 h-3.5 text-[#D97706]" />
            Free Pre-Production Tool
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Voiceover Script Timer & Word Calculator
          </h1>
          <p className="mt-4 text-lg text-[#5C5B57]">
            Paste your voiceover or dialogue script below to calculate exact
            speaking runtime and recommended storyboard frame counts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white border border-[#E5E4DE] rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5C5B57]">
                  Sample Presets:
                </span>
                {SAMPLE_SCRIPTS.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => setText(sample.text)}
                    className="px-2.5 py-1 rounded-lg bg-[#F2F2EE] hover:bg-[#E5E4DE] text-xs font-semibold transition"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setText("")}
                className="text-xs font-semibold text-[#5C5B57] hover:text-[#121212] inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </button>
            </div>

            <textarea
              aria-label="Voiceover Script Input"
              rows={9}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type your voiceover script here..."
              className="w-full p-4 rounded-2xl border border-[#E5E4DE] bg-[#F6F6F0]/60 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#121212]"
            />

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <span className="text-xs font-semibold text-[#5C5B57]">
                Speaking Pace (Words Per Minute):
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { rate: 110, label: "Slow (110 WPM)" },
                  { rate: 130, label: "Natural (130 WPM)" },
                  { rate: 150, label: "Upbeat (150 WPM)" },
                  { rate: 170, label: "Fast Promo (170 WPM)" },
                ].map((opt) => (
                  <button
                    key={opt.rate}
                    type="button"
                    onClick={() => setWpm(opt.rate)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      wpm === opt.rate
                        ? "bg-[#121212] text-white"
                        : "bg-[#F2F2EE] text-[#5C5B57] hover:text-[#121212]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-[#E5E4DE] rounded-3xl p-6 shadow-2xs space-y-6">
            <div className="p-5 rounded-2xl bg-[#F6F6F0] border border-[#E5E4DE] text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-[#5C5B57]">
                Estimated Spoken Runtime
              </div>
              <div
                data-testid="timer-runtime"
                className="text-5xl font-bold tracking-tight text-[#121212] mt-2 font-mono"
              >
                {formattedTime}
              </div>
              <div className="text-xs text-[#5C5B57] mt-1">
                {totalSeconds} seconds at {wpm} WPM
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#F2F2EE]">
                <div className="text-xl font-bold">{words}</div>
                <div className="text-[11px] text-[#5C5B57] font-semibold">
                  Words
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F2F2EE]">
                <div className="text-xl font-bold">{sentences}</div>
                <div className="text-[11px] text-[#5C5B57] font-semibold">
                  Sentences
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F2F2EE]">
                <div className="text-xl font-bold">{estFrames}</div>
                <div className="text-[11px] text-[#5C5B57] font-semibold">
                  Est. Frames
                </div>
              </div>
            </div>

            <div className="text-xs text-[#5C5B57] flex items-center justify-between border-t border-[#E5E4DE] pt-4">
              <span>Characters</span>
              <strong className="text-[#121212]">{chars}</strong>
            </div>

            <Link
              href="/dashboard"
              className="w-full py-3 px-4 rounded-xl bg-[#121212] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-black/90 transition"
            >
              <Sparkles className="w-4 h-4 text-[#F4BD64]" />
              Convert Script to Storyboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
