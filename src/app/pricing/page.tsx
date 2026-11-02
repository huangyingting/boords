"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Check, HelpCircle } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    desc: "For individuals exploring storyboarding",
    monthly: 0,
    yearly: 0,
    credits: "30 AI image credits",
    features: [
      "Up to 2 active storyboards",
      "10 frames per storyboard",
      "Two-column AV Script Editor",
      "Watermarked PDF export",
    ],
  },
  {
    name: "Lite",
    desc: "For freelance creators & solo directors",
    monthly: 19,
    yearly: 15,
    credits: "300 AI image credits / mo",
    features: [
      "Unlimited storyboards & scripts",
      "Unlimited frames per storyboard",
      "Custom branding & unwatermarked PDFs",
      "Animatic timeline player",
    ],
  },
  {
    name: "Standard",
    desc: "For growing production studios",
    monthly: 49,
    yearly: 39,
    popular: true,
    credits: "1,000 AI image credits / mo",
    features: [
      "Up to 5 Creator seats + Unlimited Reviewers",
      "Boords Agent with @mention Asset Library",
      "Password-protected client share links",
      "Version history (v1, v2, v3) & status workflows",
      "Export to Premiere, Resolve & After Effects",
    ],
  },
  {
    name: "Workflow",
    desc: "For multi-project creative teams",
    monthly: 99,
    yearly: 79,
    credits: "2,500 AI image credits / mo",
    features: [
      "Up to 15 Creator seats + Role-based access",
      "Single-use & expiring invitation codes",
      "Custom storyboard templates & workflow statuses",
      "Full Activity & Security Audit Logs",
      "API Keys & Webhooks integration",
    ],
  },
  {
    name: "Agency",
    desc: "For large agencies & enterprise studios",
    monthly: 249,
    yearly: 199,
    credits: "8,000 AI image credits / mo",
    features: [
      "Unlimited projects & priority support",
      "Granular project-level permissions",
      "Dedicated onboarding & SSO readiness",
      "Custom dark-mode client review portals",
    ],
  },
];

const FAQS = [
  {
    q: "How does invite-only registration work in Boords?",
    a: "Workspace Owners and Admins generate single-use or expiring invitation codes assigned to a specific role (Admin, Creator, Member, or Reviewer). New team members redeem their code at /register to join the workspace.",
  },
  {
    q: "Are Reviewer accounts free?",
    a: "Yes. You can invite Reviewers with single-use invitation codes or share password-protected review links (/s/, /sc/, /ps/) so clients can comment without consuming Creator seats.",
  },
  {
    q: "How does @mention character consistency work?",
    a: "Save characters, locations, and props in your team Asset Library (e.g. @alex, @office, @product). Referencing those tags in Boords Agent prompts ensures consistent visual styling across every generated frame.",
  },
  {
    q: "Can I convert an AV script directly into a storyboard?",
    a: "Yes! Click '-> Storyboard' in the Script Editor header to automatically convert every scene row and its spoken runtime into timed storyboard frames.",
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [currency, setCurrency] = useState<"USD" | "EUR" | "GBP">("USD");
  const [creditTier, setCreditTier] = useState<string>("1,000 AI image credits / mo");

  const currencySymbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  const currencyFactor = currency === "EUR" ? 0.92 : currency === "GBP" ? 0.79 : 1;

  return (
    <MarketingShell>
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Simple, transparent pricing for every production team
            </h1>
            <p className="text-base text-[#5C5B57] mt-3">
              Start free or scale your studio with AI storyboarding, AV scripts,
              and invite-only role management.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#E5E4DE]">
                <button
                  type="button"
                  onClick={() => setAnnual(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    !annual
                      ? "bg-[#121212] text-white"
                      : "text-[#5C5B57] hover:text-[#121212]"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setAnnual(true)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    annual
                      ? "bg-[#121212] text-white"
                      : "text-[#5C5B57] hover:text-[#121212]"
                  }`}
                >
                  Annual Billing (Save 20%)
                </button>
              </div>

              <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-white border border-[#E5E4DE]">
                {(["USD", "EUR", "GBP"] as const).map((cur) => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => setCurrency(cur)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      currency === cur
                        ? "bg-[#121212] text-white"
                        : "text-[#5C5B57] hover:text-[#121212]"
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-[#5C5B57] font-semibold">AI Credit Pack:</span>
              {[
                { label: "300 credits", val: "300 AI image credits / mo" },
                { label: "1,000 credits", val: "1,000 AI image credits / mo" },
                { label: "3,000 credits", val: "3,000 AI image credits / mo" },
                { label: "8,000 credits", val: "8,000 AI image credits / mo" },
              ].map((tier) => (
                <button
                  key={tier.label}
                  type="button"
                  onClick={() => setCreditTier(tier.val)}
                  className={`px-3 py-1 rounded-full border font-semibold transition ${
                    creditTier === tier.val
                      ? "bg-[#FEF3C7] border-[#F4BD64] text-[#121212]"
                      : "bg-white border-[#E5E4DE] text-[#5C5B57]"
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {PLANS.map((plan) => {
              const basePrice = annual ? plan.yearly : plan.monthly;
              const price = Math.round(basePrice * currencyFactor);
              return (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-6 flex flex-col justify-between border ${
                    plan.popular
                      ? "bg-[#121212] text-white border-[#121212] shadow-lg"
                      : "bg-white text-[#121212] border-[#E5E4DE]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold">{plan.name}</h2>
                      {plan.popular && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F4BD64] text-[#121212] text-[11px] font-bold">
                          Popular
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        plan.popular ? "text-[#A8A69E]" : "text-[#5C5B57]"
                      }`}
                    >
                      {plan.desc}
                    </p>

                    <div className="mt-5 flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        {currencySymbol}
                        {price}
                      </span>
                      <span
                        className={`text-xs ${
                          plan.popular ? "text-[#A8A69E]" : "text-[#5C5B57]"
                        }`}
                      >
                        / month
                      </span>
                    </div>
                    <div className="mt-2 text-xs font-semibold text-[#D97706]">
                      {plan.popular ? creditTier : plan.credits}
                    </div>

                    <ul className="mt-6 space-y-2.5 text-xs">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href="/register"
                    className={`mt-8 w-full py-2.5 rounded-xl text-center text-xs font-semibold transition ${
                      plan.popular
                        ? "bg-[#F4BD64] text-[#121212] hover:bg-[#f5c77e]"
                        : "bg-[#121212] text-white hover:bg-black/90"
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {FAQS.map((faq) => (
                <div
                  key={faq.q}
                  className="bg-white border border-[#E5E4DE] rounded-2xl p-6"
                >
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#D97706] shrink-0" />
                    {faq.q}
                  </h3>
                  <p className="text-sm text-[#5C5B57] mt-2 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
