"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/workspace/AppShell";
import { Archive, RotateCcw, Trash2 } from "lucide-react";

export default function ArchivePage() {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const handleRestoreStoryboard = async (id: string) => {
    await fetch(`/api/storyboards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: false }),
    });
    loadWorkspace();
  };

  const handleDeleteStoryboard = async (id: string) => {
    await fetch(`/api/storyboards/${id}`, { method: "DELETE" });
    loadWorkspace();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F0] flex items-center justify-center text-sm text-[#5C5B57]">
        Loading Archive...
      </div>
    );
  }

  const archivedStoryboards = (workspace?.storyboards || []).filter(
    (s: any) => s.isArchived
  );
  const archivedScripts = (workspace?.scripts || []).filter(
    (s: any) => s.isArchived
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
      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5">
            <Archive className="w-6 h-6 text-[#5C5B57]" />
            Archive
          </h1>
          <p className="text-sm text-[#5C5B57] mt-1">
            Restore archived storyboards and scripts or remove them permanently.
          </p>
        </div>

        {archivedStoryboards.length === 0 && archivedScripts.length === 0 ? (
          <div className="bg-white border border-dashed border-[#E5E4DE] rounded-2xl p-12 text-center text-sm text-[#5C5B57]">
            No archived storyboards or scripts.
          </div>
        ) : (
          <div className="bg-white border border-[#E5E4DE] rounded-2xl divide-y divide-[#E5E4DE]">
            {archivedStoryboards.map((sb: any) => (
              <div
                key={sb.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm">{sb.title}</div>
                  <div className="text-xs text-[#5C5B57]">
                    Storyboard • v{sb.version}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRestoreStoryboard(sb.id)}
                    className="px-3 py-1.5 rounded-xl border border-[#E5E4DE] text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[#F2F2EE]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteStoryboard(sb.id)}
                    className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-red-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
