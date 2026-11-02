"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyInitialized, setAlreadyInitialized] = useState(false);

  useEffect(() => {
    fetch("/api/auth/bootstrap")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.needsBootstrap === false) {
          setAlreadyInitialized(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          teamName: teamName || `${name}'s Studio`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to initialize workspace");
        setLoading(false);
        return;
      }

      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error while initializing workspace");
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
        <Link href="/login" className="text-sm font-medium text-[#121212] underline">
          Back to Login
        </Link>
      </header>

      <main className="w-full max-w-md mx-auto my-auto py-10">
        <div className="bg-white border border-[#E5E4DE] rounded-2xl shadow-sm p-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF3C7] text-xs font-semibold text-[#121212] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            Initial Workspace Bootstrap
          </div>
          <h1 className="text-2xl font-bold text-[#121212] tracking-tight">
            Initialize Owner Account
          </h1>
          <p className="text-sm text-[#5C5B57] mt-1 mb-6">
            This workspace starts with zero demo or dummy accounts. Create the first
            Owner account to unlock invite-code generation for your team.
          </p>

          {alreadyInitialized ? (
            <div className="p-4 rounded-xl bg-[#F2F2EE] border border-[#E5E4DE] text-sm">
              <div className="font-semibold flex items-center gap-2 text-[#121212]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Workspace Already Initialized
              </div>
              <p className="text-xs text-[#5C5B57] mt-1.5">
                An Owner account already exists. All subsequent accounts must register
                using a valid single-use or expiring invitation code.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-[#121212] text-white text-xs font-medium"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl border border-[#E5E4DE] bg-white text-[#121212] text-xs font-medium"
                >
                  Redeem Invite Code
                </Link>
              </div>
            </div>
          ) : (
            <>
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
                    htmlFor="setup-name"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1.5"
                  >
                    Owner Full Name
                  </label>
                  <input
                    id="setup-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jordan Vance"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E4DE] bg-[#F6F6F0]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#121212]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="setup-team"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1.5"
                  >
                    Studio / Team Name
                  </label>
                  <input
                    id="setup-team"
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Vance Creative Studio"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E4DE] bg-[#F6F6F0]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#121212]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="setup-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1.5"
                  >
                    Owner Email Address
                  </label>
                  <input
                    id="setup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jordan@vancestudio.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E4DE] bg-[#F6F6F0]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#121212]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="setup-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1.5"
                  >
                    Password (min 8 chars)
                  </label>
                  <input
                    id="setup-password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E4DE] bg-[#F6F6F0]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#121212]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#121212] text-white font-medium text-sm hover:bg-black/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Shield className="w-4 h-4" />
                  {loading ? "Initializing Workspace..." : "Initialize Owner & Workspace"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      <footer className="text-center text-xs text-[#5C5B57]">
        Zero Dummy Accounts Policy • First-User Bootstrap
      </footer>
    </div>
  );
}
