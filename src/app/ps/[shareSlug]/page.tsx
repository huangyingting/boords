"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Folder, Film, FileText, Lock } from "lucide-react";

export default function SharedProjectPage() {
  const params = useParams<{ shareSlug: string }>();
  const [project, setProject] = useState<any>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  const loadProject = useCallback(
    async (pwd = "") => {
      const qs = new URLSearchParams({ password: pwd }).toString();
      const res = await fetch(`/api/share/project/${params.shareSlug}?${qs}`);
      const data = await res.json();
      if (res.status === 401 && data.requiresPassword) {
        setRequiresPassword(true);
        return;
      }
      if (!res.ok) {
        setError(data.error || "Shared project not found");
        return;
      }
      setRequiresPassword(false);
      setProject(data.project);
    },
    [params.shareSlug]
  );

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-[#F6F6F0] flex items-center justify-center p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadProject(passwordInput);
          }}
          className="bg-white border border-[#E5E4DE] rounded-2xl p-8 max-w-sm w-full space-y-4"
        >
          <div className="flex items-center gap-2 font-bold text-lg">
            <Lock className="w-5 h-5 text-[#D97706]" />
            <span>Protected Project Folder</span>
          </div>
          <input
            type="password"
            required
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Enter password"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E4DE] text-sm"
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#121212] text-white text-xs font-semibold"
          >
            Unlock Project
          </button>
        </form>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F6F6F0] flex items-center justify-center text-sm text-[#5C5B57]">
        {error}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F6F6F0] flex items-center justify-center text-sm text-[#5C5B57]">
        Loading shared project...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F0] text-[#121212]">
      <header className="h-14 px-6 bg-white border-b border-[#E5E4DE] flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-sm">
          <Folder className="w-4 h-4 text-[#D97706]" />
          <span>{project.name}</span>
        </div>
        <span className="text-xs text-[#5C5B57]">
          Shared by {project.team?.name}
        </span>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-10 space-y-6">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(project.storyboards || []).map((sb: any) => (
            <Link
              key={sb.id}
              href={`/s/${sb.shortSlug}/frame`}
              className="bg-white border border-[#E5E4DE] rounded-2xl p-5 hover:shadow-md transition"
            >
              <Film className="w-5 h-5 text-[#D97706] mb-2" />
              <div className="font-bold text-sm">{sb.title}</div>
              <div className="text-xs text-[#5C5B57] mt-1">
                v{sb.version} • {sb.status}
              </div>
            </Link>
          ))}
          {(project.scripts || []).map((sc: any) => (
            <Link
              key={sc.id}
              href={`/sc/${sc.shortSlug}`}
              className="bg-white border border-[#E5E4DE] rounded-2xl p-5 hover:shadow-md transition"
            >
              <FileText className="w-5 h-5 text-[#D97706] mb-2" />
              <div className="font-bold text-sm">{sc.title}</div>
              <div className="text-xs text-[#5C5B57] mt-1">{sc.status}</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
