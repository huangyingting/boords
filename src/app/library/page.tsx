"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppShell } from "@/components/workspace/AppShell";
import {
  Images,
  Sparkles,
  Plus,
  FolderPlus,
  Trash2,
  Wand2,
  X,
} from "lucide-react";

export default function LibraryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"library" | "playground">(
    pathname?.endsWith("/playground") ? "playground" : "library"
  );
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [addAssetModalOpen, setAddAssetModalOpen] = useState(false);
  const [assetName, setAssetName] = useState("");
  const [assetMention, setAssetMention] = useState("");
  const [assetCategory, setAssetCategory] = useState("character");

  // Playground state
  const [pgPrompt, setPgPrompt] = useState(
    "@alex standing in @office holding @product, warm lighting"
  );
  const [pgStyle, setPgStyle] = useState<"sketch" | "color" | "cinematic">(
    "color"
  );
  const [pgShotType, setPgShotType] = useState("Medium Shot");
  const [pgGenerating, setPgGenerating] = useState(false);
  const [pgResults, setPgResults] = useState<any[]>([]);

  const loadWorkspace = useCallback(async () => {
    const res = await fetch("/api/workspace");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      setWorkspace(await res.json());
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim()) return;
    const res = await fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: assetName,
        mentionName:
          assetMention ||
          `@${assetName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
        category: assetCategory,
      }),
    });
    if (res.ok) {
      setAssetName("");
      setAssetMention("");
      setAddAssetModalOpen(false);
      loadWorkspace();
    }
  };

  const handlePlaygroundGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pgPrompt.trim()) return;
    setPgGenerating(true);
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playground: true,
          name: pgPrompt.slice(0, 32),
          prompt: pgPrompt,
          style: pgStyle,
          shotType: pgShotType,
          category: "generated",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPgResults((prev) => [data.asset, ...prev]);
        loadWorkspace();
      }
    } finally {
      setPgGenerating(false);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    await fetch(`/api/assets?id=${id}`, { method: "DELETE" });
    loadWorkspace();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F0] flex items-center justify-center text-sm text-[#5C5B57]">
        Loading Asset Library...
      </div>
    );
  }

  const folders = workspace?.assetFolders || [];
  const assets = workspace?.assets || [];
  const filteredAssets =
    selectedFolder === "all"
      ? assets
      : assets.filter(
          (a: any) =>
            a.folderId === selectedFolder ||
            a.category?.toLowerCase() === selectedFolder.toLowerCase()
        );

  return (
    <AppShell
      user={workspace?.user}
      team={workspace?.team}
      role={workspace?.role}
      projects={workspace?.projects || []}
      notifications={workspace?.notifications || []}
      onRefresh={loadWorkspace}
    >
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Assets
            </h1>
            <p className="text-sm text-[#5C5B57] mt-1">
              Manage reusable @character, @location, and @prop references for
              Boords Agent consistency.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F2F2EE] border border-[#E5E4DE]">
              <button
                type="button"
                onClick={() => setActiveTab("library")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                  activeTab === "library"
                    ? "bg-white text-[#121212] shadow-2xs"
                    : "text-[#5C5B57]"
                }`}
              >
                <Images className="w-3.5 h-3.5" />
                Library
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("playground")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                  activeTab === "playground"
                    ? "bg-white text-[#121212] shadow-2xs"
                    : "text-[#5C5B57]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                Playground
              </button>
            </div>

            <button
              type="button"
              onClick={() => setAddAssetModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add asset
            </button>
          </div>
        </div>

        {activeTab === "library" ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Folder Filter Sidebar */}
            <div className="md:col-span-3 space-y-1">
              <button
                type="button"
                onClick={() => setSelectedFolder("all")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  selectedFolder === "all"
                    ? "bg-white text-[#121212] border border-[#E5E4DE]"
                    : "text-[#5C5B57] hover:bg-black/5"
                }`}
              >
                <span>All Assets</span>
                <span>{assets.length}</span>
              </button>
              {folders.map((folder: any) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                    selectedFolder === folder.id
                      ? "bg-white text-[#121212] border border-[#E5E4DE]"
                      : "text-[#5C5B57] hover:bg-black/5"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FolderPlus className="w-3.5 h-3.5 text-[#D97706]" />
                    {folder.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Asset Cards Grid */}
            <div className="md:col-span-9 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAssets.map((asset: any) => (
                <div
                  key={asset.id}
                  className="bg-white border border-[#E5E4DE] rounded-2xl overflow-hidden shadow-2xs group relative"
                >
                  <div className="aspect-square bg-[#F2F2EE] flex items-center justify-center overflow-hidden">
                    <img
                      src={asset.imageUrl}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs truncate">
                        {asset.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#D97706] font-mono text-[11px] font-semibold">
                        {asset.mentionName}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#5C5B57] capitalize mt-1">
                      {asset.category}
                    </div>
                  </div>
                  {!asset.isStarter && (
                    <button
                      type="button"
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 border border-[#E5E4DE] text-red-600 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Playground Tab */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white border border-[#E5E4DE] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Wand2 className="w-4 h-4 text-[#D97706]" />
                <span>Asset Playground Generator</span>
              </div>
              <p className="text-xs text-[#5C5B57]">
                Test prompts and @mentions before adding frames to your
                storyboard. Generated images are automatically saved to your
                Asset Library.
              </p>

              <form onSubmit={handlePlaygroundGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1">
                    Prompt (supports @mentions)
                  </label>
                  <textarea
                    rows={3}
                    value={pgPrompt}
                    onChange={(e) => setPgPrompt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E4DE] bg-[#F6F6F0]/50 text-xs focus:outline-none focus:ring-2 focus:ring-[#121212]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1">
                      Visual Style
                    </label>
                    <select
                      value={pgStyle}
                      onChange={(e) =>
                        setPgStyle(
                          e.target.value as "sketch" | "color" | "cinematic"
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E4DE] bg-white text-xs"
                    >
                      <option value="sketch">Sketch Line Art</option>
                      <option value="color">Warm Concept Color</option>
                      <option value="cinematic">Cinematic Film</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1">
                      Shot Framing
                    </label>
                    <select
                      value={pgShotType}
                      onChange={(e) => setPgShotType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E4DE] bg-white text-xs"
                    >
                      <option>Wide Establishing Shot</option>
                      <option>Medium Shot</option>
                      <option>Close-Up</option>
                      <option>Hero Product Shot</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={pgGenerating}
                  className="w-full py-2.5 rounded-xl bg-[#121212] text-white text-xs font-semibold hover:bg-black/90 transition"
                >
                  {pgGenerating
                    ? "Generating Concept Frame..."
                    : "Generate & Save to Library"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-sm font-bold">
                Recent Playground Generations ({pgResults.length})
              </h2>
              {pgResults.length === 0 ? (
                <div className="bg-white border border-dashed border-[#E5E4DE] rounded-2xl p-12 text-center text-xs text-[#5C5B57]">
                  Enter a prompt on the left and click “Generate & Save to
                  Library” to preview AI concepts.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pgResults.map((res) => (
                    <div
                      key={res.id}
                      className="bg-white border border-[#E5E4DE] rounded-2xl overflow-hidden shadow-2xs"
                    >
                      <img
                        src={res.imageUrl}
                        alt={res.name}
                        className="w-full aspect-video object-cover"
                      />
                      <div className="p-3 text-xs">
                        <div className="font-semibold">{res.prompt}</div>
                        <div className="text-[#D97706] font-mono mt-1">
                          {res.mentionName}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {addAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E4DE] rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Add Library Asset</h2>
              <button
                type="button"
                onClick={() => setAddAssetModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#F2F2EE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1">
                  Asset Name
                </label>
                <input
                  type="text"
                  required
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="e.g. Detective Maya"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E4DE] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1">
                  @Mention Handle
                </label>
                <input
                  type="text"
                  value={assetMention}
                  onChange={(e) => setAssetMention(e.target.value)}
                  placeholder="@maya"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E4DE] text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1">
                  Category
                </label>
                <select
                  value={assetCategory}
                  onChange={(e) => setAssetCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E4DE] bg-white text-xs"
                >
                  <option value="character">Character</option>
                  <option value="location">Location</option>
                  <option value="prop">Prop</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddAssetModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E4DE] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
