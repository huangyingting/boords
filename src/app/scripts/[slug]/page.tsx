"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Share2,
  Download,
  ArrowRight,
  Plus,
  Trash2,
  Columns,
  FileText,
  Clock,
  Copy,
  Check,
  X,
  MessageSquare,
} from "lucide-react";

interface SceneRow {
  sceneTitle: string;
  audioText: string;
  visualText: string;
}

export default function ScriptEditorPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const [script, setScript] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [titleInput, setTitleInput] = useState("");
  const [mode, setMode] = useState<"UNSELECTED" | "AV_TABLE" | "BLANK">(
    "UNSELECTED"
  );
  const [scenes, setScenes] = useState<SceneRow[]>([]);
  const [blankContent, setBlankContent] = useState("");
  const [wpm, setWpm] = useState(130);
  const [editorTab, setEditorTab] = useState<"edit" | "review">("edit");
  const [exportOpen, setExportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [converting, setConverting] = useState(false);
  const [commentText, setCommentText] = useState("");

  const loadScript = useCallback(async () => {
    const res = await fetch(`/api/scripts/${params.slug}`);
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setScript(data.script);
      setTitleInput(data.script.title);
      setMode(data.script.mode || "UNSELECTED");
      setBlankContent(data.script.blankContent || "");
      setWpm(data.script.wordsPerMinute || 130);
      setScenes(
        (data.script.scenes || []).map((s: any) => ({
          sceneTitle: s.sceneTitle,
          audioText: s.audioText,
          visualText: s.visualText,
        }))
      );
    }
    setLoading(false);
  }, [params.slug, router]);

  useEffect(() => {
    loadScript();
  }, [loadScript]);

  const saveScriptPatch = async (patch: Record<string, unknown>) => {
    if (!script) return;
    const res = await fetch(`/api/scripts/${script.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const data = await res.json();
      setScript((prev: any) => ({
        ...prev,
        ...data.script,
        comments: prev?.comments || [],
      }));
    }
  };

  const handleSelectMode = async (chosen: "AV_TABLE" | "BLANK") => {
    setMode(chosen);
    const initialScenes =
      chosen === "AV_TABLE" && scenes.length === 0
        ? [
            {
              sceneTitle: "Scene 1",
              audioText: "",
              visualText: "",
            },
          ]
        : scenes;
    setScenes(initialScenes);
    await saveScriptPatch({ mode: chosen, scenes: initialScenes });
  };

  const handleAddScene = async () => {
    const nextScenes = [
      ...scenes,
      {
        sceneTitle: `Scene ${scenes.length + 1}`,
        audioText: "",
        visualText: "",
      },
    ];
    setScenes(nextScenes);
    await saveScriptPatch({ scenes: nextScenes });
  };

  const handleDeleteScene = async (index: number) => {
    const nextScenes = scenes.filter((_, idx) => idx !== index);
    setScenes(nextScenes);
    await saveScriptPatch({ scenes: nextScenes });
  };

  const handleConvertToStoryboard = async () => {
    if (!script) return;
    setConverting(true);
    try {
      await saveScriptPatch({ scenes, blankContent, wordsPerMinute: wpm });
      const res = await fetch(`/api/scripts/${script.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ convertToStoryboard: true }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/storyboards/${data.storyboard.slug}`);
      }
    } finally {
      setConverting(false);
    }
  };

  const handleExport = (fmt: string) => {
    setExportOpen(false);
    const text =
      mode === "BLANK"
        ? blankContent
        : scenes
            .map(
              (s, i) =>
                `## ${s.sceneTitle || `Scene ${i + 1}`}\nAUDIO: ${
                  s.audioText
                }\nVISUAL: ${s.visualText}\n`
            )
            .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${script.slug}-${fmt.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!script || !commentText.trim()) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scriptId: script.id,
        body: commentText.trim(),
        linkUrl: `/scripts/${script.slug}`,
      }),
    });
    if (res.ok) {
      setCommentText("");
      await loadScript();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F0] flex items-center justify-center text-sm text-[#5C5B57]">
        Loading Script Editor...
      </div>
    );
  }

  if (!script) {
    return (
      <div className="min-h-screen bg-[#F6F6F0] flex items-center justify-center">
        Script not found.
      </div>
    );
  }

  // Calculate Audio Words & Total RT at current WPM
  const fullAudioText =
    mode === "BLANK"
      ? blankContent
      : scenes.map((s) => s.audioText).join(" ");
  const audioWords = fullAudioText
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const totalSeconds = Math.round((audioWords / Math.max(40, wpm)) * 60);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const formattedRT = `${mins}:${secs.toString().padStart(2, "0")}`;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/sc/${script.shortSlug}`
      : `/sc/${script.shortSlug}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F0] text-[#121212]">
      {/* Top Script Editor Header */}
      <header className="h-14 px-4 bg-[#F2F2EE] border-b border-[#E5E4DE] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Link
            href={script.project ? `/p/${script.project.slug}` : "/dashboard"}
            className="p-1.5 rounded-xl hover:bg-black/5 text-xs font-medium text-[#5C5B57] inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{script.project ? script.project.name : "Home"}</span>
          </Link>
          <span>/</span>
          <input
            aria-label="Script Title"
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={() => {
              if (titleInput.trim() && titleInput !== script.title) {
                saveScriptPatch({ title: titleInput.trim() });
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-[#E5E4DE] font-bold text-sm focus:outline-none"
          />
          <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#E5E4DE] text-xs font-semibold">
            {script.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {mode !== "UNSELECTED" && (
            <button
              type="button"
              disabled={converting}
              onClick={handleConvertToStoryboard}
              className="px-3.5 py-1.5 rounded-xl bg-[#FEF3C7] border border-[#F4BD64] text-[#121212] text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#f5c77e]"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              {converting ? "Converting..." : "-> Storyboard"}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E4DE] text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share script
          </button>

          <div className="relative">
            <button
              type="button"
              disabled={mode === "UNSELECTED"}
              onClick={() => setExportOpen((v) => !v)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E4DE] text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-[#E5E4DE] rounded-xl shadow-lg p-1.5 z-30 text-xs">
                {["PDF", "Word", "Markdown", "Plain text"].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => handleExport(fmt)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F6F6F0]"
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
              onClick={() => setEditorTab("edit")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                editorTab === "edit"
                  ? "bg-[#121212] text-white"
                  : "text-[#5C5B57]"
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              disabled={mode === "UNSELECTED"}
              onClick={() => setEditorTab("review")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold disabled:opacity-40 ${
                editorTab === "review"
                  ? "bg-[#121212] text-white"
                  : "text-[#5C5B57]"
              }`}
            >
              Review
            </button>
          </div>
        </div>
      </header>

      {/* Metrics Bar when script mode is selected */}
      {mode !== "UNSELECTED" && (
        <div className="h-11 px-6 bg-white border-b border-[#E5E4DE] flex items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <span className="font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D97706]" />
              Total RT <strong className="font-mono">{formattedRT}</strong>
            </span>
            <span>
              Audio words <strong>{audioWords}</strong>
            </span>
            <label className="flex items-center gap-1.5 text-[#5C5B57]">
              <span>Pace:</span>
              <select
                aria-label="Speaking rate WPM"
                value={wpm}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setWpm(next);
                  saveScriptPatch({ wordsPerMinute: next });
                }}
                className="px-2 py-0.5 rounded border border-[#E5E4DE] bg-[#F6F6F0] font-semibold text-[#121212]"
              >
                <option value={110}>110 WPM</option>
                <option value={130}>130 WPM</option>
                <option value={150}>150 WPM</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={() =>
              saveScriptPatch({ scenes, blankContent, wordsPerMinute: wpm })
            }
            className="px-3 py-1 rounded-lg bg-[#121212] text-white font-semibold"
          >
            Save changes
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10">
        {mode === "UNSELECTED" ? (
          <div className="max-w-2xl mx-auto my-12 text-center space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Choose your script format
            </h1>
            <p className="text-sm text-[#5C5B57]">
              Select a structured two-column AV script table or start with a
              blank freeform page.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
              <button
                type="button"
                onClick={() => handleSelectMode("AV_TABLE")}
                className="bg-white border border-[#E5E4DE] hover:border-[#121212] rounded-2xl p-6 transition shadow-2xs"
              >
                <Columns className="w-7 h-7 text-[#D97706] mb-3" />
                <div className="font-bold text-base">
                  Two-column AV script
                </div>
                <p className="text-xs text-[#5C5B57] mt-1">
                  Side-by-side SCENE, AUDIO / VOICEOVER, and VISUAL columns with
                  automatic WPM runtime estimation.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode("BLANK")}
                className="bg-white border border-[#E5E4DE] hover:border-[#121212] rounded-2xl p-6 transition shadow-2xs"
              >
                <FileText className="w-7 h-7 text-[#D97706] mb-3" />
                <div className="font-bold text-base">Blank script</div>
                <p className="text-xs text-[#5C5B57] mt-1">
                  Freeform document editor for treatments, outlines, and
                  monologues.
                </p>
              </button>
            </div>
          </div>
        ) : mode === "AV_TABLE" ? (
          <div className="space-y-4">
            <div className="bg-white border border-[#E5E4DE] rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F2F2EE] border-b border-[#E5E4DE] text-xs font-bold uppercase text-[#5C5B57]">
                  <tr>
                    <th className="py-3 px-4 w-44">SCENE</th>
                    <th className="py-3 px-4">AUDIO / VOICEOVER</th>
                    <th className="py-3 px-4">VISUAL</th>
                    <th className="py-3 px-3 w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E4DE]">
                  {scenes.map((scene, idx) => (
                    <tr key={idx} className="align-top">
                      <td className="p-3">
                        <input
                          type="text"
                          value={scene.sceneTitle}
                          onChange={(e) => {
                            const next = [...scenes];
                            next[idx] = {
                              ...next[idx],
                              sceneTitle: e.target.value,
                            };
                            setScenes(next);
                          }}
                          onBlur={() => saveScriptPatch({ scenes })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5E4DE] font-semibold text-xs"
                        />
                      </td>
                      <td className="p-3">
                        <textarea
                          rows={3}
                          value={scene.audioText}
                          onChange={(e) => {
                            const next = [...scenes];
                            next[idx] = {
                              ...next[idx],
                              audioText: e.target.value,
                            };
                            setScenes(next);
                          }}
                          onBlur={() => saveScriptPatch({ scenes })}
                          placeholder="Write spoken dialogue or voiceover..."
                          className="w-full p-2.5 rounded-xl border border-[#E5E4DE] text-xs focus:outline-none focus:ring-2 focus:ring-[#121212]"
                        />
                      </td>
                      <td className="p-3">
                        <textarea
                          rows={3}
                          value={scene.visualText}
                          onChange={(e) => {
                            const next = [...scenes];
                            next[idx] = {
                              ...next[idx],
                              visualText: e.target.value,
                            };
                            setScenes(next);
                          }}
                          onBlur={() => saveScriptPatch({ scenes })}
                          placeholder="Describe camera action, @characters & @locations..."
                          className="w-full p-2.5 rounded-xl border border-[#E5E4DE] text-xs focus:outline-none focus:ring-2 focus:ring-[#121212]"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteScene(idx)}
                          className="p-1.5 rounded-lg text-[#5C5B57] hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={handleAddScene}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#E5E4DE] hover:border-[#121212] text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add scene
            </button>
          </div>
        ) : (
          <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6 shadow-2xs">
            <textarea
              rows={16}
              value={blankContent}
              onChange={(e) => setBlankContent(e.target.value)}
              onBlur={() => saveScriptPatch({ blankContent })}
              placeholder="Start writing your script treatment or dialogue..."
              className="w-full text-sm leading-relaxed focus:outline-none"
            />
          </div>
        )}

        {editorTab === "review" && (
          <div className="mt-8 bg-white border border-[#E5E4DE] rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#D97706]" />
              Script Review Comments ({(script.comments || []).length})
            </h2>
            <form onSubmit={handlePostComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add review note on this script..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-[#E5E4DE] text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold"
              >
                Comment
              </button>
            </form>
            <div className="space-y-2">
              {(script.comments || []).map((c: any) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-[#F6F6F0] text-xs"
                >
                  <div className="font-semibold">
                    {c.author?.name || c.guestName || "Reviewer"}
                  </div>
                  <div className="text-[#5C5B57] mt-0.5">{c.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Script Modal */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E4DE] rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Share script</h2>
              <button
                type="button"
                onClick={() => setShareOpen(false)}
                className="p-1 rounded-lg hover:bg-[#F2F2EE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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
                  await saveScriptPatch({ isShared: true });
                  if (navigator.clipboard) {
                    await navigator.clipboard.writeText(shareUrl);
                  }
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
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
        </div>
      )}
    </div>
  );
}
