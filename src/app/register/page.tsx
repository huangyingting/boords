"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState(initialCode);
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

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          inviteCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to redeem invitation code");
        setLoading(false);
        return;
      }

      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      setLoading(false);
      if (loginRes?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Network error while redeeming invitation code");
      setLoading(false);
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
          Already a member?{" "}
          <Link
            href="/login"
            className="font-medium text-[#121212] underline underline-offset-4"
          >
            Log in
          </Link>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto my-auto py-10">
        <div className="bg-white border border-[#E5E4DE] rounded-2xl shadow-sm p-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F2F2EE] text-xs font-medium text-[#121212] mb-3">
            <KeyRound className="w-3.5 h-3.5 text-[#D97706]" />
            Invite-Only Registration
          </div>
          <h1 className="text-2xl font-bold text-[#121212] tracking-tight">
            Join your studio workspace
          </h1>
          <p className="text-sm text-[#5C5B57] mt-1 mb-6">
            Enter your single-use or expiring invitation code to create your account.
          </p>

          {needsBootstrap && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#FEF3C7] border border-[#F4BD64] text-xs text-[#121212]">
              <div className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                No Owner account initialized yet
              </div>
              <p className="mt-1 text-[#5C5B57]">
                Since this database has 0 users, you can bootstrap the initial Owner
                account directly without an invite code on the{" "}
                <Link href="/setup" className="underline font-semibold text-[#121212]">
                  Initial Setup page
                </Link>
                .
              </p>
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
                htmlFor="invite-code"
                className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1.5"
              >
                Invitation Code
              </label>
              <input
                id="invite-code"
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="BOORDS-XXXXXX-XXXXXX-XXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E4DE] bg-[#F6F6F0]/60 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#121212] focus:bg-white transition"
              />
            </div>

            <div>
              <label
                htmlFor="reg-name"
                className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1.5"
              >
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E4DE] bg-[#F6F6F0]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#121212] focus:bg-white transition"
              />
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1.5"
              >
                Work Email
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@studio.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E4DE] bg-[#F6F6F0]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#121212] focus:bg-white transition"
              />
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1.5"
              >
                Password (min 8 chars)
              </label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={8}
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
              <ShieldCheck className="w-4 h-4" />
              {loading ? "Validating invite & creating account..." : "Redeem Code & Create Account"}
            </button>
          </form>
        </div>
      </main>

      <footer className="text-center text-xs text-[#5C5B57]">
        Single-use & expiring invitation enforcement • Audit logged
      </footer>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F6F0]" />}>
      <RegisterForm />
    </Suspense>
  );
}
