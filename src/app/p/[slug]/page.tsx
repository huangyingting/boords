"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/workspace/AppShell";
import {
  Film,
  FileText,
  Share2,
  LayoutGrid,
  Columns,
  List,
  Plus,
  Copy,
  Check,
  X,
  Lock,
  Star,
} from "lucide-react";

export default function ProjectPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [workspace, setWorkspace] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "board" | "list">("grid");
  const [shareOpen, setShareOpen] = useState(false);
  const [sharePassword, setSharePassword] = useState("");
  const [copied, setCopied] = useState(false);

  const loadData = useCallback(async () => {
    const [wsRes, projRes] = await Promise.all([
      fetch("/api/workspace"),
      fetch(`/api/projects/${params.slug}`),
    ]);
    if (wsRes.status === 401) {
      router.push("/login");
      return;
    }
    if (wsRes.ok) setWorkspace(await wsRes.json());
    if (projRes.ok) {
      const pData = await projRes.json();
      setProject(pData.project);
      setSharePassword(pData.project.sharePassword || "");
    }
    setLoading(false);
  }, [params.slug, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateStoryboard = async () => {
    if (!project) return;
    const res = await fetch("/api/storyboards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${project.name} Storyboard`,
        projectId: project.id,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/storyboards/${data.storyboard.slug}`);
    }
  };

  const handleCreateScript = async () => {
    if (!project) return;
    const res = await fetch("/api/scripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${project.name} Script`,
        projectId: project.id,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/scripts/${data.script.slug}`);
    }
  };

  const handleSaveShare = async () => {
    if (!project) return;
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isShared: true,
        sharePassword: sharePassword.trim() || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setProject((prev: any) => ({ ...prev, ...data.project }));
    }
  };

  const handleToggleProjectStar = async () => {
    if (!project) return;
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isStarred: !project.isStarred }),
    });
    loadData();
  };

  const handleUpdateProjectDesc = async (description: string) => {
    if (!project) return;
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    loadData();
  };

  const shareUrl =
    typeof window !== "undefined" && project
      ? `${window.location.origin}/ps/${project.shareSlug || project.slug}`
      : "";

  const handleCopyShare = async () => {
    await handleSaveShare();
    if (navigator.clipboard && shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F0] flex items-center justify-center text-sm text-[#5C5B57]">
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <AppShell
        user={workspace?.user}
        team={workspace?.team}
        role={workspace?.role}
        projects={workspace?.projects || []}
      >
        <div className="p-10 text-center">Project not found.</div>
      </AppShell>
    );
  }

  const storyboards = (project.storyboards || []).filter(
    (s: any) => !s.isArchived
  );
  const scripts = (project.scripts || []).filter((s: any) => !s.isArchived);
  const statuses = workspace?.statuses || [
    { name: "Draft", color: "#9CA3AF" },
    { name: "In progress", color: "#3B82F6" },
    { name: "In review", color: "#F59E0B" },
    { name: "Changes requested", color: "#EF4444" },
    { name: "Approved", color: "#10B981" },
  ];

  return (
    <AppShell
      user={workspace?.user}
      team={workspace?.team}
      role={workspace?.role}
      projects={workspace?.projects || []}
      notifications={workspace?.notifications || []}
      onRefresh={loadData}
    >
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[#5C5B57] mb-1">
              <Link href="/dashboard" className="hover:underline">
                Projects
              </Link>{" "}
              / {project.name}
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {project.name}
              </h1>
              <button
                type="button"
                aria-label="Star project"
                onClick={handleToggleProjectStar}
                className={`p-1.5 rounded-lg border transition ${
                  project.isStarred
                    ? "bg-[#FEF3C7] border-[#F4BD64] text-[#D97706]"
                    : "bg-white border-[#E5E4DE] text-[#5C5B57] hover:text-[#121212]"
                }`}
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
            </div>
            <input
              type="text"
              defaultValue={project.description || ""}
              onBlur={(e) => handleUpdateProjectDesc(e.target.value)}
              placeholder="Click here to add a description or links..."
              className="mt-1.5 w-full max-w-xl bg-transparent text-xs text-[#5C5B57] hover:bg-white focus:bg-white px-2 py-1 -ml-2 rounded-lg border border-transparent focus:border-[#E5E4DE] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {workspace?.role !== "REVIEWER" && (
              <>
                <button
                  type="button"
                  onClick={handleCreateStoryboard}
                  className="px-3.5 py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-black/90"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New storyboard
                </button>
                <button
                  type="button"
                  onClick={handleCreateScript}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#E5E4DE] text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[#F2F2EE]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New script
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#E5E4DE] text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[#F2F2EE]"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share project
            </button>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F2F2EE] border border-[#E5E4DE]">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  viewMode === "grid" ? "bg-white shadow-2xs" : "text-[#5C5B57]"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("board")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  viewMode === "board" ? "bg-white shadow-2xs" : "text-[#5C5B57]"
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  viewMode === "list" ? "bg-white shadow-2xs" : "text-[#5C5B57]"
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {storyboards.map((sb: any) => (
              <Link
                key={sb.id}
                href={`/storyboards/${sb.slug}`}
                className="bg-white border border-[#E5E4DE] rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition"
              >
                <div className="aspect-video bg-[#F2F2EE] border-b border-[#E5E4DE] flex items-center justify-center">
                  {sb.frames && sb.frames[0]?.imageUrl ? (
                    <img
                      src={sb.frames[0].imageUrl}
                      alt={sb.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Film className="w-6 h-6 text-[#5C5B57]" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm truncate">{sb.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#F2F2EE]">
                      v{sb.version}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-[#5C5B57]">
                    <span>{sb.status}</span>
                    <span>{sb._count?.frames || 0} frames</span>
                  </div>
                </div>
              </Link>
            ))}

            {scripts.map((sc: any) => (
              <Link
                key={sc.id}
                href={`/scripts/${sc.slug}`}
                className="bg-white border border-[#E5E4DE] rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D97706]">
                    <FileText className="w-4 h-4" />
                    AV Script
                  </span>
                  <h3 className="font-bold text-base mt-2">{sc.title}</h3>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-[#5C5B57]">
                  <span>{sc.status}</span>
                  <span>{sc._count?.scenes || 0} scenes</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {viewMode === "board" && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {statuses.map((st: { name: string; color: string }) => {
              const items = storyboards.filter(
                (s: any) => s.status.toLowerCase() === st.name.toLowerCase()
              );
              return (
                <div
                  key={st.name}
                  className="bg-[#F2F2EE] border border-[#E5E4DE] rounded-2xl p-3.5 min-h-[260px]"
                >
                  <div className="flex items-center justify-between mb-3 text-xs font-bold">
                    <span>{st.name}</span>
                    <span className="text-[#5C5B57]">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((sb: any) => (
                      <Link
                        key={sb.id}
                        href={`/storyboards/${sb.slug}`}
                        className="block bg-white border border-[#E5E4DE] rounded-xl p-3 text-xs font-semibold"
                      >
                        {sb.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === "list" && (
          <div className="bg-white border border-[#E5E4DE] rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F2F2EE] border-b border-[#E5E4DE] text-xs uppercase text-[#5C5B57]">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E4DE]">
                {storyboards.map((sb: any) => (
                  <tr key={sb.id}>
                    <td className="py-3 px-4 font-semibold">
                      <Link href={`/storyboards/${sb.slug}`}>{sb.title}</Link>
                    </td>
                    <td className="py-3 px-4 text-xs">Storyboard</td>
                    <td className="py-3 px-4 text-xs">{sb.status}</td>
                  </tr>
                ))}
                {scripts.map((sc: any) => (
                  <tr key={sc.id}>
                    <td className="py-3 px-4 font-semibold">
                      <Link href={`/scripts/${sc.slug}`}>{sc.title}</Link>
                    </td>
                    <td className="py-3 px-4 text-xs">Script</td>
                    <td className="py-3 px-4 text-xs">{sc.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Share Project Modal */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E4DE] rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Share project</h2>
              <button
                type="button"
                onClick={() => setShareOpen(false)}
                className="p-1 rounded-lg hover:bg-[#F2F2EE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#5C5B57]">
              Anyone with this link can view storyboards and scripts in{" "}
              <strong>{project.name}</strong>.
            </p>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1">
                Public Share Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 rounded-xl border border-[#E5E4DE] bg-[#F6F6F0] text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopyShare}
                  className="px-3.5 py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy link
                    </>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1">
                Optional Password Protection
              </label>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#5C5B57]" />
                <input
                  type="text"
                  value={sharePassword}
                  onChange={(e) => setSharePassword(e.target.value)}
                  placeholder="Leave blank for open link"
                  className="flex-1 px-3 py-2 rounded-xl border border-[#E5E4DE] text-xs"
                />
                <button
                  type="button"
                  onClick={handleSaveShare}
                  className="px-3 py-2 rounded-xl border border-[#E5E4DE] text-xs font-semibold hover:bg-[#F2F2EE]"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
