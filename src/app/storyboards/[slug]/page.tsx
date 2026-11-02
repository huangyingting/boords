"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  Share2,
  Download,
  Play,
  Pause,
  Plus,
  Trash2,
  Wand2,
  MessageSquare,
  FileText,
  Images,
  Settings,
  Activity,
  LayoutGrid,
  Table,
  SlidersHorizontal,
  Copy,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  PenTool,
} from "lucide-react";

export default function StoryboardEditorPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const [storyboard, setStoryboard] = useState<any>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Header & Toolbar states
  const [titleInput, setTitleInput] = useState("");
  const [editorMode, setEditorMode] = useState<"edit" | "review">("edit");
  const [subView, setSubView] = useState<"storyboard" | "shotlist">(
    "storyboard"
  );
  const [zoomCols, setZoomCols] = useState<number>(3);
  const [showGenerator, setShowGenerator] = useState(true);
  const [showScriptFields, setShowScriptFields] = useState(true);
  const [collapseAll, setCollapseAll] = useState(false);
  const [viewOptionsOpen, setViewOptionsOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [versionMenuOpen, setVersionMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharePassword, setSharePassword] = useState("");
  const [allowComments, setAllowComments] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

  // Selection & Right Sidebar
  const [selectedFrameIds, setSelectedFrameIds] = useState<string[]>([]);
  const [rightTab, setRightTab] = useState<
    "agent" | "comments" | "script" | "assets" | "settings" | "activity"
  >("agent");

  // Boords Agent Prompt
  const [agentPrompt, setAgentPrompt] = useState("");
  const [agentStyle, setAgentStyle] = useState<
    "sketch" | "color" | "cinematic"
  >("sketch");
  const [agentFrameCount, setAgentFrameCount] = useState(4);
  const [generatingBoard, setGeneratingBoard] = useState(false);
  const [generatingFrameId, setGeneratingFrameId] = useState<string | null>(
    null
  );

  // Comments
  const [newCommentText, setNewCommentText] = useState("");
  const [activeCommentFrameId, setActiveCommentFrameId] = useState<
    string | null
  >(null);

  // Animatic Player Modal
  const [animaticOpen, setAnimaticOpen] = useState(false);
  const [animaticPlaying, setAnimaticPlaying] = useState(false);
  const [animaticIndex, setAnimaticIndex] = useState(0);

  // Frame Annotation & Freehand Sketch Canvas Modal
  const [annotatingFrame, setAnnotatingFrame] = useState<any | null>(null);
  const [annotationNote, setAnnotationNote] = useState("");
  const [sketchColor, setSketchColor] = useState("#EF4444");
  const [sketchTool, setSketchTool] = useState<"pen" | "arrow" | "rect">("pen");
  const [sketchPaths, setSketchPaths] = useState<
    { d: string; color: string; tool: string }[]
  >([]);
  const [currentPoints, setCurrentPoints] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const loadData = useCallback(async () => {
    const [sbRes, wsRes] = await Promise.all([
      fetch(`/api/storyboards/${params.slug}`),
      fetch("/api/workspace"),
    ]);
    if (sbRes.status === 401 || wsRes.status === 401) {
      router.push("/login");
      return;
    }
    if (sbRes.ok) {
      const data = await sbRes.json();
      setStoryboard(data.storyboard);
      setTitleInput(data.storyboard.title);
      setSharePassword(data.storyboard.sharePassword || "");
      setAllowComments(data.storyboard.allowComments ?? true);
    }
    if (wsRes.ok) {
      setWorkspace(await wsRes.json());
    }
    setLoading(false);
  }, [params.slug, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Animatic Playback Timer
  useEffect(() => {
    if (!animaticOpen || !animaticPlaying || !storyboard?.frames?.length) {
      return;
    }
    const currentFrame = storyboard.frames[animaticIndex];
    const durationMs = Math.max(1, Number(currentFrame?.durationSec || 3)) * 1000;
    const timer = setTimeout(() => {
      if (animaticIndex + 1 < storyboard.frames.length) {
        setAnimaticIndex((i) => i + 1);
      } else {
        setAnimaticPlaying(false);
      }
    }, durationMs);
    return () => clearTimeout(timer);
  }, [animaticOpen, animaticPlaying, animaticIndex, storyboard]);

  const handleUpdateStoryboard = async (patch: Record<string, unknown>) => {
    if (!storyboard) return;
    const res = await fetch(`/api/storyboards/${storyboard.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const data = await res.json();
      setStoryboard((prev: any) => ({
        ...prev,
        ...data.storyboard,
        comments: prev?.comments || [],
      }));
    }
  };

  const handleCreateNewVersion = async (asNewVersion: boolean) => {
    if (!storyboard) return;
    setVersionMenuOpen(false);
    const res = await fetch("/api/storyboards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        duplicateFromId: storyboard.id,
        asNewVersion,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/storyboards/${data.storyboard.slug}`);
    }
  };

  const handleStartWithEmptyFrames = async () => {
    if (!storyboard) return;
    for (let i = 0; i < 4; i++) {
      await fetch(`/api/storyboards/${storyboard.id}/frames`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position: i,
          shotType: i === 0 ? "Wide Establishing Shot" : "Medium Shot",
          durationSec: 3,
        }),
      });
    }
    await loadData();
  };

  const handleAddSingleFrame = async () => {
    if (!storyboard) return;
    const res = await fetch(`/api/storyboards/${storyboard.id}/frames`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shotType: "Medium Shot",
        durationSec: 3,
      }),
    });
    if (res.ok) {
      await loadData();
    }
  };

  const handleDuplicateFrame = async (frame: any) => {
    if (!storyboard) return;
    const res = await fetch(`/api/storyboards/${storyboard.id}/frames`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shotType: `${frame.shotType || "Shot"} (Copy)`,
        durationSec: frame.durationSec || 3,
        voiceoverText: frame.voiceoverText || "",
        actionText: frame.actionText || "",
        cameraNotes: frame.cameraNotes || "",
        imageUrl: frame.imageUrl || null,
        imagePrompt: frame.imagePrompt || "",
      }),
    });
    if (res.ok) {
      await loadData();
    }
  };

  const handleGenerateStoryboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyboard) return;
    setGeneratingBoard(true);
    try {
      const res = await fetch(`/api/storyboards/${storyboard.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt:
            agentPrompt.trim() ||
            "@alex in @office presenting @product in a sleek commercial",
          style: agentStyle,
          frameCount: agentFrameCount,
        }),
      });
      if (res.ok) {
        setAgentPrompt("");
        await loadData();
      }
    } finally {
      setGeneratingBoard(false);
    }
  };

  const handleGenerateSingleFrame = async (frame: any) => {
    if (!storyboard) return;
    setGeneratingFrameId(frame.id);
    try {
      await fetch(`/api/storyboards/${storyboard.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frameId: frame.id,
          prompt:
            frame.imagePrompt ||
            frame.actionText ||
            frame.voiceoverText ||
            `Frame ${frame.position + 1} @alex @office`,
          style: frame.imageStyle || agentStyle,
          shotType: frame.shotType || "Medium Shot",
        }),
      });
      await loadData();
    } finally {
      setGeneratingFrameId(null);
    }
  };

  const handleUpdateFrame = async (
    frameId: string,
    patch: Record<string, unknown>
  ) => {
    if (!storyboard) return;
    setStoryboard((prev: any) => ({
      ...prev,
      frames: prev.frames.map((f: any) =>
        f.id === frameId ? { ...f, ...patch } : f
      ),
    }));
    await fetch(`/api/storyboards/${storyboard.id}/frames`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frameId, ...patch }),
    });
  };

  const handleMoveFrame = async (index: number, direction: -1 | 1) => {
    if (!storyboard?.frames) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= storyboard.frames.length) return;
    const copy = [...storyboard.frames];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    const orderedFrameIds = copy.map((f: any) => f.id);
    await fetch(`/api/storyboards/${storyboard.id}/frames`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedFrameIds }),
    });
    await loadData();
  };

  const handleBulkDelete = async () => {
    if (!storyboard || selectedFrameIds.length === 0) return;
    await fetch(`/api/storyboards/${storyboard.id}/frames`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleteFrameIds: selectedFrameIds }),
    });
    setSelectedFrameIds([]);
    await loadData();
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyboard || !newCommentText.trim()) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storyboardId: storyboard.id,
        frameId: activeCommentFrameId,
        body: newCommentText.trim(),
        linkUrl: `/storyboards/${storyboard.slug}`,
      }),
    });
    if (res.ok) {
      setNewCommentText("");
      await loadData();
    }
  };

  const handleExport = (format: string) => {
    if (!storyboard) return;
    setExportMenuOpen(false);
    const frames = storyboard.frames || [];
    let content = "";
    let filename = `${storyboard.slug}-${format.toLowerCase()}.txt`;
    let mime = "text/plain";

    if (format === "CSV" || format === "Google Sheets") {
      content = [
        "Frame,Shot Type,Duration (s),Voiceover,Action,Camera Notes",
        ...frames.map(
          (f: any, i: number) =>
            `${i + 1},"${(f.shotType || "").replace(/"/g, '""')}",${
              f.durationSec
            },"${(f.voiceoverText || "").replace(/"/g, '""')}","${(
              f.actionText || ""
            ).replace(/"/g, '""')}","${(f.cameraNotes || "").replace(
              /"/g,
              '""'
            )}"`
        ),
      ].join("\n");
      filename = `${storyboard.slug}-shotlist.csv`;
      mime = "text/csv";
    } else {
      content = JSON.stringify(
        {
          exportFormat: format,
          title: storyboard.title,
          version: `v${storyboard.version}`,
          status: storyboard.status,
          aspectRatio: storyboard.aspectRatio,
          totalDurationSec: frames.reduce(
            (sum: number, f: any) => sum + Number(f.durationSec || 3),
            0
          ),
          frames,
        },
        null,
        2
      );
      filename = `${storyboard.slug}-${format
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")}.json`;
      mime = "application/json";
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F0] flex items-center justify-center text-sm text-[#5C5B57]">
        Loading Storyboard Editor...
      </div>
    );
  }

  if (!storyboard) {
    return (
      <div className="min-h-screen bg-[#F6F6F0] flex flex-col items-center justify-center p-6">
        <p className="text-sm text-[#5C5B57] mb-4">Storyboard not found.</p>
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold"
        >
          Back to Workspace
        </Link>
      </div>
    );
  }

  const frames: any[] = storyboard.frames || [];
  const hasFrames = frames.length > 0;
  const totalDuration = frames.reduce(
    (acc, f) => acc + Number(f.durationSec || 3),
    0
  );
  const statuses = workspace?.statuses || [
    { name: "Draft", color: "#9CA3AF" },
    { name: "In progress", color: "#3B82F6" },
    { name: "In review", color: "#F59E0B" },
    { name: "Changes requested", color: "#EF4444" },
    { name: "Approved", color: "#10B981" },
  ];
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/s/${storyboard.shortSlug}/frame`
      : `/s/${storyboard.shortSlug}/frame`;

  const formatFrameNum = (idx: number) => {
    if (storyboard.frameNumberFormat === "1A, 1B") {
      return `1${String.fromCharCode(65 + (idx % 26))}`;
    }
    return String(idx + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F0] text-[#121212]">
      {/* Archived Read-Only Protection Banner */}
      {storyboard.isArchived && (
        <div className="px-4 py-2 bg-[#FEF3C7] border-b border-[#F4BD64] flex items-center justify-between text-xs font-semibold text-[#121212]">
          <span>
            You are viewing archived items. Please restore them to edit.
          </span>
          <button
            type="button"
            onClick={() => handleUpdateStoryboard({ isArchived: false })}
            className="px-3 py-1 rounded-lg bg-[#121212] text-white text-xs font-semibold"
          >
            Restore Storyboard
          </button>
        </div>
      )}

      {/* Primary Top Editor Header */}
      <header className="h-14 px-4 bg-[#F2F2EE] border-b border-[#E5E4DE] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href={
              storyboard.project
                ? `/p/${storyboard.project.slug}`
                : "/dashboard"
            }
            className="p-1.5 rounded-xl hover:bg-black/5 text-[#5C5B57] hover:text-[#121212] inline-flex items-center gap-1 text-xs font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">
              {storyboard.project ? storyboard.project.name : "Home"}
            </span>
          </Link>

          <span className="text-[#5C5B57]">/</span>

          <input
            aria-label="Storyboard Title"
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={() => {
              if (titleInput.trim() && titleInput !== storyboard.title) {
                handleUpdateStoryboard({ title: titleInput.trim() });
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-[#E5E4DE] font-bold text-sm focus:outline-none w-44 sm:w-64 truncate"
          />

          {/* Version Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setVersionMenuOpen((v) => !v)}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E4DE] text-xs font-semibold inline-flex items-center gap-1"
            >
              v{storyboard.version}
              <ChevronDown className="w-3 h-3" />
            </button>
            {versionMenuOpen && (
              <div className="absolute left-0 mt-1 w-48 bg-white border border-[#E5E4DE] rounded-xl shadow-lg p-1.5 z-40 text-xs">
                <button
                  type="button"
                  onClick={() => handleCreateNewVersion(true)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F6F6F0] font-semibold"
                >
                  + Create new version (v{storyboard.version + 1})
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateNewVersion(false)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F6F6F0]"
                >
                  Duplicate storyboard
                </button>
              </div>
            )}
          </div>

          {/* Workflow Status Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setStatusMenuOpen((v) => !v)}
              className="px-2.5 py-1 rounded-full bg-white border border-[#E5E4DE] text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-[#D97706]" />
              <span>{storyboard.status}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {statusMenuOpen && (
              <div className="absolute left-0 mt-1 w-48 bg-white border border-[#E5E4DE] rounded-xl shadow-lg p-1.5 z-40 text-xs">
                {statuses.map((st: any) => (
                  <button
                    key={st.name}
                    type="button"
                    onClick={() => {
                      setStatusMenuOpen(false);
                      handleUpdateStoryboard({ status: st.name });
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F6F6F0] text-left"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: st.color }}
                    />
                    <span>{st.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Header Actions: Share, Export, Edit | Review */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E4DE] text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[#F6F6F0]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share storyboard</span>
          </button>

          <div className="relative">
            <button
              type="button"
              disabled={!hasFrames}
              onClick={() => setExportMenuOpen((v) => !v)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E4DE] text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[#F6F6F0] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white border border-[#E5E4DE] rounded-xl shadow-lg p-1.5 z-40 text-xs">
                {[
                  "PDF",
                  "Slides",
                  "Animatic",
                  "Images",
                  "After Effects",
                  "Premiere / Resolve",
                  "Script",
                  "Google Sheets",
                ].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => handleExport(fmt)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F6F6F0] font-medium"
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-[#E5E4DE]">
            <button
              type="button"
              onClick={() => setEditorMode("edit")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                editorMode === "edit"
                  ? "bg-[#121212] text-white"
                  : "text-[#5C5B57]"
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              disabled={!hasFrames}
              onClick={() => {
                setEditorMode("review");
                setRightTab("comments");
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed ${
                editorMode === "review"
                  ? "bg-[#121212] text-white"
                  : "text-[#5C5B57]"
              }`}
            >
              Review
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Sub-Toolbar */}
      <div className="h-12 px-4 bg-white border-b border-[#E5E4DE] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Storyboard | Shot list switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F2F2EE]">
            <button
              type="button"
              onClick={() => setSubView("storyboard")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                subView === "storyboard"
                  ? "bg-white text-[#121212] shadow-2xs"
                  : "text-[#5C5B57]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Storyboard
            </button>
            <button
              type="button"
              onClick={() => setSubView("shotlist")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                subView === "shotlist"
                  ? "bg-white text-[#121212] shadow-2xs"
                  : "text-[#5C5B57]"
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Shot list
            </button>
          </div>

          {/* Zoom slider */}
          {subView === "storyboard" && (
            <div className="hidden md:flex items-center gap-2 text-xs text-[#5C5B57]">
              <span>Grid size</span>
              <input
                aria-label="Grid zoom columns"
                type="range"
                min={2}
                max={4}
                value={zoomCols}
                onChange={(e) => setZoomCols(Number(e.target.value))}
                className="w-20 accent-[#121212]"
              />
            </div>
          )}

          {/* View Options Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setViewOptionsOpen((v) => !v)}
              className="px-2.5 py-1.5 rounded-xl border border-[#E5E4DE] text-xs font-medium inline-flex items-center gap-1.5 hover:bg-[#F6F6F0]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>View options</span>
            </button>
            {viewOptionsOpen && (
              <div className="absolute left-0 mt-1 w-52 bg-white border border-[#E5E4DE] rounded-xl shadow-lg p-3 z-30 space-y-2 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Show generator</span>
                  <input
                    type="checkbox"
                    checked={showGenerator}
                    onChange={(e) => setShowGenerator(e.target.checked)}
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Show script</span>
                  <input
                    type="checkbox"
                    checked={showScriptFields}
                    onChange={(e) => setShowScriptFields(e.target.checked)}
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Collapse all</span>
                  <input
                    type="checkbox"
                    checked={collapseAll}
                    onChange={(e) => setCollapseAll(e.target.checked)}
                  />
                </label>
              </div>
            )}
          </div>

          {hasFrames && editorMode === "edit" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setSelectedFrameIds(
                    selectedFrameIds.length === frames.length
                      ? []
                      : frames.map((f) => f.id)
                  )
                }
                className="px-2.5 py-1.5 rounded-xl border border-[#E5E4DE] text-xs font-medium hover:bg-[#F6F6F0]"
              >
                Select all
              </button>
              <button
                type="button"
                disabled={selectedFrameIds.length === 0}
                onClick={handleBulkDelete}
                className="px-2.5 py-1.5 rounded-xl border border-[#E5E4DE] text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {editorMode === "edit" && (
            <button
              type="button"
              onClick={handleAddSingleFrame}
              className="px-3 py-1.5 rounded-xl border border-[#E5E4DE] bg-[#F6F6F0] hover:bg-[#E5E4DE] text-xs font-semibold inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add frame
            </button>
          )}
          <button
            type="button"
            disabled={!hasFrames}
            onClick={() => {
              setAnimaticIndex(0);
              setAnimaticPlaying(true);
              setAnimaticOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#121212] text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            <Play className="w-3.5 h-3.5" />
            Animatic ({totalDuration.toFixed(0)}s)
          </button>
        </div>
      </div>

      {/* Main Editor Body + Right 6-Tab Utility Rail */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Center Canvas */}
        <div className="flex-1 overflow-y-auto p-6">
          {!hasFrames ? (
            /* Boords Agent Empty State Start Card */
            <div className="max-w-2xl mx-auto my-8 bg-white border border-[#E5E4DE] rounded-3xl p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7] text-xs font-bold text-[#121212] mb-4">
                <Wand2 className="w-3.5 h-3.5 text-[#D97706]" />
                Boords Agent
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Have a script or idea?
              </h2>
              <p className="text-sm text-[#5C5B57] mt-1">
                Paste your script or describe your idea, and I&apos;ll build your
                storyboard with @mention character consistency.
              </p>

              <form
                onSubmit={handleGenerateStoryboard}
                className="mt-5 space-y-4"
              >
                <textarea
                  rows={4}
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  placeholder="e.g. A 4-shot commercial where @alex introduces @product in @office, followed by @sam testing it on @street..."
                  className="w-full px-4 py-3 rounded-2xl border border-[#E5E4DE] bg-[#F6F6F0]/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#121212]"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={agentStyle}
                      onChange={(e) =>
                        setAgentStyle(
                          e.target.value as "sketch" | "color" | "cinematic"
                        )
                      }
                      className="px-3 py-2 rounded-xl border border-[#E5E4DE] bg-white text-xs font-semibold"
                    >
                      <option value="sketch">Sketch Style</option>
                      <option value="color">Warm Color</option>
                      <option value="cinematic">Cinematic</option>
                    </select>
                    <select
                      value={agentFrameCount}
                      onChange={(e) =>
                        setAgentFrameCount(Number(e.target.value))
                      }
                      className="px-3 py-2 rounded-xl border border-[#E5E4DE] bg-white text-xs font-semibold"
                    >
                      <option value={4}>4 Frames</option>
                      <option value={6}>6 Frames</option>
                      <option value={8}>8 Frames</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={generatingBoard}
                    className="px-5 py-2.5 rounded-xl bg-[#121212] text-white text-xs font-semibold hover:bg-black/90 transition inline-flex items-center gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    {generatingBoard
                      ? "Building Storyboard..."
                      : "Generate Storyboard"}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-[#E5E4DE] text-center">
                <button
                  type="button"
                  onClick={handleStartWithEmptyFrames}
                  className="text-xs font-semibold text-[#5C5B57] hover:text-[#121212] underline underline-offset-4"
                >
                  Don&apos;t have a script? Start with empty frames
                </button>
              </div>
            </div>
          ) : subView === "storyboard" ? (
            /* Frame Grid View */
            <div
              className="grid gap-5"
              style={{
                gridTemplateColumns: `repeat(${zoomCols}, minmax(0, 1fr))`,
              }}
            >
              {frames.map((frame, idx) => {
                const isSelected = selectedFrameIds.includes(frame.id);
                return (
                  <div
                    key={frame.id}
                    className={`bg-white border rounded-2xl overflow-hidden shadow-2xs transition ${
                      isSelected
                        ? "border-[#121212] ring-2 ring-[#121212]"
                        : "border-[#E5E4DE]"
                    }`}
                  >
                    {/* Frame Header */}
                    <div className="px-3.5 py-2.5 bg-[#F2F2EE] border-b border-[#E5E4DE] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFrameIds((p) => [...p, frame.id]);
                            } else {
                              setSelectedFrameIds((p) =>
                                p.filter((id) => id !== frame.id)
                              );
                            }
                          }}
                        />
                        <span className="px-2 py-0.5 rounded bg-[#121212] text-white font-bold">
                          {formatFrameNum(idx)}
                        </span>
                        <input
                          type="text"
                          value={frame.shotType || ""}
                          onChange={(e) =>
                            handleUpdateFrame(frame.id, {
                              shotType: e.target.value,
                            })
                          }
                          placeholder="Shot type..."
                          className="bg-transparent font-medium text-[#121212] focus:outline-none w-32"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Move Left"
                          onClick={() => handleMoveFrame(idx, -1)}
                          className="p-1 rounded hover:bg-black/5"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Move Right"
                          onClick={() => handleMoveFrame(idx, 1)}
                          className="p-1 rounded hover:bg-black/5"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Duplicate Frame"
                          onClick={() => handleDuplicateFrame(frame)}
                          className="p-1 rounded hover:bg-black/5"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Annotate Frame"
                          onClick={() => {
                            setAnnotatingFrame(frame);
                            setAnnotationNote(frame.annotationsJson || "");
                            setSketchPaths([]);
                          }}
                          className="p-1 rounded hover:bg-black/5"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Frame Canvas / Image */}
                    <div className="aspect-video bg-[#F6F6F0] border-b border-[#E5E4DE] relative flex items-center justify-center overflow-hidden">
                      {frame.imageUrl ? (
                        <img
                          src={frame.imageUrl}
                          alt={`Frame ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <p className="text-xs text-[#5C5B57] mb-2">
                            Empty Frame {formatFrameNum(idx)}
                          </p>
                          <button
                            type="button"
                            disabled={generatingFrameId === frame.id}
                            onClick={() => handleGenerateSingleFrame(frame)}
                            className="px-3 py-1.5 rounded-xl bg-[#121212] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            {generatingFrameId === frame.id
                              ? "Generating..."
                              : "Generate AI Frame"}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Generator Bar */}
                    {showGenerator && !collapseAll && editorMode === "edit" && (
                      <div className="p-3 bg-[#F6F6F0]/60 border-b border-[#E5E4DE] flex items-center gap-2">
                        <input
                          type="text"
                          value={frame.imagePrompt || ""}
                          onChange={(e) =>
                            handleUpdateFrame(frame.id, {
                              imagePrompt: e.target.value,
                            })
                          }
                          placeholder="Prompt with @alex @office..."
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#E5E4DE] bg-white text-xs"
                        />
                        <button
                          type="button"
                          disabled={generatingFrameId === frame.id}
                          onClick={() => handleGenerateSingleFrame(frame)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#121212] text-white text-xs font-semibold shrink-0"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Script & Camera Notes Fields */}
                    {showScriptFields && !collapseAll && (
                      <div className="p-3.5 space-y-2.5 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C5B57] mb-1">
                            Voiceover / Dialogue
                          </label>
                          <textarea
                            rows={2}
                            readOnly={editorMode === "review"}
                            value={frame.voiceoverText || ""}
                            onChange={(e) =>
                              handleUpdateFrame(frame.id, {
                                voiceoverText: e.target.value,
                              })
                            }
                            placeholder="Spoken dialogue or voiceover..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5E4DE] bg-[#F6F6F0]/40 focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5C5B57] mb-1">
                            Action
                          </label>
                          <textarea
                            rows={2}
                            readOnly={editorMode === "review"}
                            value={frame.actionText || ""}
                            onChange={(e) =>
                              handleUpdateFrame(frame.id, {
                                actionText: e.target.value,
                              })
                            }
                            placeholder="Visual action in frame..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5E4DE] bg-[#F6F6F0]/40 focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-[#5C5B57]">
                              Duration (s):
                            </span>
                            <input
                              type="number"
                              step="0.5"
                              min="0.5"
                              value={frame.durationSec || 3}
                              onChange={(e) =>
                                handleUpdateFrame(frame.id, {
                                  durationSec: Number(e.target.value),
                                })
                              }
                              className="w-16 px-2 py-1 rounded border border-[#E5E4DE] text-xs"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveCommentFrameId(frame.id);
                              setRightTab("comments");
                            }}
                            className="text-xs font-semibold text-[#5C5B57] hover:text-[#121212] inline-flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Comment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Shot List Table View */
            <div className="bg-white border border-[#E5E4DE] rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F2F2EE] border-b border-[#E5E4DE] uppercase text-[#5C5B57]">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Frame</th>
                    <th className="py-3 px-4">Shot Type</th>
                    <th className="py-3 px-4">Voiceover</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Camera Notes</th>
                    <th className="py-3 px-4">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E4DE]">
                  {frames.map((frame, idx) => (
                    <tr key={frame.id} className="hover:bg-[#F6F6F0]/50">
                      <td className="py-3 px-4 font-bold">
                        {formatFrameNum(idx)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-24 aspect-video rounded bg-[#F2F2EE] overflow-hidden border border-[#E5E4DE]">
                          {frame.imageUrl && (
                            <img
                              src={frame.imageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={frame.shotType || ""}
                          onChange={(e) =>
                            handleUpdateFrame(frame.id, {
                              shotType: e.target.value,
                            })
                          }
                          className="px-2 py-1 rounded border border-[#E5E4DE] bg-white w-36"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={frame.voiceoverText || ""}
                          onChange={(e) =>
                            handleUpdateFrame(frame.id, {
                              voiceoverText: e.target.value,
                            })
                          }
                          className="px-2 py-1 rounded border border-[#E5E4DE] bg-white w-48"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={frame.actionText || ""}
                          onChange={(e) =>
                            handleUpdateFrame(frame.id, {
                              actionText: e.target.value,
                            })
                          }
                          className="px-2 py-1 rounded border border-[#E5E4DE] bg-white w-48"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={frame.cameraNotes || ""}
                          onChange={(e) =>
                            handleUpdateFrame(frame.id, {
                              cameraNotes: e.target.value,
                            })
                          }
                          className="px-2 py-1 rounded border border-[#E5E4DE] bg-white w-40"
                        />
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {frame.durationSec}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 6-Tab Utility Sidebar */}
        <aside className="w-80 bg-white border-l border-[#E5E4DE] flex flex-col shrink-0">
          <div className="p-2 border-b border-[#E5E4DE] grid grid-cols-6 gap-1 bg-[#F2F2EE]">
            {[
              { id: "agent", icon: Wand2, label: "Boords Agent" },
              { id: "comments", icon: MessageSquare, label: "Comments" },
              { id: "script", icon: FileText, label: "Script" },
              { id: "assets", icon: Images, label: "Library Assets" },
              { id: "settings", icon: Settings, label: "Storyboard Settings" },
              { id: "activity", icon: Activity, label: "Activity" },
            ].map((t) => {
              const Icon = t.icon;
              const active = rightTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  title={t.label}
                  aria-label={t.label}
                  onClick={() => setRightTab(t.id as any)}
                  className={`p-2 rounded-lg flex items-center justify-center transition ${
                    active
                      ? "bg-[#121212] text-white"
                      : "text-[#5C5B57] hover:text-[#121212]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4 text-xs space-y-4">
            {rightTab === "agent" && (
              <div className="space-y-3">
                <h3 className="font-bold text-sm">Boords Agent</h3>
                <p className="text-[#5C5B57]">
                  Generate additional frames using @character, @location, and
                  @prop tags.
                </p>
                <form onSubmit={handleGenerateStoryboard} className="space-y-3">
                  <textarea
                    rows={3}
                    value={agentPrompt}
                    onChange={(e) => setAgentPrompt(e.target.value)}
                    placeholder="Describe shots to append (e.g. @alex and @sam in @kitchen)..."
                    className="w-full p-2.5 rounded-xl border border-[#E5E4DE]"
                  />
                  <button
                    type="submit"
                    disabled={generatingBoard}
                    className="w-full py-2 rounded-xl bg-[#121212] text-white font-semibold"
                  >
                    {generatingBoard ? "Generating..." : "Generate Shots"}
                  </button>
                </form>
              </div>
            )}

            {rightTab === "comments" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm">
                    Comments ({(storyboard.comments || []).length})
                  </h3>
                  {activeCommentFrameId && (
                    <button
                      type="button"
                      onClick={() => setActiveCommentFrameId(null)}
                      className="text-[11px] underline text-[#5C5B57]"
                    >
                      Show all frames
                    </button>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="space-y-2">
                  <textarea
                    rows={2}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Leave frame feedback..."
                    className="w-full p-2.5 rounded-xl border border-[#E5E4DE]"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-[#121212] text-white font-semibold"
                  >
                    Post Comment
                  </button>
                </form>

                <div className="space-y-2.5">
                  {(storyboard.comments || []).map((c: any) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-[#F6F6F0] border border-[#E5E4DE]"
                    >
                      <div className="font-semibold">
                        {c.author?.name || c.guestName || "Reviewer"}
                      </div>
                      <p className="mt-1 text-[#5C5B57]">{c.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rightTab === "script" && (
              <div className="space-y-3">
                <h3 className="font-bold text-sm">Compiled Voiceover Script</h3>
                {frames.map((f, idx) => (
                  <div
                    key={f.id}
                    className="p-2.5 rounded-xl bg-[#F6F6F0] border border-[#E5E4DE]"
                  >
                    <div className="font-bold">Frame {idx + 1}</div>
                    <p className="text-[#5C5B57] mt-0.5">
                      {f.voiceoverText || "No dialogue"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {rightTab === "assets" && (
              <div className="space-y-3">
                <h3 className="font-bold text-sm">@Mention Library Assets</h3>
                <p className="text-[11px] text-[#5C5B57]">
                  Click an asset to apply it to a frame or append its @mention tag.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(workspace?.assets || []).slice(0, 12).map((asset: any) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        setAgentPrompt((p) =>
                          `${p} ${asset.mentionName || `@${asset.name}`}`.trim()
                        );
                        const targetFrameId =
                          selectedFrameIds[0] || frames[0]?.id;
                        if (targetFrameId && asset.imageUrl) {
                          handleUpdateFrame(targetFrameId, {
                            imageUrl: asset.imageUrl,
                            mentionedAssets: asset.mentionName || asset.name,
                          });
                        }
                      }}
                      className="p-2 rounded-xl border border-[#E5E4DE] bg-[#F6F6F0] hover:border-[#121212] text-left transition"
                    >
                      <div className="font-semibold truncate">{asset.name}</div>
                      <div className="font-mono text-[11px] text-[#D97706]">
                        {asset.mentionName}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {rightTab === "settings" && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm">Storyboard Settings</h3>
                <div>
                  <label className="block font-semibold mb-1">
                    Aspect Ratio
                  </label>
                  <select
                    value={storyboard.aspectRatio}
                    onChange={(e) =>
                      handleUpdateStoryboard({ aspectRatio: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E4DE] bg-white"
                  >
                    <option value="16:9">16:9 Widescreen</option>
                    <option value="9:16">9:16 Vertical (Reels/TikTok)</option>
                    <option value="1:1">1:1 Square</option>
                    <option value="4:5">4:5 Portrait</option>
                    <option value="2.39:1">2.39:1 Anamorphic</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Frame Numbering
                  </label>
                  <select
                    value={storyboard.frameNumberFormat}
                    onChange={(e) =>
                      handleUpdateStoryboard({
                        frameNumberFormat: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E4DE] bg-white"
                  >
                    <option value="1, 2, 3">1, 2, 3 (Sequential)</option>
                    <option value="1A, 1B">1A, 1B (Scene + Shot)</option>
                  </select>
                </div>
              </div>
            )}

            {rightTab === "activity" && (
              <div className="space-y-2.5">
                <h3 className="font-bold text-sm">Storyboard Activity</h3>
                {(workspace?.auditLogs || []).slice(0, 10).map((log: any) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-[#F6F6F0] border border-[#E5E4DE]"
                  >
                    <div className="font-mono font-semibold">{log.action}</div>
                    <div className="text-[11px] text-[#5C5B57] mt-0.5">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Share Storyboard Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E4DE] rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Share storyboard</h2>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#F2F2EE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1">
                Client Review Link
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
                  onClick={async () => {
                    await handleUpdateStoryboard({
                      isShared: true,
                      sharePassword: sharePassword.trim() || null,
                      allowComments,
                    });
                    if (navigator.clipboard) {
                      await navigator.clipboard.writeText(shareUrl);
                    }
                    setCopiedShare(true);
                    setTimeout(() => setCopiedShare(false), 2000);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  {copiedShare ? (
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
                Optional Password
              </label>
              <input
                type="text"
                value={sharePassword}
                onChange={(e) => setSharePassword(e.target.value)}
                placeholder="Leave blank for open access"
                className="w-full px-3 py-2 rounded-xl border border-[#E5E4DE] text-xs"
              />
            </div>

            <label className="flex items-center justify-between text-xs font-medium cursor-pointer">
              <span>Allow guest comments on shared link</span>
              <input
                type="checkbox"
                checked={allowComments}
                onChange={(e) => setAllowComments(e.target.checked)}
              />
            </label>
          </div>
        </div>
      )}

      {/* Animatic Player Modal */}
      {animaticOpen && hasFrames && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121212] text-white border border-white/15 rounded-3xl max-w-3xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold">
                {storyboard.title} — Animatic Preview (Frame{" "}
                {animaticIndex + 1} of {frames.length})
              </div>
              <button
                type="button"
                onClick={() => {
                  setAnimaticPlaying(false);
                  setAnimaticOpen(false);
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center relative border border-white/10">
              {frames[animaticIndex]?.imageUrl ? (
                <img
                  src={frames[animaticIndex].imageUrl}
                  alt=""
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-sm text-white/60">
                  Frame {animaticIndex + 1} ({frames[animaticIndex]?.shotType})
                </div>
              )}
              {frames[animaticIndex]?.voiceoverText && (
                <div className="absolute bottom-4 inset-x-8 bg-black/75 backdrop-blur px-4 py-2 rounded-xl text-center text-sm">
                  {frames[animaticIndex].voiceoverText}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setAnimaticPlaying((p) => !p)}
                className="px-4 py-2 rounded-xl bg-[#F4BD64] text-[#121212] text-xs font-bold inline-flex items-center gap-1.5"
              >
                {animaticPlaying ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Play
                  </>
                )}
              </button>

              <div className="flex-1 flex items-center gap-2">
                {frames.map((f, i) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setAnimaticIndex(i)}
                    className={`h-2 flex-1 rounded-full transition ${
                      i === animaticIndex ? "bg-[#F4BD64]" : "bg-white/20"
                    }`}
                  />
                ))}
              </div>

              <span className="text-xs font-mono text-white/70">
                {frames[animaticIndex]?.durationSec || 3}s / {totalDuration}s
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Frame Annotation & Freehand Sketch Studio Modal */}
      {annotatingFrame && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E4DE] rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">
                Frame Annotation, Freehand Sketch & Camera Direction
              </h3>
              <button
                type="button"
                onClick={() => setAnnotatingFrame(null)}
                className="p-1 rounded-lg hover:bg-[#F2F2EE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sketch Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#F2F2EE] border border-[#E5E4DE] text-xs">
              <div className="flex items-center gap-1.5">
                {(["pen", "arrow", "rect"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSketchTool(t)}
                    className={`px-2.5 py-1 rounded-lg font-semibold capitalize ${
                      sketchTool === t
                        ? "bg-[#121212] text-white"
                        : "bg-white text-[#5C5B57]"
                    }`}
                  >
                    {t === "pen" ? "Freehand Brush" : t === "arrow" ? "Direction Arrow" : "Camera Box"}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                {["#EF4444", "#121212", "#3B82F6", "#F59E0B", "#10B981"].map(
                  (col) => (
                    <button
                      key={col}
                      type="button"
                      aria-label={`Color ${col}`}
                      onClick={() => setSketchColor(col)}
                      className={`w-5 h-5 rounded-full border-2 ${
                        sketchColor === col
                          ? "border-[#121212] scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  )
                )}
                <button
                  type="button"
                  onClick={() => setSketchPaths([])}
                  className="ml-2 px-2 py-1 rounded bg-white border border-[#E5E4DE] text-[11px] font-semibold"
                >
                  Clear Canvas
                </button>
              </div>
            </div>

            {/* Interactive SVG Drawing Surface */}
            <div className="aspect-video rounded-xl border border-[#E5E4DE] bg-[#F6F6F0] relative overflow-hidden select-none">
              {annotatingFrame.imageUrl && (
                <img
                  src={annotatingFrame.imageUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
              )}
              <svg
                data-testid="frame-sketch-svg"
                viewBox="0 0 640 360"
                className="relative z-10 w-full h-full cursor-crosshair"
                onMouseDown={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.round(((e.clientX - rect.left) / rect.width) * 640);
                  const y = Math.round(((e.clientY - rect.top) / rect.height) * 360);
                  setIsDrawing(true);
                  setCurrentPoints([[x, y]]);
                }}
                onMouseMove={(e) => {
                  if (!isDrawing) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.round(((e.clientX - rect.left) / rect.width) * 640);
                  const y = Math.round(((e.clientY - rect.top) / rect.height) * 360);
                  setCurrentPoints((pts) => [...pts, [x, y]]);
                }}
                onMouseUp={() => {
                  if (!isDrawing || currentPoints.length === 0) return;
                  setIsDrawing(false);
                  const d = currentPoints
                    .map((pt, idx) => `${idx === 0 ? "M" : "L"}${pt[0]} ${pt[1]}`)
                    .join(" ");
                  setSketchPaths((prev) => [
                    ...prev,
                    { d: d || "M100 100 L220 160", color: sketchColor, tool: sketchTool },
                  ]);
                  setCurrentPoints([]);
                }}
              >
                {sketchPaths.map((p, i) => (
                  <path
                    key={i}
                    d={p.d}
                    stroke={p.color}
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ))}
                {isDrawing && currentPoints.length > 1 && (
                  <path
                    d={currentPoints
                      .map((pt, idx) => `${idx === 0 ? "M" : "L"}${pt[0]} ${pt[1]}`)
                      .join(" ")}
                    stroke={sketchColor}
                    strokeWidth={4}
                    strokeLinecap="round"
                    fill="none"
                  />
                )}
              </svg>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#5C5B57] mb-1">
                  Camera & Blocking Notes
                </label>
                <textarea
                  rows={2}
                  value={annotationNote}
                  onChange={(e) => setAnnotationNote(e.target.value)}
                  placeholder="e.g. Draw red push-in arrow on @alex; 35mm dolly zoom"
                  className="w-full p-2.5 rounded-xl border border-[#E5E4DE] text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#5C5B57] mb-1">
                  Upload Custom Frame Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === "string") {
                        setAnnotatingFrame((prev: any) => ({
                          ...prev,
                          imageUrl: reader.result,
                        }));
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#121212] file:text-white file:text-xs file:font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAnnotatingFrame(null)}
                className="px-4 py-2 rounded-xl border border-[#E5E4DE] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  let nextImageUrl = annotatingFrame.imageUrl;
                  if (sketchPaths.length > 0) {
                    const pathsMarkup = sketchPaths
                      .map(
                        (p) =>
                          `<path d="${p.d}" stroke="${p.color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none" />`
                      )
                      .join("");
                    const compositeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="#F6F6F0"/>${
                      nextImageUrl
                        ? `<image href="${nextImageUrl}" width="640" height="360" preserveAspectRatio="xMidYMid slice" />`
                        : ""
                    }${pathsMarkup}<rect x="16" y="312" width="240" height="32" rx="8" fill="#121212" opacity="0.85"/><text x="28" y="333" fill="#F4BD64" font-family="sans-serif" font-size="13" font-weight="bold">${(
                      annotationNote ||
                      annotatingFrame.shotType ||
                      "Annotated Frame"
                    )
                      .replace(/[<>&"]/g, "")
                      .slice(0, 28)}</text></svg>`;
                    nextImageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(
                      compositeSvg
                    )}`;
                  }
                  await handleUpdateFrame(annotatingFrame.id, {
                    annotationsJson: JSON.stringify({
                      note: annotationNote,
                      paths: sketchPaths,
                    }),
                    cameraNotes: annotationNote || annotatingFrame.cameraNotes,
                    ...(nextImageUrl ? { imageUrl: nextImageUrl } : {}),
                  });
                  setAnnotatingFrame(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold"
              >
                Save Annotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
