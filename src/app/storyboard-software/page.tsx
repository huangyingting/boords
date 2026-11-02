"use client";

import React from "react";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Film, Wand2, Layers, CheckCircle2, ArrowRight } from "lucide-react";

export default function StoryboardSoftwarePage() {
  return (
    <MarketingShell>
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7] text-xs font-semibold text-[#121212] mb-4">
            <Film className="w-3.5 h-3.5 text-[#D97706]" />
            Professional Storyboard Software
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Create clear, collaborative storyboards in record time
          </h1>
          <p className="text-lg text-[#5C5B57] mt-4">
            Combine Boords Agent AI generation, @mention character consistency,
            freehand canvas annotation, and instant Shot List tables in one
            streamlined editor.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="px-5 py-3 rounded-xl bg-[#121212] text-white text-sm font-semibold inline-flex items-center gap-2"
            >
              Launch Storyboard Editor <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="px-5 py-3 rounded-xl bg-white border border-[#E5E4DE] text-sm font-semibold"
            >
              View Plans
            </Link>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6">
            <Wand2 className="w-6 h-6 text-[#D97706] mb-3" />
            <h2 className="font-bold text-lg">Boords Agent & @Mentions</h2>
            <p className="text-sm text-[#5C5B57] mt-2">
              Reference @alex, @sam, @office, or @product in your frame prompts
              to generate character-consistent storyboard frames across Sketch,
              Color, and Cinematic styles.
            </p>
          </div>
          <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6">
            <Layers className="w-6 h-6 text-[#D97706] mb-3" />
            <h2 className="font-bold text-lg">Storyboard & Shot List Views</h2>
            <p className="text-sm text-[#5C5B57] mt-2">
              Switch seamlessly between the visual Frame Grid (with adjustable
              zoom slider) and a structured Shot List table for production crews.
            </p>
          </div>
          <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6">
            <CheckCircle2 className="w-6 h-6 text-[#D97706] mb-3" />
            <h2 className="font-bold text-lg">Annotation, Crop & Versioning</h2>
            <p className="text-sm text-[#5C5B57] mt-2">
              Draw camera movement arrows directly on frames, crop aspect
              ratios, and manage v1/v2 iterations with custom workflow statuses.
            </p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
