"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ArrowRight, Lock, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsBootstrap, setNeedsBootstrap] = useState(false);

  useEffect(() => {
    fetch("/api/auth/bootstrap")
      .then((r) => r.json())
      .then((data) => {
        if (data?.needsBootstrap) {
          setNeedsBootstrap(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password, or your workspace access was revoked.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F0] flex flex-col justify-between p-6">
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
          <span className="w-8 h-8 rounded-lg bg-[#121212] text-[#F6F6F0] flex items-center justify-center font-serif text-lg">
            B
          </span>
          <span>Boords</span>
        </Link>
        <div className="text-sm text-[#5C5B57]">
          Have an invite code?{" "}
          <Link
            href="/register"
            className="font-medium text-[#121212] underline underline-offset-4 hover:text-black"
          >
            Redeem invitation
          </Link>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto my-auto py-12">
        <div className="bg-white border border-[#E5E4DE] rounded-2xl shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#121212] tracking-tight">
              Log in to Boords
            </h1>
            <p className="text-sm text-[#5C5B57] mt-1">
              Enter your workspace email and password to continue.
            </p>
          </div>

          {needsBootstrap && (
            <div className="mb-6 p-4 rounded-xl bg-[#FEF3C7] border border-[#F4BD64] text-sm text-[#121212]">
              <div className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                First-time Workspace Setup Available
              </div>
              <p className="text-xs text-[#5C5B57] mt-1">
                No accounts exist yet in this workspace. Initialize the first Owner
                account to start generating invite codes.
              </p>
              <Link
                href="/setup"
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#121212] underline"
              >
                Create Initial Owner Workspace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1.5"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E4DE] bg-[#F6F6F0]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#121212] focus:bg-white transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57]"
                >
                  Password
                </label>
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E4DE] bg-[#F6F6F0]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#121212] focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#121212] text-white font-medium text-sm hover:bg-black/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              {loading ? "Signing in..." : "Log in to Workspace"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E5E4DE] text-center text-xs text-[#5C5B57]">
            Registration is invite-only. Ask your Team Admin for a single-use{" "}
            <span className="font-mono text-[#121212]">BOORDS-XXXX</span> code, or{" "}
            <Link href="/register" className="underline text-[#121212] font-medium">
              redeem your code here
            </Link>
            .
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-[#5C5B57]">
        Boords Pre-Production Platform • Invite-Only Workspace Security
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F6F0]" />}>
      <LoginForm />
    </Suspense>
  );
}
