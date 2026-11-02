"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { LayoutTemplate, Film, ArrowRight, CheckCircle2 } from "lucide-react";

const TEMPLATES = [
  {
    id: "commercial",
    title: "30-Second TV & Social Commercial",
    category: "Advertising",
    aspectRatio: "16:9",
    frames: 8,
    fields: ["Shot Type", "Voiceover", "Action", "Camera Movement", "Duration"],
    desc: "Structured 8-frame commercial arc: Hook, Problem, Product Reveal, Demo, Social Proof, and Call to Action.",
  },
  {
    id: "reels",
    title: "Vertical TikTok / Reels / Shorts (9:16)",
    category: "Social Media",
    aspectRatio: "9:16",
    frames: 6,
    fields: ["Hook Caption", "Audio / Trend", "Visual Action", "Duration"],
    desc: "Fast-paced 9:16 vertical storyboard optimized for 15–30 second mobile social video retention.",
  },
  {
    id: "explainer",
    title: "SaaS Product Explainer & Motion Graphics",
    category: "Motion Design",
    aspectRatio: "16:9",
    frames: 10,
    fields: ["Voiceover Script", "UI / Motion Action", "SFX Notes", "Duration"],
    desc: "Ideal for two-column AV scripts pairing narration with screen transitions and motion cues.",
  },
  {
    id: "narrative",
    title: "Narrative Film & Episodic Scene Breakdown",
    category: "Film & TV",
    aspectRatio: "2.39:1",
    frames: 12,
    fields: ["Scene / Setup", "Lens & Camera", "Dialogue", "Blocking"],
    desc: "Anamorphic widescreen template with 1A, 1B shot numbering and lens/blocking metadata.",
  },
];

export default function StoryboardTemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", "Advertising", "Social Media", "Motion Design", "Film & TV"];

  const filtered =
    selectedCategory === "All"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <MarketingShell>
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#F4BD64] text-xs font-bold text-[#121212] mb-4">
            <LayoutTemplate className="w-3.5 h-3.5 text-[#D97706]" />
            Production-Ready Templates
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Storyboard Templates for Every Video Format
          </h1>
          <p className="mt-4 text-lg text-[#5C5B57]">
            Start with industry-standard frame layouts, aspect ratios, and shot
            metadata tailored to commercials, social reels, explainers, and film.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-[#121212] text-white"
                  : "bg-white border border-[#E5E4DE] text-[#5C5B57] hover:text-[#121212]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white border border-[#E5E4DE] rounded-3xl p-7 flex flex-col justify-between shadow-2xs hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-[#F2F2EE] text-xs font-semibold">
                    {tpl.category}
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#5C5B57]">
                    {tpl.aspectRatio} • {tpl.frames} Frames
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#121212]">{tpl.title}</h2>
                <p className="text-sm text-[#5C5B57] mt-2 leading-relaxed">
                  {tpl.desc}
                </p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {tpl.fields.map((field) => (
                    <span
                      key={field}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F6F6F0] border border-[#E5E4DE] text-xs text-[#121212]"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {field}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[#E5E4DE] flex items-center justify-between">
                <span className="text-xs text-[#5C5B57] inline-flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-[#D97706]" />
                  Included in Workspace
                </span>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-black/90 transition"
                >
                  Use Template <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
