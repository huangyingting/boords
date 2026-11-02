"use client";

import React from "react";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Quote, Star, ArrowRight } from "lucide-react";

const STORIES = [
  {
    studio: "Framestore Creative",
    role: "Executive Producer",
    quote:
      "Boords cut our pre-production turnaround in half. Being able to go from a two-column AV script to a timed animatic in one afternoon transformed our client pitches.",
  },
  {
    studio: "Buck Design Studio",
    role: "Creative Director",
    quote:
      "The @mention asset library keeps our character references consistent across dozens of storyboard frames, and clients love reviewing via the clean share links.",
  },
  {
    studio: "Northhouse Film Co.",
    role: "Head of Production",
    quote:
      "Invite-only workspace controls, custom workflow statuses, and instant Shot List exports keep our directors and DPs on the exact same page.",
  },
];

export default function CustomersPage() {
  return (
    <MarketingShell>
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1 text-[#D97706] mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Trusted by world-class agencies, studios, and video teams
          </h1>
          <p className="text-lg text-[#5C5B57] mt-4">
            See how creative teams use Boords to pitch, script, storyboard, and
            deliver standout video productions.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {STORIES.map((story) => (
            <div
              key={story.studio}
              className="bg-white border border-[#E5E4DE] rounded-2xl p-7 flex flex-col justify-between"
            >
              <div>
                <Quote className="w-7 h-7 text-[#F4BD64] mb-4" />
                <p className="text-sm text-[#121212] leading-relaxed">
                  “{story.quote}”
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E5E4DE]">
                <div className="font-bold text-sm">{story.studio}</div>
                <div className="text-xs text-[#5C5B57]">{story.role}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-xl bg-[#121212] text-white text-sm font-semibold inline-flex items-center gap-2"
          >
            Start Your Next Production <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
