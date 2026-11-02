"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/workspace/AppShell";
import {
  Film,
  FileText,
  FolderPlus,
  LayoutGrid,
  Columns,
  List,
  Plus,
  MoreHorizontal,
  Sparkles,
  Archive,
  Trash2,
} from "lucide-react";

interface StoryboardItem {
  id: string;
  slug: string;
  shortSlug: string;
  title: string;
  version: number;
  status: string;
  aspectRatio: string;
  isArchived: boolean;
  updatedAt: string;
  project?: { id: string; name: string; slug: string } | null;
  frames?: { id: string; imageUrl?: string | null }[];
  _count?: { frames: number; comments: number };
}

interface ScriptItem {
  id: string;
  slug: string;
  shortSlug: string;
  title: string;
  status: string;
  mode: string;
  isArchived: boolean;
  updatedAt: string;
  project?: { id: string; name: string; slug: string } | null;
  _count?: { scenes: number; comments: number };
}

export default function DashboardPage() {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "board" | "list">("grid");
  const [creatingType, setCreatingType] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [newSbModalOpen, setNewSbModalOpen] = useState(false);
  const [newSbName, setNewSbName] = useState("");
  const [newSbAspect, setNewSbAspect] = useState("16:9");
  const [newSbNumbering, setNewSbNumbering] = useState("1, 2, 3");

  const loadWorkspace = useCallback(async () => {
    const res = await fetch("/api/workspace");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setWorkspace(data);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const handleQuickCreateStoryboard = async () => {
    setCreatingType("storyboard");
    try {
      const res = await fetch("/api/storyboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Storyboard" }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/storyboards/${data.storyboard.slug}`);
      }
    } finally {
      setCreatingType(null);
    }
  };

  const handleQuickCreateScript = async () => {
    setCreatingType("script");
    try {
      const res = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Script" }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/scripts/${data.script.slug}`);
      }
    } finally {
      setCreatingType(null);
    }
  };

  const handleArchiveStoryboard = async (sb: StoryboardItem) => {
    await fetch(`/api/storyboards/${sb.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: true }),
    });
    setOpenMenuId(null);
    loadWorkspace();
  };

  const handleDeleteStoryboard = async (sb: StoryboardItem) => {
    await fetch(`/api/storyboards/${sb.id}`, {
      method: "DELETE",
    });
    setOpenMenuId(null);
    loadWorkspace();
  };

  const handleUpdateStoryboardStatus = async (sbId: string, status: string) => {
    await fetch(`/api/storyboards/${sbId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadWorkspace();
  };

  const handleCreateCustomStoryboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSbName.trim()) return;
    setCreatingType("custom-sb");
    try {
      const res = await fetch("/api/storyboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newSbName.trim(),
          aspectRatio: newSbAspect,
          frameNumberFormat: newSbNumbering,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewSbModalOpen(false);
        setNewSbName("");
        router.push(`/storyboards/${data.storyboard.slug}`);
      }
    } finally {
      setCreatingType(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F0] flex items-center justify-center text-sm text-[#5C5B57]">
        Loading Boords workspace...
      </div>
    );
  }

  const activeStoryboards: StoryboardItem[] = (
    workspace?.storyboards || []
  ).filter((s: StoryboardItem) => !s.isArchived);
  const activeScripts: ScriptItem[] = (workspace?.scripts || []).filter(
    (s: ScriptItem) => !s.isArchived
  );
  const statuses = workspace?.statuses || [
    { name: "Draft", color: "#9CA3AF" },
    { name: "In progress", color: "#3B82F6" },
    { name: "In review", color: "#F59E0B" },
    { name: "Changes requested", color: "#EF4444" },
    { name: "Approved", color: "#10B981" },
  ];
  const isReviewer = workspace?.role === "REVIEWER";

  return (
    <AppShell
      user={workspace?.user}
      team={workspace?.team}
      role={workspace?.role}
      projects={workspace?.projects || []}
      notifications={workspace?.notifications || []}
      onRefresh={loadWorkspace}
    >
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        {/* Top Greeting & Quick Create Cards */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {workspace?.user?.name || "Creator"}
            </h1>
            <p className="text-sm text-[#5C5B57] mt-1">
              {activeStoryboards.length} Storyboards · {activeScripts.length} Scripts ·{" "}
              {(workspace?.projects || []).filter((p: any) => !p.isArchived).length} Projects
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start">
            {!isReviewer && (
              <button
                type="button"
                onClick={() => setNewSbModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#E5E4DE] hover:border-[#121212] text-xs font-semibold transition"
              >
                + Custom Storyboard...
              </button>
            )}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F2F2EE] border border-[#E5E4DE]">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                viewMode === "grid"
                  ? "bg-white text-[#121212] shadow-2xs"
                  : "text-[#5C5B57]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                viewMode === "board"
                  ? "bg-white text-[#121212] shadow-2xs"
                  : "text-[#5C5B57]"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                viewMode === "list"
                  ? "bg-white text-[#121212] shadow-2xs"
                  : "text-[#5C5B57]"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
          </div>
          </div>
        </div>

        {/* Quick Create Action Cards */}
        {!isReviewer && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              disabled={creatingType !== null}
              onClick={handleQuickCreateStoryboard}
              className="bg-white border border-[#E5E4DE] hover:border-[#121212] rounded-2xl p-5 text-left transition group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Film className="w-5 h-5" />
              </div>
              <div className="font-bold text-base flex items-center justify-between">
                <span>New storyboard</span>
                <Plus className="w-4 h-4 text-[#5C5B57]" />
              </div>
              <p className="text-xs text-[#5C5B57] mt-1">
                Start with Boords Agent AI or blank frames in 16:9, 9:16, or 1:1
              </p>
            </button>

            <button
              type="button"
              disabled={creatingType !== null}
              onClick={handleQuickCreateScript}
              className="bg-white border border-[#E5E4DE] hover:border-[#121212] rounded-2xl p-5 text-left transition group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <FileText className="w-5 h-5" />
              </div>
              <div className="font-bold text-base flex items-center justify-between">
                <span>New script</span>
                <Plus className="w-4 h-4 text-[#5C5B57]" />
              </div>
              <p className="text-xs text-[#5C5B57] mt-1">
                Two-column Audio/Visual script with live 130 WPM runtime counter
              </p>
            </button>

            <Link
              href="/library"
              className="bg-white border border-[#E5E4DE] hover:border-[#121212] rounded-2xl p-5 text-left transition group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="font-bold text-base flex items-center justify-between">
                <span>Asset Playground</span>
                <FolderPlus className="w-4 h-4 text-[#5C5B57]" />
              </div>
              <p className="text-xs text-[#5C5B57] mt-1">
                Manage @character, @location & @prop references for AI consistency
              </p>
            </Link>
          </div>
        )}

        {/* Storyboards & Scripts Display */}
        {viewMode === "grid" && (
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">
                  Storyboards ({activeStoryboards.length})
                </h2>
              </div>

              {activeStoryboards.length === 0 ? (
                <div className="bg-white border border-dashed border-[#E5E4DE] rounded-2xl p-10 text-center">
                  <Film className="w-8 h-8 text-[#5C5B57] mx-auto mb-2" />
                  <div className="font-semibold text-sm">
                    No storyboards created yet
                  </div>
                  <p className="text-xs text-[#5C5B57] mt-1">
                    Click “New storyboard” above to create your first storyboard.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {activeStoryboards.map((sb) => (
                    <div
                      key={sb.id}
                      className="bg-white border border-[#E5E4DE] rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition relative group"
                    >
                      <Link href={`/storyboards/${sb.slug}`} className="block">
                        <div className="aspect-video bg-[#F2F2EE] border-b border-[#E5E4DE] flex items-center justify-center overflow-hidden">
                          {sb.frames && sb.frames[0]?.imageUrl ? (
                            <img
                              src={sb.frames[0].imageUrl}
                              alt={sb.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center text-xs text-[#5C5B57]">
                              <Film className="w-6 h-6 mx-auto mb-1 opacity-60" />
                              <span>{sb._count?.frames || 0} frames</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-sm truncate">
                              {sb.title}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-[#F2F2EE] text-[11px] font-semibold">
                              v{sb.version}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs text-[#5C5B57]">
                            <span>{sb.status}</span>
                            <span>{sb._count?.frames || 0} frames</span>
                          </div>
                        </div>
                      </Link>

                      <div className="absolute top-2.5 right-2.5">
                        <button
                          type="button"
                          aria-label="Storyboard options"
                          onClick={() =>
                            setOpenMenuId(openMenuId === sb.id ? null : sb.id)
                          }
                          className="p-1.5 rounded-lg bg-white/90 border border-[#E5E4DE] hover:bg-white"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {openMenuId === sb.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white border border-[#E5E4DE] rounded-xl shadow-lg p-1.5 z-20 text-xs">
                            <button
                              type="button"
                              onClick={() => handleArchiveStoryboard(sb)}
                              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-[#F6F6F0] text-left"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              Move to Archive
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStoryboard(sb)}
                              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-red-50 text-red-600 text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete storyboard
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-bold mb-4">
                Scripts ({activeScripts.length})
              </h2>
              {activeScripts.length === 0 ? (
                <div className="bg-white border border-dashed border-[#E5E4DE] rounded-2xl p-8 text-center text-xs text-[#5C5B57]">
                  No scripts created yet. Click “New script” to write a two-column AV
                  script.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {activeScripts.map((sc) => (
                    <Link
                      key={sc.id}
                      href={`/scripts/${sc.slug}`}
                      className="bg-white border border-[#E5E4DE] rounded-2xl p-5 hover:shadow-md transition block"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D97706]">
                          <FileText className="w-4 h-4" />
                          {sc.mode === "BLANK"
                            ? "Blank Script"
                            : "Two-column AV Script"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#F2F2EE] text-[11px] font-medium">
                          {sc.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-base mt-2 truncate">
                        {sc.title}
                      </h3>
                      <div className="mt-3 text-xs text-[#5C5B57]">
                        {sc._count?.scenes || 0} scenes
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Kanban Board View by Workflow Status */}
        {viewMode === "board" && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto">
            {statuses.map((st: { name: string; color: string }) => {
              const items = activeStoryboards.filter(
                (s) => s.status.toLowerCase() === st.name.toLowerCase()
              );
              return (
                <div
                  key={st.name}
                  className="bg-[#F2F2EE] border border-[#E5E4DE] rounded-2xl p-3.5 min-h-[320px]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-2 text-xs font-bold">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: st.color }}
                      />
                      {st.name}
                    </span>
                    <span className="text-xs text-[#5C5B57]">
                      {items.length}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {items.map((sb) => (
                      <div
                        key={sb.id}
                        className="bg-white border border-[#E5E4DE] rounded-xl p-3 shadow-2xs hover:border-[#121212] space-y-2"
                      >
                        <Link
                          href={`/storyboards/${sb.slug}`}
                          className="block font-semibold text-xs truncate hover:underline"
                        >
                          {sb.title}
                        </Link>
                        <div className="flex items-center justify-between gap-2 text-[11px] text-[#5C5B57]">
                          <span>
                            v{sb.version} • {sb._count?.frames || 0}f
                          </span>
                          <select
                            aria-label={`Change status for ${sb.title}`}
                            value={sb.status}
                            onChange={(e) =>
                              handleUpdateStoryboardStatus(
                                sb.id,
                                e.target.value
                              )
                            }
                            className="px-1.5 py-0.5 rounded border border-[#E5E4DE] bg-[#F6F6F0] text-[10px] font-semibold text-[#121212]"
                          >
                            {statuses.map((opt: { name: string }) => (
                              <option key={opt.name} value={opt.name}>
                                {opt.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tabular List View */}
        {viewMode === "list" && (
          <div className="bg-white border border-[#E5E4DE] rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F2F2EE] border-b border-[#E5E4DE] text-xs uppercase text-[#5C5B57]">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Frames / Scenes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E4DE]">
                {activeStoryboards.map((sb) => (
                  <tr key={sb.id} className="hover:bg-[#F6F6F0]">
                    <td className="py-3 px-4 font-semibold">
                      <Link
                        href={`/storyboards/${sb.slug}`}
                        className="hover:underline"
                      >
                        {sb.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-xs text-[#5C5B57]">
                      Storyboard (v{sb.version})
                    </td>
                    <td className="py-3 px-4 text-xs">{sb.status}</td>
                    <td className="py-3 px-4 text-xs text-[#5C5B57]">
                      {sb._count?.frames || 0} frames
                    </td>
                  </tr>
                ))}
                {activeScripts.map((sc) => (
                  <tr key={sc.id} className="hover:bg-[#F6F6F0]">
                    <td className="py-3 px-4 font-semibold">
                      <Link
                        href={`/scripts/${sc.slug}`}
                        className="hover:underline"
                      >
                        {sc.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-xs text-[#5C5B57]">Script</td>
                    <td className="py-3 px-4 text-xs">{sc.status}</td>
                    <td className="py-3 px-4 text-xs text-[#5C5B57]">
                      {sc._count?.scenes || 0} scenes
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Custom New Storyboard Modal */}
        {newSbModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-[#E5E4DE] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">New Storyboard</h2>
                <button
                  type="button"
                  onClick={() => setNewSbModalOpen(false)}
                  className="text-xs text-[#5C5B57] hover:text-[#121212]"
                >
                  Close
                </button>
              </div>
              <form onSubmit={handleCreateCustomStoryboard} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1.5">
                    Storyboard Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nike Air Commercial v1"
                    value={newSbName}
                    onChange={(e) => setNewSbName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E4DE] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1.5">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {["16:9", "9:16", "1:1", "4:5", "2.39:1"].map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setNewSbAspect(ratio)}
                        className={`py-2 rounded-xl border text-xs font-semibold transition ${
                          newSbAspect === ratio
                            ? "border-[#121212] bg-[#121212] text-white"
                            : "border-[#E5E4DE] bg-[#F6F6F0] text-[#5C5B57]"
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1.5">
                    Frame Numbering
                  </label>
                  <select
                    value={newSbNumbering}
                    onChange={(e) => setNewSbNumbering(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E4DE] text-xs font-semibold bg-white"
                  >
                    <option value="1, 2, 3">Sequential (1, 2, 3)</option>
                    <option value="1A, 1B">Scene & Shot (1A, 1B)</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setNewSbModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E5E4DE] text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newSbName.trim() || creatingType === "custom-sb"}
                    className="px-4 py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Create Storyboard →
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
