"use client";

import React from "react";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Users, Lock, MessageSquare, ShieldCheck, ArrowRight } from "lucide-react";

export default function CollaboratePage() {
  return (
    <MarketingShell>
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7] text-xs font-semibold text-[#121212] mb-4">
            <Users className="w-3.5 h-3.5 text-[#D97706]" />
            Collaboration & Security
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Align directors, producers, and clients in one secure hub
          </h1>
          <p className="text-lg text-[#5C5B57] mt-4">
            Invite team members with single-use invitation codes, assign
            granular roles, share password-protected client review links, and
            track every change in the Activity Audit Log.
          </p>
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="px-5 py-3 rounded-xl bg-[#121212] text-white text-sm font-semibold inline-flex items-center gap-2"
            >
              Explore Team Collaboration <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6">
            <ShieldCheck className="w-6 h-6 text-[#D97706] mb-3" />
            <h2 className="font-bold text-lg">Invite-Only RBAC & Revocation</h2>
            <p className="text-sm text-[#5C5B57] mt-2">
              Generate single-use or expiring invitation codes for Owners,
              Admins, Creators, Members, and Reviewers—and revoke access at any
              time.
            </p>
          </div>
          <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6">
            <Lock className="w-6 h-6 text-[#D97706] mb-3" />
            <h2 className="font-bold text-lg">Password-Protected Share Links</h2>
            <p className="text-sm text-[#5C5B57] mt-2">
              Share storyboards (/s/), scripts (/sc/), or entire projects (/ps/)
              with optional password protection and custom studio branding.
            </p>
          </div>
          <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6">
            <MessageSquare className="w-6 h-6 text-[#D97706] mb-3" />
            <h2 className="font-bold text-lg">Frame-Accurate Review Mode</h2>
            <p className="text-sm text-[#5C5B57] mt-2">
              Switch between Edit and Review modes to leave frame-specific
              feedback, resolve comments, and update workflow status pills.
            </p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
