"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Film, MessageSquare, Lock, Play } from "lucide-react";

export default function SharedStoryboardFramePage() {
  const params = useParams<{ shortSlug: string }>();
  const [storyboard, setStoryboard] = useState<any>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [guestName, setGuestName] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [activeFrameIdx, setActiveFrameIdx] = useState(0);

  const loadShared = useCallback(
    async (pwd = "", attempted = false) => {
      const qs = new URLSearchParams({ password: pwd }).toString();
      const res = await fetch(
        `/api/share/storyboard/${params.shortSlug}?${qs}`
      );
      const data = await res.json();
      if (res.status === 401 && data.requiresPassword) {
        setRequiresPassword(true);
        if (attempted) {
          setPasswordError("Incorrect password. Please try again.");
        }
        return;
      }
      if (!res.ok) {
        setError(data.error || "Shared storyboard unavailable");
        return;
      }
      setRequiresPassword(false);
      setPasswordError("");
      setStoryboard(data.storyboard);
    },
    [params.shortSlug]
  );

  useEffect(() => {
    loadShared();
  }, [loadShared]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    const res = await fetch(`/api/share/storyboard/${params.shortSlug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestName: guestName.trim() || "Client Reviewer",
        body: commentBody.trim(),
        frameId: storyboard?.frames?.[activeFrameIdx]?.id,
      }),
    });
    if (res.ok) {
      setCommentBody("");
      loadShared(passwordInput);
    }
  };

  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-[#F6F6F0] flex items-center justify-center p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadShared(passwordInput, true);
          }}
          className="bg-white border border-[#E5E4DE] rounded-2xl p-8 max-w-sm w-full space-y-4"
        >
          <div className="flex items-center gap-2 font-bold text-lg">
            <Lock className="w-5 h-5 text-[#D97706]" />
            <span>Password Protected Storyboard</span>
          </div>
          {passwordError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
              {passwordError}
            </div>
          )}
          <input
            type="password"
            required
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Enter share password"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E4DE] text-sm"
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#121212] text-white text-xs font-semibold"
          >
            Unlock Storyboard
          </button>
        </form>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F6F6F0] flex items-center justify-center p-6 text-sm text-[#5C5B57]">
        {error}
      </div>
    );
  }

  if (!storyboard) {
    return (
      <div className="min-h-screen bg-[#F6F6F0] flex items-center justify-center text-sm text-[#5C5B57]">
        Loading shared presentation...
      </div>
    );
  }

  const frames = storyboard.frames || [];
  const currentFrame = frames[activeFrameIdx];

  return (
    <div
      className={`min-h-screen flex flex-col ${
        storyboard.team?.brandDarkMode
          ? "bg-[#121212] text-white"
          : "bg-[#F6F6F0] text-[#121212]"
      }`}
    >
      <header className="h-14 px-6 border-b border-[#E5E4DE]/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Film className="w-5 h-5 text-[#D97706]" />
          <span className="font-bold text-sm">{storyboard.title}</span>
          <span className="px-2 py-0.5 rounded-full bg-[#F4BD64] text-[#121212] text-xs font-bold">
            v{storyboard.version} • {storyboard.status}
          </span>
        </div>
        <div className="text-xs opacity-75">
          Shared by {storyboard.team?.name}
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {currentFrame ? (
            <div className="bg-white text-[#121212] border border-[#E5E4DE] rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-video bg-[#F2F2EE] flex items-center justify-center">
                {currentFrame.imageUrl ? (
                  <img
                    src={currentFrame.imageUrl}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Play className="w-8 h-8 text-[#5C5B57]" />
                )}
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>
                    Frame {activeFrameIdx + 1} — {currentFrame.shotType}
                  </span>
                  <span>{currentFrame.durationSec}s</span>
                </div>
                {currentFrame.voiceoverText && (
                  <p className="text-sm">
                    <strong>VO:</strong> {currentFrame.voiceoverText}
                  </p>
                )}
                {currentFrame.actionText && (
                  <p className="text-xs text-[#5C5B57]">
                    <strong>Action:</strong> {currentFrame.actionText}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed rounded-2xl">
              No frames in this storyboard yet.
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto pb-2">
            {frames.map((f: any, idx: number) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFrameIdx(idx)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold shrink-0 ${
                  idx === activeFrameIdx
                    ? "bg-[#121212] text-white border-[#121212]"
                    : "bg-white text-[#121212] border-[#E5E4DE]"
                }`}
              >
                Frame {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <aside className="lg:col-span-4 bg-white text-[#121212] border border-[#E5E4DE] rounded-2xl p-5 space-y-4 h-fit">
          <h2 className="font-bold text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#D97706]" />
            Client Feedback ({(storyboard.comments || []).length})
          </h2>

          {storyboard.allowComments && (
            <form onSubmit={handlePostComment} className="space-y-2.5">
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3 py-2 rounded-xl border border-[#E5E4DE] text-xs"
              />
              <textarea
                rows={2}
                required
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Leave feedback on this frame..."
                className="w-full px-3 py-2 rounded-xl border border-[#E5E4DE] text-xs"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold"
              >
                Submit Feedback
              </button>
            </form>
          )}

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {(storyboard.comments || []).map((c: any) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-[#F6F6F0] text-xs space-y-1"
              >
                <div className="font-bold">
                  {c.author?.name || c.guestName || "Reviewer"}
                </div>
                <p className="text-[#5C5B57]">{c.body}</p>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
